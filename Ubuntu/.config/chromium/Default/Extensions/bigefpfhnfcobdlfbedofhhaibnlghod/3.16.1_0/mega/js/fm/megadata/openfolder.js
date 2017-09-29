(function(global) {
    "use strict";

    // map handle to root name
    var maph = function(h) {
        if (h === M.RootID) {
            return h + ' (RootID)';
        }
        if (h === M.InboxID) {
            return h + ' (InboxID)';
        }
        if (h === M.RubbishID) {
            return h + ' (RubbishID)';
        }

        return h;
    };

    /**
     * Invoke M.openFolder() completion.
     *
     * @param {String}      id               The folder id
     * @param {String}      newHashLocation  location change
     * @param {Boolean}     first            Whether this is the first open call
     * @param {MegaPromise} promise          Completion promise
     * @private
     */
    var _openFolderCompletion = function(id, newHashLocation, first, promise) {
        // if the id is a file handle, then set the folder id as the file's folder.
        var fid;
        if (M.d[id] && (M.d[id].t === 0)) {
            fid = fileversioning.getTopNodeSync(id);
            id = M.d[fid].p;
        }

        this.previousdirid = this.currentdirid;
        this.currentdirid = id;
        this.currentrootid = this.getNodeRoot(id);

        if (first) {
            fminitialized = true;
            $('.top-search-bl').show();
            mBroadcaster.sendMessage('fm:initialized');

            if (d) {
                console.log('d%s, c%s, t%s', $.len(this.d), $.len(this.c), $.len(this.tree));
                console.log('RootID=%s, InboxID=%s, RubbishID=%s', this.RootID, this.InboxID, this.RubbishID);
            }
        }

        if (d) {
            console.log('previd=%s, currid=%s, currroot=%s',
                maph(this.previousdirid), maph(this.currentdirid), maph(this.currentrootid));
        }

        if (this.currentrootid === this.RootID) {
            this.lastSeenCloudFolder = this.currentdirid;
        }

        $('.nw-fm-tree-item').removeClass('opened');

        if (this.chat) {
            this.v = [];
            sharedFolderUI(); // remove shares-specific UI
            //$.tresizer();
        }
        else if (id === undefined && folderlink) {
            // Error reading shared folder link! (Eg, server gave a -11 (EACCESS) error)
            // Force cleaning the current cloud contents and showing an empty msg
            this.renderMain();
        }
        else if (id && (id.substr(0, 7) !== 'account')
            && (id.substr(0, 9) !== 'dashboard')
            && (id.substr(0, 13) !== 'notifications')) {

            $('.fm-right-files-block').removeClass('hidden');

            if (d) {
                console.time('time for rendering');
            }

            if (id === 'transfers') {
                this.v = [];
            }
            else if (id === 'links') {
                if (this.su.EXP) {
                    this.v = Object.keys(this.su.EXP)
                        .map(function(h) {
                            return M.d[h];
                        });
                }
                else {
                    this.v = [];
                }
            }
            else if (id.substr(0, 6) === 'search') {
                this.filterBySearch(this.currentdirid);
            }
            else {
                this.filterByParent(this.currentdirid);
            }

            var viewmode = 0;// 0 is list view, 1 block view
            if (this.overrideViewMode !== undefined) {
                viewmode = this.overrideViewMode;
                delete this.overrideViewMode;
            }
            else if (typeof fmconfig.uiviewmode !== 'undefined' && fmconfig.uiviewmode) {
                if (fmconfig.viewmode) {
                    viewmode = fmconfig.viewmode;
                }
            }
            else if (typeof fmconfig.viewmodes !== 'undefined' && typeof fmconfig.viewmodes[id] !== 'undefined') {
                viewmode = fmconfig.viewmodes[id];
            }
            else {
                for (var i = this.v.length; i--;) {
                    if (is_image(this.v[i])) {
                        viewmode = 1;
                        break;
                    }
                }
            }
            this.viewmode = viewmode;
            if (this.overrideSortMode) {
                this.doSort(this.overrideSortMode[0], this.overrideSortMode[1]);
                delete this.overrideSortMode;
            }
            else if (fmconfig.uisorting && fmconfig.sorting) {
                this.doSort(fmconfig.sorting.n, fmconfig.sorting.d);
            }
            else if (fmconfig.sortmodes && fmconfig.sortmodes[id]) {
                this.doSort(fmconfig.sortmodes[id].n, fmconfig.sortmodes[id].d);
            }
            else if (this.currentdirid === 'contacts') {
                this.doSort('status', 1);
            }
            else {
                this.doSort('name', 1);
            }

            if (this.currentdirid === 'opc') {
                this.v = [];
                for (var i in this.opc) {
                    this.v.push(this.opc[i]);
                }
            }
            else if (this.currentdirid === 'ipc') {
                this.v = [];
                for (var i in this.ipc) {
                    this.v.push(this.ipc[i]);
                }
            }

            this.renderMain();

            if (fminitialized && !is_mobile) {
                var currentdirid = this.currentdirid;
                if (id.substr(0, 6) === 'search' || id === 'links') {
                    currentdirid = this.RootID;

                    if (this.d[this.previousdirid]) {
                        currentdirid = this.previousdirid;
                    }
                }

                if ($('#treea_' + currentdirid).length === 0) {
                    var n = this.d[currentdirid];
                    if (n && n.p) {
                        M.onTreeUIOpen(n.p, false, true);
                    }
                }
                M.onTreeUIOpen(currentdirid, currentdirid === 'contacts');

                $('#treea_' + currentdirid).addClass('opened');
            }
            if (d) {
                console.timeEnd('time for rendering');
            }

            Soon(function() {
                M.renderPath(fid);
            });
        }


        // If a folderlink, and entering a new folder.
        if (pfid && this.currentrootid === this.RootID) {
            var target = '';
            if (this.currentdirid !== this.RootID) {
                target = '!' + this.currentdirid;
            }
            newHashLocation = 'F!' + pfid + '!' + pfkey + target;
            this.lastSeenFolderLink = newHashLocation;
        }
        else {
            // new hash location can be altered already by the chat logic in the previous lines in this func
            if (!newHashLocation) {
                newHashLocation = 'fm/' + this.currentdirid;
            }
        }
        try {

            if (hashLogic) {
                document.location.hash = '#' + newHashLocation;
            }
            else {
                if (window.location.pathname !== "/" + newHashLocation && !pfid) {
                    loadSubPage(newHashLocation);
                }
                else if (pfid && document.location.hash !== '#' + newHashLocation) {
                    history.pushState({fmpage: newHashLocation}, "", "#" + newHashLocation);
                    page = newHashLocation;
                }
            }
        }
        catch (ex) {
            console.error(ex);
        }

        M.searchPath();
        M.treeSearchUI();

        promise.resolve(id);
        mBroadcaster.sendMessage('mega:openfolder');
    };

    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    /**
     * Open Cloud Folder or Site Section/Page
     *
     * @param {String}  id      The folder id
     * @param {Boolean} [force] If that folder is already open, re-render it
     * @param {Boolean} [chat]  Some chat flag..
     * @returns {MegaPromise}
     */
    MegaData.prototype.openFolder = function(id, force, chat) {
        var newHashLocation;
        var fetchdbnodes;
        var fetchshares;
        var firstopen;

        $('.fm-right-account-block, .fm-right-block.dashboard').addClass('hidden');
        $('.fm-files-view-icon').removeClass('hidden');

        if (d) {
            console.warn('openFolder(%s, %s), currentdir=%s, fmloaded=%s',
                maph(id), force, maph(this.currentdirid), loadfm.loaded);
        }

        if (!loadfm.loaded) {
            console.error('Internal error, do not call openFolder before the cloud finished loading.');
            return MegaPromise.reject(EACCESS);
        }

        if (!folderlink) {
            // open the dashboard by default
            /*id = id || 'dashboard';
             disabled for now
             */
        }

        if (!is_mobile && (id !== 'notifications') && !$('.fm-main.notifications').hasClass('hidden')) {
            M.addNotificationsUI(1);
        }

        this.search = false;
        this.chat = false;

        if (!fminitialized) {
            firstopen = true;
        }
        else if (id && id === this.currentdirid && !force) {
            // Do nothing if same path is chosen
            return MegaPromise.resolve(EEXIST);
        }

        if (id === 'rubbish') {
            id = this.RubbishID;
        }
        else if (id === 'inbox') {
            id = this.InboxID;
        }
        else if (id === 'cloudroot') {
            id = this.RootID;
        }
        else if (id === 'contacts') {
            id = 'contacts';
        }
        else if (id === 'opc') {
            id = 'opc';
        }
        else if (id === 'ipc') {
            id = 'ipc';
        }
        else if (id === 'shares') {
            id = 'shares';
        }
        else if (id === 'chat') {
            if (!megaChatIsReady) {
                id = this.RootID;
            }
            else {
                this.chat = true;

                megaChat.refreshConversations();
                M.addTreeUI();
                var room = megaChat.renderListing();

                if (room) {
                    newHashLocation = room.getRoomUrl();
                }
            }
        }
        else if (id && id.substr(0, 7) === 'account') {
            M.onFileManagerReady(accountUI);
        }
        else if (id && id.substr(0, 9) === 'dashboard') {
            M.onFileManagerReady(dashboardUI);
        }
        else if (id && id.substr(0, 13) === 'notifications') {
            M.addNotificationsUI();
        }
        else if (id && id.substr(0, 7) === 'search/') {
            this.search = true;
        }
        else if (id && id.substr(0, 5) === 'chat/') {
            this.chat = true;
            this.addTreeUI();

            if (megaChatIsReady) {
                // XX: using the old code...for now
                chatui(id);
            }
        }
        else if (String(id).length === 11) {
            fetchshares = !M.c[id];
        }
        else if (id !== 'transfers' && id !== 'links') {
            if (id && id.substr(0, 9) === 'versions/') {
                id = id.substr(9);
            }
            if (!id) {
                id = this.RootID;
            }
            else if (fmdb && (!this.d[id] || (this.d[id].t && !this.c[id]))) {
                fetchdbnodes = true;
            }
        }

        if (megaChatIsReady) {
            if (!this.chat) {
                if (megaChat.getCurrentRoom()) {
                    megaChat.getCurrentRoom().hide();
                }
            }
        }

        var promise = new MegaPromise();

        if (fetchdbnodes) {

            dbfetch.get(id)
                .always(function() {
                    if (!M.d[id]) {
                        id = M.RootID;
                    }
                    _openFolderCompletion.call(M, id, newHashLocation, firstopen, promise);
                });
        }
        else if (fetchshares || id === 'shares') {
            dbfetch.geta(Object.keys(M.c.shares || {}))
                .always(function() {
                    _openFolderCompletion.call(M, id, newHashLocation, firstopen, promise);
                });
        }
        else {
            _openFolderCompletion.call(this, id, newHashLocation, firstopen, promise);
        }

        return promise;
    };
})(this);
