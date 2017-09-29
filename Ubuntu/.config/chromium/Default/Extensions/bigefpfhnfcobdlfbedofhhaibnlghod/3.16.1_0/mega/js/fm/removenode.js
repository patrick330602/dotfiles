function removeUInode(h, parent) {

    var n = M.d[h],
        i = 0;

    // check subfolders
    if (n && n.t) {
        var cns = M.c[n.p];
        if (cns) {
            for (var cn in cns) {
                if (M.d[cn] && M.d[cn].t && cn !== h) {
                    i++;
                    break;
                }
            }
        }
    }

    var hasItems = !!M.v.length;
    switch (M.currentdirid) {
        case "shares":
            $('#treeli_' + h).remove();// remove folder and subfolders
            if (!hasItems) {
                $('.files-grid-view .grid-table-header tr').remove();
                $('.fm-empty-cloud').removeClass('hidden');
            }
            break;
        case "contacts":

            //Clear left panel:
            $('#contact_' + h).fadeOut('slow', function() {
                $(this).remove();
            });

            //Clear right panel:
            $('.grid-table.contacts tr#' + h + ', .contacts-blocks-scrolling a#' + h)
                .fadeOut('slow', function() {
                    $(this).remove();
                });

            // clear the contacts grid:
            $('.contacts-grid-view #' + h).remove();
            if (!hasItems) {
                $('.contacts-grid-view .contacts-grid-header tr').remove();
                $('.fm-empty-contacts .fm-empty-cloud-txt').text(l[784]);
                $('.fm-empty-contacts').removeClass('hidden');
            }
            break;
        case "chat":
            if (!hasItems) {
                $('.contacts-grid-view .contacts-grid-header tr').remove();
                $('.fm-empty-chat').removeClass('hidden');
            }
            break;
        case M.RubbishID:
            if (i == 0 && n) {
                $('#treea_' + n.p).removeClass('contains-folders expanded');
            }

            // Remove item
            $('#' + h).remove();

            // Remove folder and subfolders
            $('#treeli_' + h).remove();
            if (!hasItems) {
                $('.contacts-grid-view .contacts-grid-header tr').remove();
                $('.fm-empty-trashbin').removeClass('hidden');
            }
            break;
        case M.RootID:
            if (i == 0 && n) {
                $('#treea_' + n.p).removeClass('contains-folders expanded');
            }

            // Remove item
            $('#' + h).remove();

            // Remove folder and subfolders
            $('#treeli_' + h).remove();
            if (!hasItems) {
                $('.files-grid-view').addClass('hidden');
                $('.grid-table.fm tr').remove();
                $('.fm-empty-cloud').removeClass('hidden');
            }
            break;
        default:
            if (i == 0 && n) {
                $('#treea_' + n.p).removeClass('contains-folders expanded');
            }
            $('#' + h).remove();// remove item
            $('#treeli_' + h).remove();// remove folder and subfolders
            if (!hasItems) {
                if (sharedFolderUI()) {
                    M.emptySharefolderUI();
                }
                else {
                    $('.files-grid-view').addClass('hidden');
                    $('.fm-empty-folder').removeClass('hidden');
                }
                $('.grid-table.fm tr').remove();
            }
            break;
    }

    if (M.megaRender && M.megaRender.megaList) {
        if (parent) {
            // this was a move node op
            if (parent === M.currentdirid) {
                // the node was moved out of the current viewport, so lets remove it from the MegaList
                M.megaRender.megaList.remove(h);
            }
        }
        else {
            M.megaRender.megaList.remove(h);
        }
    }


    if (M.currentdirid === h || M.isCircular(h, M.currentdirid) === true) {
        parent = parent || M.getNodeParent(n || h) || M.getNodeRoot(h);
        delay('openfolder', M.openFolder.bind(M, parent));
    }
}

function fmremove() {
    var promise = new MegaPromise();
    var handles = ($.selected || []).concat();

    dbfetch.coll(handles)
        .always(function() {
            var doRemoveShare = handles.some(function(h) {
                return M.d[h] && M.d[h].su;
            });

            if (doRemoveShare) {
                var promises = [];

                for (var i = handles.length; i--;) {
                    promises.push(M.leaveShare(handles[i]));
                }

                promise.linkDoneAndFailTo(MegaPromise.allDone(promises));
            }
            else {
                fmremovesync();
                promise.resolve();
            }
        });

    return promise;
}

