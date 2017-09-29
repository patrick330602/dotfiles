function FileManager() {
    this.logger = new MegaLogger('FileManager');
}
FileManager.prototype.constructor = FileManager;

/**
 * Initialize the rendering of the cloud/file-manager
 * @details Former renderfm()
 * @returns {MegaPromise}
 */
FileManager.prototype.initFileManager = function() {
    "use strict";

    var promise = new MegaPromise();
    var tpromise;

    if (d) {
        console.time('renderfm');
    }

    if (!is_mobile) {
        this.initFileManagerUI();
    }
    this.sortByName();

    if (is_mobile) {
        tpromise = MegaPromise.resolve();
    }
    else {
        tpromise = this.renderTree();
        tpromise.always(function() {
            M.renderPath();
        });
    }

    tpromise
        .always(function() {
            var $treesub = $('#treesub_' + M.RootID);
            if (!$treesub.hasClass('opened')) {
                $('.fm-tree-header.cloud-drive-item').addClass('opened');
                $treesub.addClass('opened');
            }

            M.openFolder(M.currentdirid)
                .always(function() {
                    if (megaChatIsReady) {
                        megaChat.renderMyStatus();
                    }

                    if (d) {
                        console.timeEnd('renderfm');
                    }

                    promise.resolve.apply(promise, arguments);
                });
        });

    return promise;
};

/**
 * Invoke callback once the fm has been initialized
 * @param {Boolean} [ifMaster] Invoke callback if running under a master tab
 * @param {Function} callback The function to invoke
 */
FileManager.prototype.onFileManagerReady = function(ifMaster, callback) {
    'use strict';

    if (typeof ifMaster === 'function') {
        callback = ifMaster;
        ifMaster = false;
    }

    callback = (function(callback) {
        return function() {
            if (!ifMaster || mBroadcaster.crossTab.master) {
                callback();
            }
        };
    })(callback);

    if (fminitialized) {
        onIdle(callback);
    }
    else {
        mBroadcaster.once('fm:initialized', callback);
    }
};

/**
 * Initialize the cloud/file-manager UI components
 * @details Former initUI()
 */
FileManager.prototype.initFileManagerUI = function() {
    "use strict";

    if (d) {
        console.time('initUI');
    }
    $('.not-logged .fm-not-logged-button.create-account').rebind('click', function() {
        loadSubPage('register');
    });

    $('.fm-dialog-overlay').rebind('click.fm', function(ev) {
        closeDialog(ev);
        $.hideContextMenu();

        // For ephemeral session redirect to 'fm' page
        // if user clicks overlay instead Yes/No or close icon 'x'
        // One situation when this is used, is when ephemeral user
        //  trying to access settings directly via url
        if (u_type === 0) {
            loadSubPage('fm');
        }
    });
    if (folderlink) {
        $('.fm-main').addClass('active-folder-link');
        $('.activity-status-block').hide();
    }
    else {
        $('.fm-tree-header.cloud-drive-item').text(l[164]);
        $('.fm-tree-header').not('.cloud-drive-item').show();
        $('.fm-left-menu .folderlink').addClass('hidden');
        $('.fm-main').removeClass('active-folder-link');
    }

    $.doDD = function(e, ui, a, type) {

        function nRevert(r) {
            try {
                $(ui.draggable).draggable("option", "revert", false);
                if (r) {
                    $(ui.draggable).remove();
                }
            }
            catch (e) {
            }
        }

        var c = $(ui.draggable.context).attr('class');
        var t, ids, dd;


        if (c && c.indexOf('nw-fm-tree-item') > -1) {
            // tree dragged:
            var id = $(ui.draggable.context).attr('id');
            if (id.indexOf('treea_') > -1) {
                ids = [id.replace('treea_', '')];
            }
            else if (id.indexOf('contact_') > -1) {
                ids = [id.replace('contact_', '')];
            }
        }
        else {
            if ($.dragSelected && $.dragSelected.length > 0) {
                ids = $.dragSelected;
            }
            else if ($.selected && $.selected.length > 0) {
                // grid dragged:
                ids = $.selected;
            }
        }

        // Workaround a problem where we get over[1] -> over[2] -> out[1]
        if (a === 'out' && $.currentOver !== $(e.target).attr('id')) {
            a = 'noop';
        }

        if (type == 1) {
            // tree dropped:
            var c = $(e.target).attr('class');
            if (c && c.indexOf('nw-fm-left-icon') > -1) {
                dd = 'nw-fm-left-icon';
                if (a === 'drop') {
                    if (c.indexOf('cloud') > -1) {
                        t = M.RootID;
                    }
                    else if (c.indexOf('rubbish-bin') > -1) {
                        t = M.RubbishID;
                    }
                    else if (c.indexOf('transfers') > -1) {
                        dd = 'download';
                    }
                }
            }
            else if (c && c.indexOf('nw-fm-tree-item') > -1 && !$(e.target).visible(!0)) {
                dd = 'download';
            }
            else if (
                $(e.target).is('ul.conversations-pane > li') ||
                $(e.target).closest('ul.conversations-pane > li').size() > 0 ||
                $(e.target).is('.messages-block')
            ) {
                if (M.isFile(ids)) {
                    dd = 'chat-attach';
                }
                else {
                    dd = 'noop';
                }
            }
            else {
                var t = $(e.target).attr('id');
                if (t && t.indexOf('treea_') > -1) {
                    t = t.replace('treea_', '');
                }
                else if (t && t.indexOf('path_') > -1) {
                    t = t.replace('path_', '');
                }
                else if (t && t.indexOf('contact2_') > -1) {
                    t = t.replace('contact2_', '');
                }
                else if (t && t.indexOf('contact_') > -1) {
                    t = t.replace('contact_', '');
                }
                else if (M.currentdirid !== 'shares' || !M.d[t] || M.getNodeRoot(t) !== 'shares') {
                    t = undefined;
                }
            }
        }
        else {
            // grid dropped:
            var c = $(e.target).attr('class');
            if (c && c.indexOf('folder') > -1) {
                t = $(e.target).attr('id');
            }
        }

        if (ids && ids.length && t) {
            dd = ddtype(ids, t, e.altKey);
            if (dd === 'move' && e.altKey) {
                dd = 'copy';
            }
        }

        if (a !== 'noop') {
            if ($.liTimerK) {
                clearTimeout($.liTimerK);
            }
            $('body').removeClassWith('dndc-');
            $('.hide-settings-icon').removeClass('hide-settings-icon');
        }
        if (a == 'drop' || a == 'out' || a == 'noop') {
            $(e.target).removeClass('dragover');
            // if (a !== 'noop') $('.dragger-block').addClass('drag');
        }
        else if (a === 'over') {
            var id = $(e.target).attr('id');
            if (!id) {
                $(e.target).uniqueId();
                id = $(e.target).attr('id');
            }

            $.currentOver = id;
            setTimeout(function() {
                if ($.currentOver == id) {
                    var h;
                    if (id.indexOf('treea_') > -1) {
                        h = id.replace('treea_', '');
                    }
                    else {
                        var c = $(id).attr('class');
                        if (c && c.indexOf('cloud-drive-item') > -1) {
                            h = M.RootID;
                        }
                        else if (c && c.indexOf('recycle-item') > -1) {
                            h = M.RubbishID;
                        }
                        else if (c && c.indexOf('contacts-item') > -1) {
                            h = 'contacts';
                        }
                    }
                    if (h) {
                        M.onTreeUIExpand(h, 1);
                    }
                    else if ($(e.target).hasClass('nw-conversations-item')) {
                        $(e.target).click();
                    }
                    else if ($(e.target).is('ul.conversations-pane > li')) {
                        $(e.target).click();
                    }
                }
            }, 890);

            if (dd === 'move') {
                $.draggingClass = ('dndc-move');
            }
            else if (dd === 'copy') {
                $.draggingClass = ('dndc-copy');
            }
            else if (dd === 'download') {
                $.draggingClass = ('dndc-download');
            }
            else if (dd === 'nw-fm-left-icon') {
                var c = '' + $(e.target).attr('class');

                if (~c.indexOf('rubbish-bin')) {
                    $.draggingClass = ('dndc-to-rubbish');
                }
                else if (~c.indexOf('shared-with-me')) {
                    $.draggingClass = ('dndc-to-shared');
                }
                else if (~c.indexOf('contacts')) {
                    $.draggingClass = ('dndc-to-contacts');
                }
                else if (~c.indexOf('conversations')) {
                    $.draggingClass = ('dndc-to-conversations');
                }
                else if (~c.indexOf('cloud-drive')) {
                    $.draggingClass = ('dndc-to-conversations');
                }// TODO: cursor, please?
                else {
                    c = null;
                }

                if (c) {
                    if ($.liTooltipTimer) {
                        clearTimeout($.liTooltipTimer);
                    }
                    $.liTimerK = setTimeout(function() {
                        $(e.target).click()
                    }, 920);
                }
            }
            else if (dd === 'chat-attach') {
                $.draggingClass = ('dndc-to-conversations');
            }
            // else $('.dragger-block').addClass('drag');
            else {
                $.draggingClass = ('dndc-warning');
            }

            $('body').addClass($.draggingClass);

            $(e.target).addClass('dragover');
            $($.selectddUIgrid + ' ' + $.selectddUIitem).removeClass('ui-selected');
            if ($(e.target).hasClass('folder')) {
                $(e.target).addClass('ui-selected').find('.file-settings-icon, .grid-url-arrow').addClass('hide-settings-icon');
            }
        }
        // if (d) console.log('!a:'+a, dd, $(e.target).attr('id'), (M.d[$(e.target).attr('id').split('_').pop()]||{}).name, $(e.target).attr('class'), $(ui.draggable.context).attr('class'));


        if ((a === 'drop') && dd) {
            if (dd === 'nw-fm-left-icon') {
                // do nothing
            }
            else if (
                $(e.target).hasClass('nw-conversations-item') ||
                dd === 'chat-attach'
            ) {
                nRevert();

                // drop over a chat window
                var currentRoom = megaChat.getCurrentRoom();
                assert(currentRoom, 'Current room missing - this drop action should be impossible.');
                currentRoom.attachNodes(ids);
            }
            else if (dd === 'move') {
                nRevert();
                $.moveids = ids;
                $.movet = t;
                var $ddelm = $(ui.draggable);
                setTimeout(function() {
                    if ($.movet === M.RubbishID) {
                        $.selected = $.moveids;
                        fmremove();
                    }
                    else {
                        M.moveNodes($.moveids, $.movet)
                            .done(function(moves) {
                                if (moves) {
                                    $ddelm.remove();
                                }
                            });
                    }
                }, 50);
            }
            else if ((dd === 'copy') || (dd === 'copydel')) {
                nRevert();
                $.copyids = ids;
                $.copyt = t;
                setTimeout(function() {
                    M.copyNodes($.copyids, $.copyt, (dd === 'copydel'), new MegaPromise())
                        .done(function() {

                            // Update files count...
                            if (M.currentdirid === 'shares' && !M.viewmode) {
                                M.openFolder('shares', 1);
                            }
                        })
                        .fail(function(error) {
                            if (error === EOVERQUOTA) {
                                return msgDialog('warninga', l[135], l[8435]);
                            }
                            return msgDialog('warninga', l[135], l[47], api_strerror(error));
                        });
                }, 50);
            }
            else if (dd === 'download') {
                nRevert();
                var as_zip = e.altKey;
                M.addDownload(ids, as_zip);
            }
            $('.dragger-block').hide();
        }
    };
    InitFileDrag();
    M.createFolderUI();
    M.buildRootSubMenu();
    M.treeSearchUI();
    M.initTreePanelSorting();
    M.initContextUI();
    initShareDialog();
    M.addTransferPanelUI();
    M.initUIKeyEvents();
    contactAddDialog();
    onIdle(topmenuUI);

    $('.fm-files-view-icon').rebind('click', function() {
        $.hideContextMenu();

        if ($(this).hasClass('listing-view')) {
            if (fmconfig.uiviewmode) {
                mega.config.set('viewmode', 0);
            }
            else {
                fmviewmode(M.currentdirid, 0);
            }
        }
        else {
            if (fmconfig.uiviewmode) {
                mega.config.set('viewmode', 1);
            }
            else {
                fmviewmode(M.currentdirid, 1);
            }
        }

        M.openFolder(M.currentdirid, true)
            .always(function() {
                reselect();
            });

        return false;
    });

    $.hideContextMenu = function(event) {

        var a, b, currentNodeClass;

        if (event && event.target) {
            currentNodeClass = $(event.target).attr('class');
            if (!currentNodeClass) {
                currentNodeClass = $(event.target).parent();
                if (currentNodeClass) {
                    currentNodeClass = $(currentNodeClass).attr('class');
                }
            }
            if (currentNodeClass && currentNodeClass.indexOf('dropdown') > -1
                && (currentNodeClass.indexOf('download-item') > -1
                || currentNodeClass.indexOf('move-item') > -1)
                && currentNodeClass.indexOf('active') > -1) {
                return false;
            }
        }

        $('.nw-sorting-menu').addClass('hidden');
        $('.fm-start-chat-dropdown').addClass('hidden').removeClass('active');
        $('.start-chat-button').removeClass('active');
        $('.nw-tree-panel-arrows').removeClass('active');
        $('.dropdown-item.dropdown').removeClass('active');
        $('.fm-tree-header').removeClass('dragover');
        $('.nw-fm-tree-item').removeClass('dragover');
        $('.nw-fm-tree-item.hovered').removeClass('hovered');

        // Set to default
        a = $('.dropdown.body.files-menu,.dropdown.body.download');
        a.addClass('hidden');
        b = a.find('.dropdown.body.submenu');
        b.attr('style', '');
        b.removeClass('active left-position overlap-right overlap-left mega-height');
        a.find('.disabled,.context-scrolling-block').removeClass('disabled context-scrolling-block');
        a.find('.dropdown-item.contains-submenu.opened').removeClass('opened');

        // Cleanup for scrollable context menu
        var cnt = $('#cm_scroll').contents();
        $('#cm_scroll').replaceWith(cnt);// Remove .context-scrollable-block
        a.removeClass('mega-height');
        a.find('> .context-top-arrow').remove();
        a.find('> .context-bottom-arrow').remove();
        a.css({ 'height': 'auto' });// In case that window is enlarged

        // Remove all sub-menues from context-menu move-item
        $('#csb_' + M.RootID).empty();
    };

    $('#fmholder').rebind('click.contextmenu', function(e) {
        $.hideContextMenu(e);
        if ($.hideTopMenu) {
            $.hideTopMenu(e);
        }
        var $target = $(e.target);
        var exclude = '.upgradelink, .campaign-logo, .resellerbuy, .linkified, a.red';

        if ($target.attr('data-reactid') || $target.is('.chatlink')) {
            // chat can handle its own links..no need to return false on every "click" and "element" :O
            return;
        }
        if ($target.attr('type') !== 'file'
            && !$target.is(exclude)
            && !$target.parent().is(exclude)) {
            return false;
        }
    });

    $('.fm-back-button').rebind('click', function() {

        if (!M.currentdirid) {
            return;
        }

        if (M.currentdirid === 'notifications'
            || M.currentdirid.substr(0, 7) === 'search/'
            || M.currentdirid.substr(0, 5) === 'chat/') {
            window.history.back();
        }
        else {
            var n = M.d[M.currentdirid];
            if ((n && n.p && M.d[n.p]) || (n && n.p === 'contacts')) {
                M.openFolder(n.p);
            }
        }
    });

    $('.fm-right-header.fm').removeClass('hidden');

    if (folderlink) {
        $('.fm-tree-header.cloud-drive-item span').text('');
    }
    else {
        folderlink = 0;
    }

    if ((typeof dl_import !== 'undefined') && dl_import) {
        importFile();
    }

    $('.dropdown.body.context').rebind('contextmenu.dropdown', function(e) {
        if (!localStorage.contextmenu) {
            e.preventDefault();
        }
    });

    $('.nw-fm-left-icon').rebind('contextmenu', function(ev) {
        M.contextMenuUI(ev, 1);
        return false;
    });

    var fmTabState;
    $('.nw-fm-left-icon').rebind('click', function() {
        treesearch = false;
        var clickedClass = $(this).attr('class');
        if (!clickedClass) {
            return;
        }
        if (!fmTabState || fmTabState['cloud-drive'].root !== M.RootID) {
            fmTabState = {
                'cloud-drive':     {root: M.RootID,    prev: null},
                'folder-link':     {root: M.RootID,    prev: null},
                'shared-with-me':  {root: 'shares',    prev: null},
                'conversations':   {root: 'chat',      prev: null},
                'contacts':        {root: 'contacts',  prev: null},
                'transfers':       {root: 'transfers', prev: null},
                'account':         {root: 'account',   prev: null},
                'dashboard':       {root: 'dashboard', prev: null},
                'inbox':           {root: M.InboxID,   prev: null},
                'rubbish-bin':     {root: M.RubbishID, prev: null}
            };
        }

        var activeClass = ('' + $('.nw-fm-left-icon.active:visible')
            .attr('class')).split(" ").filter(function(c) {
            return !!fmTabState[c];
        })[0];

        var activeTab = fmTabState[activeClass];
        if (activeTab) {
            if (activeTab.root === M.currentrootid || activeTab.root === 'chat') {
                activeTab.prev = M.currentdirid;
                M.lastActiveTab = activeClass;
            }
            else if (d) {
                console.warn('Root mismatch', M.currentrootid, M.currentdirid, activeTab);
            }
        }

        if ($(this).hasClass('account') || $(this).hasClass('dashboard')) {
            if (u_type === 0) {
                if ($(this).hasClass('account')) {
                    ephemeralDialog(l[7687]);
                }
                else {
                    // Show message 'This page is for registered users only'
                    ephemeralDialog(l[17146]);
                }
            }
            else if ($(this).hasClass('dashboard')) {
                loadSubPage('fm/dashboard');
            }
            else {
                loadSubPage('fm/account');
            }
            return false;
        }

        for (var tab in fmTabState) {
            if (~clickedClass.indexOf(tab)) {
                tab = fmTabState[tab];

                var targetFolder = null;

                // Clicked on the currently active tab, should open the root (e.g. go back)
                if (~clickedClass.indexOf(activeClass)) {
                    targetFolder = tab.root;

                    // special case handling for the chat, re-render current conversation
                    if (tab.root === 'chat' && String(M.currentdirid).substr(0, 5) === 'chat/') {
                        targetFolder = M.currentdirid;
                    }
                }
                else if (tab.prev && M.d[tab.prev]) {
                    targetFolder = tab.prev;
                }
                else {
                    targetFolder = tab.root
                }

                M.openFolder(targetFolder, true);

                break;
            }
        }
    });

    if (dlMethod.warn && !localStorage.browserDialog && !$.browserDialog) {
        setTimeout(browserDialog, 2000);
    }

    // chat can handle the left-panel resizing on its own
    var lPane = $('.fm-left-panel').filter(":not(.chat-left-panel)");
    $.leftPaneResizable = new FMResizablePane(lPane, {
        'direction': 'e',
        'minWidth': 200,
        'maxWidth': 400,
        'persistanceKey': 'leftPaneWidth',
        'handle': '.left-pane-drag-handle'
    });

    if (fmconfig.leftPaneWidth) {
        lPane.width(Math.min(
            $.leftPaneResizable.options.maxWidth,
            Math.max($.leftPaneResizable.options.minWidth, fmconfig.leftPaneWidth)
        ));
    }

    $($.leftPaneResizable).on('resize', function() {
        var w = lPane.width();
        if (w >= $.leftPaneResizable.options.maxWidth) {
            $('.left-pane-drag-handle').css('cursor', 'w-resize')
        }
        else if (w <= $.leftPaneResizable.options.minWidth) {
            $('.left-pane-drag-handle').css('cursor', 'e-resize')
        }
        else {
            $('.left-pane-drag-handle').css('cursor', 'we-resize')
        }
        $(window).trigger('resize');
    });

    $(window).rebind('resize.fmrh hashchange.fmrh', fm_resize_handler);
    if (d) {
        console.timeEnd('initUI');
    }
};

