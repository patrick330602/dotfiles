function jScrollFade(id) {
    if (is_selenium) {
        return;
    }

    $(id + ' .jspTrack').rebind('mouseover', function(e) {
        $(this).find('.jspDrag').addClass('jspActive');
        $(this).closest('.jspContainer').uniqueId();
        jScrollFadeOut($(this).closest('.jspContainer').attr('id'));
    });

    if (!$.jScroll) {
        $.jScroll = {};
    }
    for (var i in $.jScroll) {
        if ($.jScroll[i] === 0) {
            delete $.jScroll[i];
        }
    }
    $(id).rebind('jsp-scroll-y.fade', function(event, scrollPositionY, isAtTop, isAtBottom) {
        $(this).find('.jspDrag').addClass('jspActive');
        $(this).find('.jspContainer').uniqueId();
        var id = $(this).find('.jspContainer').attr('id');
        jScrollFadeOut(id);
    });
}

function jScrollFadeOut(id) {
    if (!$.jScroll[id]) {
        $.jScroll[id] = 0;
    }
    $.jScroll[id]++;
    setTimeout(function(id) {
        $.jScroll[id]--;
        if ($.jScroll[id] === 0) {
            $('#' + id + ' .jspDrag').removeClass('jspActive');
        }
    }, 500, id);
}


function deleteScrollPanel(from, data) {
    var jsp = $(from).data(data);
    if (jsp) {
        jsp.destroy();
    }
}

function initAccountScroll(scroll) {
    $('.account.tab-content:visible').jScrollPane({
        enableKeyboardNavigation: false, showArrows: true, arrowSize: 5, animateScroll: true
    });
    jScrollFade('.account.tab-content:visible');
    if (scroll) {
        var jsp = $('.account.tab-content:visible').data('jsp');
        if (jsp) {
            jsp.scrollToBottom();
        }
    }
}

function initGridScrolling() {
    $('.grid-scrolling-table:visible')
        .filter(":not(.megaList,.megaListContainer)")
        .jScrollPane({enableKeyboardNavigation: false, showArrows: true, arrowSize: 5});

    jScrollFade('.grid-scrolling-table:not(.megaList,.megaListContainer)');
}

function initSelectScrolling(scrollBlock) {
    $(scrollBlock).jScrollPane({enableKeyboardNavigation: false, showArrows: true, arrowSize: 5});
    jScrollFade(scrollBlock);
}

function initFileblocksScrolling() {
    $('.file-block-scrolling:visible')
        .filter(":not(.megaList)")
        .jScrollPane({enableKeyboardNavigation: false, showArrows: true, arrowSize: 5});

    jScrollFade('.file-block-scrolling:not(.megaList)');
}

function initFileblocksScrolling2() {
    $('.contact-details-view .file-block-scrolling').jScrollPane({
        enableKeyboardNavigation: false,
        showArrows: true,
        arrowSize: 5
    });
    jScrollFade('.contact-details-view .file-block-scrolling');
}

function initContactsGridScrolling() {
    var scroll = '.grid-scrolling-table.contacts';
    deleteScrollPanel(scroll, 'jsp');
    $(scroll).jScrollPane({enableKeyboardNavigation: false, showArrows: true, arrowSize: 5});
    jScrollFade(scroll);
}


function initOpcGridScrolling() {
    var scroll = '.grid-scrolling-table.opc';
    deleteScrollPanel(scroll, 'jsp');
    $(scroll).jScrollPane({enableKeyboardNavigation: false, showArrows: true, arrowSize: 5});
    jScrollFade(scroll);
}

function initIpcGridScrolling() {
    var scroll = '.grid-scrolling-table.ipc';
    deleteScrollPanel(scroll, 'jsp');
    $(scroll).jScrollPane({enableKeyboardNavigation: false, showArrows: true, arrowSize: 5});
    jScrollFade(scroll);
}