function fmremovesync() {
    var filecnt = 0,
        foldercnt = 0,
        contactcnt = 0,
        removesharecnt = 0;

    // If on mobile we will bypass the warning dialog prompts
    if (is_mobile) {
        localStorage.skipDelWarning = '1';
    }

    for (var i in $.selected) {
        var n = M.d[$.selected[i]];

        if (n && n.su) {
            removesharecnt++;
        }
        else if (String($.selected[i]).length === 11) {
            contactcnt++;
        }
        else if (n && n.t) {
            foldercnt++;
        }
        else {
            filecnt++;
        }
    }

    if (removesharecnt) {
        for (var i in $.selected) {
            M.leaveShare($.selected[i]);
        }
        M.openFolder('shares', true);
    }

    // Remove contacts from list
    else if (contactcnt) {

        var c = $.selected.length;
        var replaceString = '';
        var contact = '';

        if (c > 1) {
            replaceString = c + ' ' + l[5569];
            contact = 'contacts';
        }
        else {
            replaceString = '<strong>' + htmlentities(M.d[$.selected[0]].name) + '</strong>';
            contact = 'contact';
        }

        msgDialog('delete-contact', l[1001], l[1002].replace('[X]', replaceString), l[7872].replace('[X]', contact),
            function(e) {
                if (e) {
                    $.selected.forEach(function(selected) {

                        if (M.c[selected]) {
                            Object.keys(M.c[selected])
                                .forEach(function(sharenode) {
                                    M.leaveShare(sharenode);
                                });
                        }

                        api_req({a: 'ur2', u: $.selected[i], l: '0', i: requesti});
                        M.handleEmptyContactGrid();
                    });
                }
            });
        if (c > 1) {
            $('#msgDialog').addClass('multiple');
            $('.fm-del-contacts-number').text($.selected.length);
            $('#msgDialog .fm-del-contact-avatar').attr('class', 'fm-del-contact-avatar');
            $('#msgDialog .fm-del-contact-avatar span').empty();
        }
        else {
            var user = M.u[$.selected[0]],
                avatar = useravatar.contact(user, 'avatar-remove-dialog');

            $('#msgDialog .fm-del-contact-avatar').html(avatar);
        }
    }

    // Remove selected nodes from rubbish bin
    else if (M.getNodeRoot($.selected[0]) === M.RubbishID) {

        var dlgMessage = '';
        var toastMessage = '';

        if ((filecnt === 1) && (!foldercnt)) {
            dlgMessage = l[13749];// 1 file
            toastMessage = l[13757];
        }
        else if ((filecnt > 1) && (!foldercnt)) {
            dlgMessage = l[13750].replace('%1', filecnt);
            toastMessage = l[13758].replace('%1', filecnt);
        }
        else if ((!filecnt) && (foldercnt === 1)) {
            dlgMessage = l[13751];// 1 folder
            toastMessage = l[13759];
        }
        else if ((!filecnt) && (foldercnt > 1)) {
            dlgMessage = l[13752].replace('%1', foldercnt);
            toastMessage = l[13760].replace('%1', foldercnt);
        }
        else if ((filecnt === 1) && (foldercnt === 1)) {
            dlgMessage = l[13753];// 1 file 1 folder
            toastMessage = l[13761];
        }
        else if ((filecnt === 1) && (foldercnt > 1)) {
            dlgMessage = l[13754].replace('%1', foldercnt);
            toastMessage = l[13762].replace('%1', foldercnt);
        }
        else if ((filecnt > 1) && (foldercnt === 1)) {
            dlgMessage = l[13755].replace('%1', filecnt);
            toastMessage = l[13763].replace('%1', filecnt);
        }
        else if ((filecnt > 1) && (foldercnt > 1)) {
            dlgMessage = l[13756].replace('%1', filecnt).replace('%2', foldercnt);
            toastMessage = l[13764].replace('%1', filecnt).replace('%2', foldercnt);
        }

        msgDialog('clear-bin', l[1003], dlgMessage, l[1007], function(e) {
            if (e) {
                var tmp = null;
                if (String(M.currentdirid).substr(0, 7) === 'search/') {
                    tmp = M.currentdirid;
                    M.currentdirid = M.getNodeByHandle($.selected[0]).p || M.RubbishID;
                }
                M.clearRubbish(false)
                    .always(function() {
                        if (tmp) {
                            M.currentdirid = tmp;
                        }
                    })
                    .done(function() {
                        showToast('settings', toastMessage);
                    });
            }
        });

        // ToDo: is this necessary?
        // $('.fm-dialog-button.notification-button').each(function(i, e) {
        //     if ($(e).text() === l[1018]) {
        //         $(e).safeHTML('<span>@@</span>', l[83]);
        //     }
        // });
    }

    // Remove contacts
    else if (M.getNodeRoot($.selected[0]) === 'contacts') {
        if (localStorage.skipDelWarning) {
            M.copyNodes($.selected, M.RubbishID, true);
        }
        else {
            var title = l[1003];
            var message = l[1004].replace('[X]', fm_contains(filecnt, foldercnt));

            msgDialog('confirmation', title, message, false, function(e) {
                    if (e) {
                        M.copyNodes($.selected, M.RubbishID, 1);
                    }
                }, true);
        }
    }
    else {
        if (localStorage.skipDelWarning) {
            if (M.currentrootid === 'shares') {
                M.copyNodes($.selected, M.RubbishID, true);
            }
            else {
                M.moveNodes($.selected, M.RubbishID);
            }
        }
        else {
            // Contains complete directory structure of selected nodes, their ids
            var selected = [], dirTree = [];

            for (var i in $.selected) {
                selected.push($.selected[i]);
                var nodes = M.getNodesSync($.selected[i], true);
                dirTree = dirTree.concat(nodes);
            }

            // Additional message in case that there's a shared node
            var share = new mega.Share({});
            var delShareInfo = share.isShareExist(dirTree, true, true, true) ? ' ' + l[1952] + ' ' + l[7410] : '';
            var title = l[1003];
            var message = l[1004].replace('[X]', fm_contains(filecnt, foldercnt)) + delShareInfo;

            msgDialog('remove', title, message, false, function(e) {
                if (e) {
                    if (M.currentrootid === 'shares') {
                        M.copyNodes($.selected, M.RubbishID, true);
                    }
                    else {
                        var delctx = {pending: 1, selected: selected};

                        // Remove all shares related to selected nodes
                        for (var i = dirTree.length; i--;) {
                            var h = dirTree[i];

                            // remove established shares
                            for (var share in Object(M.d[dirTree[i]]).shares) {
                                delctx.pending++;
                                api_req({
                                    a: 's2',
                                    n: h,
                                    s: [{u: M.d[h].shares[share].u, r: ''}],
                                    ha: '',
                                    i: requesti
                                }, {
                                    n: h,
                                    u: M.d[h].shares[share].u,
                                    delctx: delctx,
                                    callback: function(res, ctx) {
                                        if (typeof res == 'object') {
                                            // FIXME: verify error codes in res.r
                                            M.delNodeShare(ctx.n, ctx.u);
                                            setLastInteractionWith(ctx.u, "0:" + unixtime());
                                        }
                                        else {
                                            // FIXME: display error to user
                                        }

                                        if (!--ctx.delctx.pending) {
                                            M.moveNodes(ctx.delctx.selected, M.RubbishID);
                                        }
                                    }
                                });
                            }

                            // remove pending shares
                            for (var pendingUserId in M.ps[h]) {
                                var userEmailOrID = Object(M.opc[pendingUserId]).m || pendingUserId;
                                delctx.pending++;
                                api_req({
                                    a: 's2',
                                    n: h,
                                    s: [{u: userEmailOrID, r: ''}],
                                    ha: '',
                                    i: requesti
                                }, {
                                    n: h,
                                    u: pendingUserId,
                                    delctx: delctx,
                                    callback: function(res, ctx) {
                                        if (typeof res == 'object') {
                                            // FIXME: verify error codes in res.r
                                            M.deletePendingShare(ctx.n, ctx.u);
                                        }
                                        else {
                                            // FIXME: display error to user
                                        }

                                        if (!--ctx.delctx.pending) {
                                            M.moveNodes(ctx.delctx.selected, M.RubbishID);
                                        }
                                    }
                                });
                            }
                        }

                        if (!--delctx.pending) {
                            M.moveNodes(delctx.selected, M.RubbishID);
                        }
                    }
                }
            }, true);
        }
    }
}