/**
 * Update FileManager on new nodes availability
 * @details Former rendernew()
 * @returns {MegaPromise}
 */
FileManager.prototype.updFileManagerUI = function() {
    "use strict";

    var treebuild = Object.create(null);
    var UImain = false;
    var UItree = false;
    var newcontact = false;
    var newpath = false;
    var newshare = false;
    var selnode;

    if (d) {
        console.time('rendernew');
    }

    for (var i = newnodes.length; i--;) {
        var newNode = newnodes[i];
        if (newNode.h.length === 11) {
            newcontact = true;
        }
        if (newNode.su) {
            newshare = true;
        }
        if (newNode.p && newNode.t) {
            treebuild[newNode.p] = 1;
        }
        if (newNode.p === this.currentdirid || newNode.h === this.currentdirid) {
            UImain = true;

            if ($.onRenderNewSelectNode === newNode.h) {
                delete $.onRenderNewSelectNode;
                selnode = newNode.h;
            }
        }
        if (!newpath && document.getElementById('path_' + newNode.h)) {
            newpath = true;
        }
    }

    var masterPromise = new MegaPromise();
    var treePromises = [];

    for (var h in treebuild) {
        var tb = this.d[h];
        if (tb) {
            treePromises.push(this.buildtree(tb, this.buildtree.FORCE_REBUILD));
            UItree = true;
        }
    }

    if (d) {
        console.log('rendernew, dir=%s, root=%s, mode=%d', this.currentdirid, this.currentrootid, this.viewmode);
        console.log('rendernew.stat', newcontact, newshare, UImain, newpath);
        console.log('rendernew.tree', treePromises.length, Object.keys(treebuild));
    }

    MegaPromise.allDone(treePromises)
        .always(function() {

            if (UImain) {
                M.filterByParent(M.currentdirid);
                M.sort();
                M.renderMain(true);
                // M.renderPath();
                if (selnode) {
                    Soon(function() {
                        $.selected = [selnode];
                        reselect(1);
                    });
                }
                $.tresizer();
            }

            var renderPromise = MegaPromise.resolve();

            if (UItree) {
                if (M.currentrootid === 'shares') {
                    renderPromise = M.renderTree();
                }
                else {
                    M.addTreeUI();
                }

                if (M.currentdirid === 'shares' && !M.viewmode) {
                    renderPromise.pipe(function() {
                        return M.openFolder('shares', 1);
                    });
                }

                renderPromise.always(function() {
                    M.onTreeUIOpen(M.currentdirid);
                });
            }

            renderPromise.always(function() {
                if (newcontact) {
                    M.avatars();
                    M.contacts();
                    M.addTreeUI();

                    if (megaChatIsReady) {
                        //megaChat.renderContactTree();
                        megaChat.renderMyStatus();
                    }
                }
                if (newshare) {
                    M.buildtree({h: 'shares'}, M.buildtree.FORCE_REBUILD);
                }
                if (newpath) {
                    M.renderPath();
                }

                if (u_type === 0) {
                    // Show "ephemeral session warning"
                    topmenuUI();
                }

                if (M.currentdirid === 'dashboard') {
                    delay('dashboard:upd', dashboardUI, 2000);
                }

                if (d) {
                    console.timeEnd('rendernew');
                }

                masterPromise.resolve();
            });
        });

    newnodes = [];
    return masterPromise;
};

/**
 * Initialize context-menu related user interface
 */
