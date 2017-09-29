var inherits = (function() {
    var createObject = Object.create || function createObject(source) {
        var Host = function() {};
        Host.prototype = source;
        return new Host();
    };

    return function(destination, source) {
        var proto = destination.prototype = createObject(source.prototype);
        proto.constructor = destination;
        proto._super = source.prototype;
    };
})();

makeEnum(['MDBOPEN', 'EXECSC', 'LOADINGCLOUD'], 'MEGAFLAG_', window);

/**
 *  Check if value is contained in a array. If it is return value
 *  otherwise false
 */
function anyOf(arr, value) {
    return $.inArray(value, arr) === -1 ? false : value;
}

/**
 * excludeIntersected
 *
 * Loop through arrays excluding intersected items form array2
 * and prepare result format for tokenInput plugin item format.
 *
 * @param {Array} array1, emails used in share
 * @param {Array} array2, list of all available emails
 *
 * @returns {Array} item An array of JSON objects e.g. { id, name }.
 */
function excludeIntersected(array1, array2) {

    var result = [],
        tmpObj2 = array2;

    if (!array1) {
        return array2;
    }
    else if (!array2) {
        return array1;
    }

    // Loop through emails used in share
    for (var i in array1) {
        if (array1.hasOwnProperty(i)) {

            // Loop through list of all emails
            for (var k in array2) {
                if (array2.hasOwnProperty(k)) {

                    // Remove matched email from result
                    if (array1[i] === array2[k]) {
                        tmpObj2.splice(k, 1);
                        break;
                    }
                }
            }
        }
    }

    // Prepare for token.input plugin item format
    for (var n in tmpObj2) {
        if (tmpObj2.hasOwnProperty(n)) {
            result.push({ id: tmpObj2[n], name: tmpObj2[n] });
        }
    }

    return result;
}

function asciionly(text) {
    var rforeign = /[^\u0000-\u007f]/;
    if (rforeign.test(text)) {
        return false;
    }
    else {
        return true;
    }
}

var isNativeObject = function(obj) {
    var objConstructorText = obj.constructor.toString();
    return objConstructorText.indexOf("[native code]") !== -1 && objConstructorText.indexOf("Object()") === -1;
};

function clone(obj) {

    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (Array.isArray(obj)) {
        var arr = new Array(obj.length);
        for (var i = obj.length; i--; ) {
            arr[i] = clone(obj[i]);
        }
        return arr;
    }
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                if (!(obj[attr] instanceof Object)) {
                    copy[attr] = obj[attr];
                }
                else if (Array.isArray(obj[attr])) {
                    copy[attr] = clone(obj[attr]);
                }
                else if (!isNativeObject(obj[attr])) {
                    copy[attr] = clone(obj[attr]);
                }
                else if ($.isFunction(obj[attr])) {
                    copy[attr] = obj[attr];
                }
                else {
                    copy[attr] = {};
                }
            }
        }

        return copy;
    }
    else {
        var copy = Object.create(null);

        for (var k in obj) {
            copy[k] = clone(obj[k]);
        }

        return copy;
    }
}

/**
 * Check if something (val) is a string.
 *
 * @param val
 * @returns {boolean}
 */
function isString(val) {
    return (typeof val === 'string' || val instanceof String);
};

function easeOutCubic(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
}

function ellipsis(text, location, maxCharacters) {
    if (text.length > 0 && text.length > maxCharacters) {
        if (typeof location === 'undefined') {
            location = 'end';
        }
        switch (location) {
            case 'center':
                var center = (maxCharacters / 2);
                text = text.slice(0, center) + '...' + text.slice(-center);
                break;
            case 'end':
                text = text.slice(0, maxCharacters - 3) + '...';
                break;
        }
    }
    return text;
}

function megatitle(nperc) {
    if (!nperc) {
        nperc = '';
    }
    var a = parseInt($('.notification-num:first').text());
    if (a > 0) {
        a = '(' + a + ') ';
    }
    else {
        a = '';
    }
    if (document.title !== a + mega_title + nperc) {
        document.title = a + mega_title + nperc;
    }
}

function countrydetails(isocode) {
    var cdetails = {
        name: isoCountries[isocode],
        icon: isocode.toLowerCase() + '.gif'
    };
    return cdetails;
}

/**
 * Gets the current UNIX timestamp
 * @returns {Number} Returns an integer with the current UNIX timestamp (in seconds)
 */
function unixtime() {
    return Math.round(Date.now() / 1000);
}

function uplpad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function secondsToTime(secs, html_format) {
    if (isNaN(secs)) {
        return '--:--:--';
    }
    if (secs < 0) {
        return '';
    }

    var hours = uplpad(Math.floor(secs / (60 * 60)), 2);
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = uplpad(Math.floor(divisor_for_minutes / 60), 2);
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = uplpad(Math.floor(divisor_for_seconds), 2);
    var returnvar = hours + ':' + minutes + ':' + seconds;

    if (html_format) {
        hours = (hours !== '00') ? (hours + '<span>h</span> ') : '';
        returnvar = hours + minutes + '<span>m</span> ' + seconds + '<span>s</span>';
    }
    return returnvar;
}

function secondsToTimeShort(secs) {
    var val = secondsToTime(secs);

    if (!val) {
        return val;
    }

    if (val.substr(0, 1) === "0") {
        val = val.substr(1, val.length);
    }
    if (val.substr(0, 2) === "0:") {
        val = val.substr(2, val.length);
    }

    return val;
}

/**
 * Convert bytes sizes into a human-friendly format (KB, MB, GB), pretty
 * similar to `bytesToSize` but this function returns an object
 * (`{ size: "23,33", unit: 'KB' }`) which is easier to consume
 *
 * @param {Number} bytes        Size in bytes to convert
 * @param {Number} precision    Precision to show the decimal number
 * @returns {Object} Returns an object similar to `{size: "2.1", unit: "MB"}`
 */
function numOfBytes(bytes, precision) {

    var parts = bytesToSize(bytes, precision || 2).split(' ');
    return { size: parts[0], unit: parts[1] || 'B' };
}

function bytesToSize(bytes, precision, html_format) {
    var s_b = 'B';
    var s_kb = 'KB';
    var s_mb = 'MB';
    var s_gb = 'GB';
    var s_tb = 'TB';
    var s_pb = 'PB';

    if (lang === 'fr') {
        s_b = 'O';
        s_kb = 'Ko';
        s_mb = 'Mo';
        s_gb = 'Go';
        s_tb = 'To';
        s_pb = 'Po';
    }

    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    var gigabyte = megabyte * 1024;
    var terabyte = gigabyte * 1024;
    var petabyte = terabyte * 1024;
    var resultSize = 0;
    var resultUnit = '';

    if (precision === undefined) {
        if (bytes > gigabyte) {
            precision = 2;
        }
        else if (bytes > megabyte) {
            precision = 1;
        }
    }

    if (!bytes) {
        resultSize = 0;
        resultUnit = s_mb;
    }
    else if ((bytes >= 0) && (bytes < kilobyte)) {
        resultSize = parseInt(bytes);
        resultUnit = s_b;
    }
    else if ((bytes >= kilobyte) && (bytes < megabyte)) {
        resultSize = (bytes / kilobyte).toFixed(precision);
        resultUnit = s_kb;
    }
    else if ((bytes >= megabyte) && (bytes < gigabyte)) {
        resultSize = (bytes / megabyte).toFixed(precision);
        resultUnit = s_mb;
    }
    else if ((bytes >= gigabyte) && (bytes < terabyte)) {
        resultSize = (bytes / gigabyte).toFixed(precision);
        resultUnit = s_gb;
    }
    else if ((bytes >= terabyte) && (bytes < petabyte)) {
        resultSize = (bytes / terabyte).toFixed(precision);
        resultUnit = s_tb;
    }
    else if (bytes >= petabyte) {
        resultSize = (bytes / petabyte).toFixed(precision);
        resultUnit = s_pb;
    }
    else {
        resultSize = parseInt(bytes);
        resultUnit = s_b;
    }

    // XXX: If ever adding more HTML here, make sure it's safe and/or sanitize it.
    if (html_format === 2) {
        return resultSize + '<span>' + resultUnit + '</span>';
    }
    else if (html_format) {
        return '<span>' + resultSize + '</span>' + resultUnit;
    }
    else {
        return resultSize + ' ' + resultUnit;
    }
}

