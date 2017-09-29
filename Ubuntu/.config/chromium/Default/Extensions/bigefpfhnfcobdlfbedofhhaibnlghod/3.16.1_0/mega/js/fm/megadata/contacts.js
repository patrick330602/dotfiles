MegaData.prototype.contactstatus = function(h, wantTimeStamp) {
    var folders = 0;
    var files = 0;
    var ts = 0;
    if (this.d[h]) {
        if (!wantTimeStamp || !this.d[h].ts) {
            // FIXME: include root?
            var a = this.getNodesSync(h);

            for (var i = a.length; i--;) {
                var n = this.d[a[i]];
                if (n) {
                    if (ts < n.ts) {
                        ts = n.ts;
                    }
                    if (n.t) {
                        folders++;
                    }
                    else if (!n.fv) {
                        files++;
                    }
                }
            }
            if (!this.d[h].ts) {
                this.d[h].ts = ts;
            }
        }
        else {
            ts = this.d[h].ts;
        }
    }

    return {files: files, folders: folders, ts: ts};
};

MegaData.prototype.onlineStatusClass = function(os) {
    if (os === 4 || os === 'dnd') {
        // UserPresence.PRESENCE.DND
        return [l[5925], 'busy'];
    }
    else if (os === 2 || os === 'away') {
        // UserPresence.PRESENCE.AWAY
        return [l[5924], 'away'];
    }
    else if (os === 3 || os === 'chat' || os === 'available') {
        // UserPresence.PRESENCE.ONLINE
        return [l[5923], 'online'];
    }
    else {
        return [l[5926], 'offline'];
    }
};

MegaData.prototype.onlineStatusEvent = function(u, status) {
    if (u && megaChatIsReady) {
        var e = $('.ustatus.' + u.u);
        if (e.length > 0) {
            $(e).removeClass('offline online busy away');
            $(e).addClass(this.onlineStatusClass(status)[1]);
        }
        e = $('#contact_' + u.u);
        if (e.length > 0) {
            $(e).removeClass('offline online busy away');
            $(e).addClass(this.onlineStatusClass(status)[1]);
        }

        e = $('.fm-chat-user-status.' + u.u);
        if (e.length > 0) {
            $(e).safeHTML(this.onlineStatusClass(status)[0]);
        }
    }
};


/**
 *
 * @param {array.<JSON_objects>} ipc - received requests
 * @param {bool} clearGrid
 *
 */
MegaData.prototype.drawReceivedContactRequests = function(ipc, clearGrid) {
    if (d) console.debug('Draw received contacts grid.');
    var html, email, ps, trClass, id,
        type = '',
        drawn = false,
        t = '.grid-table.contact-requests';
    var contactName = '';

    if (this.currentdirid === 'ipc') {

        if (clearGrid) {
            $(t + ' tr').remove();
        }

        for (var i in ipc) {
            id = ipc[i].p;
            // Make sure that denied and ignored requests are shown properly
            // don't be fooled, we need M.ipc here and not ipc
            if (this.ipc[id]) {
                if (this.ipc[id].dts || (this.ipc[id].s && (this.ipc[id].s === 3))) {
                    type = 'deleted';
                }
                else if (this.ipc[id].s && this.ipc[id].s === 1) {
                    type = 'ignored';
                }
                trClass = (type !== '') ? ' class="' + type + '"' : '';
                email = ipc[i].m;
                contactName = this.getNameByHandle(ipc[i].p);

                if (ipc[i].ps && ipc[i].ps !== 0) {
                    ps = '<span class="contact-request-content">' + ipc[i].ps + ' ' + l[105] + ' ' + l[813] + '</span>';
                }
                else {
                    ps = '<span class="contact-request-content">' + l[5851] + '</span>';
                }
                html = '<tr id="ipc_' + id + '"' + trClass + '>' +
                    '<td>' +
                    useravatar.contact(email, 'nw-contact-avatar') +
                    '<div class="fm-chat-user-info">' +
                    '<div class="fm-chat-user">' + htmlentities(contactName) + '</div>' +
                    '<div class="contact-email">' + htmlentities(email) + '</div>' +
                    '</div>' +
                    '</td>' +
                    '<td>' + ps + '</td>' +
                    '<td>' +
                    '<div class="contact-request-button default-white-button grey-txt small right delete"><span>' + l[5858] + '</span></div>' +
                    '<div class="contact-request-button default-white-button grey-txt small right accept"><span>' + l[5856] + '</span></div>' +
                    '<div class="contact-request-button default-white-button grey-txt small right ignore"><span>' + l[5860] + '</span></div>' +
                    '<div class="contact-request-ignored"><span>' + l[5864] + '</span></div>' +
                    '<div class="clear"></div>' +
                    '</td>' +
                    '</tr>';

                $(t).append(html);

                drawn = true;
            }
        }

        // If at least one new item is added then ajust grid
        if (drawn) {
            $('.fm-empty-contacts').addClass('hidden');

            // hide/show sent/received grid
            $('.sent-requests-grid').addClass('hidden');
            $('.contact-requests-grid').removeClass('hidden');

            initIpcGridScrolling();

            /**
             * Bind actions to Received Pending Conctact Request buttons
             */
            $('.contact-requests-grid .contact-request-button').rebind('click', function() {

                var $self = $(this);
                var $reqRow = $self.closest('tr');
                var ipcId = $reqRow.attr('id').replace('ipc_', '');

                if ($self.is('.accept')) {
                    if (M.acceptPendingContactRequest(ipcId) === 0) {
                        $reqRow.remove();
                    }
                }
                else if ($self.is('.delete')) {
                    if (M.denyPendingContactRequest(ipcId) === 0) {
                        $reqRow.remove();
                    }
                }
                else if ($self.is('.ignore')) {
                    if (M.ignorePendingContactRequest(ipcId) === 0) {
                        $reqRow.remove();
                    }
                }
            });
        }
    }
};