FileManager.prototype.initContextUI = function() {
    "use strict";

    var c = '.dropdown.body.context .dropdown-item';

    $('.dropdown-section').off('mouseover', '.dropdown-item');
    $('.dropdown-section').on('mouseover', '.dropdown-item', function() {
        var $this = $(this),
            pos = $this.offset(),
            menuPos,
            currentId;

        // Hide opened submenus
        if (!$this.parent().parent().hasClass('submenu')) {
            $('.dropdown-item').removeClass('opened');
            $('.dropdown.body.submenu').removeClass('active');
        }
        else {
            $this.parent().find('.dropdown-item').removeClass('opened');
            $this.parent().find('.submenu').removeClass('active');
        }

        currentId = $this.attr('id');
        if (currentId) {
            M.buildSubMenu(currentId.replace('fi_', ''));
        }

        // Show necessary submenu
        if (!$this.hasClass('opened') && $this.hasClass('contains-submenu')) {
            menuPos = M.reCalcMenuPosition($this, pos.left, pos.top, 'submenu');

            $this.next('.submenu')
                .css({'top': menuPos.top})
                .addClass('active');

            $this.addClass('opened');
        }
    });

    var safeMoveNodes = function() {
        if (!$(this).hasClass('disabled')) {
            $.hideContextMenu();
            M.safeMoveNodes(String($(this).attr('id')).replace('fi_', ''));
        }
        return false;
    };
    $(c + '.cloud-item').rebind('click', safeMoveNodes);

    $('.dropdown.body.files-menu').off('click', '.folder-item');
    $('.dropdown.body.files-menu').on('click', '.folder-item', safeMoveNodes);
    safeMoveNodes = undefined;

    $(c + '.download-item').rebind('click', function(event) {
        var c = $(event.target).attr('class');
        if (c && c.indexOf('contains-submenu') > -1) {
            M.addDownload($.selected);
        }
    });

    $(c + '.download-standart-item').rebind('click', function() {
        M.addDownload($.selected);
    });

    $(c + '.zipdownload-item').rebind('click', function() {
        M.addDownload($.selected, true);
    });

    $(c + '.getlink-item').rebind('click', function() {

        if (u_type === 0) {
            ephemeralDialog(l[1005]);
        }
        else {
            mega.Share.initCopyrightsDialog($.selected);
        }
    });

    $(c + '.removelink-item').rebind('click', function() {

        if (u_type === 0) {
            ephemeralDialog(l[1005]);
        }
        else {
            var exportLink = new mega.Share.ExportLink({'updateUI': true, 'nodesToProcess': $.selected});
            exportLink.removeExportLink();
        }
    });

    $(c + '.rename-item').rebind('click', function() {
        renameDialog();
    });

    $(c + '.sh4r1ng-item').rebind('click', function() {
        if (u_type === 0) {
            return ephemeralDialog(l[1006]);
        }
        var $dialog = $('.fm-dialog.share-dialog');

        M.safeShowDialog('share', function() {
            $.hideContextMenu();
            clearScrollPanel('.share-dialog');

            // Show the share dialog
            $dialog.removeClass('hidden');

            // Hide the optional message by default.
            // This gets enabled if user want to share
            $dialog.find('.share-message').hide();

            fillShareDialogWithContent();

            // Taking care about share dialog button 'Done'/share and scroll
            shareDialogContentCheck();

            // Maintain drop down list updated
            updateDialogDropDownList('.share-multiple-input');

            $('.share-dialog-icon.permissions-icon')
                .removeClass('active full-access read-and-write')
                .safeHTML('<span></span>' + l[55])
                .addClass('read-only');

            // Update dialog title text
            $('.fm-dialog-title', $dialog).text(l[5631] + ' "' + M.d[$.selected].name + '"');
            $('.multiple-input .token-input-token-mega', $dialog).remove();
            dialogPositioning($dialog);
            $('.token-input-input-token-mega input', $dialog).focus();

            return $dialog;
        });
    });

    // Move Dialog
    $(c + '.advanced-item, ' + c + '.move-item').rebind('click', openMoveDialog);

    $(c + '.copy-item').rebind('click', openCopyDialog);

    $(c + '.import-item').rebind('click', function() {
        ASSERT(folderlink, 'Import needs to be used in folder links.');

        M.importFolderLinkNodes($.selected);
    });

    $(c + '.newfolder-item').rebind('click', function() {
        createFolderDialog();
    });

    $(c + '.fileupload-item').rebind('click', function() {
        $('#fileselect3').click();
    });

    $(c + '.folderupload-item').rebind('click', function() {
        $('#fileselect4').click();
    });

    $(c + '.remove-item').rebind('click', function() {
        fmremove();
    });

    $(c + '.startchat-item').rebind('click', function() {
        var $this = $(this);
        var user_handle = $.selected;

        if (user_handle.length === 1) {
            if (!$this.is(".disabled") && user_handle) {
                loadSubPage('fm/chat/' + user_handle);
            }
        }
        else {
            megaChat.createAndShowGroupRoomFor(user_handle);
        }
    });

    $(c + '.startaudio-item').rebind('click', function() {
        var $this = $(this);
        var user_handle = $.selected && $.selected[0];
        var room;

        if (!$this.is(".disabled") && user_handle) {
            loadSubPage('fm/chat/' + user_handle);
            room = megaChat.createAndShowPrivateRoomFor(user_handle);
            if (room) {
                room.startAudioCall();
            }
        }
    });

    $(c + '.startvideo-item').rebind('click', function() {
        var $this = $(this);
        var user_handle = $.selected && $.selected[0];
        var room;

        if (!$this.is(".disabled") && user_handle) {
            loadSubPage('fm/chat/' + user_handle);
            room = megaChat.createAndShowPrivateRoomFor(user_handle);
            if (room) {
                room.startVideoCall();
            }
        }
    });

    $(c + '.removeshare-item').rebind('click', function() {
        fmremove();
    });

    $(c + '.properties-item').rebind('click', function() {
        propertiesDialog();
    });

    $(c + '.properties-versions').rebind('click', function() {
        fileversioning.fileVersioningDialog();
    });

    $(c + '.clearprevious-versions').rebind('click', function() {
        if ($.selected && $.selected[0]) {
            var fh = $.selected[0];
            msgDialog('remove', l[1003], l[17154], l[1007], function(e) {
                if (e) {
                    fileversioning.clearPreviousVersions(fh);
                }
            });
        }

    });

    $(c + '.findupes-item').rebind('click', M.findDupes);

    $(c + '.permissions-item').rebind('click', function() {
        if (d) {
            console.log('permissions');
        }
    });

    $(c + '.add-star-item').rebind('click', function() {
        var newFavState = Number(!M.isFavourite($.selected));

        M.favourite($.selected, newFavState);

        if (M.viewmode) {
            $('.fm-blocks-view .data-block-view').removeClass('ui-selected');
        }
        else {
            $('.grid-table.fm tr').removeClass('ui-selected');
        }
    });

    $('.labels .dropdown-colour-item').rebind('click', function() {
        var labelId = parseInt(this.dataset.labelId);

        if (labelId && (M.getNodeRights($.selected[0]) > 1)) {
            M.colourLabeling($.selected, labelId);
        }
    });

    $('.labels .dropdown-colour-item').rebind('mouseover', function() {
        var labelTxt = this.dataset.labelTxt;
        var labelInfo;

        if ($(this).hasClass('active')) {
            labelInfo = l[16222];
        }
        else {
            labelInfo = l[16221];
        }
        labelTxt = labelInfo.replace('%1', '"' + labelTxt + '"');
        $('.labels .dropdown-color-info').text(labelTxt).addClass('active');
    });

    $('.labels .dropdown-colour-item').rebind('mouseout', function() {
        $('.labels .dropdown-color-info').removeClass('active');
    });

    $(c + '.open-item').rebind('click', function() {
        M.openFolder($.selected[0]);
    });

    $(c + '.preview-item').rebind('click', function() {
        slideshow($.selected[0]);
    });

    $(c + '.clearbin-item').rebind('click', function() {
        doClearbin(false);
    });

    $(c + '.move-up').rebind('click', function() {
        $('.transfer-table tr.ui-selected')
            .attrs('id')
            .map(function(id) {
                fm_tfsmove(id, -1);
            });
        $('.transfer-table tr.ui-selected').removeClass('ui-selected');
        delay('fm_tfsupdate', fm_tfsupdate);
    });

    $(c + '.move-down').rebind('click', function() {
        $('.transfer-table tr.ui-selected')
            .attrs('id')
            .reverse()
            .map(function(id) {
                fm_tfsmove(id, 1);
            });
        $('.transfer-table tr.ui-selected').removeClass('ui-selected');
        delay('fm_tfsupdate', fm_tfsupdate);
    });

    $(c + '.transfer-play').rebind('click', function() {
        $('.transfer-table tr.ui-selected').attrs('id').map(fm_tfsresume);
        $('.transfer-table tr.ui-selected').removeClass('ui-selected');
        if (uldl_hold) {
            dlQueue.resume();
            ulQueue.resume();
            uldl_hold = false;
        }
    });

    $(c + '.transfer-pause').rebind('click', function() {
        $('.transfer-table tr.ui-selected').attrs('id').map(fm_tfspause);
        $('.transfer-table tr.ui-selected').removeClass('ui-selected');
    });

    $(c + '.network-diagnostic').rebind('click', function() {
        var $trs = $('.transfer-table tr.ui-selected');
        M.require('network_js')
            .then(function() {
                NetworkTesting.dialog($trs.attrs('id')[0].replace(/^dl_/, '#!'));
            });
    });

    $(c + '.canceltransfer-item,' + c + '.transfer-clear').rebind('click', function() {
        var $trs = $('.transfer-table tr.ui-selected');
        var toabort = $trs.attrs('id');
        $trs.remove();
        dlmanager.abort(toabort);
        ulmanager.abort(toabort);
        $.clearTransferPanel();
        fm_tfsupdate();

        if (toabort.length) {
            for (var i = toabort.length; i--;) {
                var blk = String(toabort[i]).indexOf('ul_') !== -1 ? 'ul' : 'dl';
                mega.ui.tpp.setTotal(-1, blk);
                mega.ui.tpp.updateIndexes(blk);
            }
        }

        onIdle(function() {
            // XXX: better way to stretch the scrollbar?
            $(window).trigger('resize');
        });
        $('.transfer-table tr.ui-selected').removeClass('ui-selected');
    });

    if (localStorage.folderLinkImport) {
        onIdle(M.importFolderLinkNodes.bind(M, false));
    }
};

FileManager.prototype.createFolderUI = function() {
    "use strict";

    var doCreateFolder = function() {
        var $inputWrapper = $('.create-folder-pad');
        var $input = $('.create-new-folder input');

        if ($input.val() === '') {
            $inputWrapper.addClass('error');

            setTimeout(function() {
                $inputWrapper.removeClass('error');
                $input.focus();
            }, 200);
        }
        else {
            loadingDialog.pshow();
            M.createFolder(M.currentdirid, $input.val(), new MegaPromise())
                .done(function(h) {
                    if (d) {
                        console.log('Created new folder %s->%s.', M.currentdirid, h);
                    }
                    loadingDialog.phide();
                })
                .fail(function(error) {
                    loadingDialog.phide();
                    msgDialog('warninga', l[135], l[47], api_strerror(error));
                });
        }

        return false;
    };

    $('.fm-new-folder').rebind('click', function(e) {

        var c = $('.fm-new-folder').attr('class'),
            c2 = $(e.target).attr('class'),
            c3 = $(e.target).parent().attr('class'),
            b1 = $('.fm-new-folder');

        $('.create-new-folder').removeClass('filled-input');
        var d1 = $('.create-new-folder');
        if ((!c2 || c2.indexOf('fm-new-folder') === -1) && (!c3 || c3.indexOf('fm-new-folder') === -1)) {
            return false;
        }
        if (c.indexOf('active') === -1) {
            b1.addClass('active');
            d1.removeClass('hidden');
            topPopupAlign(this, '.dropdown.create-new-folder');
            $('.create-new-folder input').focus();
        }
        else {
            b1.removeClass('active filled-input');
            d1.addClass('hidden');
            $('.fm-new-folder input').val('');
        }
        $.hideContextMenu();
    });

    $('.create-folder-button').rebind('click', doCreateFolder);

    $('.create-folder-button-cancel').rebind('click', function() {
        $('.fm-new-folder').removeClass('active');
        $('.create-new-folder').addClass('hidden');
        $('.create-new-folder').removeClass('filled-input');
        $('.create-new-folder input').val('');
    });

    $('.create-folder-size-icon.full-size').rebind('click', function() {

        var v = $('.create-new-folder input').val();

        if (v !== l[157] && v !== '') {
            $('.create-folder-dialog input').val(v);
        }

        $('.create-new-folder input').focus();
        $('.create-new-folder').removeClass('filled-input');
        $('.create-new-folder').addClass('hidden');
        $('.fm-new-folder').removeClass('active');
        createFolderDialog(0);
        $('.create-new-folder input').val('');
    });

    $('.create-folder-size-icon.short-size').rebind('click', function() {

        var v = $('.create-folder-dialog input').val();

        if (v !== l[157] && v !== '') {
            $('.create-new-folder input').val(v);
            $('.create-new-folder').addClass('filled-input');
        }

        $('.fm-new-folder').addClass('active');
        $('.create-new-folder').removeClass('hidden');
        topPopupAlign('.link-button.fm-new-folder', '.add-user-popup');

        createFolderDialog(1);
        $('.create-folder-dialog input').val('');
        $('.create-new-folder input').focus();
    });

    $('.create-new-folder input').rebind('keyup.create-new-f', function(e) {
        $('.create-new-folder').addClass('filled-input');
        if ($(this).val() === '') {
            $('.create-new-folder').removeClass('filled-input');
        }
        if (e.which == 13) {
            doCreateFolder();
        }
    });

    $('.create-new-folder input').rebind('focus.create-new-f', function() {
        if ($(this).val() === l[157]) {
            $(this).val('');
        }
        $('.create-new-folder').addClass('focused');
    });

    $('.create-new-folder input').rebind('blur.create-new-f', function() {
        $('.create-new-folder').removeClass('focused');
    });
};

