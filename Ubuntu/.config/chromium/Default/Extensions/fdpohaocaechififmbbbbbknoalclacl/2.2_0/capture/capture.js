
var PAGE_STATE = {};
var FIT_PADDING = 20;


// Helpers

function $(id) {
    return document.getElementById(id);
}


$.findClass = function $findClass(className, ctxElt) {
    return asArray((ctxElt || document).getElementsByClassName(className));
};


$.on = function $on(elt, event, fn) {
    elt.addEventListener(event, fn, false);
    return elt;
};


$.hasClass = function $hasClass(elt, name) {
    return elt.classList.contains(name);
};


$.addClass = function $addClass(elt, name) {
    return elt.classList.add(name);
};


$.removeClass = function $removeClass(elt, name) {
    return elt.classList.remove(name);
};


$.offsets = function $offsets(elt) {
    var left = 0,
        top = 0,
        offsetParent = elt;
    while (offsetParent) {
        left += offsetParent.offsetLeft;
        top += offsetParent.offsetTop;
        offsetParent = offsetParent.offsetParent;
    }
    return {left: left, top: top};
};


function asArray(collection) {
    return Array.prototype.slice.call(collection, 0);
}


function getQueryString() {
    var result = {};
    window.location.search.substring(1).split('&').forEach(function(pair) {
        var sp = pair.split('=').map(decodeURIComponent);
        result[sp.shift()] = sp.join('=');
    });
    return result;
}


function fitConstraints(width, height, fitWidth, fitHeight) {
    var widthRatio = fitWidth / width,
        heightRatio = fitHeight / height;
    width = Math.min(width * widthRatio, width * heightRatio, width);
    height = Math.min(height * widthRatio, height * heightRatio, height);
    return {
        width: width,
        height: height,
        left: parseInt((fitWidth - width) / 2),
        top: parseInt((fitHeight - height) / 2)
    };
}