MegaData.prototype.handleEmptyContactGrid = function() {

    var haveActiveContact = false;

    // If focus is on contacts tab
    if (this.currentdirid === 'contacts') {
        this.u.forEach(function(v, k) {
            if (v.c === 1) {
                haveActiveContact = true;
                return false; // break
            }
        });

        // We do NOT have active contacts, set empty contacts grid
        if (!haveActiveContact) {
            $('.files-grid-view.contacts-view').addClass('hidden');
            $('.fm-empty-contacts .fm-empty-cloud-txt').text(l[784]);
            $('.fm-empty-contacts').removeClass('hidden');
        }
    }

    return haveActiveContact;
};

/**
 *
 * @param {array.<JSON_objects>} opc - sent requests
 * @param {bool} clearGrid
 *
 */
MegaData.prototype.drawSentContactRequests = function(opc, clearGrid) {

    if (d) console.debug('Draw sent invites.');

    var html, hideCancel, hideReinvite, hideOPC,
        drawn = false,
        TIME_FRAME = 60 * 60 * 24 * 14,// 14 days in seconds
        utcDateNow = Math.floor(Date.now() / 1000),
        t = '.grid-table.sent-requests';

    if (this.currentdirid === 'opc') {

        if (clearGrid) {
            $(t + ' tr').remove();
        }

        for (var i in opc) {
            if (opc.hasOwnProperty(i)) {
                hideCancel = '';
                hideReinvite = '';
                hideOPC = '';
                if (opc[i].dts) {
                    hideOPC = 'deleted';
                    hideReinvite = 'hidden';
                    hideCancel = 'hidden';
                }
                else {
                    if (utcDateNow < (opc[i].rts + TIME_FRAME)) {
                        hideReinvite = 'hidden';
                    }
                }

                hideOPC = (hideOPC !== '') ? ' class="' + hideOPC + '"' : '';
                html = '<tr id="opc_' + htmlentities(opc[i].p) + '"' + hideOPC + '>' +
                    '<td>' +
                    '<div class="left email">' +
                    '<div class="nw-contact-avatar"></div>' +
                    '<div class="fm-chat-user-info">' +
                    '<div class="contact-email">' + htmlentities(opc[i].m) + '</div>' +
                    '</div>' +
                    '</div>' +
                    '</td>' +
                    '<td>' +
                    '<div class="default-white-button grey-txt small ' +
                    'contact-request-button right cancel ' + hideCancel + '">' +
                    '<span>' + escapeHTML(l[5930]) + '</span>' +
                    '</div>' +
                    '<div class="default-white-button grey-txt small ' +
                    'contact-request-button right reinvite ' + hideReinvite + '">' +
                    '<span>' + escapeHTML(l[5861]) + '</span>' +
                    '</div>' +
                    '</td></tr>';

                $(t).append(html);

                drawn = true;
            }
        }

        if (drawn) {
            $('.fm-empty-contacts').addClass('hidden');

            // hide/show received/sent grids
            $('.contact-requests-grid').addClass('hidden');
            $('.sent-requests-grid').removeClass('hidden');

            initOpcGridScrolling();

            /**
             * Bind actions to Received pending contacts requests buttons
             */

            $('.sent-requests-grid .contact-request-button').rebind('click', function() {
                var $self = $(this);
                var $reqRow = $self.closest('tr');
                var opcId = $reqRow.attr('id').replace('opc_', '');

                if ($self.is('.reinvite')) {
                    M.reinvitePendingContactRequest(M.opc[opcId].m);
                    $reqRow.children().children('.contact-request-button.reinvite').addClass('hidden');
                }
                else if ($self.is('.cancel')) {

                    // If successfully deleted, grey column and hide buttons
                    if (M.cancelPendingContactRequest(M.opc[opcId].m) === 0) {
                        $(this).addClass('hidden');
                        $reqRow.children().children('.contact-request-button.cancel').addClass('hidden');
                        $reqRow.children().children('.contact-request-button.reinvite').addClass('hidden');
                        $reqRow.addClass('deleted');
                    }
                }
            });
        }
    }
};