FileManager.prototype.initUIKeyEvents = function() {
    "use strict";

    $(window).rebind('keydown.uikeyevents', function(e) {
        if (e.keyCode == 9 && !$(e.target).is("input,textarea,select")) {
            return false;
        }
        if ($(e.target).filter("input,textarea,select").is(":focus")) {
            // when the user is typing in the "New folder dialog", if the current viewMode is grid/icons view, then
            // left/right navigation in the input field may cause the selection manager to trigger selection changes.
            // Note: I expected that the dialog would set $.dialog, but it doesn't.
            return true;
        }

        var is_transfers_or_accounts = (
            M.currentdirid && (M.currentdirid.substr(0, 7) === 'account' || M.currentdirid === 'transfers')
        );

        // selection manager may not be available on empty folders.
        var is_selection_manager_available = !!selectionManager;

        var sl = false;
        var s = [];

        var selPanel = $('.fm-transfers-block tr.ui-selected');

        if (selectionManager && selectionManager.selected_list && selectionManager.selected_list.length > 0) {
            s = clone(selectionManager.selected_list);
        }
        else {
            var tempSel;

            if (M.viewmode) {
                tempSel = $('.data-block-view.ui-selected');
            }
            else {
                tempSel = $('.grid-table tr.ui-selected');
            }

            s = tempSel.attrs('id');
        }

        if (M.chat) {
            return true;
        }

        if (!is_fm() && page !== 'login' && page.substr(0, 3) !== 'pro') {
            return true;
        }

        /**
         * Because of te .unbind, this can only be here... it would be better if its moved to iconUI(), but maybe some
         * other day :)
         */
        if (
            is_selection_manager_available &&
            !is_transfers_or_accounts &&
            !$.dialog &&
            !slideshowid &&
            M.viewmode == 1
        ) {
            if (e.keyCode == 37) {
                // left
                selectionManager.select_prev(e.shiftKey, true);
            }
            else if (e.keyCode == 39) {
                // right
                selectionManager.select_next(e.shiftKey, true);
            }

            // up & down
            else if (e.keyCode == 38 || e.keyCode == 40) {
                if (e.keyCode === 38) {
                    selectionManager.select_grid_up(e.shiftKey, true);
                }
                else {
                    selectionManager.select_grid_down(e.shiftKey, true);
                }

            }
        }

        if (
            is_selection_manager_available &&
            !is_transfers_or_accounts &&
            e.keyCode == 38 &&
            s.length > 0 &&
            $.selectddUIgrid.indexOf('.grid-scrolling-table') > -1 &&
            !$.dialog
        ) {
            // up in grid/table
            selectionManager.select_prev(e.shiftKey, true);
            quickFinder.disable_if_active();
        }
        else if (
            is_selection_manager_available &&
            !is_transfers_or_accounts &&
            e.keyCode == 40 &&
            s.length > 0 &&
            $.selectddUIgrid.indexOf('.grid-scrolling-table') > -1 &&
            !$.dialog
        ) {
            // down in grid/table
            selectionManager.select_next(e.shiftKey, true);
            quickFinder.disable_if_active();
        }
        else if (
            !is_transfers_or_accounts &&
            e.keyCode == 46 &&
            s.length > 0 &&
            !$.dialog &&
            M.getNodeRights(M.currentdirid) > 1
        ) {
            // delete
            fmremove();
        }
        else if ((e.keyCode === 46) && (selPanel.length > 0)
            && !$.dialog && M.getNodeRights(M.currentdirid) > 1) {
            msgDialog('confirmation', l[1003], l[17092].replace('%1', s.length), false, function(e) {

                // we should encapsule the click handler
                // to call a function rather than use this hacking
                if (e) {
                    $('.transfer-clear').trigger('click');
                }
            });
        }
        else if (
            !is_transfers_or_accounts &&
            e.keyCode == 13
            && s.length > 0
            && !$.dialog
            && !$.msgDialog
            && !$('.fm-new-folder').hasClass('active')
            && !$('.top-search-bl').hasClass('active')
        ) {
            $.selected = s;

            if ($.selected && $.selected.length > 0) {
                var n = M.d[$.selected[0]];
                if (n && n.t) {
                    M.openFolder(n.h);
                }
                else if ($.selected.length == 1 && M.d[$.selected[0]] && is_image(M.d[$.selected[0]])) {
                    slideshow($.selected[0]);
                }
                else {
                    M.addDownload($.selected);
                }
            }
        }
        else if ((e.keyCode === 13) && ($.dialog === 'share')) {
            var share = new mega.Share();
            share.updateNodeShares();
        }
        else if ((e.keyCode === 13) && ($.dialog === 'add-contact-popup')) {
            addNewContact($('.add-user-popup-button.add'));
        }
        else if ((e.keyCode === 13) && ($.dialog === 'rename')) {
            $('.rename-dialog-button.rename').trigger('click');
        }

        // If the Esc key is pressed while the payment address dialog is visible, close it
        else if ((e.keyCode === 27) && !$('.payment-address-dialog').hasClass('hidden')) {
            addressDialog.closeDialog();
        }
        else if (e.keyCode == 27 && ($.copyDialog || $.moveDialog || $.copyrightsDialog)) {
            closeDialog();
        }
        else if (e.keyCode == 27 && $.topMenu) {
            topMenu(1);
        }
        else if (e.keyCode == 27 && $.dialog) {
            closeDialog();
        }
        else if (e.keyCode == 27 && $('.default-select.active').length) {
            var $selectBlock = $('.default-select.active');
            $selectBlock.find('.default-select-dropdown').fadeOut(200);
            $selectBlock.removeClass('active');
        }
        else if (e.keyCode == 27 && $.msgDialog) {
            closeMsg();
            if ($.warningCallback) {
                $.warningCallback(false);
            }
        }
        else if ((e.keyCode == 13 && $.msgDialog == 'confirmation') && (e.keyCode == 13 && $.msgDialog == 'remove')) {
            closeMsg();
            if ($.warningCallback) {
                $.warningCallback(true);
            }
        }
        else if (
            !is_transfers_or_accounts &&
            (e.keyCode === 113 /* F2 */) &&
            (s.length > 0) &&
            !$.dialog && M.getNodeRights(M.currentdirid) > 1
        ) {
            renameDialog();
        }
        else if (
            is_selection_manager_available &&
            e.keyCode == 65 &&
            e.ctrlKey &&
            !$.dialog
        ) {
            if (is_transfers_or_accounts || M.currentdirid === 'ipc' || M.currentdirid === 'opc') {
                return;
            }
            // ctrl+a/cmd+a - select all
            selectionManager.select_all();
        }
        else if (e.keyCode == 27) {
            if ($.hideTopMenu) {
                $.hideTopMenu();
            }
        }

        if (sl && $.selectddUIgrid.indexOf('.grid-scrolling-table') > -1) {
            // if something is selected, scroll to that item
            var jsp = $($.selectddUIgrid).data('jsp');
            if (jsp) {
                jsp.scrollToElement(sl);
            }
            else if (M.megaRender && M.megaRender.megaList && M.megaRender.megaList._wasRendered) {
                M.megaRender.megaList.scrollToItem(sl.data('id'));
            }
        }

        M.searchPath();
    });
};

FileManager.prototype.addTransferPanelUI = function() {
    "use strict";

    var transferPanelContextMenu = function(target) {
        var file;
        var tclear;

        $('.dropdown.body.files-menu .dropdown-item').hide();
        var menuitems = $('.dropdown.body.files-menu .dropdown-item');

        menuitems.filter('.transfer-pause,.transfer-play,.move-up,.move-down,.transfer-clear')
            .show();

        tclear = menuitems.filter('.transfer-clear').contents().last().get(0) || {};
        tclear.textContent = l[103];

        if (target === null && (target = $('.transfer-table tr.ui-selected')).length > 1) {
            var ids = target.attrs('id');
            var finished = 0;
            var paused = 0;
            var started = false;

            ids.forEach(function(id) {
                file = GlobalProgress[id];
                if (!file) {
                    finished++;
                }
                else {
                    if (file.paused) {
                        paused++;
                    }
                    if (file.started) {
                        started = true;
                    }
                }
            });

            if (finished === ids.length) {
                menuitems.hide()
                    .filter('.transfer-clear')
                    .show();
                tclear.textContent = l[7218];
            }
            else {
                if (started) {
                    menuitems.filter('.move-up,.move-down').hide();
                }
                if (paused === ids.length) {
                    menuitems.filter('.transfer-pause').hide();
                }

                var prev = target.first().prev();
                var next = target.last().next();

                if (prev.length === 0 || !prev.hasClass('transfer-queued')) {
                    menuitems.filter('.move-up').hide();
                }
                if (next.length === 0) {
                    menuitems.filter('.move-down').hide();
                }
            }
        }
        else if (!(file = GlobalProgress[$(target).attr('id')])) {
            /* no file, it is a finished operation */
            menuitems.hide()
                .filter('.transfer-clear')
                .show();
            tclear.textContent = l[7218];
        }
        else {
            if (file.started) {
                menuitems.filter('.move-up,.move-down').hide();
            }
            if (file.paused) {
                menuitems.filter('.transfer-pause').hide();
            }
            else {
                menuitems.filter('.transfer-play').hide();
            }

            if (!target.prev().length || !target.prev().hasClass('transfer-queued')) {
                menuitems.filter('.move-up').hide();
            }
            if (target.next().length === 0) {
                menuitems.filter('.move-down').hide();
            }
        }

        // XXX: Hide context-menu's menu-up/down items for now to check if that's the
        // origin of some problems, users can still use the new d&d logic to move transfers
        menuitems.filter('.move-up,.move-down').hide();

        if (d && target.length === 1 && target.eq(0).attr('id').match(/^dl_/)) {
            menuitems.filter('.network-diagnostic').show();
        }


        var parent = menuitems.parent();
        parent
            .children('hr').hide().end()
            .children('hr.pause').show().end();

        if (parent.height() < 56) {
            parent.find('hr.pause').hide();
        }
    };


    $.transferHeader = function(tfse) {
        tfse = tfse || M.getTransferElements();
        var domTableEmptyTxt = tfse.domTableEmptyTxt;
        var domTableHeader = tfse.domTableHeader;
        var domScrollingTable = tfse.domScrollingTable;
        var domTable = tfse.domTable;
        tfse = undefined;

        // Show/Hide header if there is no items in transfer list
        if (domTable.querySelector('tr')) {
            domTableEmptyTxt.classList.add('hidden');
            domScrollingTable.style.display = '';
            domTableHeader.style.display = '';
        }
        else {
            domTableEmptyTxt.classList.remove('hidden');
            domScrollingTable.style.display = 'none';
            domTableHeader.style.display = 'none';
        }

        $(domScrollingTable).rebind('click.tst contextmenu.tst', function(e) {
            if (!$(e.target).closest('.transfer-table').length) {
                $('.ui-selected', domTable).removeClass('ui-selected');
            }
        });

        var $tmp = $('.grid-url-arrow, .clear-transfer-icon', domTable);
        $tmp.rebind('click', function(e) {
            var target = $(this).closest('tr');
            e.preventDefault();
            e.stopPropagation(); // do not treat it as a regular click on the file
            $('tr', domTable).removeClass('ui-selected');

            if ($(this).hasClass('grid-url-arrow')) {
                target.addClass('ui-selected');
                e.currentTarget = target;
                transferPanelContextMenu(target);
                if (!$(this).hasClass('active')) {
                    M.contextMenuUI(e);
                    $(this).addClass('active');
                }
                else {
                    $.hideContextMenu();
                    $(this).removeClass('active');
                }
            }
            else {
                if (!target.hasClass('.transfer-completed')) {
                    var toabort = target.attr('id');
                    dlmanager.abort(toabort);
                    ulmanager.abort(toabort);
                }
                target.fadeOut(function() {
                    $(this).remove();
                    $.clearTransferPanel();
                    fm_tfsupdate();
                    $.tresizer();
                });
            }

            return false;
        });

        $tmp = $('tr', domTable);
        $tmp.rebind('dblclick', function() {
            if ($(this).hasClass('transfer-completed')) {
                var id = String($(this).attr('id'));
                if (id[0] === 'd') {
                    id = id.split('_').pop();
                }
                else if (id[0] === 'u') {
                    id = String(ulmanager.ulIDToNode[id]);
                }
                var path = M.getPath(id);
                if (path.length > 1) {
                    M.openFolder(path[1], true)
                        .always(function() {
                            if (!$('#' + id).length) {
                                $(window).trigger('dynlist.flush');
                            }
                            $.selected = [id];
                            reselect(1);
                        });
                }
            }
            return false;
        });

        $tmp.rebind('click contextmenu', function(e) {
            if (e.type === 'contextmenu') {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    $('.ui-selected', domTable).removeClass('ui-selected');
                }
                $(this).addClass('ui-selected dragover');
                transferPanelContextMenu(null);
                return !!M.contextMenuUI(e);
            }
            else {
                var domNode = domTable.querySelector('tr');
                if (e.shiftKey && domNode) {
                    var start = domNode;
                    var end = this;
                    if ($.TgridLastSelected && $($.TgridLastSelected).hasClass('ui-selected')) {
                        start = $.TgridLastSelected;
                    }
                    if ($(start).index() > $(end).index()) {
                        end = start;
                        start = this;
                    }
                    $('.ui-selected', domTable).removeClass('ui-selected');
                    $([start, end]).addClass('ui-selected');
                    $(start).nextUntil($(end)).each(function(i, e) {
                        $(e).addClass('ui-selected');
                    });
                }
                else if (!e.ctrlKey && !e.metaKey) {
                    $('.ui-selected', domTable).removeClass('ui-selected');
                    $(this).addClass('ui-selected');
                    $.TgridLastSelected = this;
                }
                else {
                    if ($(this).hasClass("ui-selected")) {
                        $(this).removeClass("ui-selected");
                    }
                    else {
                        $(this).addClass("ui-selected");
                        $.TgridLastSelected = this;
                    }
                }
            }

            return false;
        });
        $tmp = undefined;

        // initTransferScroll(domScrollingTable);
        delay('tfs-ps-update', Ps.update.bind(Ps, domScrollingTable));
    };

    $.transferClose = function() {
        if (M.pendingTransfers) {
            mega.ui.tpp.show();
        }
        $('.nw-fm-left-icon.transfers').removeClass('active');
        $('#fmholder').removeClass('transfer-panel-opened');
    };

    $.transferOpen = function(force) {
        mega.ui.tpp.hide();
        if (force || !$('.nw-fm-left-icon.transfers').hasClass('active')) {
            $('.nw-fm-left-icon').removeClass('active');
            $('.nw-fm-left-icon.transfers').addClass('active');
            $('#fmholder').addClass('transfer-panel-opened');
            M.addNotificationsUI(1);
            var domScrollingTable = M.getTransferElements().domScrollingTable;
            if (!domScrollingTable.classList.contains('ps-container')) {
                Ps.initialize(domScrollingTable, {suppressScrollX: true});
            }
            fm_tfsupdate(); // this will call $.transferHeader();
        }
    };

    $.clearTransferPanel = function() {
        var obj = M.getTransferElements();
        if (!obj.domTable.querySelector('tr')) {
            $('.transfer-clear-all-icon').addClass('disabled');
            $('.transfer-pause-icon').addClass('disabled');
            $('.transfer-clear-completed').addClass('disabled');
            $('.transfer-table-header').hide();
            $('.transfer-panel-empty-txt').removeClass('hidden');
            $('.transfer-panel-title').text('');
            $('.nw-fm-left-icon.transfers').removeClass('transfering').find('p').removeAttr('style');
            if (M.currentdirid === 'transfers') {
                fm_tfsupdate();
                $.tresizer();
            }
        }
    };

    $.removeTransferItems = function($trs) {
        if (!$trs) {
            $trs = $('.transfer-table tr.transfer-completed');
        }
        var $len = $trs.length;
        if ($len && $len < 100) {
            $trs.fadeOut(function() {
                $(this).remove();
                if (!--$len) {
                    $.clearTransferPanel();
                }
            });
        }
        else {
            $trs.remove();
            Soon($.clearTransferPanel);
        }
    };

    $('.transfer-clear-all-icon').rebind('click', function() {
        if (!$(this).hasClass('disabled')) {
            msgDialog('confirmation', 'clear all transfers', l[7225], '', function(e) {
                if (!e) {
                    return;
                }

                dlmanager.abort(null);
                ulmanager.abort(null);

                $.removeTransferItems($('.transfer-table tr'));
            });
        }
    });

    $('.transfer-clear-completed').rebind('click', function() {
        if (!$(this).hasClass('disabled')) {
            $.removeTransferItems();
        }
    });

    $('.transfer-pause-icon').rebind('click', function() {

        if (dlmanager.isOverQuota) {
            return dlmanager.showOverQuotaDialog();
        }

        if (!$(this).hasClass('disabled')) {
            if ($(this).hasClass('active')) {
                // terms of service
                if (u_type || folderlink || Object(u_attr).terms) {
                    [dlQueue, ulQueue].forEach(function(queue) {
                        Object.keys(queue._qpaused).map(fm_tfsresume);
                    });
                    uldl_hold = false;
                    ulQueue.resume();
                    dlQueue.resume();

                    $(this).removeClass('active').find('span').text(l[6993]);
                    $('.transfer-table-wrapper tr').removeClass('transfer-paused');
                    $('.nw-fm-left-icon').removeClass('paused');
                }
                else {
                    alert(l[214]);
                    if (d) {
                        console.debug(l[214]);
                    }
                }
            }
            else {
                var $trs = $('.transfer-table tr:not(.transfer-completed)');

                $trs.attrs('id')
                    .concat(Object.keys(M.tfsdomqueue))
                    .map(fm_tfspause);

                dlQueue.pause();
                ulQueue.pause();
                uldl_hold = true;

                $(this).addClass('active').find('span').text(l[7101]);
                $trs.addClass('transfer-paused');
                $('.nw-fm-left-icon').addClass('paused');
            }
        }
    });
};

