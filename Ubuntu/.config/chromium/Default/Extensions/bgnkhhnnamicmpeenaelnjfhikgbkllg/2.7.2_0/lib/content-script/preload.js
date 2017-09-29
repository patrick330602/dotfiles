/**
 * This file is part of Adguard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * Adguard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Adguard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Adguard Browser Extension.  If not, see <http://www.gnu.org/licenses/>.
 */
/* global contentPage, ExtendedCss, HTMLDocument, XMLDocument, ElementCollapser, CssHitsCounter */
(function () {

    var requestTypeMap = {
        "img": "IMAGE",
        "input": "IMAGE",
        "audio": "MEDIA",
        "video": "MEDIA",
        "object": "OBJECT",
        "frame": "SUBDOCUMENT",
        "iframe": "SUBDOCUMENT",
        "embed": "OBJECT"
    };

    // Don't apply scripts twice
    var scriptsApplied = false;

    /**
     * Do not use shadow DOM on some websites
     * https://code.google.com/p/chromium/issues/detail?id=496055
     */
    var shadowDomExceptions = [
        'mail.google.com',
        'inbox.google.com',
        'productforums.google.com'
    ];

    /**
     * Do not use iframes pre-hiding on some websites.
     * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/720
     */
    var iframeHidingExceptions = [
        'docs.google.com'
    ];

    var collapseRequests = Object.create(null);
    var collapseRequestId = 1;
    var isFirefox = false;
    var isOpera = false;
    var shadowRoot = null;
    var loadTruncatedCss = false;

    /**
     * Set callback for saving css hits
     */
    if (typeof CssHitsCounter !== 'undefined' &&
        typeof CssHitsCounter.setCssHitsFoundCallback === 'function') {

        CssHitsCounter.setCssHitsFoundCallback(function (stats) {
            contentPage.sendMessage({type: 'saveCssHitStats', stats: stats});
        });
    }

    /**
     * When Background page receives 'onCommitted' frame event then it sends scripts to corresponding frame
     * It allows us to execute script as soon as possible, because runtime.messaging makes huge overhead
     * If onCommitted event doesn't occur for the frame, scripts will be applied in usual way.
     */
    contentPage.onMessage.addListener(function (response, sender, sendResponse) {
        if (response.type === 'injectScripts') {
            // Notify background-page that content-script was received scripts
            sendResponse({applied: true});
            if (!isHtml()) {
                return;
            }
            applyScripts(response.scripts);
        }
    });

    /**
     * Initializing content script
     */
    var init = function () {

        if (!isHtml()) {
            return;
        }

        initRequestWrappers();

        // We use shadow DOM when it's available to minimize our impact on web page DOM tree.
        // According to ABP issue #452, creating a shadow root breaks running CSS transitions.
        // Because of this, we create shadow root right after content script is initialized.
        // First check if it's available already, chrome shows warning message in case of we try to create an additional root.
        shadowRoot = document.documentElement.shadowRoot;
        if (!shadowRoot) {
            if ("createShadowRoot" in document.documentElement && shadowDomExceptions.indexOf(document.domain) == -1) {
                shadowRoot = document.documentElement.createShadowRoot();
                shadowRoot.appendChild(document.createElement("shadow"));
                protectShadowRoot();
            }
        }

        var userAgent = navigator.userAgent.toLowerCase();
        isFirefox = userAgent.indexOf('firefox') > -1;
        isOpera = userAgent.indexOf('opera') > -1 || userAgent.indexOf('opr') > -1;

        if (window !== window.top) {
            var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            // Load only small set of css for small frames.
            // We hide all generic css rules in this case.
            // https://github.com/AdguardTeam/AdguardBrowserExtension/issues/223
            loadTruncatedCss = (height * width) < 100000;
        }

        initCollapseEventListeners();
        tryLoadCssAndScripts();
    };

    /**
     * Checks if it is html document
     *
     * @returns {boolean}
     */
    var isHtml = function () {
        return (document instanceof HTMLDocument) ||
            // https://github.com/AdguardTeam/AdguardBrowserExtension/issues/233
            ((document instanceof XMLDocument) && (document.createElement('div') instanceof HTMLDivElement));
    };

    /**
     * Uses in `initRequestWrappers` method.
     * We insert wrapper's code into http/https documents and dynamically created frames.
     * The last one is due to the circumvention with using iframe's contentWindow.
     */
    var isHttpOrAboutPage = function () {
        var protocol = window.location.protocol;
        return protocol.indexOf('http') === 0 || protocol.indexOf('about:') === 0;
    };

    /**
     * Try to keep DOM clean: let script removes itself when execution completes
     * @returns {string}
     */
    var cleanupCurrentScriptToString = function () {

        var cleanup = function () {
            var current = document.currentScript;
            var parent = current && current.parentNode;
            if (parent) {
                parent.removeChild(current);
            }
        };

        return '(' + cleanup.toString() + ')();';
    };

    /**
     * Execute scripts in a page context and cleanup itself when execution completes
     * @param scripts Array of scripts to execute
     */
    var executeScripts = function (scripts) {

        if (!scripts || scripts.length === 0) {
            return;
        }

        // Wraps with try catch and appends cleanup
        scripts.unshift("( function () { try {");
        scripts.push("} catch (ex) { console.error('Error executing AG js: ' + ex); } })();");
        scripts.push(cleanupCurrentScriptToString());

        var script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.textContent = scripts.join("\r\n");
        (document.head || document.documentElement).appendChild(script);
    };

    /**
     * We should override WebSocket constructor in the following browsers: Chrome (between 47 and 57 versions), Edge, YaBrowser, Opera and Safari (old versions)
     * Firefox and Safari (9 or higher) can be omitted because they allow us to inspect and block WS requests.
     * This function simply checks the conditions above.
     * @returns true if WebSocket constructor should be overridden
     */
    var shouldOverrideWebSocket = function () {

        // Checks for using of Content Blocker API for Safari 9+
        if (contentPage.isSafari) {
            return !contentPage.isSafariContentBlockerEnabled;
        }

        var userAgent = navigator.userAgent.toLowerCase();
        var isFirefox = userAgent.indexOf('firefox') >= 0;

        // Explicit check, we must not go further in case of Firefox
        // https://github.com/AdguardTeam/AdguardBrowserExtension/issues/379
        if (isFirefox) {
            return false;
        }

        // Keep in mind that the following browsers (that support WebExt-API) Chrome, Edge, YaBrowser and Opera contain `Chrome/<version>` in their User-Agent string.
        var cIndex = userAgent.indexOf('chrome/');
        if (cIndex < 0) {
            return false;
        }

        var version = userAgent.substring(cIndex + 7);
        var versionNumber = Number.parseInt(version.substring(0, version.indexOf('.')));

        // WebSockets are broken in old versions of chrome and we don't need this hack in new version cause then websocket traffic is intercepted
        return versionNumber >= 47 && versionNumber <= 57;
    };

    /**
     * We should override RTCPeerConnection in all browsers, except the case of using of Content Blocker API for Safari 9+
     * @returns true if RTCPeerConnection should be overridden
     */
    var shouldOverrideWebRTC = function () {

        // Checks for using of Content Blocker API for Safari 9+
        if (contentPage.isSafari) {
            return !contentPage.isSafariContentBlockerEnabled;
        }

        return true;
    };

    /**
     * Overrides window.WebSocket and window.RTCPeerConnection running the function from wrappers.js
     * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/203
     * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/588
     */
    /* global injectPageScriptAPI, initPageMessageListener */
    var initRequestWrappers = function () {

        // Only for dynamically created frames and http/https documents.
        if (!isHttpOrAboutPage()) {
            return;
        }

        /**
         *
         * The code below is supposed to be used in WebExt extensions.
         * This code overrides WebSocket constructor (except for newer Chrome and FF) and RTCPeerConnection constructor, so that we could inspect & block them.
         *
         * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/273
         * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/572
         */
        var overrideWebSocket = shouldOverrideWebSocket();
        var overrideWebRTC = shouldOverrideWebRTC();

        if (overrideWebSocket || overrideWebRTC) {

            initPageMessageListener();

            var wrapperScriptName = 'wrapper-script-' + Math.random().toString().substr(2);
            var script = "(" + injectPageScriptAPI.toString() + ")('" + wrapperScriptName + "', " + overrideWebSocket + ", " + overrideWebRTC + ");";
            executeScripts([script]);
        }
    };

    /**
     * Overrides shadowRoot getter
     * The solution from ABP
     *
     * Function supposed to be executed in page's context
     */
    var overrideShadowRootGetter = function () {
        if ("shadowRoot" in Element.prototype) {
            var ourShadowRoot = document.documentElement.shadowRoot;
            if (ourShadowRoot) {
                var desc = Object.getOwnPropertyDescriptor(Element.prototype, "shadowRoot");
                var shadowRoot = Function.prototype.call.bind(desc.get);

                Object.defineProperty(Element.prototype, "shadowRoot", {
                    configurable: true, enumerable: true, get: function () {
                        var thisShadow = shadowRoot(this);
                        return thisShadow === ourShadowRoot ? null : thisShadow;
                    }
                });
            }
        }
    };

    /**
     * Overrides stylesheets property disabled
     *
     * Function supposed to be executed in page's context
     */
    var overrideStyleSheetProperties = function () {
        Object.defineProperty(window.HTMLStyleElement.prototype, 'disabled', {
            get: function () {
                return false;
            }, set: function (val) {
                // Do nothing
            }
        });
    };

    /**
     * Protects shadow root from access in page's context
     * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/829
     */
    var protectShadowRoot = function () {
        var scriptShadowRoot = "(" + overrideShadowRootGetter.toString() + ")();";
        var scriptStylesheets = "(" + overrideStyleSheetProperties.toString() + ")();";
        executeScripts([scriptShadowRoot, scriptStylesheets]);
    };

    /**
     * The main purpose of this function is to prevent blocked iframes "flickering".
     * So, we do two things:
     * 1. Add a temporary display:none style for all frames (which is removed on DOMContentLoaded event)
     * 2. Use a MutationObserver to react on dynamically added iframe
     *
     * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/301
     */
    var addIframeHidingStyle = function () {
        if (window !== window.top) {
            // Do nothing for frames
            return;
        }

        /**
         * Checks for pre-hide iframes exception
         */
        var hideIframes = iframeHidingExceptions.indexOf(document.domain) < 0;

        // We do not hide "allowfullscreen" as it is likely to be video player frames
        var iframeHidingSelector = "iframe[src]:not([allowfullscreen])";
        if (hideIframes) {
            ElementCollapser.hideBySelector(iframeHidingSelector, null, shadowRoot);
        }

        /**
         * For iframes with changed source we check if it should be collapsed
         *
         * @param mutations
         */
        var handleIframeSrcChanged = function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var iframe = mutations[i].target;
                if (iframe) {
                    checkShouldCollapseElement(iframe);
                }
            }
        };

        var iframeObserver = new MutationObserver(handleIframeSrcChanged);
        var iframeObserverOptions = {
            attributes: true,
            attributeFilter: ['src']
        };

        /**
         * Dynamically added frames handler
         *
         * @param mutations
         */
        var handleDomChanged = function (mutations) {
            var iframes = [];
            for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                var addedNodes = mutation.addedNodes;
                for (var j = 0; j < addedNodes.length; j++) {
                    var node = addedNodes[j];
                    if (node.localName === "iframe") {
                        iframes.push(node);
                    }
                }
            }

            if (iframes.length > 0) {
                var iIframes = iframes.length;
                while (iIframes--) {
                    var iframe = iframes[iIframes];
                    checkShouldCollapseElement(iframe);
                    iframeObserver.observe(iframe, iframeObserverOptions);
                }
            }
        };

        /**
         * Removes iframes hide style and initiates should-collapse check for iframes
         */
        var onDocumentReady = function () {
            var iframes = document.getElementsByTagName('iframe');
            for (var i = 0; i < iframes.length; i++) {
                checkShouldCollapseElement(iframes[i]);
            }

            if (hideIframes) {
                ElementCollapser.unhideBySelector(iframeHidingSelector, shadowRoot);
            }

            if (document.body) {
                // Handle dynamically added frames
                var domObserver = new MutationObserver(handleDomChanged);
                domObserver.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        };

        //Document can already be loaded
        if (['interactive', 'complete'].indexOf(document.readyState) >= 0) {
            onDocumentReady();
        } else {
            document.addEventListener('DOMContentLoaded', onDocumentReady);
        }
    };

    /**
     * Loads CSS and JS injections
     */
    var tryLoadCssAndScripts = function () {
        var message = {
            type: 'getSelectorsAndScripts',
            documentUrl: window.location.href,
            options: {
                filter: ['selectors', 'scripts'],
                genericHide: loadTruncatedCss
            }
        };

        /**
         * Sending message to background page and passing a callback function
         */
        contentPage.sendMessage(message, processCssAndScriptsResponse);
    };

    /**
     * Processes response from the background page containing CSS and JS injections
     *
     * @param response Response from the background page
     */
    var processCssAndScriptsResponse = function (response) {
        if (!response || response.requestFilterReady === false) {
            /**
             * This flag (requestFilterReady) means that we should wait for a while, because the
             * request filter is not ready yet. This is possible only on browser startup.
             * In this case we'll delay injections until extension is fully initialized.
             */
            setTimeout(function () {
                tryLoadCssAndScripts();
            }, 100);

            return;
        } else if (response.collapseAllElements) {

            /**
             * This flag (collapseAllElements) means that we should check all page elements
             * and collapse them if needed. Why? On browser startup we can't block some
             * ad/tracking requests because extension is not yet initialized when
             * these requests are executed. At least we could hide these elements.
             */
            applySelectors(response.selectors, response.useShadowDom);
            applyScripts(response.scripts);
            initBatchCollapse();
        } else {
            applySelectors(response.selectors, response.useShadowDom);
            applyScripts(response.scripts);
        }

        if (response && response.selectors && response.selectors.css && response.selectors.css.length > 0) {
            addIframeHidingStyle();
        }

        if (typeof CssHitsCounter !== 'undefined' &&
            typeof CssHitsCounter.count === 'function' &&
            response && response.selectors && response.selectors.cssHitsCounterEnabled) {

            // Start css hits calculation
            CssHitsCounter.count();
        }
    };

    /**
     * Sets "style" DOM element content.
     *
     * @param styleEl       "style" DOM element
     * @param cssContent    CSS content to set
     * @param useShadowDom  true if we want to use shadow DOM
     */
    var setStyleContent = function (styleEl, cssContent, useShadowDom) {

        if (useShadowDom && !shadowRoot) {
            // Despite our will to use shadow DOM we cannot
            // It is rare case, but anyway: https://code.google.com/p/chromium/issues/detail?id=496055
            // The only thing we can do is to append styles to document root
            // We should remove ::content pseudo-element first
            cssContent = cssContent.replace(new RegExp('::content ', 'g'), '');
        }

        styleEl.textContent = cssContent;
    };

    /**
     * Applies CSS and extended CSS stylesheets
     *
     * @param selectors     Object with the stylesheets got from the background page.
     * @param useShadowDom  If true - add styles to shadow DOM instead of normal DOM.
     */
    var applySelectors = function (selectors, useShadowDom) {
        if (!selectors) {
            return;
        }

        applyCss(selectors.css, useShadowDom);
        applyExtendedCss(selectors.extendedCss);
    };

    /**
     * Applies CSS stylesheets
     *
     * @param css Array with CSS stylesheets
     */
    var applyCss = function (css, useShadowDom) {
        if (!css || css.length === 0) {
            return;
        }

        for (var i = 0; i < css.length; i++) {
            var styleEl = document.createElement("style");
            styleEl.setAttribute("type", "text/css");
            setStyleContent(styleEl, css[i], useShadowDom);

            if (useShadowDom && shadowRoot) {
                shadowRoot.appendChild(styleEl);
            } else {
                (document.head || document.documentElement).appendChild(styleEl);
            }

            protectStyleElementFromRemoval(styleEl, useShadowDom);
            protectStyleElementContent(styleEl);
        }
    };

    /**
     * Applies Extended Css stylesheet
     *
     * @param extendedCss Array with ExtendedCss stylesheets
     */
    var applyExtendedCss = function (extendedCss) {
        if (!extendedCss || !extendedCss.length) {
            return;
        }

        // https://github.com/AdguardTeam/ExtendedCss
        new ExtendedCss(extendedCss.join("\n")).apply();
    };

    /**
     * Protects specified style element from changes to the current document
     * Add a mutation observer, which is adds our rules again if it was removed
     *
     * @param protectStyleEl protected style element
     */
    var protectStyleElementContent = function (protectStyleEl) {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        if (!MutationObserver) {
            return;
        }
        /* observer, which observe protectStyleEl inner changes, without deleting styleEl */
        var innerObserver = new MutationObserver(function (mutations) {

            for (var i = 0; i < mutations.length; i++) {

                var m = mutations[i];
                if (protectStyleEl.hasAttribute("mod") && protectStyleEl.getAttribute("mod") == "inner") {
                    protectStyleEl.removeAttribute("mod");
                    break;
                }

                protectStyleEl.setAttribute("mod", "inner");
                var isProtectStyleElModified = false;

                /* further, there are two mutually exclusive situations: either there were changes the text of protectStyleEl,
                 either there was removes a whole child "text" element of protectStyleEl
                 we'll process both of them */

                if (m.removedNodes.length > 0) {
                    for (var j = 0; j < m.removedNodes.length; j++) {
                        isProtectStyleElModified = true;
                        protectStyleEl.appendChild(m.removedNodes[j]);
                    }
                } else {
                    if (m.oldValue) {
                        isProtectStyleElModified = true;
                        protectStyleEl.textContent = m.oldValue;
                    }
                }

                if (!isProtectStyleElModified) {
                    protectStyleEl.removeAttribute("mod");
                }
            }

        });

        innerObserver.observe(protectStyleEl, {
            'childList': true,
            'characterData': true,
            'subtree': true,
            'characterDataOldValue': true
        });
    };

    /**
     * Protects style element from removing.
     *
     * @param protectStyleEl protected style element
     * @param useShadowDom shadowDOM flag
     */
    var protectStyleElementFromRemoval = function (protectStyleEl, useShadowDom) {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        if (!MutationObserver) {
            return;
        }
        /* observer, which observe deleting protectStyleEl */
        var outerObserver = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {

                var m = mutations[i];
                var removedNodeIndex = [].indexOf.call(mutations[i].removedNodes, protectStyleEl);
                if (removedNodeIndex != -1) {
                    var removedStyleEl = m.removedNodes[removedNodeIndex];

                    outerObserver.disconnect();

                    applyCss([removedStyleEl.textContent], useShadowDom);

                    break;
                }
            }

        });

        outerObserver.observe(protectStyleEl.parentNode, {'childList': true, 'characterData': true});
    };

    /**
     * Applies JS injections.
     *
     * @param scripts Array with JS scripts and scriptSource ('remote' or 'local')
     */
    var applyScripts = function (scripts) {

        if (scriptsApplied) {
            return;
        }
        scriptsApplied = true;

        if (!scripts || scripts.length === 0) {
            return;
        }

        var scriptsToApply = [];

        for (var i = 0; i < scripts.length; i++) {
            var scriptRule = scripts[i];
            switch (scriptRule.scriptSource) {
                case 'local':
                    scriptsToApply.push(scriptRule.rule);
                    break;
                case 'remote':
                    /**
                     * Note (!) (Firefox, Opera):
                     * In case of Firefox and Opera add-ons, JS filtering rules are hardcoded into add-on code.
                     * Look at ScriptFilterRule.getScriptSource to learn more.
                     */
                    if (!isFirefox && !isOpera) {
                        scriptsToApply.push(scriptRule.rule);
                    }
                    break;
            }
        }

        if (scriptsToApply.length === 0) {
            return;
        }

        /**
         * JS injections are created by JS filtering rules:
         * http://adguard.com/en/filterrules.html#javascriptInjection
         */
        executeScripts(scriptsToApply);
    };

    /**
     * Init listeners for error and load events.
     * We will then check loaded elements if they are blocked by our extension.
     * In this case we'll hide these blocked elements.
     */
    var initCollapseEventListeners = function () {
        document.addEventListener("error", checkShouldCollapse, true);

        // We need to listen for load events to hide blocked iframes (they don't raise error event)
        document.addEventListener("load", checkShouldCollapse, true);
    };

    /**
     * Checks if loaded element is blocked by AG and should be hidden
     *
     * @param event Load or error event
     */
    var checkShouldCollapse = function (event) {
        var element = event.target;
        var eventType = event.type;
        var tagName = element.tagName.toLowerCase();

        var expectedEventType = (tagName == "iframe" || tagName == "frame" || tagName == "embed") ? "load" : "error";
        if (eventType != expectedEventType) {
            return;
        }

        checkShouldCollapseElement(element);
    };

    /**
     * Extracts element URL from the dom node
     *
     * @param element DOM node
     */
    var getElementUrl = function (element) {
        var elementUrl = element.src || element.data;
        if (!elementUrl ||
            elementUrl.indexOf('http') !== 0 ||
            // Some sources could not be set yet, lazy loaded images or smth.
            // In some cases like on gog.com, collapsing these elements could break the page script loading their sources 
            elementUrl === element.baseURI) {
            return null;
        }

        return elementUrl;
    };

    /**
     * Saves collapse request (to be reused after we get result from bg page)
     *
     * @param element Element to check
     * @return request ID
     */
    var saveCollapseRequest = function (element) {

        var tagName = element.tagName.toLowerCase();
        var requestId = collapseRequestId++;
        collapseRequests[requestId] = {
            element: element,
            src: element.src,
            tagName: tagName
        };

        return requestId;
    };

    /**
     * Hides element temporarily (until collapse check request is processed)
     *
     * @param element Element to hide
     */
    var tempHideElement = function (element) {
        // We skip big frames here
        if (element.localName === 'iframe' || element.localName === 'frame' || element.localName === 'embed') {
            if (element.clientHeight * element.clientWidth > 400 * 300) {
                return;
            }

            if (element.hasAttribute('allowfullscreen')) {
                // This is likely to be a video player
                return;
            }
        }

        /**
         * Due to some reasons after applying style to 'embed' element with SVG causes 'load' event, so we get into the infinite loop.
         * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/770
         * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/779
         */
        if (element.localName === 'embed') {
            return;
        }

        ElementCollapser.hideElement(element, shadowRoot);
    };

    /**
     * Response callback for "processShouldCollapse" message.
     *
     * @param response Response got from the background page
     */
    var onProcessShouldCollapseResponse = function (response) {

        if (!response) {
            return;
        }

        // Get original collapse request
        var collapseRequest = collapseRequests[response.requestId];
        if (!collapseRequest) {
            return;
        }
        delete collapseRequests[response.requestId];

        var element = collapseRequest.element;
        if (response.collapse === true) {
            var elementUrl = collapseRequest.src;
            ElementCollapser.collapseElement(element, elementUrl, shadowRoot);
        }

        // Unhide element, which was previously hidden by "tempHideElement"
        // In case if element is collapsed, there's no need to hide it
        // Otherwise we shouldn't hide it either as it shouldn't be blocked
        ElementCollapser.unhideElement(element, shadowRoot);
    };

    /**
     * Checks if element is blocked by AG and should be hidden
     *
     * @param element Element to check
     */
    var checkShouldCollapseElement = function (element) {

        var requestType = requestTypeMap[element.localName];
        if (!requestType) {
            return;
        }

        var elementUrl = getElementUrl(element);
        if (!elementUrl) {
            return;
        }

        // Save request to a map (it will be used in response callback)
        var requestId = saveCollapseRequest(element);

        // Hide element right away (to prevent iframes "blinking")
        tempHideElement(element);

        // Send a message to the background page to check if the element really should be collapsed
        var message = {
            type: 'processShouldCollapse',
            elementUrl: elementUrl,
            documentUrl: document.URL,
            requestType: requestType,
            requestId: requestId
        };

        contentPage.sendMessage(message, onProcessShouldCollapseResponse);
    };

    /**
     * Response callback for "processShouldCollapseMany" message.
     *
     * @param response Response from bg page.
     */
    var onProcessShouldCollapseManyResponse = function (response) {

        if (!response) {
            return;
        }

        var requests = response.requests;
        for (var i = 0; i < requests.length; i++) {
            var collapseRequest = requests[i];
            onProcessShouldCollapseResponse(collapseRequest);
        }
    };

    /**
     * Collects all elements from the page and checks if we should hide them.
     */
    var checkBatchShouldCollapse = function () {
        var requests = [];

        // Collect collapse requests
        for (var tagName in requestTypeMap) { // jshint ignore:line
            var requestType = requestTypeMap[tagName];

            var elements = document.getElementsByTagName(tagName);
            for (var j = 0; j < elements.length; j++) {

                var element = elements[j];
                var elementUrl = getElementUrl(element);
                if (!elementUrl) {
                    continue;
                }

                var requestId = saveCollapseRequest(element);

                requests.push({
                    elementUrl: elementUrl,
                    requestType: requestType,
                    requestId: requestId,
                    tagName: tagName
                });
            }
        }

        var message = {
            type: 'processShouldCollapseMany',
            requests: requests,
            documentUrl: document.URL
        };

        // Send all prepared requests in one message
        contentPage.sendMessage(message, onProcessShouldCollapseManyResponse);
    };

    /**
     * This method is used when we need to check all page elements with collapse rules.
     * We need this when the browser is just started and add-on is not yet initialized.
     * In this case content scripts waits for add-on initialization and the
     * checks all page elements.
     */
    var initBatchCollapse = function () {
        if (document.readyState === 'complete' ||
            document.readyState === 'loaded' ||
            document.readyState === 'interactive') {
            checkBatchShouldCollapse();
        } else {
            document.addEventListener('DOMContentLoaded', checkBatchShouldCollapse);
        }
    };

    /**
     * Called when document become visible.
     * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/159
     */
    var onVisibilityChange = function () {

        if (document.hidden === false) {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            init();
        }
    };

    /**
     * Messaging won't work when page is loaded by Safari top hits
     */
    if (contentPage.isSafari && document.hidden) {
        document.addEventListener("visibilitychange", onVisibilityChange);
        return;
    }

    // Start the content script
    init();
})();