/**
 * getContactsEMails
 *
 * Loop through all available contacts, full and pending ones (outgoing and incomming)
 * and creates a list of contacts email addresses.
 * @returns {Array} contacts, array of contacts email.
 */
MegaData.prototype.getContactsEMails = function() {
    var contact;
    var contacts = [];
    var contactName;

    // Loop through full contacts
    M.u.forEach(function(contact) {
        // Active contacts with email set
        if (contact.c === 1 && contact.m) {
            contacts.push({ id: contact.m, name: M.getNameByHandle(contact.u) });
        }
    });

    // Loop through outgoing pending contacts
    for (var k in M.opc) {
        contact = M.opc[k];
        contactName = M.getNameByHandle(M.opc[k].p);

        // Is contact deleted
        if (!contact.dts) {
            contacts.push({ id: contact.m, name: contactName });
        }
    }

    // Loop through incomming pending contacts
    for (var m in M.ipc) {
        contact = M.ipc[m];
        contactName = M.getNameByHandle(M.ipc[m].p);

        // Is there a email available
        if (contact.m) {
            contacts.push({ id: contact.m, name: contactName });
        }
    }

    return contacts;
}

MegaData.prototype.getActiveContacts = function() {
    var res = [];

    if (typeof this.c.contacts === 'object') {
        Object.keys(this.c.contacts)
            .forEach(function(userHandle) {
                if (Object(M.u[userHandle]).c === 1) {
                    res.push(userHandle);
                }
            });
    }

    return res;
};

