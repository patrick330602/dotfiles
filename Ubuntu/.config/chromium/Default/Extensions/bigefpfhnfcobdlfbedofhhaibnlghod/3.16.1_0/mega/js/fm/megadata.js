/**
 * @typedef {Object} MEGA_USER_STRUCT
 *      Access using namespace mega.u
 *      Access using global variable M.u
 *      An object holding informations about specific contacts/user identified
 *      by "handle" as base64 URL encoded 88-bit value.
 *      Caches informations for current/past full contacts.
 *      Pending contacts informations are not stored here.
 * @property {String} u
 *     Mega user handle as base64 URL encoded 88-bit value.
 * @property {Number} c
 *     Contact access right/status: 2: owner, 1: active contact, 0: otherwise.
 * @property {String} m
 *     Email address of the contact.
 * @property {Array} m2
 *     Array of all emails/phone numbers of a user.
 * @property {String} name
 *     Combines users First and Last name defined in user profile.
 *     If First and Last name in user profile are undefined holds users email.
 *     It's used at least like index field for search contacts in share dialog.
 *     It combines `firstname` and `lastname` of user attributes.
 * @property {String} h
 *     Holds user handle, value equal to 'u' param. Used only when synching with
 *     M.d, deeply rooted in code. should not be removed.
 *     Reason behind it should be searched in file/folders caching structure,
 *     'h' represents file/folder "handle" as base64 URL encoded 64-bit value.
 * @property {Number} t
 *     For active contacts but not for the owner 't' is set to 1. For non active
 *     contacts and owner it's 'undefined'. Used when synching with M.d, deeply
 *     rooted in code. should not be removed.
 *     Reason behind it should be searched in file/folders caching structure,
 *     't' represents type of item: 2: Cloud Drive root, 1: folder, 0: file
 * @property {String} p
 *     Logic inherited from file manager where parent directory 'p' is
 *     represented by base64 URL encoded 64-bit value.
 *     Root directory for Cloud Drive is cached in M.RootID.
 *     This parameter represents top level/root/parent for 'Contacts' tab.
 *     All contacts are bind to account owner but instead of owners "handle"
 *     as base64 URL encoded 88-bit value we are using 'contacts'.
 * @property {Number} ts
 *     UNIX epoch time stamp as an integer in seconds to record last change of
 *     parameters values.
 * @property {Number} lastChatActivity
 *     UNIX epoch time stamp as an integer in seconds for the last chat
 *     activity.
 */

Object.defineProperty(this, 'MEGA_USER_STRUCT', {
    value: Object.freeze({
        "u": undefined,
        "c": undefined,
        "m": undefined,
        "m2": undefined,
        "name": undefined,
        "h": undefined,
        "t": undefined,
        "p": undefined,
        "presence": undefined,
        "presenceMtime": undefined,
        "displayColor": NaN,
        "shortName": "",
        "firstName": "",
        "lastName": "",
        "ts": undefined,
        "avatar": undefined
    })
});


function MegaData() {
    "use strict";

    this.reset();

    this.csortd = -1;
    this.csort = 'name';
    this.tfsdomqueue = Object.create(null);
    this.scAckQueue = Object.create(null);
    this.lastColumn = null;
    this.account = false;

    Object.defineProperty(this, 'fsViewSel', {
        value: '.files-grid-view.fm .grid-scrolling-table, .fm-blocks-view.fm .file-block-scrolling',
        configurable: false
    });

    (function(self) {
        var maf = false;
        var saved = 0;

        Object.defineProperty(self, 'maf', {
            get: function() {
                if (Object(self.account).maf && saved !== self.account.maf) {
                    saved = self.account.maf;
                    maf = mega.achievem.prettify(self.account.maf);
                }
                return maf;
            }
        })
    })(this);

    this.sortRules = {
        'name': this.sortByName.bind(this),
        'size': this.sortBySize.bind(this),
        'type': this.sortByType.bind(this),
        'date': this.sortByDateTime.bind(this),
        'ts': this.sortByDateTime.bind(this),
        'owner': this.sortByOwner.bind(this),
        'modified': this.sortByModTime.bind(this),
        'mtime': this.sortByModTime.bind(this),
        'interaction': this.sortByInteraction.bind(this),
        'access': this.sortByAccess.bind(this),
        'status': this.sortByStatus.bind(this),
        'fav': this.sortByFav.bind(this),
        'email': this.sortByEmail.bind(this)
    };

    /** EventListener interface. */
    this.handleEvent = function(ev) {
        if (d > 1) {
            console.debug(ev.type, ev);
        }

        var ttl;
        if (ev.type === 'ps-y-reach-end') {
            ttl = M.getTransferTableLengths();
            if (ttl.left > -100) {
                this.doFlushTransfersDynList(ttl.size);
            }
        }
        else if (ev.type === 'tfs-dynlist-flush') {
            ttl = M.getTransferTableLengths();
            if (ttl.left > -10) {
                this.doFlushTransfersDynList(ttl.size);
            }
        }
    };

    if (is_mobile) {
        var dummy = function() {
            return MegaPromise.resolve();
        };
        this['check' + 'StorageQuota'] = dummy;
        this['show' + 'OverStorageQuota'] = dummy;
        this['init' + 'UIKeyEvents'] = dummy;
        this['abort' + 'Transfers'] = dummy;
        this['search' + 'Path'] = dummy;

        this['render' + 'Main'] = function(aUpdate) {
            if (aUpdate) {
                mobile.cloud.renderUpdate();
            }
            else {
                mobile.cloud.renderLayout();
            }
            return true;
        };

        var tf = [
            "renderTree", "buildtree", "initTreePanelSorting", "treeSearchUI", "treePanelType", "addTreeUI",
            "addTreeUIDelayed", "onTreeUIExpand", "onTreeUIOpen"
        ];

        for (var i = tf.length; i--;) {
            this[tf[i]] = dummy;
        }
    }

    /** @name M.IS_TREE */
    /** @name M.IS_FAV */
    /** @name M.IS_LINKED */
    /** @name M.IS_SHARED */
    /** @name M.IS_TAKENDOWN */
    makeEnum(['TREE', 'FAV', 'LINKED', 'SHARED', 'TAKENDOWN'], 'IS_', this);
}

MegaData.prototype = new MegaUtils();
MegaData.prototype.constructor = MegaData;
