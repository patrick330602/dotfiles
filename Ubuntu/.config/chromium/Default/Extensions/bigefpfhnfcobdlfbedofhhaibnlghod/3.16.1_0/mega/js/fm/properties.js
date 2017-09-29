(function _properties(global) {
    'use strict';

    /**
     * Handles node properties/info dialog contact list content
     * @param {Object} $dialog The properties dialog
     * @param {Array} users The list of users to whom we're sharing the selected nodes
     * @private
     */
    function fillPropertiesContactList($dialog, users) {

        var MAX_CONTACTS = 5;
        var shareUsersHtml = '';
        var $shareUsers = $dialog.find('.properties-body .properties-context-menu')
            .empty()
            .append('<div class="properties-context-arrow"></div>');

        for (var i = users.length; i--;) {
            var user = users[i];
            var userHandle = user.u || user.p;
            var hidden = i >= MAX_CONTACTS ? 'hidden' : '';
            var status = megaChatIsReady && megaChat.getPresenceAsCssClass(user.u);

            shareUsersHtml += '<div class="properties-context-item ustatus ' + escapeHTML(userHandle)
                + ' ' + (status ? status : '') + ' ' + hidden + '">'
                + '<div class="properties-contact-status"></div>'
                + '<span>' + escapeHTML(M.getNameByHandle(userHandle)) + '</span>'
                + '</div>';
        }

        if (users.length > MAX_CONTACTS) {
            shareUsersHtml += '<div class="properties-context-item show-more">'
                + '<span>...' + escapeHTML(l[10663]).replace('[X]', users.length - MAX_CONTACTS) + '</span>'
                + '</div>';
        }

        if (shareUsersHtml !== '') {
            $shareUsers.append(shareUsersHtml);
        }
    }

    function _propertiesDialog(close) {

        var $dialog = $('.fm-dialog.properties-dialog');

        $(document).unbind('MegaNodeRename.Properties');
        $(document).unbind('MegaCloseDialog.Properties');

        if (close) {
            delete $.propertiesDialog;
            if (close !== 2) {
                closeDialog();
            }
            else {
                fm_hideoverlay();
            }
            $('.contact-list-icon').removeClass('active');
            $('.properties-context-menu').fadeOut(200);
            $.hideContextMenu();

            // Revert $.selected to an array of handles
            $.selected = $.selected.map(function(n) {
                return n.h || n;
            });

            return true;
        }

        $dialog.removeClass('multiple folders-only two-elements shared shared-with-me');
        $dialog.removeClass('read-only read-and-write full-access taken-down undecryptable');
        $('.properties-elements-counter span').text('');

        var users = null;
        var filecnt = 0;
        var foldercnt = 0;
        var size = 0;
        var sfilecnt = 0;
        var sfoldercnt = 0;
        var vsize = 0;
        var svfilecnt = 0;
        var n;
        var versioningFlag = false;

        for (var i = $.selected.length; i--;) {
            n = $.selected[i];
            if (n.tvf) {
                $dialog.addClass('versioning');
                versioningFlag = true;
            }

            if (!n) {
                console.error('propertiesDialog: invalid node', $.selected[i]);
            }
            else if (n.t) {
                size += n.tb;
                sfilecnt += n.tf;
                sfoldercnt += n.td;
                foldercnt++;
                vsize += n.tvb;
                svfilecnt += n.tvf;
            }
            else {
                filecnt++;
                size += n.s;
                vsize += (n.tvb) ? n.tvb : 0;
                svfilecnt += (n.tvf) ? n.tvf : 0;
            }
        }
        if (!n) {
            // $.selected had no valid nodes!
            return propertiesDialog(1);
        }

        M.safeShowDialog('properties', function() {
            $.propertiesDialog = 'properties';
            return $dialog;
        });

        var exportLink = new mega.Share.ExportLink({});
        var isTakenDown = exportLink.isTakenDown($.selected);
        var isUndecrypted = missingkeys[$.selected[0].h];
        var notificationText = '';

        if (isTakenDown || isUndecrypted) {
            if (isTakenDown) {
                $dialog.addClass('taken-down');
                notificationText = l[7703] + '\n';
            }
            if (isUndecrypted) {
                $dialog.addClass('undecryptable');

                if ($.selected[0].t) {// folder
                    notificationText += l[8595];
                }
                else {// file
                    notificationText += l[8602];
                }
            }
            showToast('clipboard', notificationText);
        }

        var star = '';
        if (n.fav) {
            star = ' star';
        }
        $dialog.find('.file-status-icon').attr('class', 'file-status-icon ' + star);

        if (fileIcon(n).indexOf('shared') > -1) {
            $dialog.addClass('shared');
        }

        if (typeof n.r === "number") {
            var zclass = "read-only";

            if (n.r === 1) {
                zclass = "read-and-write";
            }
            else if (n.r === 2) {
                zclass = "full-access";
            }
            $dialog.addClass('shared shared-with-me ' + zclass);
        }

        var p = {};
        var user = Object(M.d[n.su || n.p]);

        if (d) {
            console.log('propertiesDialog', n, user);
        }

        if (filecnt + foldercnt === 1) {
            p.t6 = '';
            p.t7 = '';

            if (filecnt) {
                p.t3 = l[87] + ':';
                p.t5 = ' second';

                if (n.mtime) {
                    p.t6 = l[94] + ':';
                    p.t7 = htmlentities(time2date(n.mtime));
                }
            }
            else {
                p.t3 = l[894] + ':';
                p.t5 = '';
            }
            p.t1 = l[86] + ':';
            if (n.name) {
                p.t2 = htmlentities(n.name);
            }
            else if (n.h === M.RootID) {
                p.t2 = htmlentities(l[164]);
            }
            else if (n.h === M.InboxID) {
                p.t2 = htmlentities(l[166]);
            }
            else if (n.h === M.RubbishID) {
                p.t2 = htmlentities(l[167]);
            }
            // 'Shared with me' tab, info dialog, undecrypted nodes
            else if (missingkeys[n.h]) {
                p.t2 = htmlentities(l[8649]);
            }

            p.t4 = versioningFlag ? bytesToSize(size + vsize) : bytesToSize(size);
            p.t9 = n.ts && htmlentities(time2date(n.ts)) || '';
            p.t8 = p.t9 ? (l[896] + ':') : '';
            p.t12 = ' second';
            p.t13 = l[17150] + ':';
            p.t14 = (svfilecnt === 1) ? l[17152] : l[17151].replace("[X]", svfilecnt);
            p.t15 = l[17149] + ':';
            p.t16 = bytesToSize(size);
            p.t17 = ' second';
            p.t18 = l[16474] + ':';
            p.t19 = bytesToSize(vsize);

            if (foldercnt) {
                p.t6 = l[897] + ':';
                p.t7 = fm_contains(sfilecnt, sfoldercnt);
                p.t15 = l[17148] + ':';
                if ($dialog.hasClass('shared')) {
                    users = M.getSharingUsers($.selected, true);

                    // In case that user doesn't share with other
                    // Do NOT show contact informations in property dialog
                    if (!users.length) {
                        p.hideContacts = true;
                    }
                    else {
                        p.t8 = l[1036] + ':';
                        p.t9 = users.length === 1 ? l[990] : l[989].replace("[X]", users.length);
                        p.t11 = n.ts ? htmlentities(time2date(n.ts)) : '';
                        p.t10 = p.t11 ? l[896] : '';
                        $('.properties-elements-counter span').text(typeof n.r === "number" ? '' : users.length);

                        fillPropertiesContactList($dialog, users);
                    }
                }
                if ($dialog.hasClass('shared-with-me')) {
                    p.t3 = l[64];
                    var rights = l[55];
                    if (n.r === 1) {
                        rights = l[56];
                    }
                    else if (n.r === 2) {
                        rights = l[57];
                    }
                    p.t4 = rights;
                    p.t6 = l[5905];
                    p.t7 = htmlentities(M.getNameByHandle(user.h));
                    p.t8 = l[894] + ':';
                    p.t9 = bytesToSize(size);
                    p.t10 = l[897] + ':';
                    p.t11 = fm_contains(sfilecnt, sfoldercnt);
                }
            }
            if (filecnt && versioningFlag) {
                p.t14 = '<a href ="#" id = "previousversions" class="red" >'  + p.t14 + '</a>';
            }
        }
        else {
            $dialog.addClass('multiple folders-only');
            p.t1 = '';
            p.t2 = '<b>' + fm_contains(filecnt, foldercnt) + '</b>';
            p.t3 = l[894] + ':';
            p.t4 = versioningFlag ? bytesToSize(size + vsize) : bytesToSize(size);
            p.t5 = ' second';
            p.t8 = l[93] + ':';
            p.t9 = l[1025];
            p.t12 = '';
            p.t13 = l[17150] + ':';
            p.t14 = (svfilecnt === 1) ? l[17152] : l[17151].replace("[X]", svfilecnt);
            p.t15 = l[17148] + ':';
            p.t16 = bytesToSize(size);
            p.t17 = '';
            p.t18 = l[16474] + ':';
            p.t19 = bytesToSize(vsize);

            users = M.getSharingUsers($.selected, true);
            if (users.length) {
                fillPropertiesContactList($dialog, users);
            }
        }

        var vhtml = versioningFlag
            ?
            '<div class="properties-float-bl' + p.t12 + '"><span class="properties-small-gray">' + p.t13 + '</span>'
            + '<span class="propreties-dark-txt">' + p.t14 + '</span></div>'
            + '<div class="properties-float-bl"><span class="properties-small-gray">' + p.t15 + '</span>'
            + '<span class="propreties-dark-txt">' + p.t16 + '</span></div>'
            + '<div class="properties-float-bl' + p.t17 + '"><span class="properties-small-gray">' + p.t18 + '</span>'
            + '<span class="propreties-dark-txt">' + p.t19 + '</span></div>'
            : '';
        var singlenodeinfohtml  = (((filecnt + foldercnt) === 1) || (versioningFlag === false))
            ?
            '<div class="properties-float-bl' + p.t5 + '"><span class="properties-small-gray">' + p.t6 + '</span>'
            + '<span class="propreties-dark-txt">' + p.t7 + '</span></div>'
            : '';
        var shareinfohtml = (typeof p.t10 === 'undefined' && typeof p.t11 === 'undefined')
            ? ''
            : '<div class="properties-float-bl"><div class="properties-small-gray t10">' + p.t10 + '</div>'
            + '<div class="propreties-dark-txt t11">' + p.t11 + '</div></div></div>';

        var html = '<div class="properties-small-gray">' + p.t1 + '</div>'
            + '<div class="properties-name-block"><div class="propreties-dark-txt">' + p.t2 + '</div>'
            + ' <span class="file-settings-icon"><span></span></span></div>'
            + '<div><div class="properties-float-bl"><span class="properties-small-gray">' + p.t3 + '</span>'
            + '<span class="propreties-dark-txt">' + p.t4 + '</span></div>'
            + vhtml
            + singlenodeinfohtml
            + '<div class="properties-float-bl">'
            + '<div class="properties-small-gray">' + p.t8
            + '</div><div class="propreties-dark-txt contact-list">' + p.t9
            + '<div class="contact-list-icon"></div></div></div>'
            + shareinfohtml;

        $('.properties-txt-pad').html(html);

        $('.properties-body', $dialog).rebind('click', function() {

            // Clicking anywhere in the dialog will close the context-menu, if open
            var $fsi = $('.file-settings-icon', $dialog);
            if ($fsi.hasClass('active')) {
                $fsi.click();
            }
        });

        if ((filecnt === 1) && (foldercnt === 0)) {
            $('#previousversions').rebind('click', function(ev) {
                fileversioning.fileVersioningDialog(n.h);
            });
        }

        $('.fm-dialog-close', $dialog).rebind('click', _propertiesDialog);

        var __fsi_close = function() {
            $dialog.find('.file-settings-icon').removeClass('active');
            $('.dropdown.body').removeClass('arrange-to-front');
            $('.properties-dialog').removeClass('arrange-to-back');
            $('.fm-dialog').removeClass('arrange-to-front');
            $.hideContextMenu();
        };

        $dialog.find('.file-settings-icon').rebind('click context', function(e) {
            if (!$(this).hasClass('active')) {
                e.preventDefault();
                e.stopPropagation();
                $(this).addClass('active');
                // $('.fm-dialog').addClass('arrange-to-front');
                // $('.properties-dialog').addClass('arrange-to-back');
                $('.dropdown.body').addClass('arrange-to-front');
                e.currentTarget = $('#' + n.h);
                if (!e.currentTarget.length) {
                    e.currentTarget = $('#treea_' + n.h);
                }
                e.calculatePosition = true;
                $.selected = [n.h];
                M.contextMenuUI(e, n.h.length === 11 ? 5 : 1);
            }
            else {
                __fsi_close();
            }

            return false;
        });

        $(document).bind('MegaCloseDialog.Properties', __fsi_close);
        $(document).bind('MegaNodeRename.Properties', function(e, h, name) {
            if (n.h === h) {
                $dialog.find('.properties-name-block .propreties-dark-txt').text(name);
            }
        });

        if (p.hideContacts) {
            $('.properties-txt-pad .contact-list-icon').hide();
        }

        if ($dialog.hasClass('shared')) {
            $('.contact-list-icon').rebind('click', function() {
                if (!$(this).hasClass('active')) {
                    $(this).addClass('active');
                    var $pcm = $('.properties-context-menu');
                    $pcm.css({
                        'left': $(this).position().left + 8 + 'px',
                        'top': $(this).position().top - $pcm.outerHeight() - 8 + 'px',
                        'margin-left': '-' + $pcm.width() / 2 + 'px'
                    });
                    $pcm.fadeIn(200);
                }
                else {
                    $(this).removeClass('active');
                    $('.properties-context-menu').fadeOut(200);
                }

                return false;
            });

            $('.properties-dialog').rebind('click', function() {
                var $list = $('.contact-list-icon');
                if ($list.attr('class').indexOf('active') !== -1) {
                    $list.removeClass('active');
                    $('.properties-context-menu').fadeOut(200);
                }
            });

            $('.properties-context-item').rebind('click', function() {
                $('.contact-list-icon').removeClass('active');
                $('.properties-context-menu').fadeOut(200);
                loadSubPage('fm/' + $(this).data('handle'));
                return false;
            });

            // Expands properties-context-menu so rest of contacts can be shown
            // By default only 5 contacts is shown
            $('.properties-context-item.show-more').rebind('click', function() {

                // $('.properties-context-menu').fadeOut(200);
                $('.properties-dialog .properties-context-item')
                    .remove('.show-more')
                    .removeClass('hidden');// un-hide rest of contacts

                var $cli = $('.contact-list-icon');
                $('.properties-context-menu').css({
                    'left': $cli.position().left + 8 + 'px',
                    'top': $cli.position().top - $('.properties-context-menu').outerHeight() - 8 + 'px',
                    'margin-left': '-' + $('.properties-context-menu').width() / 2 + 'px'
                });
                // $('.properties-context-menu').fadeIn(200);

                return false;// Prevent bubbling
            });
        }

        if (filecnt + foldercnt === 1) {
            $('.properties-file-icon').html('<div class="' + fileIcon(n) + '"></div>');
        }
        else {
            if (filecnt + foldercnt === 2) {
                $dialog.addClass('two-elements');
            }
            $('.properties-elements-counter span').text(filecnt + foldercnt);
            $('.properties-file-icon').html('');

            for (var j = 0, a = 0; j < $.selected.length; ++j) {
                var ico = fileIcon($.selected[j]);

                if (a <= 3) {
                    if (ico.indexOf('folder') === -1) {
                        $dialog.removeClass('folders-only');
                    }
                    $('.properties-file-icon').prepend('<div class="' + escapeHTML(ico) + '"></div>');
                    a++;
                }
            }
        }
    }

    /**
     * Open properties dialog for the selected node(s)
     * @param {Number|Boolean} [close] Whether it should be rather closed.
     * @returns {*|MegaPromise}
     */
    global.propertiesDialog = function propertiesDialog(close) {

        if (close) {
            _propertiesDialog(close);
        }
        else {
            var shares = [];
            var nodes = ($.selected || [])
                .filter(function(h) {
                    if (String(h).length === 11 && M.c[h]) {
                        shares = shares.concat(Object.keys(M.c[h]));
                    }
                    else {
                        return true;
                    }
                });
            var promise = dbfetch.node(nodes.concat(shares));

            promise.always(function(r) {
                $.selected = r;
                _propertiesDialog();
            });

            return promise;
        }
    };

})(self);