// Contacts left panel handling
MegaData.prototype.contacts = function() {

    // Contacts rendering not used on mobile
    if (is_mobile) {
        return true;
    }

    var i;
    var activeContacts = this.getActiveContacts()
        .map(function(handle) {
            return M.d[handle];
        });

    var sortBy = $.sortTreePanel['contacts'].by;
    var sortFn;

    if (sortBy === 'last-interaction') {
        sortFn = this.getSortByInteractionFn();
    }
    else if (sortBy === 'name') {
        sortFn = this.getSortByNameFn();
    }
    else if (sortBy === 'status') {
        sortFn = this.getSortByStatusFn();
    }
    else if (sortBy === 'created') {
        sortFn = this.getSortByDateTimeFn();
    }
    else if (sortBy === 'fav') {
        sortFn = this.getSortByFavFn();
    }

    var sortDirection = $.sortTreePanel['contacts'].dir;
    activeContacts.sort(
        function(a, b) {
            return sortFn(a, b, sortDirection);
        }
    );

    var html = '';
    var onlinestatus;

    // status can be: "online"/"away"/"busy"/"offline"
    for (i in activeContacts) {
        if (activeContacts.hasOwnProperty(i)) {
            if (megaChatIsReady && activeContacts[i].u) {
                onlinestatus = this.onlineStatusClass(
                    activeContacts[i].presence ? activeContacts[i].presence : 'unavailable'
                );
            }
            else {
                onlinestatus = [l[5926], 'offline'];
            }

            var name = this.getNameByHandle(activeContacts[i].u);

            if (!treesearch || name.toLowerCase().indexOf(treesearch.toLowerCase()) > -1) {

                html += '<div class="nw-contact-item ui-droppable '
                    + onlinestatus[1] + '" id="contact_' + htmlentities(activeContacts[i].u)
                    + '"><div class="nw-contact-status"></div><div class="nw-contact-name">'
                    + htmlentities(name)
                    + ' <a class="button start-chat-button"><span></span></a></div></div>';
            }
            $('.fm-start-chat-dropdown').addClass('hidden');
        }
    }

    $('.content-panel.contacts').html(html);

    if (megaChatIsReady) {
        $('.fm-tree-panel').undelegate('.start-chat-button', 'click.megaChat');
        $('.fm-tree-panel').delegate('.start-chat-button', 'click.megaChat', function() {
            var m = $('.fm-start-chat-dropdown'),
                scrollPos = 0;

            var $this = $(this);
            var $userDiv = $this.parent().parent();

            $.hideContextMenu();

            if (!$this.is(".active")) {
                $('.start-chat-button').removeClass('active');

                $('.dropdown-item', m).removeClass("disabled");

                $this.addClass('active');
                var y = $this.offset().top + 21;
                m
                    .css('top', y)
                    .removeClass('hidden')
                    .addClass('active')
                    .data("triggeredBy", $this);
            }
            else {
                $this.removeClass('active');
                m
                    .removeClass('active')
                    .addClass('hidden')
                    .removeData("triggeredBy");
            }

            $.selected = [$userDiv.attr('id').replace('contact_', '')];

            return false; // stop propagation!
        });

        $('.fm-start-chat-dropdown .dropdown-item.startchat-item').rebind('click.treePanel', function() {
            var $this = $(this);

            if (!$this.is(".disabled")) {
                var user_handle = $.selected && $.selected[0];
                loadSubPage("fm/chat/" + user_handle);
            }
        });

        $('.fm-start-chat-dropdown .dropdown-item.startaudio-item').rebind('click.treePanel', function() {
            var $this = $(this);
            var $triggeredBy = $this.parent().data("triggeredBy");
            var $userDiv = $triggeredBy.parent().parent();

            if (!$this.is(".disabled")) {
                var user_handle = $userDiv.attr('id').replace("contact_", "");

                loadSubPage("fm/chat/" + user_handle);
                var room = megaChat.createAndShowPrivateRoomFor(user_handle);
                if (room) {
                    room.startAudioCall();
                }
            }
        });

        $('.fm-start-chat-dropdown .dropdown-item.startvideo-item').rebind('click.treePanel', function() {
            var $this = $(this);
            var $triggeredBy = $this.parent().data("triggeredBy");
            var $userDiv = $triggeredBy.parent().parent();

            if (!$this.is(".disabled")) {
                var user_handle = $userDiv.attr('id').replace("contact_", "");

                loadSubPage("fm/chat/" + user_handle);
                var room = megaChat.createAndShowPrivateRoomFor(user_handle);
                if (room) {
                    room.startVideoCall();
                }
            }
        });
    }

    $('.fm-tree-panel').undelegate('.nw-contact-item', 'click');
    $('.fm-tree-panel').delegate('.nw-contact-item', 'click', function() {
        var id = $(this).attr('id');
        if (id) {
            id = id.replace('contact_', '');
        }
        M.openFolder(id);

        return false; // stop propagation!
    });

    // On the Contacts screen, initiate a call by double clicking a contact name in the left panel
    $('.fm-tree-panel').delegate('.nw-contact-item.online', 'dblclick', function() {

        // Get the element ID
        var $this = $(this);
        var id = $this.attr('id');

        // Get the user handle and change to conversations screen
        var user_handle = id.replace('contact_', '');
        loadSubPage('fm/chat/' + user_handle);
    });
};

MegaData.prototype.getContacts = function(n) {
    var folders = [];
    for (var i in this.c[n.h])
        if (this.d[i].t == 1 && this.d[i].name) {
            folders.push(this.d[i]);
        }

    return folders;
};