function fm_contains(filecnt, foldercnt) {
    var containstxt = l[782];
    if ((foldercnt > 1) && (filecnt > 1)) {
        containstxt = l[828].replace('[X1]', foldercnt).replace('[X2]', filecnt);
    } else if ((foldercnt > 1) && (filecnt === 1)) {
        containstxt = l[829].replace('[X]', foldercnt);
    } else if ((foldercnt === 1) && (filecnt > 1)) {
        containstxt = l[830].replace('[X]', filecnt);
    } else if ((foldercnt === 1) && (filecnt === 1)) {
        containstxt = l[831];
    } else if (foldercnt > 1) {
        containstxt = l[832].replace('[X]', foldercnt);
    } else if (filecnt > 1) {
        containstxt = l[833].replace('[X]', filecnt);
    } else if (foldercnt === 1) {
        containstxt = l[834];
    } else if (filecnt === 1) {
        containstxt = l[835];
    }
    return containstxt;
}


function fmremdupes(test) {
    var hs = {}, i, f = [], s = 0;
    var cRootID = M.currentrootid;
    loadingDialog.show();
    for (i in M.d) {
        var n = M.d[i];
        if (n && n.hash && n.h && M.getNodeRoot(n.h) === cRootID) {
            if (!hs[n.hash]) {
                hs[n.hash] = [];
            }
            hs[n.hash].push(n.h);
        }
    }
    for (i in hs) {
        var h = hs[i];
        while (h.length > 1)
            f.push(h.pop());
    }
    for (i in f) {
        console.debug('Duplicate node: ' + f[i] + ' at ~/'
            + M.getPath(f[i]).reverse().map(function(n) {
                return M.d[n].name || ''
            }).filter(String).join("/"));
        s += M.d[f[i]].s | 0;
    }
    loadingDialog.hide();
    console.log('Found ' + f.length + ' duplicated files using a sum of ' + bytesToSize(s));
    if (!test && f.length) {
        $.selected = f;
        fmremove();
    }
    return f.length;
}