function formatBytes(bytes, decimals) {
    // function adapted from http://stackoverflow.com/a/18650828/376489
    if (bytes == 0) return '0';
    var k = 1024; // 1000; // or 1024 for binary
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


// Image loading

function loadImage(src, success, error) {
    var img = new Image();
    var delay = 5 * 1000;
    var errored = false;

    var timeout = window.setTimeout(function() {
        if (!errored) {
            errored = true;
            error('Timed out trying to load image.');
        }
    }, 10000);

    img.onerror = function(e) {
        if (!errored) {
            errored = true;
            error('File no longer exists—perhaps it has been cleared from your browser 😐');
        }
    };

    img.onload = function() {
        window.clearTimeout(timeout);
        if (!errored) {
            success(src, img.width, img.height);
        }
    };

    img.src = src;
}


// UI

function setImage(src, width, height) {
    //
    // Update the image
    //
    var img = document.createElement('IMG');
    img.src = src;
    img.title = 'Captured screenshot';

    var imageWrapElt = $('image');
    imageWrapElt.innerHTML = '';
    imageWrapElt.appendChild(img);

    //
    // Update the download link
    //
    var downloadElt = $('btn-download');
    downloadElt.href = src;
    downloadElt.download = src.split('/').pop();

    var expandElt = $('btn-expand');
    expandElt.href = src;

    PAGE_STATE.imgSrc = src;
    PAGE_STATE.fsPath = downloadElt.download;

    //
    // Click zoom in/out handling
    //
    function fitImg() {
        var pad = FIT_PADDING * 2;
        var containerWidth = window.innerWidth - pad;
        var containerHeight = (window.innerHeight
                               - document.getElementsByTagName('header')[0].offsetHeight
                               - pad);

        var constraints = fitConstraints(width, height, containerWidth, containerHeight);
        img.style.height = constraints.height + 'px';
        img.style.width = constraints.width + 'px';
        // img.style.marginLeft = constraints.left + 'px';
        img.parentNode.style.padding = (constraints.top + pad/2) + 'px 0';
    }

    function expandImg() {
        img.style.height = 'auto';
        img.style.width = 'auto';
        // img.style.marginLeft = 0;
        img.parentNode.style.padding = 0;
    }

    function imgClick(evt) {
        var maintain = (evt === true);
        var isEvent = (typeof(evt) === 'object');

        var pad = FIT_PADDING * 2;
        var headerHeight = document.getElementsByTagName('header')[0].offsetHeight;
        var canExpand = (width > window.innerWidth ||
                         height + pad > (window.innerHeight - headerHeight));
        var currentWidth = img.width;
        var currentHeight = img.height;
        var offsets = isEvent ? $.offsets(img) : null;
        var imgParentElt = $('image');

        var isExpanded = $.hasClass(imgParentElt, 'can-zoom-out');
        if (maintain === true) {
            isExpanded = !isExpanded;
        }

        var nextClass = '';
        if (canExpand) {
            if (isExpanded) {
                fitImg();
                nextClass = 'can-zoom-in';
            } else {
                expandImg();
                nextClass = 'can-zoom-out';
            }
        }
        imgParentElt.setAttribute('class', nextClass);

        // zoom into wherever mouse was...
        if (isEvent && !isExpanded) {
            var imgX = evt.clientX - offsets.left,
                imgY = evt.clientY - offsets.top,
                imgXCenter = (imgX / currentWidth) * width,
                imgYCenter = (imgY / currentHeight) * height,
                scrollX = imgXCenter - window.innerWidth / 2,
                scrollY = imgYCenter - window.innerHeight / 2;
            window.scrollTo(scrollX, scrollY);
        }
    }

    imgClick(true);
    showImgButtons();

    $.on(img, 'click', imgClick);
    $.on(window, 'resize', function() {
        imgClick(true);
    });
}


function showError(title, body, isError, canClose) {
    $('error-title').innerText = title;
    $('error-body').innerText = body;
    var errorElt = $('error');

    if (isError) {
        $.removeClass(errorElt, 'warning');
    } else {
        $.addClass(errorElt, 'warning');
    }

    $.findClass('close', errorElt).forEach(function(elt) {
        elt.style.display = canClose ? '' : 'none';
    });
    $('error-wrap').style.display = 'block';
}


function hideError() {
    $('error-wrap').style.display = 'none';
}


$.findClass('close', $('error')).forEach(function(elt) {
    $.on(elt, 'click', function() {
        hideError();
    });
});


function showHistory(files) {
    hideError();
    $('image').style.display = 'none';
    window.scrollTo(0, 0);

    var frag = document.createElement('ul'); // createDocumentFragment();
    frag.className = 'dropdown-items';

    frag.appendChild(_createHistoryHeader());

    files.sort(function(fileA, fileB) {
        var dateA = fileA.metadata ? fileA.metadata.modificationTime.getTime() : null,
            dateB = fileB.metadata ? fileB.metadata.modificationTime.getTime() : null;
        return (!dateA ? (!dateB ? 0 : 1) :
                !dateB ? -1 :
                dateB - dateA);
    });

    files.forEach(function(file) {
        frag.appendChild(_createHistoryRow(file));
    });

    if (files.length > 1) {
        frag.appendChild(_createClearAllRow());
    } else if (!files.length) {
        frag.appendChild(_createEmptyRow());
    }

    var historyElt = $('history');
    historyElt.innerHTML = '';
    historyElt.appendChild(frag);
    historyElt.style.display = 'block';

    hideImgButtons();
}


function _createHistoryHeader() {
    var headerRow = document.createElement('li');
    headerRow.className = 'dropdown-header';

    var headerRowInner = document.createElement('div');
    headerRowInner.className = 'container';
    headerRow.appendChild(headerRowInner);

    var link = document.createElement('a');
    link.className = 'right close abs-close';
    link.href = '#';
    link.innerHTML = ('<span class="pe-7s-close"></span>' +
                      '<span class="sr-only">Close</span>');
    $.on(link, 'click', function(evt) {
        evt.preventDefault();
        hideHistory();
    });
    headerRowInner.appendChild(link);

    var title = document.createElement('h3');
    title.innerText = 'History';
    headerRowInner.appendChild(title);

    return headerRow;
}


function _createHistoryRow(file) {
    var name = file.name;
    var date = file.metadata ? file.metadata.modificationTime.toLocaleDateString() : '??';
    var size = file.metadata ? formatBytes(file.metadata.size, 1) : '';
    var href = 'index.html?src=' + encodeURIComponent(name);

    var li = document.createElement('li');
    li.className = 'dropdown-item';

    var liInner = document.createElement('div');
    liInner.className = 'container';
    li.appendChild(liInner);

    var a = document.createElement('a');
    a.innerText = name;
    a.href = href;
    liInner.appendChild(a);

    var span = document.createElement('span');
    span.innerText = size;
    span.className = 'size right';
    a.insertBefore(span, a.firstChild);

    span = document.createElement('span');
    span.innerText = date;
    span.className = 'date right';
    a.insertBefore(span, a.firstChild);

    return li;
}


function _createClearAllRow() {
    var li = document.createElement('li');
    li.className = 'dropdown-item clear-all';

    var liInner = document.createElement('div');
    liInner.className = 'container';
    li.appendChild(liInner);

    var link = document.createElement('a');
    link.href = '#';
    link.innerHTML = '🗑 <em>Clear all screen captures</em> 🗑';
    $.on(link, 'click', function(evt) {
        evt.preventDefault();
        if (confirm('Are you sure you want to delete all screen captures? ' +
                    '(This action cannot be undone)')) {
            var title = 'Clear all images';
            FSAPI.clearTempFiles(function clearCallback(succeededFiles, failedFiles) {
                var msg = succeededFiles.length + ' file' + (succeededFiles.length == 1 ? '' : 's') + ' successfully removed 🗑';
                if (failedFiles.length) {
                    msg = msg + '\n\n' + failedFiles.length + ' file' + (failedFiles.length == 1 ? '': 's') + ' could not be removed.';
                }
                $('btn-history').click();
                window.setTimeout(function() {
                    showError(title, msg);
                }, 50);
            }, function clearErrback(e) {
                console.error('Error handling files', e);
                showError(title, 'Error handling files.');
            }, function clearProgress(file, i, total, success) {
                showError(title + ' (' + i + ' of ' + total + ')');
            });
        }
    });
    liInner.appendChild(link);

    return li;
}


function _createEmptyRow() {
    var li = document.createElement('li');
    li.className = 'dropdown-item info';
    li.innerHTML = '<div class="container">😦 <em>No screen captures found.</em> 😦</div>';
    return li;
}


function hideHistory() {
    $('history').style.display = 'none';
    $('image').style.display = '';
    showImgButtons();
}


function showDeletedImg() {
    hideImgButtons();

    var imageWrap = $('image');
    imageWrap.innerHTML = '';

    showError('Image deleted', 'This screen capture has been successfully removed.');
}


// Buttons

function showImgButtons() {
    if (!PAGE_STATE.imgSrc) {
        hideImgButtons();
        return;
    }
    $.findClass('img-btn').forEach(function(elt) {
        elt.style.display = 'block';
    });
}


function hideImgButtons() {
    $.findClass('img-btn').forEach(function(elt) {
        elt.style.display = 'none';
    });
}


$.on($('btn-trash'), 'click', function(evt) {
    evt.preventDefault();

    var fsPath = PAGE_STATE.fsPath;

    function errback(e) {
        console.log('ERROR removing file', e);
        showError('Error reading file',
                  'Something went wrong reading your screen shot. Check your browser settings.',
                  true, true);
    }

    FSAPI.withFs(function fsError() {
        console.log('ERROR requesting filesystem', e);
        showError('Unable to access filesystem',
                  'Something went wrong accessing the filesystem. Check your browser settings.',
                  true,
                  true);
    }, function(fs) {
        fs.root.getFile(fsPath, {create: false}, function getFileSuccess(fileEntry) {
            fileEntry.remove(function successFileRemove() {
                showDeletedImg();
            }, errback);
        }, errback);
    });
});


$.on($('btn-history'), 'click', function(evt) {
    evt.preventDefault();

    FSAPI.withFs(function(e) {
        console.log('ERROR requesting filesystem', e);
        showError('Unable to access filesystem',
                  'Something went wrong accessing the filesystem. Check your browser settings.',
                  true,
                  true);
    }, FSAPI.lookupFiles, function(files) {
        files = files.filter(function(file) { return file.isFile; });
        FSAPI.loadMetadata(files, function(files) {
            showHistory(files);
        });
    }, function(e) {
        console.log('ERROR looking up files', e);
        showError('Error reading files',
                  'Something went wrong reading your screen shots. Check your browser settings.',
                  true, true);
    });
});


// Keyboard events

$.on(document, 'keydown', function(evt) {
    // make ctrl-s (or cmd+s on mac) trigger the download button
    if (evt.keyCode == 83 && (navigator.platform.match('Mac') ? evt.metaKey : evt.ctrlKey)) {
        var downloadElt = $('btn-download');
        var style = window.getComputedStyle(downloadElt);
        if (style.display !== 'none') {
            evt.preventDefault();
            downloadElt.click();
        }
    }
});


// Main

var qs = getQueryString();

if (qs.src) {
    // load image from query string
    loadImage(FSAPI.imgPathBase + qs.src, setImage, function loadImageError(msg) {
        showError('Unable to load image',
                  msg);
    });
} else {
    // no image specified
    showError('No image specified',
              'There is no image specified for this page. Please try creating a new screen capture.');
}