MegaData.prototype.syncUsersFullname = function(userId) {
    var self = this;

    if (this.u[userId].firstName || this.u[userId].lastName) {
        // already loaded.
        return;
    }

    var lastName = {name: 'lastname', value: null};
    var firstName = {name: 'firstname', value: null};

    MegaPromise.allDone([
        mega.attr.get(userId, 'firstname', -1)
            .done(function(r) {
                firstName.value = r;
            }),
        mega.attr.get(userId, 'lastname', -1)
            .done(function(r) {
                lastName.value = r;
            })
    ]).done(function(results) {
        if (!self.u[userId]) {
            return;
        }

        [firstName, lastName].forEach(function(obj) {
            // -1, -9, -2, etc...
            if (typeof obj.value === 'string') {
                try {
                    obj.value = from8(base64urldecode(obj.value));
                }
                catch (ex) {
                    obj.value = ex;
                }
            }

            if (typeof obj.value !== 'string' || !obj.value) {
                obj.value = '';
            }
        });

        lastName = lastName.value;
        firstName = firstName.value;

        self.u[userId].firstName = firstName;
        self.u[userId].lastName = lastName;

        if (
            (firstName && $.trim(firstName).length > 0) ||
            (lastName && $.trim(lastName).length > 0)
        ) {
            self.u[userId].name = "";

            if (firstName && $.trim(firstName).length > 0) {
                self.u[userId].name = firstName;
            }
            if (lastName && $.trim(lastName).length > 0) {
                self.u[userId].name += (self.u[userId].name.length > 0 ? " " : "") + lastName;
            }
        }
        else {
            self.u[userId].name = "";
        }

        if (self.u[userId].avatar && self.u[userId].avatar.type != "image") {
            self.u[userId].avatar = false;
            useravatar.loaded(userId); // FIXME: why is this needed here?
        }

        if (userId === u_handle) {
            u_attr.firstname = firstName;
            u_attr.lastname = lastName;
            u_attr.name = self.u[userId].name;

            $('.user-name').text(u_attr.name);

            $('.membership-big-txt.name:visible').text(
                u_attr.name
            );

            // XXX: why are we invalidating avatars on first/last-name change?
            /*if (fminitialized) {
             M.avatars(u_handle);
             }*/
        }
    });
};

(function(global) {
    /**
     * Callback, that would be called when a contact is changed.
     */
    var onContactChanged = function(contact) {
        if (fminitialized) {
            if (getSitePath() === "/fm/" + contact.u) {
                // re-render the contact view page if the presence had changed
                M.addContactUI();
            }
        }
    };

    /**
     * addUser, updates global .u variable with new user data
     * adds/updates user indexedDB with newest user data
     *
     * @param {object} u, user object data
     * @param {boolean} ignoreDB, don't write to indexedDB
     */
    MegaData.prototype.addUser = function(u, ignoreDB) {
        if (u && u.u) {
            var userId = u.u;

            if (this.u[userId]) {
                for (var key in u) {
                    if (MEGA_USER_STRUCT.hasOwnProperty(key) && key !== 'name') {
                        this.u[userId][key] = u[key];
                    }
                    else if (d) {
                        console.warn('addUser: property "%s" not updated.', key, u[key]);
                    }
                }

                u = this.u[userId];
            }
            else {
                this.u.set(userId, new MegaDataObject(MEGA_USER_STRUCT, true, u));
            }


            this.u[userId].addChangeListener(onContactChanged);

            if (fmdb && !ignoreDB && !pfkey) {
                // convert MegaDataObjects -> JS
                var cleanedUpUserData = clone(u.toJS ? u.toJS() : u);
                delete cleanedUpUserData.presence;
                delete cleanedUpUserData.presenceMtime;
                delete cleanedUpUserData.shortName;
                delete cleanedUpUserData.name;
                delete cleanedUpUserData.avatar;
                fmdb.add('u', {u: u.u, d: cleanedUpUserData});
            }

            this.syncUsersFullname(userId);
        }
    };
})(this);

// Update M.opc and related localStorage
MegaData.prototype.addOPC = function(u, ignoreDB) {
    this.opc[u.p] = u;
    if (fmdb && !ignoreDB && !pfkey) {
        fmdb.add('opc', {p: u.p, d: u});
    }
};

/**
 * Delete opc record from localStorage using id
 *
 * @param {string} id
 *
 */