FileManager.prototype.addContactUI = function() {
    "use strict";

    $('.nw-contact-item').removeClass('selected');
    $('.contact-details-pad .grid-url-arrow').unbind('click');

    var n = this.u[this.currentdirid];
    if (n && n.u) {
        var u_h = this.currentdirid;
        var user = this.u[u_h];
        var avatar = $(useravatar.contact(u_h));

        var onlinestatus = this.onlineStatusClass(
            megaChatIsReady &&
            this.u[u_h] ? this.u[u_h].presence : "unavailable"
        );

        $('.contact-top-details .nw-contact-block-avatar').empty().append(avatar.removeClass('avatar').addClass('square'));
        $('.contact-top-details .onlinestatus').removeClass('away offline online busy').addClass(onlinestatus[1]);
        $('.contact-top-details .fm-chat-user-status').text(onlinestatus[0]);
        $('.contact-top-details .contact-details-user-name').text(this.getNameByHandle(user.u));
        $('.contact-top-details .contact-details-email').text(user.m);

        $('.contact-details-pad .grid-url-arrow').rebind('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // do not treat it as a regular click on the file
            // $(this).addClass('active');
            $('.dropdown.body').addClass('arrange-to-front');
            e.currentTarget = $(this);
            e.calculatePosition = true;
            $.selected = [getSitePath().replace('/fm/', '')];
            M.searchPath();
            if (!$(this).hasClass('active')) {
                M.contextMenuUI(e, 4);
                $(this).addClass('active');
            }
            else {
                $.hideContextMenu();
                $(this).removeClass('active');
            }
        });

        // Display the current fingerpring
        showAuthenticityCredentials(user);

        // Set authentication state of contact from authring.
        // To be called on settled authring promise.
        authring.onAuthringReady('contactUI').done(function _setVerifiedState() {

            var handle = user.u || user;
            var verificationState = u_authring.Ed25519[handle] || {};
            var isVerified = (verificationState.method
            >= authring.AUTHENTICATION_METHOD.FINGERPRINT_COMPARISON);

            // Show the user is verified
            if (isVerified) {
                $('.fm-verify').addClass('verified').find('span').text(l[6776]);
            }
            else {
                // Otherwise show the Verify... button.
                enableVerifyFingerprintsButton(handle);
            }
        });

        // Reset seen or verified fingerprints and re-enable the Verify button
        $('.fm-reset-stored-fingerprint').rebind('click', function() {
            authring.resetFingerprintsForUser(user.u);
            enableVerifyFingerprintsButton(user.u);

            // Refetch the key
            showAuthenticityCredentials(user);
        });

        $('.fm-share-folders').rebind('click', openCopyShareDialog);

        // Remove contact button on contacts page
        $('.fm-remove-contact').rebind('click', function() {
            $.selected = [M.currentdirid];
            fmremove();
        });

        if (!megaChatIsDisabled) {

            // Bind the "Start conversation" button
            $('.fm-start-conversation').rebind('click.megaChat', function() {
                loadSubPage('fm/chat/' + u_h);
                return false;
            });
        }

        $('.nw-contact-item#contact_' + u_h).addClass('selected');
    }
};

FileManager.prototype.addNotificationsUI = function(close) {
    if (close) {
        $('.fm-main.notifications').addClass('hidden');
        $('.fm-main.default').removeClass('hidden');
        return false;
    }
    $('.fm-main.notifications').removeClass('hidden');
    $('.notifications .nw-fm-left-icon').removeClass('active');
    $('.fm-main.default').addClass('hidden');
    $.tresizer();
};

/**
 * Depending the viewmode this fires either addIconUI or addGridUI, plus addTreeUI
 * @param {Boolean} aNoTreeUpdate Omit the call to addTreeUI
 */
FileManager.prototype.addViewUI = function(aNoTreeUpdate, refresh) {
    if (this.viewmode) {
        this.addIconUI(undefined, refresh);
    }
    else {
        this.addGridUI(refresh);
    }

    if (!aNoTreeUpdate) {
        this.addTreeUI();
    }
};

FileManager.prototype.addIconUI = function(aQuiet, refresh) {
    "use strict";
    if (d) {
        console.time('iconUI');
    }

    $('.fm-files-view-icon.block-view').addClass('active');
    $('.fm-files-view-icon.listing-view').removeClass('active');
    $('.shared-grid-view').addClass('hidden');
    $('.files-grid-view.fm').addClass('hidden');
    $('.fm-blocks-view.fm').addClass('hidden');
    $('.fm-blocks-view.contacts-view').addClass('hidden');
    $('.files-grid-view.contacts-view').addClass('hidden');
    $('.contacts-details-block').addClass('hidden');
    $('.files-grid-view.contact-details-view').addClass('hidden');
    $('.fm-blocks-view.contact-details-view').addClass('hidden');

    if (this.currentdirid === 'contacts') {
        $('.fm-blocks-view.contacts-view').removeClass('hidden');
        initContactsBlocksScrolling();
    }
    else if (this.currentdirid === 'shares') {
        $('.shared-blocks-view').removeClass('hidden');
        initShareBlocksScrolling();
    }
    else if (String(this.currentdirid).length === 11 && this.currentrootid === 'contacts') {
        $('.contacts-details-block').removeClass('hidden');
        if (this.v.length > 0) {
            $('.fm-blocks-view.contact-details-view').removeClass('hidden');
            initFileblocksScrolling2();
        }
    }
    else if (this.currentdirid === this.InboxID || this.getNodeRoot(this.currentdirid) === this.InboxID) {
        //console.error("Inbox iconUI");
        if (this.v.length > 0) {
            $('.fm-blocks-view.fm').removeClass('hidden');
            initFileblocksScrolling();
        }
    }
    else {
        $('.fm-blocks-view.fm').removeClass('hidden');
        if (!aQuiet) {
            initFileblocksScrolling();
        }
    }

    $('.fm-blocks-view, .shared-blocks-view, .fm-empty-cloud, .fm-empty-folder').rebind('contextmenu.fm', function(e) {
        $(this).find('.data-block-view').removeClass('ui-selected');
        // is this required? don't we have a support for a multi-selection context menu?
        if (selectionManager) {
            selectionManager.clear_selection();
        }
        $.selected = [];
        $.hideTopMenu();
        return !!M.contextMenuUI(e, 2);
    });

    if (this.currentdirid === 'contacts') {
        $.selectddUIgrid = '.contacts-blocks-scrolling';
        $.selectddUIitem = 'a';
    }
    else if (this.currentdirid === 'shares') {
        $.selectddUIgrid = '.shared-blocks-scrolling';
        $.selectddUIitem = 'a';
    }
    else if (String(this.currentdirid).length === 11 && this.currentrootid === 'contacts') {
        $.selectddUIgrid = '.contact-details-view .file-block-scrolling';
        $.selectddUIitem = 'a';
    }
    else {
        $.selectddUIgrid = '.file-block-scrolling';
        $.selectddUIitem = 'a';
    }
    this.addSelectDragDropUI(refresh);
    if (d) {
        console.timeEnd('iconUI');
    }
};

