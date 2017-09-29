
// via http://www.html5rocks.com/en/tutorials/file/filesystem/#toc-dir

window.FSAPI = (function() {

    function noop() {}

    window.requestFileSystem = (window.requestFileSystem ||
                                window.webkitRequestFileSystem);


    function toArray(list) {
        return Array.prototype.slice.call(list || [], 0);
    }


    // function listResults(entries) {
    //     entries.forEach(function(entry, i) {
    //         console.log('ENTRY', i, entry);
    //     });
    // }


    function errorParser(e) {
        var msg = '';

        switch (e.code) {
          case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
          case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
          case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
          case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
          case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
        };

        return msg;
    }


    function lookupFiles(fs, callback, errback) {
        var dirReader = fs.root.createReader();
        var entries = [];

        // Call the reader.readEntries() until no more results are returned.
        (function readEntries() {
            dirReader.readEntries(function(results) {
                if (!results.length) {
                    callback(entries.sort());
                } else {
                    entries = entries.concat(toArray(results));
                    readEntries();
                }
            }, errback);
        })();
    }


    // loadMetadata - add metadata attributes to the given files
    function loadMetadata(files, callback) {
        var numFiles = files.length;
        var numDone = 0;

        function incr() {
            numDone++;
            if (numDone >= numFiles) {
                callback(files);
            }
        }

        files.forEach(function(file) {
            file.getMetadata(function(metadata) {
                file.metadata = metadata;
                incr();
            }, function() {
                console.log('error reading metadata', arguments);
                file.metadata = null;
                incr();
            });
        });

        if (!files.length) {
            incr();
        }
    }


    function clearTempFiles(callback, errback, progress) {
        progress = progress || noop;

        function onerror(e) {
            var msg = errorParser(e);
            console.error('Encountered error', msg);
            if (errback) {
                errback(e, msg);
            }
        }

        window.requestFileSystem(window.TEMPORARY, 1024*1024, function onload(fs) {
            lookupFiles(fs, function(files) {
                var numFiles = files.length,
                    succeededFiles = [],
                    failedFiles = [];

                function updateResult(file, i, succeeded) {
                    (succeeded ? succeededFiles : failedFiles).push(file);
                    progress(file, i, numFiles, succeeded);
                    if (succeededFiles.length + failedFiles.length == numFiles) {
                        callback(succeededFiles, failedFiles);
                    }
                }

                files.forEach(function(file, i) {
                    console.log('FILE', file, i);
                    if (file.isFile) {
                        file.remove(function successFileRemove() {
                            updateResult(file, i, true);
                        }, function errorFileRemove() {
                            updateResult(file, i, false);
                        });
                    } else {
                        updateResult(file, i, false);
                    }
                });
            }, onerror);
        }, onerror);
    }


    // Calls the given function with extra arguments once a file system has been loaded
    function withFs(errback, fn) {
        var args = toArray(arguments).slice(2);
        window.requestFileSystem(window.TEMPORARY, 1024*1024, function onload(fs) {
            args.unshift(fs);
            fn.apply(this, args);
        }, errback || noop);
    }

    // *   image path (with filesystem)
    // *   image DL path (without filesystem)
    // *   capture URL + query string

    // chrome-extension://{{id}}/temporary/{{filename}}
    // filesystem:chrome-extension://{{id}}/temporary/{{filename}}


    var extensionEndpoint = 'chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/';
    var fsPrefix = 'filesystem:';
    var imgPathBase = fsPrefix + extensionEndpoint + 'temporary/';

    var self = {
        // ### Functions
        //

        // withFs(errback, fn, [*arguments]) - wrapper function to request a file system
        //     and then call `fn` with first the filesystem and then the given arguments
        withFs: withFs,

        // lookupFiles(fs, callback, errback) - finds all temporary screenshoot files
        //     and calls callback with the list of FileEntry objects or errors out with errback.
        lookupFiles: lookupFiles,

        // loadMetadata(files, callback) - add a Metadata object or null to each file,
        //     returning the updated files. Metadata objects have `modificationTime` and
        //     `size` attributes.
        loadMetadata: loadMetadata,

        // clearTempFiles(callback, errback, progress) - clears all temporary files,
        //     requests its own filesystem
        //
        clearTempFiles: clearTempFiles,

        // ### Constants
        //
        // extensionEndpoint - string - base endpoint for this extension
        extensionEndpoint: extensionEndpoint,
        // fsPrefix - string - the extensionEndpoint with "filesystem:" in front of it
        fsPrefix: fsPrefix,
        // imgPathBase - str - path to where the screen capture images live
        imgPathBase: imgPathBase,

        //
        _: noop
    };
    return self;
})();