MegaData.prototype.delOPC = function(id) {
    if (fmdb && !pfkey) {
        fmdb.del('opc', id);
    }
};

// Update M.ipc and related localStorage
MegaData.prototype.addIPC = function(u, ignoreDB) {
    this.ipc[u.p] = u;
    if (fmdb && !pfkey) {
        fmdb.add('ipc', {p: u.p, d: u});
    }
};

/**
 * Delete ipc record from indexedDb using id
 *
 * @param {string} id
 *
 */
MegaData.prototype.delIPC = function(id) {
    if (fmdb && !pfkey) {
        fmdb.del('ipc', id);
    }
};

/**
 * Update M.ps and indexedDb
 *
 * Structure of M.ps
 * <shared_item_id>:
 * [
 *  <pending_contact_request_id>:
 *  {h, p, r, ts},
 * ]
 * @param {JSON} ps, pending share
 * @param {boolean} ignoreDB
 *
 *
 */
MegaData.prototype.addPS = function(ps, ignoreDB) {
    if (!this.ps[ps.h]) {
        this.ps[ps.h] = Object.create(null);
    }
    this.ps[ps.h][ps.p] = ps;

    if (fmdb && !ignoreDB && !pfkey) {
        fmdb.add('ps', {h_p: ps.h + '*' + ps.p, d: ps});
    }

    // maintain special outgoing shares index by user:
    if (!this.su[ps.p]) {
        this.su[ps.p] = Object.create(null);
    }
    this.su[ps.p][ps.h] = 2;
};

/**
 * Maintain .ps and related indexedDb
 *
 * @param {string} pcrId, pending contact request id
 * @param {string} nodeId, shared item id
 *
 *
 */
MegaData.prototype.delPS = function(pcrId, nodeId) {

    // Delete the pending share
    if (this.ps[nodeId]) {
        if (this.ps[nodeId][pcrId]) {
            delete this.ps[nodeId][pcrId];
        }

        // If there's no pending shares for node left, clean M.ps
        if (Object.keys(this.ps[nodeId]).length === 0) {
            delete this.ps[nodeId];
        }
    }

    if (fmdb && !pfkey) {
        fmdb.del('ps', nodeId + '*' + pcrId);
    }
};


/**
 * Check existance of contact/pending contact
 *
 *
 * @param {email} email of invited contact
 *
 * @returns {number} error code, 0 proceed with request
 *
 * -12, Owner already invited user & expiration period didn't expired, fail.
 * -12 In case expiration period passed new upc is sent, but what to do with old request?
 * Delete it as soon as opc response is received for same email (idealy use user ID, if exist)
 * -10, User already invited Owner (ToDO. how to check diff emails for one account) (Check M.opc)
 * -2, User is already in contact list (check M.u)
 *
 */
MegaData.prototype.checkInviteContactPrerequisites = function(email) {
    "use strict";

    // Check pending invitations
    var opc = M.opc;
    for (var i in opc) {
        if (this.opc[i].m === email) {
            return 0;
        }
    }

    // Check active contacts
    var result = 0;
    M.u.forEach(function(v, k) {

        // Invite all except full contact users
        if (v.m === email && v.c === 1) {
            result = -2;
            return false; // break;
        }
    });

    return result;
};

/**
 * Invite contacts using email address, also known as ongoing pending contacts.
 * This uses API 2.0
 *
 * @param {String} owner, account owner email address.
 * @param {String} target, target email address.
 * @param {String} msg, optional custom text message.
 * @returns {Integer} proceed, API response code, if negative something is wrong
 * look at API response code table.
 */
MegaData.prototype.inviteContact = function(owner, target, msg) {
    if (d) console.debug('inviteContact');
    var proceed = this.checkInviteContactPrerequisites(target);

    if (proceed === 0) {
        api_req({'a': 'upc', 'e': owner, 'u': target, 'msg': msg, 'aa': 'a', i: requesti}, {
            callback: function(resp) {
                if (typeof resp === 'object') {
                    if (resp.p) {
                        proceed = resp.p;
                    }
                }
            }
        });
    }

    // In case of invite-dialog we will use notifications
    if ($.dialog !== 'invite-friend') {
        this.inviteContactMessageHandler(proceed);
    }

    return proceed;
};