FileManager.prototype.addGridUI = function(refresh) {
    "use strict";

    if (this.chat) {
        return;
    }
    if (d) {
        console.time('gridUI');
    }
    // $.gridDragging=false;
    $.gridLastSelected = false;
    $('.fm-files-view-icon.listing-view').addClass('active');
    $('.fm-files-view-icon.block-view').removeClass('active');

    $.gridHeader = function() {
        var headerColumn = '';
        var $firstChildTd = $('.grid-table tr:first-child td:visible');
        if ($firstChildTd.size() === 0) {
            // if the first <tr> does not contain any TDs, pick the next one
            // this can happen when MegaList's prepusher (empty <TR/> is first)
            $firstChildTd = $('.grid-table tr:nth-child(2) td:visible');
        }

        $firstChildTd.each(function(i, e) {
            headerColumn = $('.grid-table-header th').get(i);
            $(headerColumn).width($(e).width());
        });
    };


    $.detailsGridHeader = function() {
        $('.contact-details-view .grid-table tr:first-child td').each(function(i, e) {
            var headerColumn = $('.contact-details-view .grid-table-header th').get(i);
            $(headerColumn).width($(e).width());
        });
    };

    $.contactGridHeader = function() {
        $('.files-grid-view.contacts-view .grid-scrolling-table tr:first-child td').each(function(i, e) {
            var headerColumn = $('.files-grid-view.contacts-view .grid-table-header th').get(i);
            $(headerColumn).width($(e).width());
        });
    };

    $.opcGridHeader = function() {
        $('.sent-requests-grid .grid-scrolling-table tr:first-child td').each(function(i, e) {
            var headerColumn = $('.sent-requests-grid .grid-table-header th').get(i);
            $(headerColumn).width($(e).width());
        });
    };

    $.ipcGridHeader = function() {
        $('.contact-requests-grid .grid-scrolling-table tr:first-child td').each(function(i, e) {
            var headerColumn = $('.contact-requests-grid .grid-table-header th').get(i);
            $(headerColumn).width($(e).width());
        });
    };

    $.sharedGridHeader = function() {
        $('.shared-grid-view .grid-scrolling-table tr:first-child td').each(function(i, e) {
            var headerColumn = $('.shared-grid-view .grid-table-header th').get(i);
            $(headerColumn).width($(e).width());
        });
    };

    $('.fm-blocks-view.fm').addClass('hidden');
    $('.fm-chat-block').addClass('hidden');
    $('.shared-blocks-view').addClass('hidden');
    $('.shared-grid-view').addClass('hidden');

    $('.files-grid-view.fm').addClass('hidden');
    $('.fm-blocks-view.contacts-view').addClass('hidden');
    $('.files-grid-view.contacts-view').addClass('hidden');
    $('.contacts-details-block').addClass('hidden');
    $('.files-grid-view.contact-details-view').addClass('hidden');
    $('.fm-blocks-view.contact-details-view').addClass('hidden');

    if (this.currentdirid === 'contacts') {
        $('.files-grid-view.contacts-view').removeClass('hidden');
        $.contactGridHeader();
        initContactsGridScrolling();
    }
    else if (this.currentdirid === 'opc') {
        $('.grid-table.sent-requests').removeClass('hidden');
        $.opcGridHeader();
        initOpcGridScrolling();
    }
    else if (this.currentdirid === 'ipc') {
        $('.grid-table.contact-requests').removeClass('hidden');
        $.ipcGridHeader();
        initIpcGridScrolling();
    }
    else if (this.currentdirid === 'shares') {
        $('.shared-grid-view').removeClass('hidden');
        $.sharedGridHeader();
        initGridScrolling();
    }
    else if (String(this.currentdirid).length === 11 && this.currentrootid === 'contacts') {// Cloud-drive/File manager
        $('.contacts-details-block').removeClass('hidden');
        if (this.v.length > 0) {
            $('.files-grid-view.contact-details-view').removeClass('hidden');
            $.detailsGridHeader();
            initGridScrolling();
        }
    }
    else {
        $('.files-grid-view.fm').removeClass('hidden');
        initGridScrolling();
        $.gridHeader();
    }

    if (folderlink) {
        $('.grid-url-arrow').hide();
        $('.grid-url-header').text('');
    }
    else {
        $('.grid-url-arrow').show();
        $('.grid-url-header').text('');
    }

    $('.fm .grid-table-header th').rebind('contextmenu', function(e) {
        $('.fm-blocks-view .data-block-view').removeClass('ui-selected');
        if (selectionManager) {
            selectionManager.clear_selection();
        }

        $.selected = [];
        $.hideTopMenu();
        return !!M.contextMenuUI(e, 6);
    });

    $('.files-grid-view, .fm-empty-cloud, .fm-empty-folder').rebind('contextmenu.fm', function(e) {
        $('.fm-blocks-view .data-block-view').removeClass('ui-selected');
        if (selectionManager) {
            selectionManager.clear_selection();
        }
        $.selected = [];
        $.hideTopMenu();
        return !!M.contextMenuUI(e, 2);
    });

    // enable add star on first column click (make favorite)
    $('.grid-table.shared-with-me tr td:first-child,.grid-table.fm tr td:first-child').rebind('click', function() {
        var id = [$(this).parent().attr('id')];
        var newFavState = Number(!M.isFavourite(id));

        // Handling favourites is allowed for full permissions shares only
        if (M.getNodeRights(id) > 1) {
            M.favourite(id, newFavState);
        }
    });

    $('.dropdown-item.do-sort').rebind('click', function() {
        M.setLastColumn($(this).data('by'));
        M.doSort($(this).data('by'), -1);
        M.renderMain();
    });

    $('.grid-table-header .arrow').rebind('click', function() {
        var cls = $(this).attr('class');
        var dir = 1;

        if (cls && cls.indexOf('desc') > -1) {
            dir = -1;
        }

        for (var sortBy in M.sortRules) {
            if (cls.indexOf(sortBy) !== -1) {
                M.doSort(sortBy, dir);
                M.renderMain();
                break;
            }
        }

        return false;
    });

    $('.grid-first-th').rebind('click', function() {
        var c = $(this).children().first().attr('class');
        var d = 1;

        if (c && (c.indexOf('desc') > -1)) {
            d = -1;
        }

        for (var e in M.sortRules) {
            if (M.sortRules.hasOwnProperty(e)) {
                if (c.indexOf(e) !== -1) {
                    M.doSort(e, d);
                    M.renderMain();
                    break;
                }
            }
        }
    });

    if (this.currentdirid === 'shares') {
        $.selectddUIgrid = '.shared-grid-view .grid-scrolling-table';
    }
    else if (this.currentdirid === 'contacts') {
        $.selectddUIgrid = '.grid-scrolling-table.contacts';
    }
    else if (this.currentdirid === 'ipc') {
        $.selectddUIgrid = '.contact-requests-grid .grid-scrolling-table';
    }
    else if (this.currentdirid === 'opc') {
        $.selectddUIgrid = '.sent-requests-grid .grid-scrolling-table';
    }
    else if (String(this.currentdirid).length === 11 && this.currentrootid === 'contacts') {
        $.selectddUIgrid = '.files-grid-view.contact-details-view .grid-scrolling-table';
    }
    else {
        $.selectddUIgrid = '.files-grid-view.fm .grid-scrolling-table';
    }

    $.selectddUIitem = 'tr';
    this.addSelectDragDropUIDelayed(refresh);

    if (d) {
        console.timeEnd('gridUI');
    }
};

FileManager.prototype.addGridUIDelayed = function(refresh) {
    delay('GridUI', function() {
        M.addGridUI(refresh);
    }, 20);
};

FileManager.prototype.getDDhelper = function getDDhelper() {
    'use strict';

    var id = '#fmholder';
    if (page === 'start') {
        id = '#startholder';
    }
    $('.dragger-block').remove();
    $(id).append(
        '<div class="dragger-block drag" id="draghelper">' +
        '<div class="dragger-content"></div>' +
        '<div class="dragger-files-number">1</div>' +
        '</div>'
    );
    $('.dragger-block').show();
    $('.dragger-files-number').hide();
    return $('.dragger-block')[0];
};

FileManager.prototype.addSelectDragDropUI = function(refresh) {
    "use strict";

    if (this.currentdirid && this.currentdirid.substr(0, 7) === 'account') {
        return false;
    }

    if (d) {
        console.time('selectddUI');
    }

    var mainSel = $.selectddUIgrid + ' ' + $.selectddUIitem;
    var dropSel = $.selectddUIgrid + ' ' + $.selectddUIitem + '.folder';
    if (this.currentrootid === 'contacts') {
        dropSel = mainSel;
    }

    $(dropSel).droppable({
        tolerance: 'pointer',
        drop: function(e, ui) {
            $.doDD(e, ui, 'drop', 0);
        },
        over: function(e, ui) {
            $.doDD(e, ui, 'over', 0);
        },
        out: function(e, ui) {
            $.doDD(e, ui, 'out', 0);
        }
    });

    if ($.gridDragging) {
        $('body').addClass('dragging ' + ($.draggingClass || ''));
    }

    var $ddUIitem = $(mainSel);
    var $ddUIgrid = $($.selectddUIgrid);
    $ddUIitem.draggable({
        start: function(e, u) {
            if (d) {
                console.log('draggable.start');
            }
            $.hideContextMenu(e);
            $.gridDragging = true;
            $('body').addClass('dragging');
            if (!$(this).hasClass('ui-selected')) {
                selectionManager.clear_selection();
                selectionManager.set_currently_selected($(this).attr('id'));
            }
            var max = ($(window).height() - 96) / 24;
            var html = [];
            $.selected.forEach(function(id, i) {
                var n = M.d[id];
                if (n) {
                    if (max > i) {
                        html.push(
                            '<div class="transfer-filetype-icon '
                            + fileIcon(n) + ' tranfer-filetype-txt dragger-entry">'
                            + str_mtrunc(htmlentities(n.name))
                            + '</div>'
                        );
                    }
                }
            });
            if ($.selected.length > max) {
                $('.dragger-files-number').text($.selected.length);
                $('.dragger-files-number').show();
            }
            $('#draghelper .dragger-content').html(html.join(""));
            $.draggerHeight = $('#draghelper .dragger-content').outerHeight();
            $.draggerWidth = $('#draghelper .dragger-content').outerWidth();
            $.draggerOrigin = M.currentdirid;
            $.dragSelected = clone($.selected);
        },
        drag: function(e, ui) {
            if (ui.position.top + $.draggerHeight - 28 > $(window).height()) {
                ui.position.top = $(window).height() - $.draggerHeight + 26;
            }
            if (ui.position.left + $.draggerWidth - 58 > $(window).width()) {
                ui.position.left = $(window).width() - $.draggerWidth + 56;
            }
        },
        refreshPositions: true,
        containment: 'document',
        scroll: false,
        distance: 10,
        revertDuration: 200,
        revert: true,
        cursorAt: {right: 90, bottom: 56},
        helper: function(e, ui) {
            $(this).draggable("option", "containment", [72, 42, $(window).width(), $(window).height()]);
            return M.getDDhelper();
        },
        stop: function(event) {
            if (d) {
                console.log('draggable.stop');
            }
            $.gridDragging = $.draggingClass = false;
            $('body').removeClass('dragging').removeClassWith("dndc-");
            var origin = $.draggerOrigin;
            setTimeout(function __onDragStop() {
                if (M.currentdirid === 'contacts') {
                    if (origin !== 'contacts') {
                        M.openFolder(origin, true);
                    }
                }
                else {
                    M.onTreeUIOpen(M.currentdirid, false, true);
                }
            }, 200);
            delete $.dragSelected;
        }
    });

    $('.ui-selectable-helper').remove();

    $ddUIgrid.selectable({
        filter: $.selectddUIitem,
        start: function(e, u) {
            $.hideContextMenu(e);
            $.hideTopMenu();
        },
        stop: function(e, u) {
            M.searchPath();
        }
    });




    $ddUIitem.rebind('contextmenu', function(e) {
        if ($(this).attr('class').indexOf('ui-selected') == -1) {
            $($.selectddUIgrid + ' ' + $.selectddUIitem).removeClass('ui-selected');
            $(this).addClass('ui-selected');
            selectionManager.clear_selection();
            selectionManager.set_currently_selected($(this).attr('id'));
        }
        M.searchPath();
        $.hideTopMenu();
        return !!M.contextMenuUI(e, 1);
    });

    $ddUIitem.rebind('click', function(e) {
        if ($.gridDragging) {
            return false;
        }
        var s = e.shiftKey;
        if (e.shiftKey) {
            selectionManager.shift_select_to($(this).attr('id'), false, true, true);
        }
        else if (e.ctrlKey == false && e.metaKey == false)
        {
            $($.selectddUIgrid + ' ' + $.selectddUIitem).removeClass('ui-selected');
            $(this).addClass('ui-selected');
            $.gridLastSelected = this;
            selectionManager.clear_selection();
            selectionManager.add_to_selection($(this).attr('id'));
        }
        else
        {
            if ($(this).hasClass("ui-selected")) {
                $(this).removeClass("ui-selected");
                selectionManager.remove_from_selection($(this).attr('id'));
            }
            else
            {
                $(this).addClass("ui-selected");
                $.gridLastSelected = this;
                selectionManager.add_to_selection($(this).attr('id'));
            }
        }

        M.searchPath();
        $.hideContextMenu(e);
        if ($.hideTopMenu) {
            $.hideTopMenu();
        }
        return false;
    });

    $ddUIitem.rebind('dblclick', function(e) {
        var h = $(e.currentTarget).attr('id');
        var n = M.d[h] || {};
        if (n.t) {
            $('.top-context-menu').hide();
            M.openFolder(h);
        }
        else if (is_image(n)) {
            slideshow(h);
        }
        else {
            M.addDownload([h]);
        }
    });

    if ($.rmInitJSP) {
        var jsp = $($.rmInitJSP).data('jsp');
        if (jsp) {
            jsp.reinitialise();
        }
        if (d) {
            console.log('jsp:!u', !!jsp);
        }
        delete $.rmInitJSP;
    }
    if (!refresh) {
        $.tresizer();
    }

    if (d) {
        console.timeEnd('selectddUI');
    }

    $ddUIitem = $ddUIgrid = undefined;
};