function makeid(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/**
 * Checks if the email address is valid
 * @param {String} email The email address to validate
 * @returns {Boolean} Returns true if email is invalid, false if email is fine
 */
function checkMail(email) {
    email = email.replace(/\+/g, '');
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (filter.test(email)) {
        return false;
    }
    else {
        return true;
    }
}

/**
 * Adds on, bind, unbind, one and trigger methods to a specific class's prototype.
 *
 * @param kls class on which prototype this method should add the on, bind, unbind, etc methods
 */
function makeObservable(kls) {
    var target = kls.prototype || kls;
    var aliases = ['on', 'bind', 'unbind', 'one', 'trigger', 'rebind'];

    aliases.forEach(function(fn) {
        target[fn] = function() {
            var $this = $(this);
            return $this[fn].apply($this, arguments);
        };
    });

    target = aliases = kls = undefined;
}

/**
 * Instantiates an enum-like list on the provided target object
 */
function makeEnum(aEnum, aPrefix, aTarget, aNorm) {
    aTarget = aTarget || {};

    var len = aEnum.length;
    while (len--) {
        Object.defineProperty(aTarget,
            (aPrefix || '') + String(aEnum[len]).toUpperCase(), {
                value: aNorm ? len : (1 << len),
                enumerable: true
            });
    }
    return aTarget;
}

/**
 * Adds simple .setMeta and .getMeta functions, which can be used to store some meta information on the fly.
 * Also triggers `onMetaChange` events (only if the `kls` have a `trigger` method !)
 *
 * @param kls {Class} on which prototype's this method should add the setMeta and getMeta
 */
function makeMetaAware(kls) {
    /**
     * Store meta data
     *
     * @param prefix string
     * @param namespace string
     * @param k string
     * @param val {*}
     */
    kls.prototype.setMeta = function(prefix, namespace, k, val) {
        var self = this;

        if (self["_" + prefix] === undefined) {
            self["_" + prefix] = {};
        }
        if (self["_" + prefix][namespace] === undefined) {
            self["_" + prefix][namespace] = {};
        }
        self["_" + prefix][namespace][k] = val;

        if (self.trigger) {
            self.trigger("onMetaChange", prefix, namespace, k, val);
        }
    };

    /**
     * Clear/delete meta data
     *
     * @param prefix string  optional
     * @param [namespace] string  optional
     * @param [k] string optional
     */
    kls.prototype.clearMeta = function(prefix, namespace, k) {
        var self = this;

        if (!self["_" + prefix]) {
            return;
        }

        if (prefix && !namespace && !k) {
            delete self["_" + prefix];
        }
        else if (prefix && namespace && !k) {
            delete self["_" + prefix][namespace];
        }
        else if (prefix && namespace && k) {
            delete self["_" + prefix][namespace][k];
        }

        if (self.trigger) {
            self.trigger("onMetaChange", prefix, namespace, k);
        }
    };

    /**
     * Retrieve meta data
     *
     * @param prefix {string}
     * @param namespace {string} optional
     * @param k {string} optional
     * @param default_value {*} optional
     * @returns {*}
     */
    kls.prototype.getMeta = function(prefix, namespace, k, default_value) {
        var self = this;

        namespace = namespace || undefined; /* optional */
        k = k || undefined; /* optional */
        default_value = default_value || undefined; /* optional */

        // support for calling only with 2 args.
        if (k === undefined) {
            if (self["_" + prefix] === undefined) {
                return default_value;
            }
            else {
                return self["_" + prefix][namespace] || default_value;
            }
        }
        else {
            // all args

            if (self["_" + prefix] === undefined) {
                return default_value;
            }
            else if (self["_" + prefix][namespace] === undefined) {
                return default_value;
            }
            else {
                return self["_" + prefix][namespace][k] || default_value;
            }
        }
    };
}

/**
 * Simple method for generating unique event name with a .suffix that is a hash of the passed 3-n arguments
 * Main purpose is to be used with jQuery.bind and jQuery.unbind.
 *
 * @param eventName {string} event name
 * @param name {string} name of the handler (e.g. .suffix)
 * @returns {string} e.g. $eventName.$name_$ShortHashOfTheAdditionalArguments
 */
function generateEventSuffixFromArguments(eventName, name) {
    var args = Array.prototype.splice.call(arguments, 2);
    var result = "";
    $.each(args, function(k, v) {
        result += v;
    });

    return eventName + "." + name + "_" + ("" + fastHashFunction(result)).replace("-", "_");
}

/**
 * This is a placeholder, which will be used anywhere in our code where we need a simple and FAST hash function.
 * later on, we can change the implementation (to use md5 or murmur) by just changing the function body of this
 * function.
 * @param {String}
 */
function fastHashFunction(val) {
    return MurmurHash3(val, 0x4ef5391a).toString();
}

/**
 * Creates a promise, which will fail if the validateFunction() don't return true in a timely manner (e.g. < timeout).
 *
 * @param validateFunction {Function}
 * @param tick {int}
 * @param timeout {int}
 * @param [resolveRejectArgs] {(Array|*)} args that will be used to call back .resolve/.reject
 * @param [waitForPromise] {(MegaPromise|$.Deferred)} Before starting the timer, we will wait for this promise to be rej/res first.
 * @param [name] {String} optional name for the debug output of the error/debug messages
 * @returns {Deferred}
 */
function createTimeoutPromise(validateFunction, tick, timeout,
                              resolveRejectArgs, waitForPromise, name) {
    var tickInterval = false;
    var timeoutTimer = false;

    var $promise = new MegaPromise();
    resolveRejectArgs = resolveRejectArgs || [];
    if (!$.isArray(resolveRejectArgs)) {
        resolveRejectArgs = [resolveRejectArgs]
    }

    $promise.verify = function() {
        if (validateFunction()) {
            if (window.d && typeof(window.promisesDebug) !== 'undefined') {
                console.debug("Resolving timeout promise", name,
                    timeout, "ms", "at", (new Date()).toISOString(),
                    validateFunction, resolveRejectArgs);
            }
            $promise.resolve.apply($promise, resolveRejectArgs);
        }
    };

    var startTimerChecks = function() {
        tickInterval = setInterval(function() {
            $promise.verify();
        }, tick);

        timeoutTimer = setTimeout(function() {
            if (validateFunction()) {
                if (window.d && typeof(window.promisesDebug) !== 'undefined') {
                    console.debug("Resolving timeout promise", name,
                        timeout, "ms", "at", (new Date()).toISOString(),
                        validateFunction, resolveRejectArgs);
                }
                $promise.resolve.apply($promise, resolveRejectArgs);
            }
            else {
                console.error("Timed out after waiting", name,
                    timeout, "ms", "at", (new Date()).toISOString(), $promise.state(),
                    validateFunction, resolveRejectArgs);
                $promise.reject.apply($promise, resolveRejectArgs);
            }
        }, timeout);

        $promise.verify();
    };

    // stop any running timers and timeouts
    $promise.always(function() {
        if (tickInterval !== false) {
            clearInterval(tickInterval);
        }

        if (timeoutTimer !== false) {
            clearTimeout(timeoutTimer);
        }
    });


    if (!waitForPromise || !waitForPromise.done) {
        startTimerChecks();
    }
    else {
        waitForPromise
            .done(function() {
                startTimerChecks();
            })
            .fail(function() {
                $promise.reject();
            });
    }

    return $promise;
}

/**
 * Assertion exception.
 * @param message
 *     Message for exception on failure.
 * @constructor
 */
function AssertionFailed(message) {
    this.message = message;
    this.stack = M.getStack();
}
AssertionFailed.prototype = Object.create(Error.prototype);
AssertionFailed.prototype.name = 'AssertionFailed';

/**
 * Assert a given test condition.
 *
 * Throws an AssertionFailed exception with a given message, in case the condition is false.
 * The message is assembled by the args following 'test', similar to console.log()
 *
 * @param test
 *     Test statement.
 */
function assert(test) {
    if (test) {
        return;
    }
    //assemble message from parameters
    var message = '';
    var last = arguments.length - 1;
    for (var i = 1; i <= last; i++) {
        message += arguments[i];
        if (i < last) {
            message += ' ';
        }
    }
    if (MegaLogger && MegaLogger.rootLogger) {
        MegaLogger.rootLogger.error("assertion failed: ", message);
    }
    else if (window.d) {
        console.error(message);
    }

    if (localStorage.stopOnAssertFail) {
        debugger;
    }

    throw new AssertionFailed(message);
}


/**
 * Assert that a user handle is potentially valid (e. g. not an email address).
 *
 * @param userHandle {string}
 *     The user handle to check.
 * @throws
 *     Throws an exception on something that does not seem to be a user handle.
 */
var assertUserHandle = function(userHandle) {
    try {
        if (typeof userHandle !== 'string'
                || base64urldecode(userHandle).length !== 8) {

            throw 1;
        }
    }
    catch (ex) {
        assert(false, 'This seems not to be a user handle: ' + userHandle);
    }
};


/**
 * Pad/prepend `val` with "0" (zeros) until the length is === `length`
 *
 * @param val {String} value to add "0" to
 * @param len {Number} expected length
 * @returns {String}
 */
function addZeroIfLenLessThen(val, len) {
    if (val.toString().length < len) {
        for (var i = val.toString().length; i < len; i++) {
            val = "0" + val;
        }
    }
    return val;
}

function ASSERT(what, msg, udata) {
    if (!what) {
        var af = new Error('failed assertion; ' + msg);
        if (udata) {
            af.udata = udata;
        }
        Soon(function() {
            throw af;
        });
        if (console.assert) {
            console.assert(what, msg);
        }
        else {
            console.error('FAILED ASSERTION', msg);
        }
    }
    return !!what;
}

// log failures through jscrashes system
function srvlog(msg, data, silent) {
    if (data && !(data instanceof Error)) {
        data = {
            udata: data
        };
    }
    if (!silent && d) {
        console.error(msg, data);
    }
    if (typeof window.onerror === 'function') {
        window.onerror(msg, '', data ? 1 : -1, 0, data || null);
    }
}

// log failures through event id 99666
function srvlog2(type /*, ...*/) {
    if (d || window.exTimeLeft) {
        var args    = toArray.apply(null, arguments);
        var version = buildVersion.website;

        if (is_extension) {
            if (is_chrome_firefox) {
                version = window.mozMEGAExtensionVersion || buildVersion.firefox;
            }
            else if (window.chrome) {
                version = buildVersion.chrome;
            }
            else {
                version = buildVersion.commit && buildVersion.commit.substr(0, 8) || '?';
            }
        }
        args.unshift((is_extension ? 'e' : 'w') + (version || '-'));

        api_req({a: 'log', e: 99666, m: JSON.stringify(args)});
    }
}


function oDestroy(obj) {
    if (window.d) {
        ASSERT(Object.isFrozen(obj) === false, 'Object already frozen...');
    }

    Object.keys(obj).forEach(function(memb) {
        if (obj.hasOwnProperty(memb)) {
            delete obj[memb];
        }
    });
    if (!oIsFrozen(obj)) {
        Object.defineProperty(obj, ":$:frozen:", {
            value: String(new Date()),
            writable: false
        });
    }

    if (window.d) {
        Object.freeze(obj);
    }
}

function oIsFrozen(obj) {
    return obj && typeof obj === 'object' && obj.hasOwnProperty(":$:frozen:");
}

/**
 * Original: http://stackoverflow.com/questions/7317299/regex-matching-list-of-emoticons-of-various-type
 *
 * @param text
 * @returns {XML|string|void}
 * @constructor
 */
function RegExpEscape(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function unixtimeToTimeString(timestamp) {
    var date = new Date(timestamp * 1000);
    return addZeroIfLenLessThen(date.getHours(), 2)
        + ":" + addZeroIfLenLessThen(date.getMinutes(), 2);
}


/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @author <a href="mailto:gary.court.gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby.gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
function MurmurHash3(key, seed) {
    var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

    remainder = key.length & 3; // key.length % 4
    bytes = key.length - remainder;
    h1 = seed || 0xe6546b64;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;

    while (i < bytes) {
        k1 =
            ((key.charCodeAt(i) & 0xff)) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;

        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
    }

    k1 = 0;

    switch (remainder) {
        case 3:
            k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2:
            k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1:
            k1 ^= (key.charCodeAt(i) & 0xff);

            k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= k1;
    }

    h1 ^= key.length;

    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
}

/**
 * Ask the user for a decryption key
 * @param {String} ph   The node's handle
 * @param {String} fl   Whether is a folderlink
 * @param {String} keyr If a wrong key was used
 * @return {MegaPromise}
 */
function mKeyDialog(ph, fl, keyr) {
    var promise = new MegaPromise();

    if (keyr) {
        $('.fm-dialog.dlkey-dialog .instruction-message')
            .text(l[9048]);
    }
    else {
        $('.fm-dialog.dlkey-dialog .instruction-message')
            .safeHTML(l[7945] + '<br/>' + l[7972]);
    }

    $('.new-download-buttons').addClass('hidden');
    $('.new-download-file-title').text(l[1199]);
    $('.new-download-file-icon').addClass(fileIcon({
        name: 'unknown.unknown'
    }));
    $('.fm-dialog.dlkey-dialog').removeClass('hidden');
    fm_showoverlay();

    $('.fm-dialog.dlkey-dialog input').rebind('keydown', function(e) {
        $('.fm-dialog.dlkey-dialog .fm-dialog-new-folder-button').addClass('active');
        if (e.keyCode === 13) {
            $('.fm-dialog.dlkey-dialog .fm-dialog-new-folder-button').click();
        }
    });

    $('.fm-dialog.dlkey-dialog .fm-dialog-new-folder-button').rebind('click', function(e) {

        // Trim the input from the user for whitespace, newlines etc on either end
        var key = $.trim($('.fm-dialog.dlkey-dialog input').val());

        if (key) {
            // Remove the ! from the key which is exported from the export dialog
            key = key.replace('!', '');

            var newHash = (fl ? '/F!' : '/!') + ph + '!' + key;

            if (getSitePath() !== newHash) {
                promise.resolve(key);

                fm_hideoverlay();
                $('.fm-dialog.dlkey-dialog').addClass('hidden');
                loadSubPage(newHash);
            }
        }
        else {
            promise.reject();
        }
    });
    $('.fm-dialog.dlkey-dialog .fm-dialog-close').rebind('click', function(e) {
        $('.fm-dialog.dlkey-dialog').addClass('hidden');
        fm_hideoverlay();
        promise.reject();
    });

    return promise;
}

function mRandomToken(pfx) {
    // return (pfx || '!') + '$' + (Math.random() * Date.now()).toString(36);
    return (pfx || '') + '!' + (Date.now() - 15e11).toString(36) + rand(0x10000).toString(36);
}

function str_mtrunc(str, len) {
    if (!len) {
        len = 35;
    }
    if (len > (str || '').length) {
        return str;
    }
    var p1 = Math.ceil(0.60 * len),
        p2 = Math.ceil(0.30 * len);
    return str.substr(0, p1) + '\u2026' + str.substr(-p2);
}

function percent_megatitle() {
    var dl_r = 0;
    var dl_t = 0;
    var ul_r = 0;
    var ul_t = 0;
    var tp = $.transferprogress || {};
    var dl_s = 0;
    var ul_s = 0;
    var zips = {};
    var t, i;

    for (i = dl_queue.length; i--;) {
        var q = dl_queue[i];
        var td = q && tp[q.zipid ? 'zip_' + q.zipid : 'dl_' + q.id];

        if (td) {
            dl_r += td[0];
            dl_t += td[1];
            if (!q.zipid || !zips[q.zipid]) {
                if (q.zipid) {
                    zips[q.zipid] = 1;
                }
                dl_s += td[2];
            }
        }
        else {
            dl_t += q && q.size || 0;
        }
    }

    for (i = ul_queue.length; i--;) {
        var tu = tp['ul_' + ul_queue[i].id];

        if (tu) {
            ul_r += tu[0];
            ul_t += tu[1];
            ul_s += tu[2];
        }
        else {
            ul_t += ul_queue[i].size || 0;
        }
    }

    if (dl_t) {
        dl_t += tp['dlc'] || 0;
        dl_r += tp['dlc'] || 0;
    }
    if (ul_t) {
        ul_t += tp['ulc'] || 0;
        ul_r += tp['ulc'] || 0;
    }

    var x_ul = Math.floor(ul_r / ul_t * 100) || 0;
    var x_dl = Math.floor(dl_r / dl_t * 100) || 0;

    mega.ui.tpp.setTotalProgress(x_ul, 'ul');
    mega.ui.tpp.setTotalProgress(x_dl, 'dl');

    if (dl_t && ul_t) {
        t = ' \u2193 ' + x_dl + '% \u2191 ' + x_ul + '%';
    }
    else if (dl_t) {
        t = ' \u2193 ' + x_dl + '%';
    }
    else if (ul_t) {
        t = ' \u2191 ' + x_ul + '%';
    }
    else {
        t = '';
        $.transferprogress = Object.create(null);
    }
    megatitle(t);

    var d_deg = 360 * x_dl / 100;
    var u_deg = 360 * x_ul / 100;
    var $dl_rchart = $('.transfers .download .nw-fm-chart0.right-c p');
    var $dl_lchart = $('.transfers .download .nw-fm-chart0.left-c p');
    var $ul_rchart = $('.transfers .upload .nw-fm-chart0.right-c p');
    var $ul_lchart = $('.transfers .upload .nw-fm-chart0.left-c p');

    if (d_deg <= 180) {
        $dl_rchart.css('transform', 'rotate(' + d_deg + 'deg)');
        $dl_lchart.css('transform', 'rotate(0deg)');
    }
    else {
        $dl_rchart.css('transform', 'rotate(180deg)');
        $dl_lchart.css('transform', 'rotate(' + (d_deg - 180) + 'deg)');
    }
    if (u_deg <= 180) {
        $ul_rchart.css('transform', 'rotate(' + u_deg + 'deg)');
        $ul_lchart.css('transform', 'rotate(0deg)');
    }
    else {
        $ul_rchart.css('transform', 'rotate(180deg)');
        $ul_lchart.css('transform', 'rotate(' + (u_deg - 180) + 'deg)');
    }
}

function hostname(url) {
    if (d) {
        ASSERT(url && /^http/.test(url), 'Invalid URL passed to hostname() -> ' + url);
    }
    url = ('' + url).match(/https?:\/\/([^.]+)/);
    return url && url[1];
}

function moveCursortoToEnd(el) {
    if (typeof el.selectionStart === "number") {
        el.focus();
        el.selectionStart = el.selectionEnd = el.value.length;
    }
    else if (typeof el.createTextRange !== "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
    $(el).focus();
}

function asyncApiReq(data) {
    var $promise = new MegaPromise();
    api_req(data, {
        callback: function(r) {
            if (typeof r === 'number' && r !== 0) {
                $promise.reject.apply($promise, arguments);
            }
            else {
                $promise.resolve.apply($promise, arguments);
            }
        }
    });

    //TODO: fail case?! e.g. the exp. backoff failed after waiting for X minutes??

    return $promise;
}

// Returns pixels position of element relative to document (top left corner) OR to the parent (IF the parent and the
// target element are both with position: absolute)
function getHtmlElemPos(elem, n) {
    var xPos = 0;
    var yPos = 0;
    var sl, st, cl, ct;
    var pNode;
    while (elem) {
        pNode = elem.parentNode;
        sl = 0;
        st = 0;
        cl = 0;
        ct = 0;
        if (pNode && pNode.tagName && !/html|body/i.test(pNode.tagName)) {
            if (typeof n === 'undefined') // count this in, except for overflow huge menu
            {
                sl = elem.scrollLeft;
                st = elem.scrollTop;
            }
            cl = elem.clientLeft;
            ct = elem.clientTop;
            xPos += (elem.offsetLeft - sl + cl);
            yPos += (elem.offsetTop - st - ct);
        }
        elem = elem.offsetParent;
    }
    return {
        x: xPos,
        y: yPos
    };
}

/**
 * Detects if Flash is enabled or disabled in the user's browser
 * From http://stackoverflow.com/a/20095467
 * @returns {Boolean}
 */
function flashIsEnabled() {

    var flashEnabled = false;

    try {
        var flashObject = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if (flashObject) {
            flashEnabled = true;
        }
    }
    catch (e) {
        if (navigator.mimeTypes
                && (navigator.mimeTypes['application/x-shockwave-flash'] !== undefined)
                && (navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin)) {
            flashEnabled = true;
        }
    }

    return flashEnabled;
}

/**
 * Gets the current base URL of the page (protocol + hostname) e.g. If on beta.mega.nz it will return https://beta.mega.nz.
 * If on the browser extension it will return the default https://mega.nz. If on localhost it will return https://mega.nz.
 * This can be used to create external links, for example file downloads https://mega.nz/#!qRN33YbK!o4Z76qDqPbiK2G0I...
 * @returns {String}
 */
function getBaseUrl() {
    return 'https://' + (((location.protocol === 'https:') && location.host) || 'mega.nz');
}

/**
 * Like getBaseUrl(), but suitable for extensions to point to internal resources.
 * This should be the same than `bootstaticpath + urlrootfile` except that may differ
 * from a public entry point (Such as the Firefox extension and its mega: protocol)
 * @returns {string}
 */
function getAppBaseUrl() {
    var l = location;
    var base = (l.origin !== 'null' && l.origin || (l.protocol + '//' + l.hostname));
    if (is_extension) {
        base += l.pathname;
    }
    return base;
}

/**
 * http://stackoverflow.com/a/16344621/402133
 *
 * @param ms
 * @returns {string}
 */
function ms2Time(ms) {
    var secs = ms / 1000;
    ms = Math.floor(ms % 1000);
    var minutes = secs / 60;
    secs = Math.floor(secs % 60);
    var hours = minutes / 60;
    minutes = Math.floor(minutes % 60);
    hours = Math.floor(hours % 24);
    return hours + ":" + minutes + ":" + secs;
}

function secToDuration(s, sep) {
    var dur = ms2Time(s * 1000).split(":");
    var durStr = "";
    sep = sep || ", ";
    if (!secToDuration.regExp) { //regexp compile cache
        secToDuration.regExp = {};
    }

    if (!secToDuration.regExp[sep]) {
        secToDuration.regExp[sep] = new RegExp("" + sep + "$");
    }

    for (var i = 0; i < dur.length; i++) {
        var unit;
        var v = dur[i];
        if (v === "0") {
            if (durStr.length !== 0 && i !== 0) {
                continue;
            }
            else if (i < 2) {
                continue;
            }
        }

        if (i === 0) {
            unit = v !== 1 ? "hours" : "hour";
        }
        else if (i === 1) {
            unit = v !== 1 ? "minutes" : "minute";
        }
        else if (i === 2) {
            unit = v !== 1 ? "seconds" : "second";
        }
        else {
            throw new Error("this should never happen.");
        }

        durStr += v + " " + unit + sep;
    }

    return durStr.replace(secToDuration.regExp[sep], "");
}

function generateAnonymousReport() {
    var $promise = new MegaPromise();
    var report = {};
    report.ua = navigator.userAgent;
    report.ut = u_type;
    report.pbm = !!window.Incognito;
    report.io = window.dlMethod && dlMethod.name;
    report.sb = +('' + $('script[src*="secureboot"]').attr('src')).split('=').pop();
    report.tp = $.transferprogress;
    if (!megaChatIsReady) {
        report.karereState = '#disabled#';
    }
    else {
        report.numOpenedChats = Object.keys(megaChat.chats).length;
        report.haveRtc = megaChat.rtc ? true : false;
        if (report.haveRtc) {
            report.rtcStatsAnonymousId = megaChat.rtc.ownAnonId;
        }
    }

    var chatStates = {};
    var userAnonMap = {};
    var userAnonIdx = 0;
    var roomUniqueId = 0;
    var roomUniqueIdMap = {};

    if (megaChatIsReady && megaChat.chats) {
        megaChat.chats.forEach(function (v, k) {
            var participants = v.getParticipants();

            participants.forEach(function (v, k) {
                var cc = M.u[v];
                if (cc && cc.u && !userAnonMap[cc.u]) {
                    userAnonMap[cc.u] = {
                        anonId: userAnonIdx++ + rand(1000),
                        pres: megaChat.getPresence(v)
                    };
                }
                participants[k] = cc && cc.u ? userAnonMap[cc.u] : v;
            });

            var r = {
                'roomUniqueId': roomUniqueId,
                'roomState': v.getStateAsText(),
                'roomParticipants': participants
            };

            chatStates[roomUniqueId] = r;
            roomUniqueIdMap[k] = roomUniqueId;
            roomUniqueId++;
        });

        if (report.haveRtc) {
            var callSessions = megaChat.plugins.callManager.callSessions ?
                megaChat.plugins.callManager.callSessions :
                megaChat.plugins.callManager._calls;

            Object.keys(callSessions).forEach(function (k) {
                var v = callSessions[k];

                var r = {
                    'callStats': v.callStats,
                    'state': v.state
                };

                var roomIdx = roomUniqueIdMap[v.room.roomId];
                if (!roomIdx) {
                    roomUniqueId += 1; // room which was closed, create new tmp id;
                    roomIdx = roomUniqueId;
                }
                if (!chatStates[roomIdx]) {
                    chatStates[roomIdx] = {};
                }
                if (!chatStates[roomIdx].callSessions) {
                    chatStates[roomIdx].callSessions = [];
                }
                chatStates[roomIdx].callSessions.push(r);
            });
        };

        report.chatRoomState = chatStates;
    };

    if (is_chrome_firefox) {
        report.mo = mozBrowserID + '::' + is_chrome_firefox + '::' + mozMEGAExtensionVersion;
    }

    var apireqHaveBackOffs = {};
    apixs.forEach(function(v, k) {
        if (v.backoff > 0) {
            apireqHaveBackOffs[k] = v.backoff;
        }
    });

    if (Object.keys(apireqHaveBackOffs).length > 0) {
        report.apireqbackoffs = apireqHaveBackOffs;
    }

    report.hadLoadedRsaKeys = u_authring.RSA && Object.keys(u_authring.RSA).length > 0;
    report.hadLoadedEd25519Keys = u_authring.Ed25519 && Object.keys(u_authring.Ed25519).length > 0;
    report.totalDomElements = $("*").length;
    report.totalScriptElements = $("script").length;

    report.totalD = Object.keys(M.d).length;
    report.totalU = M.u.size();
    report.totalC = Object.keys(M.c).length;
    report.totalIpc = Object.keys(M.ipc).length;
    report.totalOpc = Object.keys(M.opc).length;
    report.totalPs = Object.keys(M.ps).length;
    report.l = lang;
    report.scrnSize = window.screen.availWidth + "x" + window.screen.availHeight;

    if (typeof window.devicePixelRatio !== 'undefined') {
        report.pixRatio = window.devicePixelRatio;
    }

    try {
        report.perfTiming = JSON.parse(JSON.stringify(window.performance.timing));
        report.memUsed = window.performance.memory.usedJSHeapSize;
        report.memTotal = window.performance.memory.totalJSHeapSize;
        report.memLim = window.performance.memory.jsHeapSizeLimit;
    }
    catch (e) {}

    report.jslC = jslcomplete;
    report.jslI = jsli;
    report.scripts = {};
    report.host = window.location.host;

    var promises = [];

    $('script').each(function() {
        var self = this;
        var src = self.src.replace(window.location.host, "$current");
        if (is_chrome_firefox) {
            if (!promises.length) {
                promises.push(MegaPromise.resolve());
            }
            report.scripts[self.src] = false;
            return;
        }
        promises.push(
            $.ajax({
                url: self.src,
                dataType: "text"
            })
            .done(function(r) {
                report.scripts[src] = [
                        MurmurHash3(r, 0x4ef5391a),
                        r.length
                    ];
            })
            .fail(function(r) {
                report.scripts[src] = false;
            })
        );
    });

    report.version = null; // TODO: how can we find this?

    MegaPromise.allDone(promises)
        .done(function() {
            $promise.resolve(report);
        })
        .fail(function() {
            $promise.resolve(report)
        });

    return $promise;
}

function __(s) { // TODO: waiting for @crodas to commit the real __ code.
    return s;
}

function MegaEvents() {}
MegaEvents.prototype.trigger = function(name, args) {
    if (!(this._events && this._events.hasOwnProperty(name))) {
        return false;
    }

    if (d > 1) {
        console.log(' >>> Triggering ' + name, this._events[name].length, args);
    }

    args = args || []
    var done = 0,
        evs = this._events[name];
    for (var i in evs) {
        try {
            evs[i].apply(null, args);
        }
        catch (ex) {
            console.error(ex);
        }
        ++done;
    }
    return done;
};
MegaEvents.prototype.on = function(name, callback) {
    if (!this._events) {
        this._events = {};
    }
    if (!this._events.hasOwnProperty(name)) {
        this._events[name] = [];
    }
    this._events[name].push(callback);
    return this;
};

(function(scope) {
    var MegaAnalytics = function(id) {
        this.loggerId = id;
        this.sessionId = makeid(16);
    };
    MegaAnalytics.prototype.log = function(c, e, data) {

        data = data || {};
        data = $.extend(
            true, {}, {
                'aid': this.sessionId,
                'lang': typeof lang !== 'undefined' ? lang : null,
                'browserlang': navigator.language,
                'u_type': typeof u_type !== 'undefined' ? u_type : null
            },
            data
        );

        var msg = JSON.stringify({
            'c': c,
            'e': e,
            'data': data
        });

        if (d) {
            console.log("megaAnalytics: ", c, e, data);
        }
        if (window.location.toString().indexOf("mega.dev") !== -1) {
            return;
        }
        api_req({
            a: 'log',
            e: this.loggerId,
            m: msg
        }, {});
    };
    scope.megaAnalytics = new MegaAnalytics(99999);
})(this);


function constStateToText(enumMap, state) {
    "use strict";
    for (var k in enumMap) {
        if (enumMap[k] === state) {
            return k;
        }
    }
    return "(not found: " + state + ")";
};

/**
 * Helper function that will do some assert()s to guarantee that the new state is correct/allowed
 *
 * @param currentState
 * @param newState
 * @param allowedStatesMap
 * @param enumMap
 * @throws AssertionError
 */
function assertStateChange(currentState, newState, allowedStatesMap, enumMap) {
    "use strict";

    assert(typeof newState !== "undefined", "assertStateChange: Invalid newState");
    var checksAvailable = allowedStatesMap[currentState];
    var allowed = false;
    if (checksAvailable) {
        checksAvailable.forEach(function(allowedState) {
            if (allowedState === newState) {
                allowed = true;
                return false; // break;
            }
        });
    }
    if (!allowed) {
        assert(
            false,
            'State change from: ' + constStateToText(enumMap, currentState) + ' to ' +
            constStateToText(enumMap, newState) + ' is not in the allowed state transitions map.'
        );
    }
}

/**
 * Perform a normal logout
 *
 * @param {Function} aCallback optional
 * @param {Bool} force optional
 */
function mLogout(aCallback, force) {
    "use strict";

    if (!force && mega.ui.passwordReminderDialog) {
        var passwordReminderLogout = mega.ui.passwordReminderDialog.recheckLogoutDialog();

        passwordReminderLogout
            .done(function() {
                mLogout(aCallback, true);
            });

        return;
    }

    var cnt = 0;
    if (M.c[M.RootID] && u_type === 0) {
        for (var i in M.c[M.RootID]) {
            cnt++;
        }
    }
    if (u_type === 0 && cnt > 0) {
        msgDialog('confirmation', l[1057], l[1058], l[1059], function (e) {
            if (e) {
                M.logout();
            }
        });
    }
    else {
        M.logout();
    }
}

/**
 * Perform a strict logout, by removing databases
 * and cleaning sessionStorage/localStorage.
 *
 * @param {String} aUserHandle optional
 */
function mCleanestLogout(aUserHandle) {
    if (u_type !== 0 && u_type !== 3) {
        throw new Error('Operation not permitted.');
    }

    mLogout(function() {
        MegaDB.dropAllDatabases(aUserHandle)
            .always(function(r) {
                console.debug('mCleanestLogout', r);

                localStorage.clear();
                sessionStorage.clear();

                setTimeout(function() {
                    location.reload(true);
                }, 7e3);
            });
    });
}

// Initialize Rubbish-Bin Cleaning Scheduler
mBroadcaster.addListener('crossTab:master', function _setup() {
    var RUBSCHED_WAITPROC =  20 * 1000;
    var RUBSCHED_IDLETIME =   4 * 1000;
    var timer, updId;

    mBroadcaster.once('crossTab:leave', _exit);

    // The fm must be initialized before proceeding
    if (!folderlink && fminitialized) {
        _fmready();
    }
    else {
        mBroadcaster.addListener('fm:initialized', _fmready);
    }

    function _fmready() {
        if (!folderlink) {
            _init();
            return 0xdead;
        }
    }

    function _update(enabled) {
        _exit();
        if (enabled) {
            _init();
        }
    }

    function _exit() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        if (updId) {
            mBroadcaster.removeListener(updId);
            updId = null;
        }
    }

    function _init() {
        // if (d) console.log('Initializing Rubbish-Bin Cleaning Scheduler');

        // updId = mBroadcaster.addListener('fmconfig:rubsched', _update);
        if (fmconfig.rubsched) {
            timer = setInterval(function() {
                // Do nothing unless the user has been idle
                if (Date.now() - lastactive < RUBSCHED_IDLETIME) {
                    return;
                }
                _exit();

                dbfetch.coll([M.RubbishID], new MegaPromise()).wait(_proc);

            }, RUBSCHED_WAITPROC);
        }
    }

    function _proc() {

        // Mode 14 - Remove files older than X days
        // Mode 15 - Keep the Rubbish-Bin under X GB
        var mode = String(fmconfig.rubsched).split(':');
        var xval = mode[1];
        mode = +mode[0];

        var handler = _rubSchedHandler[mode];
        if (!handler) {
            throw new Error('Invalid RubSchedHandler', mode);
        }

        if (d) {
            console.log('Running Rubbish Bin Cleaning Scheduler', mode, xval);
            console.time('rubsched');
        }

        // Watch how long this is running
        var startTime = Date.now();

        // Get nodes in the Rubbish-bin
        var nodes = Object.keys(M.c[M.RubbishID] || {});
        var rubnodes = [];

        for (var i = nodes.length; i--; ) {
            var node = M.d[nodes[i]];
            if (!node) {
                console.error('Invalid node', nodes[i]);
                continue;
            }
            rubnodes = rubnodes.concat(M.getNodesSync(node.h, true));
        }

        rubnodes.sort(handler.sort);
        var rNodes = handler.log(rubnodes);

        // if (d) console.log('rubnodes', rubnodes, rNodes);

        var handles = [];
        if (handler.purge(xval)) {
            for (var i in rubnodes) {
                var node = M.d[rubnodes[i]];

                if (handler.remove(node, xval)) {
                    handles.push(node.h);

                    if (handler.ready(node, xval)) {
                        break;
                    }

                    // Abort if this has been running for too long..
                    if ((Date.now() - startTime) > 7000) {
                        break;
                    }
                }
            }

            // if (d) console.log('RubSched-remove', handles);

            if (handles.length) {
                var inRub = (M.RubbishID === M.currentrootid);

                handles.map(function(handle) {
                    M.delNode(handle, true);    // must not update DB pre-API
                    api_req({a: 'd', n: handle/*, i: requesti*/});

                    if (inRub) {
                        $('.grid-table.fm#' + handle).remove();
                        $('.data-block-view#' + handle).remove();
                    }
                });

                if (inRub) {
                    M.addViewUI();
                }
            }
        }

        if (d) {
            console.timeEnd('rubsched');
        }

        // Once we ran for the first time, set up a long running scheduler
        RUBSCHED_WAITPROC = 4 * 3600 * 1e3;
        _init();
    }

    /**
     * Scheduler Handlers
     *   Sort:    Sort nodes specifically for the handler purpose
     *   Log:     Keep a record of nodes if required and return a debugable array
     *   Purge:   Check whether the Rubbish-Bin should be cleared
     *   Remove:  Return true if the node is suitable to get removed
     *   Ready:   Once a node is removed, check if the criteria has been meet
     */
    var _rubSchedHandler = {
        // Remove files older than X days
        "14": {
            sort: function(n1, n2) {
                return M.d[n1].ts > M.d[n2].ts;
            },
            log: function(nodes) {
                return d && nodes.map(function(node) {
                    return M.d[node].name + '~' + (new Date(M.d[node].ts*1000)).toISOString();
                });
            },
            purge: function(limit) {
                return true;
            },
            remove: function(node, limit) {
                limit = (Date.now() / 1e3) - (limit * 86400);
                return node.ts < limit;
            },
            ready: function(node, limit) {
                return false;
            }
        },
        // Keep the Rubbish-Bin under X GB
        "15": {
            sort: function(n1, n2) {
                n1 = M.d[n1].s || 0;
                n2 = M.d[n2].s || 0;
                return n1 < n2;
            },
            log: function(nodes) {
                var pnodes, size = 0;

                pnodes = nodes.map(function(node) {
                    size += (M.d[node].s || 0);
                    return M.d[node].name + '~' + bytesToSize(M.d[node].s);
                });

                this._size = size;

                return pnodes;
            },
            purge: function(limit) {
                return this._size > (limit * 1024 * 1024 * 1024);
            },
            remove: function(node, limit) {
                return true;
            },
            ready: function(node, limit) {
                this._size -= (node.s || 0);
                return this._size < (limit * 1024 * 1024 * 1024);
            }
        }
    };
});

/** prevent tabnabbing attacks */
mBroadcaster.once('startMega', function() {
    return;

    if (!(window.chrome || window.safari || window.opr)) {
        return;
    }

    // Check whether is safe to open a link through the native window.open
    var isSafeTarget = function(link) {
        link = String(link);

        var allowed = [
            getBaseUrl(),
            getAppBaseUrl()
        ];

        var rv = allowed.some(function(v) {
            return link.indexOf(v) === 0;
        });

        if (d) {
            console.log('isSafeTarget', link, rv);
        }

        return rv || (location.hash.indexOf('fm/chat') === -1);
    };

    var open = window.open;
    delete window.open;

    // Replace the native window.open which will open unsafe links through a hidden iframe
    Object.defineProperty(window, 'open', {
        writable: false,
        enumerable: true,
        value: function(url) {
            var link = document.createElement('a');
            link.href = url;

            if (isSafeTarget(link.href)) {
                return open.apply(window, arguments);
            }

            var iframe = mCreateElement('iframe', {type: 'content', style: 'display:none'}, 'body');
            var data = 'var win=window.open("' + escapeHTML(link) + '");if(win)win.opener = null;';
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            var script = doc.createElement('script');
            script.type = 'text/javascript';
            script.src = mObjectURL([data], script.type);
            script.onload = SoonFc(function() {
                myURL.revokeObjectURL(script.src);
                document.body.removeChild(iframe);
            });
            doc.body.appendChild(script);
        }
    });

    // Catch clicks on links and forward them to window.open
    document.documentElement.addEventListener('click', function(ev) {
        var node = Object(ev.target);

        if (node.nodeName === 'A' && node.href
                && String(node.getAttribute('target')).toLowerCase() === '_blank'
                && !isSafeTarget(node.href)) {

            ev.stopPropagation();
            ev.preventDefault();

            window.open(node.href);
        }
    }, true);
});

/**
 * Simple alias that will return a random number in the range of: a < b
 *
 * @param a {Number} min
 * @param b {Number} max
 * @returns {*}
 */
function rand_range(a, b) {
    return Math.random() * (b - a) + a;
}

/**
 * Invoke the password manager in Chrome.
 *
 * There are some requirements for this function work propertly:
 *
 *  1. The username/password needs to be in a <form/>
 *  2. The form needs to be filled and visible when this function is called
 *  3. After this function is called, within the next second the form needs to be gone
 *
 * As an example take a look at the `tooltiplogin()` function in `index.js`.
 *
 * @param {String|Object} form jQuery selector of the form
 * @return {Bool}   True if the password manager can be called.
 *
 */
function passwordManager(form) {
    if (is_chrome_firefox) {
        var creds = passwordManager.pickFormFields(form);
        if (creds) {
            mozRunAsync(mozLoginManager.saveLogin.bind(mozLoginManager, creds.usr, creds.pwd));
        }
        $(form).find('input').val('');
        return;
    }
    if (typeof history !== "object") {
        return false;
    }
    $(form).rebind('submit', function() {
        setTimeout(function() {
            var path = getSitePath();
            history.replaceState({ success: true }, '', "index.html#" + document.location.hash.substr(1));
            if (hashLogic || isPublicLink(path)) {
                path = path.replace('/', '/#');

                if (location.href.substr(0, 19) === 'chrome-extension://') {
                    path = path.replace('/#', '/mega/secure.html#');
                }
            }
            history.replaceState({ success: true, subpage: path.replace('#','').replace('/','') }, '', path);
            $(form).find('input').val('');
        }, 1000);
        return false;
    }).submit();
    return true;
}
passwordManager.knownForms = Object.freeze({
    '#form_login_header': {
        usr: '#login-name',
        pwd: '#login-password'
    },
    '#login_form': {
        usr: '#login-name2',
        pwd: '#login-password2'
    },
    '#register_form': {
        usr: '#register-email',
        pwd: '#register-password'
    }
});
passwordManager.getStoredCredentials = function(password) {
    // Retrieve `keypw` and `userhash` from pwd string
    var result = null;

    if (String(password).substr(0, 2) === '~:') {
        var parts = password.substr(2).split(':');

        if (parts.length === 2) {
            try {
                var hash = parts[1];
                var keypw = base64_to_a32(parts[0]);

                if (base64_to_a32(hash).length === 2
                        && keypw.length === 4) {

                    result = {
                        hash: hash,
                        keypw: keypw
                    };
                }
            }
            catch (e) {}
        }
    }

    return result;
};
passwordManager.pickFormFields = function(form) {
    var result = null;
    var $form = $(form);

    if ($form.length) {
        if ($form.length !== 1) {
            console.error('Unexpected form selector', form);
        }
        else {
            form = passwordManager.knownForms[form];
            if (form) {
                result = {
                    usr: $form.find(form.usr).val(),
                    pwd: $form.find(form.pwd).val(),

                    selector: {
                        usr: form.usr,
                        pwd: form.pwd
                    }
                };

                if (!(result.usr && result.pwd)) {
                    result = false;
                }
            }
        }
    }

    return result;
};

/**
 * Check if the passed in element (DOMNode) is FULLY visible in the viewport.
 *
 * @param el {DOMNode}
 * @returns {boolean}
 */
function elementInViewport(el) {
    if (!verge.inY(el)) {
        return false;
    }
    if (!verge.inX(el)) {
        return false;
    }

    var rect = verge.rectangle(el);

    return !(rect.left < 0 || rect.right < 0 || rect.bottom < 0 || rect.top < 0);
}

// FIXME: This is a "Dirty Hack" (TM) that needs to be removed as soon as
//        the original problem is found and resolved.
if (typeof sjcl !== 'undefined') {
    // We need to track SJCL exceptions for ticket #2348
    sjcl.exception.invalid = function(message) {
        this.toString = function() {
            return "INVALID: " + this.message;
        };
        this.message = message;
        this.stack = M.getStack();
    };
}

(function($, scope) {
    /**
     * Share related operations.
     *
     * @param opts {Object}
     *
     * @constructor
     */
    var Share = function(opts) {

        var self = this;
        var defaultOptions = {
        };

        self.options = $.extend(true, {}, defaultOptions, opts);    };

    /**
     * isShareExists
     *
     * Checking if there's available shares for selected nodes.
     * @param {Array} nodes Holds array of ids from selected folders/files (nodes).
     * @param {Boolean} fullShare Do we need info about full share.
     * @param {Boolean} pendingShare Do we need info about pending share .
     * @param {Boolean} linkShare Do we need info about link share 'EXP'.
     * @returns {Boolean} result.
     */
    Share.prototype.isShareExist = function(nodes, fullShare, pendingShare, linkShare) {

        var self = this;

        var shares = {}, length;

        for (var i in nodes) {
            if (nodes.hasOwnProperty(i)) {

                // Look for full share
                if (fullShare) {
                    shares = M.d[nodes[i]] && M.d[nodes[i]].shares;

                    // Look for link share
                    if (linkShare) {
                        if (shares && Object.keys(shares).length) {
                            return true;
                        }
                    }
                    else { // Exclude folder/file links,
                        if (shares) {
                            length = self.getFullSharesNumber(shares);
                            if (length) {
                                return true;
                            }
                        }
                    }
                }

                // Look for pending share
                if (pendingShare) {
                    shares = M.ps[nodes[i]];

                    if (shares && Object.keys(shares).length) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    /**
     * hasExportLink, check if at least one selected item have public link.
     *
     * @param {String|Array} nodes Node id or array of nodes string
     * @returns {Boolean}
     */
    Share.prototype.hasExportLink = function(nodes) {

        if (typeof nodes === 'string') {
            nodes = [nodes];
        }

        // Loop through all selected items
        for (var i in nodes) {
            var node = M.d[nodes[i]];

            if (node && Object(node.shares).EXP) {
                return true;
            }
        }

        return false;
    };

    /**
     * getFullSharesNumber
     *
     * Loops through all shares and return number of full shares excluding
     * ex. full contacts. Why ex. full contact, in the past when client removes
     * full contact from the list, share related to client remains active on
     * owners side. That behaviour is changed/updated on API side, so now after
     * full contact relationship is removed, related shares are also removed.
     *
     * @param {Object} shares
     * @returns {Integer} result Number of shares
     */
    Share.prototype.getFullSharesNumber = function(shares) {

        var result = 0;
        var contactKeys = [];

        if (shares) {
            contactKeys = Object.keys(shares);
            $.each(contactKeys, function(ind, key) {

                // Count only full contacts
                if (M.u[key] && M.u[key].c) {
                    result++;
                }
            });
        }

        return result;
    };

    /**
     * addContactToFolderShare
     *
     * Add verified email addresses to folder shares.
     */
    Share.prototype.addContactToFolderShare = function addContactToFolderShare() {

        var promise = MegaPromise.resolve();
        var targets = [];
        var $shareDialog = $('.share-dialog');
        var $newContacts;
        var permissionLevel;
        var iconPermLvl;
        var permissionClass;
        var selectedNode;

        // Share button enabled
        if ($.dialog === 'share' && !$shareDialog.find('.dialog-share-button').is('.disabled')) {

            selectedNode = $.selected[0];
            $newContacts = $shareDialog.find('.token-input-list-mega .token-input-token-mega');

            // Is there a new contacts planned for addition to share
            if ($newContacts.length) {

                // Determin current group permission level
                iconPermLvl = $shareDialog.find('.permissions-icon')[0];
                permissionClass = checkMultiInputPermission($(iconPermLvl));
                permissionLevel = sharedPermissionLevel(permissionClass[0]);

                // Add new planned contact to list
                $.each($newContacts, function(ind, val) {
                    targets.push({u: $(val).contents().eq(1).text(), r: permissionLevel});
                });
            }

            closeDialog();
            $('.export-links-warning').addClass('hidden');

            // Add new contacts to folder share
            if (targets.length > 0) {
                promise = doShare(selectedNode, targets, true);
            }
        }

        return promise;
    };

    Share.prototype.updateNodeShares = function() {

        var self = this;
        var promise = new MegaPromise();

        loadingDialog.show();
        this.removeContactFromShare()
            .always(function() {
                var promises = [];

                if (Object($.changedPermissions).length > 0) {
                    promises.push(doShare($.selected[0], $.changedPermissions, true));
                }
                promises.push(self.addContactToFolderShare());

                MegaPromise.allDone(promises)
                    .always(function() {
                        loadingDialog.hide();
                        promise.resolve.apply(promise, arguments);
                    });
            });

        return promise;
    };


    Share.prototype.removeFromPermissionQueue = function(handleOrEmail) {

        $.changedPermissions.forEach(function(value, index) {
            if (value.u === handleOrEmail) {
                $.changedPermissions.splice(index, 1);
            }
        });
    };

    Share.prototype.removeContactFromShare = function() {

        var self = this;
        var promises = [];

        if (Object($.removedContactsFromShare).length > 0) {

            $.removedContactsFromShare.forEach(function(elem) {
                var userEmail = elem.userEmail;
                var selectedNodeHandle = elem.selectedNodeHandle;
                var handleOrEmail = elem.handleOrEmail;

                promises.push(new MegaPromise());

                // The s2 api call can remove both shares and pending shares
                api_req({
                    a: 's2',
                    n:  selectedNodeHandle,
                    s: [{ u: userEmail, r: ''}],
                    ha: '',
                    i: requesti
                }, {
                    userEmail: userEmail,
                    selectedNodeHandle: selectedNodeHandle,
                    handleOrEmail: handleOrEmail,
                    promise: promises[promises.length - 1],

                    callback : function(res, ctx) {
                        var promise = ctx.promise;

                        if (typeof res === 'object') {
                            // FIXME: examine error codes in res.r, display error
                            // to user if needed

                            // If it was a user handle, the share is a full share
                            if (M.u[ctx.handleOrEmail]) {
                                M.delNodeShare(ctx.selectedNodeHandle, ctx.handleOrEmail);
                                setLastInteractionWith(ctx.handleOrEmail, "0:" + unixtime());

                                self.removeFromPermissionQueue(ctx.handleOrEmail);
                            }
                            // Pending share
                            else {
                                var pendingContactId = M.findOutgoingPendingContactIdByEmail(ctx.userEmail);
                                M.deletePendingShare(ctx.selectedNodeHandle, pendingContactId);

                                self.removeFromPermissionQueue(ctx.userEmail);
                            }

                            // Wait for action-packet acknowledge, this is needed so that removing the last user
                            // from a share will issue an `okd` flag which removes the associated sharekey that we
                            // have to wait for *if* we're going to re-share to a different user next...
                            mBroadcaster.once('share-packet.' + ctx.selectedNodeHandle, function(packet) {
                                if (packet.okd && u_sharekeys[ctx.selectedNodeHandle]) {
                                    console.error('The sharekey should have been removed...');
                                }
                                promise.resolve(packet);
                            });
                        }
                        else {
                            // FIXME: display error to user

                            promise.reject(res);
                        }
                    }
                });
            });
        }

        return MegaPromise.allDone(promises);
    };

    // export
    scope.mega.Share = Share;
})(jQuery, window);



(function(scope) {
    /** Utilities for Set operations. */
    scope.setutils = {};

    /**
     * Helper function that will return an intersect Set of two sets given.
     *
     * @private
     * @param {Set} set1
     *     First set to intersect with.
     * @param {Set} set2
     *     Second set to intersect with.
     * @return {Set}
     *     Intersected result set.
     */
    scope.setutils.intersection = function(set1, set2) {

        var result = new Set();
        set1.forEach(function _setIntersectionIterator(item) {
            if (set2.has(item)) {
                result.add(item);
            }
        });

        return result;
    };


    /**
     * Helper function that will return a joined Set of two sets given.
     *
     * @private
     * @param {Set} set1
     *     First set to join with.
     * @param {Set} set2
     *     Second set to join with.
     * @return {Set}
     *     Joined result set.
     */
    scope.setutils.join = function(set1, set2) {

        var result = new Set(set1);
        set2.forEach(function _setJoinIterator(item) {
            result.add(item);
        });

        return result;
    };

    /**
     * Helper function that will return a Set from set1 subtracting set2.
     *
     * @private
     * @param {Set} set1
     *     First set to subtract from.
     * @param {Set} set2
     *     Second set to subtract.
     * @return {Set}
     *     Subtracted result set.
     */
    scope.setutils.subtract = function(set1, set2) {

        var result = new Set(set1);
        set2.forEach(function _setSubtractIterator(item) {
            result.delete(item);
        });

        return result;
    };

    /**
     * Helper function that will compare two Sets for equality.
     *
     * @private
     * @param {Set} set1
     *     First set to compare.
     * @param {Set} set2
     *     Second set to compare.
     * @return {Boolean}
     *     `true` if the sets are equal, `false` otherwise.
     */
    scope.setutils.equal = function(set1, set2) {

        if (set1.size !== set2.size) {
            return false;
        }

        var result = true;
        set1.forEach(function _setEqualityIterator(item) {
            if (!set2.has(item)) {
                result = false;
            }
        });

        return result;
    };
})(window);


// Constructs an extensible hashmap-like class...
function Hash(a, b, c, d) {
    if (!(this instanceof Hash)) {
        return new Hash(a, b, c, d);
    }
    var properties;
    var self = this;
    var args = toArray.apply(null, arguments);
    var proto = Hash.prototype;

    if (typeof args[0] === 'string') {
        Object.defineProperty(self, 'instance', {value: args.shift()});
        proto = self;
    }

    if (Array.isArray(args[0])) {
        properties = args.shift();
    }

    if (args[0] === false) {
        args.shift();
        proto = null;
    }

    if (typeof args[0] === 'object') {
        var methods = args.shift();
        var SuperHash = function SuperHash() {};
        SuperHash.prototype = Object.create(proto);

        for (var k in methods) {
            Object.defineProperty(SuperHash.prototype, k, {value: methods[k]});
        }
        Object.freeze(SuperHash.prototype);

        self = new SuperHash();
    }

    if (properties) {
        for (var i = properties.length; i--;) {
            Object.defineProperty(self, properties[i], {
                value: Hash(properties[i]),
                enumerable: true
            });
        }
    }

    return self;
}

Hash.prototype = Object.create(null, {
    constructor: {
        value: Hash
    },
    first: {
        get: function first() {
            for (var k in this) {
                return k
            }
        }
    },
    keys: {
        get: function keys() {
            return Object.keys(this);
        }
    },
    values: {
        get: function values() {
            return Object.values(this);
        }
    },
    length: {
        get: function length() {
            return this.keys.length;
        }
    },
    hasOwnProperty: {
        value: function hasOwnProperty(k) {
            if (d) {
                console.warn('You should not need to call Hash.hasOwnProperty...');
            }
            return Object.prototype.hasOwnProperty.call(this, k);
        }
    },
    toString: {
        value: function toString() {
            return '[hash ' + (this.instance || 'Unknown') + ']';
        }
    }
});