/**
 * Handle all error codes for contact invitations and shows message
 *
 * @param {int} errorCode
 * @param {string} msg Can be undefined
 * @param {email} email  Can be undefined
 *
 */
MegaData.prototype.inviteContactMessageHandler = function(errorCode) {
    if (errorCode === -12) {

        // Invite already sent, and not expired
        msgDialog('info', '', 'Invite already sent, waiting for response');
    }
    else if (errorCode === -10) {

        // User already sent you an invitation
        msgDialog('info', '', 'User already sent you an invitation, check incoming contacts dialog');
    }
    else if (errorCode === -2) {

        // User already exist or owner
        msgDialog('info', '', l[1783]);
    }
};

MegaData.prototype.cancelPendingContactRequest = function(target) {
    if (d) console.debug('cancelPendingContactRequest');
    var proceed = this.checkCancelContactPrerequisites(target);

    if (proceed === 0) {
        api_req({'a': 'upc', 'u': target, 'aa': 'd', i: requesti}, {
            callback: function(resp) {
                proceed = resp;
            }
        });
    }

    this.cancelContactMessageHandler(proceed);

    return proceed;
};

MegaData.prototype.cancelContactMessageHandler = function(errorCode) {
    if (errorCode === -2) {
        msgDialog('info', '', 'This pending contact is already deleted.');
    }
};

MegaData.prototype.checkCancelContactPrerequisites = function(email) {

    // Check pending invitations
    var opc = M.opc;
    var foundEmail = false;
    for (var i in opc) {
        if (M.opc[i].m === email) {
            foundEmail = true;
            if (M.opc[i].dts) {
                return -2;// opc is already deleted
            }
        }
    }
    if (!foundEmail) {
        return -2;// opc doesn't exist for given email
    }

    return 0;
};

MegaData.prototype.reinvitePendingContactRequest = function(target) {

    if (d) console.debug('reinvitePendingContactRequest');
    api_req({'a': 'upc', 'u': target, 'aa': 'r', i: requesti});
};

// Answer on 'aa':'a', {"a":"upc","p":"0uUure4TCJw","s":2,"uts":1416434431,"ou":"fRSlXWOeSfo","i":"UAouV6Kori"}
// Answer on 'aa':'i', "{"a":"upc","p":"t17TPe65rMM","s":1,"uts":1416438884,"ou":"nKv9P8pn64U","i":"qHzMjvvqTY"}"
// ToDo, update M.ipc so we can have info about ipc status for view received requests
MegaData.prototype.ipcRequestHandler = function(id, action) {
    if (d) console.debug('ipcRequestHandler');
    var proceed = this.checkIpcRequestPrerequisites(id);

    if (proceed === 0) {
        api_req({'a': 'upca', 'p': id, 'aa': action, i: requesti}, {
            callback: function(resp) {
                proceed = resp;
            }
        });
    }

    this.ipcRequestMessageHandler(proceed);

    return proceed;
};

MegaData.prototype.ipcRequestMessageHandler = function(errorCode) {
    if (errorCode === -2) {
        msgDialog('info', 'Already processed', 'Already handled request, something went wrong.');
    }

    // Server busy, ask them to retry the request
    else if (errorCode === -3 || errorCode === -4) {
        msgDialog('warninga', 'Server busy', 'The server was busy, please try again later.');
    }

    // Repeated request
    else if (errorCode === -12) {
        msgDialog('info', 'Repeated request', 'The contact has already been accepted.');
    }
};

MegaData.prototype.checkIpcRequestPrerequisites = function(id) {
    var ipc = this.ipc;
    for (var i in ipc) {
        if (this.ipc[i].p === id) {
            return -0;
        }
    }

    return 0;
};

MegaData.prototype.acceptPendingContactRequest = function(id) {
    return this.ipcRequestHandler(id, 'a');
};

MegaData.prototype.denyPendingContactRequest = function(id) {
    return this.ipcRequestHandler(id, 'd');
};

MegaData.prototype.ignorePendingContactRequest = function(id) {
    return this.ipcRequestHandler(id, 'i');
};

// Searches M.opc for the pending contact
MegaData.prototype.findOutgoingPendingContactIdByEmail = function(email) {
    for (var index in this.opc) {
        var opc = this.opc[index];

        if (opc.m === email) {
            return opc.p;
        }
    }
};