function initContactsBlocksScrolling() {
    var scroll = '.contacts-blocks-scrolling';
    if ($('.contacts-blocks-scrolling:visible').length === 0) {
        return;
    }
    deleteScrollPanel(scroll, 'jsp');
    $(scroll).jScrollPane({enableKeyboardNavigation: false, showArrows: true, arrowSize: 5});
    jScrollFade(scroll);
}

function initShareBlocksScrolling() {
    var scroll = '.shared-blocks-scrolling';
    if ($('.shared-blocks-scrolling:visible').length === 0) {
        return;
    }
    deleteScrollPanel(scroll, 'jsp');
    $(scroll).jScrollPane({enableKeyboardNavigation: false, showArrows: true, arrowSize: 5});
    jScrollFade(scroll);
}

function initTransferScroll() {
    $('.transfer-scrolling-table').jScrollPane({
        enableKeyboardNavigation: false,
        showArrows: true,
        arrowSize: 5,
        verticalDragMinHeight: 20
    });
    jScrollFade('.transfer-scrolling-table');
}

function initTreeScroll() {
    if (d) {
        console.time('treeScroll');
    }

    $('.fm-tree-panel:not(.manual-tree-panel-scroll-management)').jScrollPane({
        enableKeyboardNavigation: false,
        showArrows: true,
        arrowSize: 5,
        animateScroll: true
    });

    jScrollFade('.fm-tree-panel:not(.manual-tree-panel-scroll-management)');

    if (d) {
        console.timeEnd('treeScroll');
    }
}

function dialogScroll(s) {
    s += ':visible';
    $(s).jScrollPane({enableKeyboardNavigation: false, showArrows: true, arrowSize: 8, animateScroll: true});
    jScrollFade(s);
}

function handleDialogScroll(num, dc) {
    var SCROLL_NUM = 5;// Number of items in dialog before scroll is implemented
    //
    // Add scroll in case that we have more then 5 items in list
    if (num > SCROLL_NUM) {
        dialogScroll(dc + ' .share-dialog-contacts');
    }
    else {
        var $x = $(dc + ' .share-dialog-contacts').jScrollPane();
        var el = $x.data('jsp');
        el.destroy();
    }
}


function clearScrollPanel(from) {
    var j = $(from + ' .multiple-input').jScrollPane().data();

    if (j && j.jsp) {
        j.jsp.destroy();
    }

    $(from + ' .multiple-input .jspPane').unwrap();
    $(from + ' .multiple-input .jspPane:first-child').unwrap();

    // remove share dialog contacts, jScrollPane
    j = $(from + ' .share-dialog-contacts').jScrollPane().data();

    if (j && j.jsp) {
        j.jsp.destroy();
    }
}

//----------------------------------------------------------------------------

function reselect(n) {
    $('.ui-selected').removeClass('ui-selected');

    if (!Array.isArray($.selected)) {
        if (selectionManager) {
            selectionManager.clear_selection();
        }
        $.selected = [];
    }
    var ids = $.selected.map(function(h) {
        if (h && typeof h === 'object') {
            h = h.h;
        }
        return String(h).replace(/[^\w-]/g, '');
    });

    for (var i = ids.length; i--;) {
        $('#' + ids[i]).addClass('ui-selected');

        if (n) {
            $('#' + ids[i] + ' .grid-status-icon').addClass('new');
            $('#' + ids[i] + ' .file-status-icon').addClass('new');
        }
    }

    if (n) {
        var el, jsp;

        if (M.viewmode) {
            jsp = $('.file-block-scrolling').data('jsp');
            el = $('a.ui-selected');
        }
        else {
            jsp = $('.grid-scrolling-table').data('jsp');
            el = $('tr.ui-selected');
        }
        if (el.length > 0) {
            el = el[0];
        }
        else {
            el = false;
        }
        if (el && jsp) {
            jsp.scrollToElement(el);
        }
    }
}