FileManager.prototype.addSelectDragDropUIDelayed = function(refresh) {
    delay('selectddUI', function() {
        M.addSelectDragDropUI(refresh);
    });
};

FileManager.prototype.addTreeUI = function() {
    "use strict";

    //console.error('treeUI');
    if (d) {
        console.time('treeUI');
    }
    var $treePanel = $('.fm-tree-panel');
    var $treeItem = $('.nw-fm-tree-item:visible', $treePanel);

    $treeItem.draggable(
        {
            revert: true,
            containment: 'document',
            revertDuration: 200,
            distance: 10,
            scroll: false,
            cursorAt: {right: 88, bottom: 58},
            helper: function(e, ui) {
                $(this).draggable("option", "containment", [72, 42, $(window).width(), $(window).height()]);
                return M.getDDhelper();
            },
            start: function(e, ui) {
                $.treeDragging = true;
                $.hideContextMenu(e);
                var html = '';
                var id = $(e.target).attr('id');
                if (id) {
                    id = id.replace('treea_', '');
                }
                if (id && M.d[id]) {
                    html = (
                        '<div class="transfer-filetype-icon '
                        + fileIcon(M.d[id]) + ' tranfer-filetype-txt dragger-entry">'
                        + str_mtrunc(htmlentities(M.d[id].name)) + '</div>'
                    );
                }
                $('#draghelper .dragger-icon').remove();
                $('#draghelper .dragger-content').html(html);
                $('body').addClass('dragging');
                $.draggerHeight = $('#draghelper .dragger-content').outerHeight();
                $.draggerWidth = $('#draghelper .dragger-content').outerWidth();
            },
            drag: function(e, ui) {
                //console.log('tree dragging',e);
                if (ui.position.top + $.draggerHeight - 28 > $(window).height()) {
                    ui.position.top = $(window).height() - $.draggerHeight + 26;
                }
                if (ui.position.left + $.draggerWidth - 58 > $(window).width()) {
                    ui.position.left = $(window).width() - $.draggerWidth + 56;
                }
            },
            stop: function(e, u) {
                $.treeDragging = false;
                $('body').removeClass('dragging').removeClassWith("dndc-");
            }
        });

    $(
        '.fm-tree-panel .nw-fm-tree-item,' +
        '.rubbish-bin,' +
        '.fm-breadcrumbs,' +
        '.nw-fm-left-icons-panel .nw-fm-left-icon,' +
        '.shared-with-me tr,' +
        '.nw-conversations-item,' +
        'ul.conversations-pane > li,' +
        '.messages-block,' +
        '.nw-contact-item'
    ).filter(":visible").droppable({
        tolerance: 'pointer',
        drop: function(e, ui) {
            $.doDD(e, ui, 'drop', 1);
        },
        over: function(e, ui) {
            $.doDD(e, ui, 'over', 1);
        },
        out: function(e, ui) {
            $.doDD(e, ui, 'out', 1);
        }
    });

    // disabling right click, default contextmenu.
    $(document).rebind('contextmenu', function(e) {
        var $target = $(e.target);

        if (!is_fm() ||
            $target.parents('#startholder').length ||
            $target.is('input') ||
            $target.is('textarea') ||
            $target.is('.download.info-txt') ||
            $target.closest('.multiple-input').length ||
            $target.closest('.create-folder-input-bl').length ||
            $target.closest('.content-panel.conversations').length ||
            $target.closest('.messages.content-area').length ||
            $target.closest('.chat-right-pad .user-card-data').length ||
            $target.parents('.fm-account-main').length ||
            $target.parents('.export-link-item').length ||
            $target.parents('.contact-fingerprint-txt').length ||
            $target.parents('.fm-breadcrumbs').length ||
            $target.hasClass('contact-details-user-name') ||
            $target.hasClass('contact-details-email') ||
            $target.hasClass('nw-conversations-name')) {
        }
        else if (!localStorage.contextmenu) {
            $.hideContextMenu();
            return false;
        }
    });

    $treeItem.rebind('click.treeUI, contextmenu.treeUI', function(e) {
        var $this = $(this);
        var id = $this.attr('id').replace('treea_', '');

        if (e.type === 'contextmenu') {
            $('.nw-fm-tree-item').removeClass('dragover');
            $this.addClass('dragover');

            var $uls = $this.parents('ul').find('.selected');

            if ($uls.length > 1) {
                $.selected = $uls.attrs('id')
                    .map(function(id) {
                        return id.replace('treea_', '');
                    });
            }
            else {
                $.selected = [id];

                Soon(function() {
                    $this.addClass('hovered');
                });
            }
            return !!M.contextMenuUI(e, 1);
        }

        var $target = $(e.target);
        if ($target.hasClass('nw-fm-arrow-icon')) {
            M.onTreeUIExpand(id);
        }
        else if (e.shiftKey) {
            $this.addClass('selected');
        }
        else {
            // plain click, remove all .selected from e.shiftKey
            $('#treesub_' + M.currentrootid + ' .nw-fm-tree-item').removeClass('selected');
            $this.addClass('selected');

            if ($target.hasClass('opened')) {
                M.onTreeUIExpand(id);
            }
            M.openFolder(id);
        }

        return false;
    });

    $('.nw-contact-item', $treePanel).rebind('contextmenu.treeUI', function(e) {
        var $self = $(this);

        if ($self.attr('class').indexOf('selected') === -1) {
            $('.content-panel.contacts .nw-contact-item.selected').removeClass('selected');
            $self.addClass('selected');
        }

        $.selected = [$self.attr('id').replace('contact_', '')];
        M.searchPath();
        $.hideTopMenu();

        return Boolean(M.contextMenuUI(e, 1));
    });

    /**
     * Let's shoot two birds with a stone, when nodes are moved we need a resize
     * to let dynlist refresh - plus, we'll implicitly invoke initTreeScroll.
     */
    $(window).trigger('resize');

    if (d) {
        console.timeEnd('treeUI');
    }
};

FileManager.prototype.addTreeUIDelayed = function() {
    delay('treeUI', function() {
        M.addTreeUI();
    }, 30);
};

FileManager.prototype.onTreeUIExpand = function(id, force) {
    "use strict";

    return this.buildtree({h: id})
        .always(function() {
            var $tree = $('#treea_' + id);

            if ($tree.hasClass('expanded') && !force) {
                fmtreenode(id, false);
                $('#treesub_' + id).removeClass('opened');
                $tree.removeClass('expanded');
            }
            else if ($tree.hasClass('contains-folders')) {
                fmtreenode(id, true);
                $('#treesub_' + id).addClass('opened');
                $tree.addClass('expanded');
            }

            M.addTreeUIDelayed();
        });
};

FileManager.prototype.onTreeUIOpen = function(id, event, ignoreScroll) {
    "use strict";

    id = String(id);
    var id_r = this.getNodeRoot(id);
    var id_s = id.split('/')[0];
    var e, scrollTo = false, stickToTop = false;

    //console.error("treeUIopen", id);

    if (id_r === 'shares') {
        this.onSectionUIOpen('shared-with-me');
    }
    else if (this.InboxID && id_r === this.InboxID) {
        this.onSectionUIOpen('inbox');
    }
    else if (id_r === this.RootID) {
        this.onSectionUIOpen('cloud-drive');
    }
    else if (id_s === 'chat') {
        this.onSectionUIOpen('conversations');
    }
    else if (id_r === 'contacts') {
        this.onSectionUIOpen('contacts');
    }
    else if (id_r === 'ipc') {
        this.onSectionUIOpen('ipc');
    }
    else if (id_r === 'opc') {
        this.onSectionUIOpen('opc');
    }
    else if (id_r === 'account') {
        this.onSectionUIOpen('account');
    }
    else if (id_r === 'dashboard') {
        this.onSectionUIOpen('dashboard');
    }
    else if (this.RubbishID && id_r === this.RubbishID) {
        this.onSectionUIOpen('rubbish-bin');
    }
    else if (id_s === 'transfers') {
        this.onSectionUIOpen('transfers');
    }

    if (!fminitialized) {
        return false;
    }

    if (!event) {
        var ids = this.getPath(id);
        var i = 1;
        while (i < ids.length) {
            if (this.d[ids[i]] && ids[i].length === 8) {
                this.onTreeUIExpand(ids[i], 1);
            }
            i++;
        }
        if (
            (ids[0] === 'contacts')
            && this.currentdirid
            && (String(this.currentdirid).length === 11)
            && (this.currentrootid === 'contacts')
        ) {
            this.onSectionUIOpen('contacts');
        }
        else if (ids[0] === 'contacts') {
            // XX: whats the goal of this? everytime when i'm in the contacts and I receive a share, it changes ONLY the
            // UI tree -> Shared with me... its a bug from what i can see and i also don't see any points of automatic
            // redirect in the UI when another user had sent me a shared folder.... its very bad UX. Plus, as a bonus
            // sectionUIopen is already called with sectionUIopen('contacts') few lines before this (when this func
            // is called by the renderNew()

            // sectionUIopen('shared-with-me');
        }
        else if (ids[0] === this.RootID) {
            this.onSectionUIOpen('cloud-drive');
        }
    }
    if ($.hideContextMenu) {
        $.hideContextMenu(event);
    }

    e = $('#treea_' + id_s);
    $('.fm-tree-panel .nw-fm-tree-item').removeClass('selected');
    e.addClass('selected');

    if (!ignoreScroll) {
        if (id === this.RootID || id === 'shares' || id === 'contacts' || id === 'chat' || id === 'opc' || id === 'ipc') {
            stickToTop = true;
            scrollTo = $('.nw-tree-panel-header');
        }
        else if (e.length && !e.visible()) {
            scrollTo = e;
        }
        // if (d) console.log('scroll to element?',ignoreScroll,scrollTo,stickToTop);

        var jsp = scrollTo && $('.fm-tree-panel').data('jsp');
        if (jsp) {
            setTimeout(function() {
                jsp.scrollToElement(scrollTo, stickToTop);
            }, 50);
        }
    }
    this.addTreeUIDelayed();
};

FileManager.prototype.onSectionUIOpen = function(id) {
    "use strict";

    var tmpId;
    if (d) {
        console.log('sectionUIopen', id, folderlink);
    }

    $.hideContextMenu();
    $('.nw-fm-left-icon').removeClass('active');
    if (this.hasInboxItems() === true) {
        $('.nw-fm-left-icon.inbox').removeClass('hidden');
    }
    else {
        $('.nw-fm-left-icon.inbox').addClass('hidden');
    }

    $('.content-panel').removeClass('active');

    if (id === 'opc' || id === 'ipc') {
        tmpId = 'contacts';
    }
    else if (id === 'account') {
        tmpId = 'account';
    }
    else if (id === 'dashboard') {
        tmpId = 'dashboard';
    }
    else {
        tmpId = id;
    }
    $('.nw-fm-left-icon.' + String(tmpId).replace(/[^\w-]/g, '')).addClass('active');
    $('.content-panel.' + String(tmpId).replace(/[^\w-]/g, '')).addClass('active');
    $('.fm-left-menu').removeClass(
        'cloud-drive folder-link shared-with-me rubbish-bin contacts ' +
        'conversations opc ipc inbox account dashboard transfers'
    ).addClass(tmpId);
    $('.fm.fm-right-header, .fm-import-to-cloudrive, .fm-download-as-zip').addClass('hidden');
    $('.fm-import-to-cloudrive, .fm-download-as-zip').unbind('click');

    $('.fm-main').removeClass('active-folder-link');
    $('.nw-fm-tree-header.folder-link').hide();
    $('.nw-fm-left-icon.folder-link').removeClass('active');

    if (folderlink) {
        // XXX: isValidShareLink won't work properly when navigating from/to a folderlink
        /*if (!isValidShareLink()) {
         $('.fm-breadcrumbs.folder-link .right-arrow-bg').text('Invalid folder');
         } else*/
        if (id === 'cloud-drive' || id === 'transfers') {
            $('.fm-main').addClass('active-folder-link');
            $('.fm-right-header').addClass('folder-link');
            $('.nw-fm-left-icon.folder-link').addClass('active');
            $('.fm-left-menu').addClass('folder-link');
            $('.nw-fm-tree-header.folder-link').show();
            $('.fm-import-to-cloudrive, .fm-download-as-zip')
                .removeClass('hidden')
                .rebind('click', function() {
                    var c = '' + $(this).attr('class');

                    if (~c.indexOf('fm-import-to-cloudrive')) {
                        M.importFolderLinkNodes([M.currentdirid]);
                    }
                    else if (~c.indexOf('fm-download-as-zip')) {
                        M.addDownload([M.currentdirid], true);
                    }
                });
            // if (!u_type) {
            // $('.fm-import-to-cloudrive').addClass('hidden');
            // }
        }
    }

    if (id !== 'conversations') {
        $('.fm-right-header').removeClass('hidden');
        $('.fm-chat-block').addClass('hidden');
        $('.section.conversations').addClass('hidden');
    }
    else {
        $('.section.conversations').removeClass('hidden');
    }

    if (
        (id !== 'cloud-drive') &&
        (id !== 'rubbish-bin') &&
        (id !== 'inbox') &&
        (
            (id !== 'shared-with-me') &&
            (M.currentdirid !== 'shares')
        )
    ) {
        $('.files-grid-view.fm').addClass('hidden');
        $('.fm-blocks-view.fm').addClass('hidden');
    }

    if (id !== 'contacts' && id !== 'opc' && id !== 'ipc' && String(M.currentdirid).length !== 11) {
        $('.fm-left-panel').removeClass('contacts-panel');
        $('.fm-right-header').removeClass('requests-panel');
        $('.fm-received-requests').removeClass('active');
        $('.fm-contact-requests').removeClass('active');
    }

    if (id !== 'contacts') {
        $('.contacts-details-block').addClass('hidden');
        $('.files-grid-view.contacts-view').addClass('hidden');
        $('.fm-blocks-view.contacts-view').addClass('hidden');
    }

    if (id !== 'opc') {
        $('.sent-requests-grid').addClass('hidden');

        // this's button in left panel of contacts tab
        $('.fm-recived-requests').removeClass('active');
    }

    if (id !== 'ipc') {
        $('.contact-requests-grid').addClass('hidden');

        // this's button in left panel of contacts tab
        $('.fm-contact-requests').removeClass('active');
    }

    if (id !== 'shared-with-me') {
        $('.shared-blocks-view').addClass('hidden');
        $('.shared-grid-view').addClass('hidden');
    }

    if (id !== 'transfers') {
        if ($.transferClose) {
            $.transferClose();
        }
    }
    else {
        if (!$.transferOpen) {
            M.addTransferPanelUI();
        }
        $.transferOpen(true);
    }

    var headertxt = '';
    switch (id) {
        case 'contacts':
        case 'ipc':
        case 'opc':
            headertxt = l[5903];
            break;
        case 'conversations':
            headertxt = l[5914];
            break;
        case 'shared-with-me':
            headertxt = l[5915];
            break;
        case 'cloud-drive':
            if (folderlink) {
                headertxt = Object(M.d[M.RootID]).name || '';
            }
            else {
                headertxt = l[5916];
            }
            break;
        case 'inbox':
            headertxt = l[949];
            break;
        case 'rubbish-bin':
            headertxt = l[6771];
            break;
    }

    $('.fm-left-panel .nw-tree-panel-header span').text(headertxt);

    {
        // required tricks to make the conversations work with the old UI HTML/css structure
        if (id === "conversations") { // moving the control of the headers in the tree panel to chat.js + ui/conversations.jsx
            $('.fm-left-panel .nw-tree-panel-header').addClass('hidden');
            $('.fm-main.default > .fm-left-panel').addClass('hidden');
        }
        else {
            $('.fm-left-panel .nw-tree-panel-header').removeClass('hidden');
            $('.fm-main.default > .fm-left-panel').removeClass('hidden');
        }

        // prevent unneeded flashing of the conversations section when switching between chats
        // new sections UI
        if (id === "conversations") {
            $('.section:not(.conversations)').addClass('hidden');
            $('.section.' + id).removeClass('hidden');
        }
        else {
            $('.section').addClass('hidden');
            $('.section.' + String(id).replace(/[^\w-]/g, '')).removeClass('hidden');
        }
    }
};


/**
 * Show storage overquota dialog
 * @param {Number} perc percent
 * @param {Number} [cstrg] Current storage usage
 * @param {Number} [mstrg] Maximum storage.
 * @param {Object} [options] Additional options
 */
FileManager.prototype.showOverStorageQuota = function(perc, cstrg, mstrg, options) {
    'use strict';

    var promise = new MegaPromise();
    var prevState = $('.fm-main').is('.almost-full, .full');
    $('.fm-main').removeClass('almost-full full');

    if (this.showOverStorageQuotaPromise) {
        promise = this.showOverStorageQuotaPromise;
    }
    this.showOverStorageQuotaPromise = promise;

    if (Object(u_attr).p) {
        // update texts with "for free accounts" sentences removed.
        $('.fm-notification-block.full').safeHTML(l[16358]);
        $('.fm-notification-block.almost-full')
            .safeHTML('<div class="fm-notification-close"></div>' + l[16359]);
        $('.fm-dialog-body.storage-dialog.full .body-header').safeHTML(l[16360]);
        $('.fm-dialog-body.storage-dialog.almost-full .no-achievements-bl .body-p').safeHTML(l[16361]);
        $('.fm-dialog-body.storage-dialog.almost-full .achievements-bl .body-p')
            .safeHTML(l[16361] + ' ' + l[16314]);
    }
    else {
        $('.fm-dialog-body.storage-dialog.almost-full .no-achievements-bl .body-p')
            .safeHTML(l[16313].replace('%1', (4.99).toLocaleString()));
        $('.fm-dialog-body.storage-dialog.almost-full .achievements-bl .body-p')
            .safeHTML(l[16313].replace('%1', (4.99).toLocaleString()) + ' ' + l[16314]);
    }

    if (perc > 90 || Object(options).custom) {
        var $strgdlg = $('.fm-dialog.storage-dialog').removeClass('full almost-full');

        if (perc > 99) {
            $('.fm-main').addClass('fm-notification full');
            $strgdlg.addClass('full')
                .find('.fm-dialog-body.full')
                .find('.fm-dialog-title')
                .text(Object(options).title || l[16302])
                .end()
                .find('.body-header')
                .safeHTML(Object(options).body || l[16360]);
        }
        else {
            $('.fm-main').addClass('fm-notification almost-full');
            $strgdlg.addClass('almost-full')
                .find('.fm-dialog-body.almost-full')
                .find('.fm-dialog-title')
                .text(Object(options).title || l[16311])
                .end()
                .find('.body-header')
                .safeHTML(Object(options).body || l[16312]);

            // Storage chart and info
            var strQuotaLimit = bytesToSize(mstrg, 0).split(' ');
            var strQuotaUsed = bytesToSize(cstrg);
            var deg = 230 * perc / 100;
            var $storageChart = $('.fm-account-blocks.storage', $strgdlg);

            // Storage space chart
            if (deg <= 180) {
                $storageChart.find('.left-chart span').css('transform', 'rotate(' + deg + 'deg)');
                $storageChart.find('.right-chart span').removeAttr('style');
            }
            else {
                $storageChart.find('.left-chart span').css('transform', 'rotate(180deg)');
                $storageChart.find('.right-chart span').css('transform', 'rotate(' + (deg - 180) + 'deg)');
            }

            $('.chart.data .size-txt', $strgdlg).text(strQuotaUsed);
            $('.chart.data .pecents-txt', $strgdlg).text(strQuotaLimit[0]);
            $('.chart.data .gb-txt', $strgdlg).text(strQuotaLimit[1]);
            $('.chart.data .perc-txt', $strgdlg).text(perc + '%');
        }

        var closeDialog = function() {
            $.dialog = null;
            window.closeDialog();

            promise.resolve();
            delete M.showOverStorageQuotaPromise;
        };
        $.dialog = closeDialog;

        $('.button', $strgdlg).rebind('click', function() {
            var $this = $(this);

            closeDialog();

            if ($this.hasClass('choose-plan')) {
                loadSubPage('pro');
            }
            else if ($this.hasClass('get-bonuses')) {
                mega.achievem.achievementsListDialog();
            }

            return false;
        });
        $('.fm-dialog-close, .button.skip', $strgdlg).rebind('click', closeDialog);

        $('.fm-notification-block .fm-notification-close')
            .rebind('click', function() {
                $('.fm-main').removeClass('fm-notification almost-full full');
            });

        mega.achievem.enabled()
            .done(function() {
                $strgdlg.addClass('achievements')
                    .find('.semi-small-icon.rocket')
                    .rebind('click', function() {
                        closeDialog();
                        mega.achievem.achievementsListDialog();
                        return false;
                    });
            });

        clickURLs();
        $('a.gotorub').attr('href', '/fm/' + M.RubbishID)
            .rebind('click', function() {
                closeDialog();
                loadSubPage('fm/' + M.RubbishID);
                return false;
            });

        if (Object(u_attr).p) {
            $('.choose-plan', $strgdlg).text(l[16386]);
        }

        // if another dialog wasn't opened previously
        if (!prevState || Object(options).custom) {
            M.safeShowDialog('over-storage-quota', $strgdlg);
            $('.fm-dialog:visible, .overlay:visible').addClass('arrange-to-back');
        }
        else {
            promise.reject();
        }
    }

    return promise;
};

(function(global) {
    'use strict';

    var _cdialogq = Object.create(null);

    // Define what dialogs can be opened from other dialogs
    var diagInheritance = {
        properties: ['links', 'rename', 'copyrights', 'copy', 'move'],
        copy: ['createfolder'],
        move: ['createfolder']
    };

    var _openDialog = function(name, dsp) {
        if (d) {
            console.log('safeShowDialog::_openDialog', name, typeof dsp, $.dialog);
        }

        onIdle(function() {
            if (typeof $.dialog === 'string') {

                // There are a few dialogs that can be opened from others, deal it.
                if (!diagInheritance[$.dialog] || diagInheritance[$.dialog].indexOf(name) < 0) {
                    _cdialogq[name] = dsp;
                    return;
                }
            }

            dsp();
        });
    };

    mBroadcaster.addListener('closedialog', function() {
        var name = Object.keys(_cdialogq).shift();

        if (name) {
            _openDialog(name, _cdialogq[name]);
            delete _cdialogq[name];
        }
    });

    if (d) {
        global._cdialogq = _cdialogq;
    }

    /**
     * Prevent dispatching several dialogs in top on each other
     * @param {String} dialogName The dialog name to set on $.dialog
     * @param {Function|Object} dispatcher The dispatcher, either a jQuery's node/selector or a function
     */
    FileManager.prototype.safeShowDialog = function(dialogName, dispatcher) {

        dispatcher = (function(name, dsp) {
            return tryCatch(function() {
                var $dialog;

                if (d) {
                    console.warn('Dispatching queued dialog.', name);
                }

                if (typeof dsp === 'function') {
                    $dialog = dsp();
                }
                else {
                    $dialog = $(dsp);
                }

                if ($dialog) {
                    if (!$dialog.hasClass('fm-dialog')) {
                        throw new Error('Unexpected dialog type...');
                    }

                    // arrange to back any non-controlled dialogs,
                    // this class will be removed on the next closeDialog()
                    $('.fm-dialog').addClass('arrange-to-back');

                    fm_showoverlay();
                    $dialog.removeClass('hidden arrange-to-back');
                }
                $.dialog = String(name);
            }, function(ex) {
                // There was an exception dispatching the above code, move to the next queued dialog...
                mBroadcaster.sendMessage('closedialog', ex);
            });
        })(dialogName, dispatcher);

        _openDialog(dialogName, dispatcher);
    };
})(self);
