/* ***************** BEGIN MEGA LIMITED CODE REVIEW LICENCE *****************
 *
 * Copyright (c) 2016 by Mega Limited, Auckland, New Zealand
 * All rights reserved.
 *
 * This licence grants you the rights, and only the rights, set out below,
 * to access and review Mega's code. If you take advantage of these rights,
 * you accept this licence. If you do not accept the licence,
 * do not access the code.
 *
 * Words used in the Mega Limited Terms of Service [https://mega.nz/terms]
 * have the same meaning in this licence. Where there is any inconsistency
 * between this licence and those Terms of Service, these terms prevail.
 *
 * 1. This licence does not grant you any rights to use Mega's name, logo,
 *    or trademarks and you must not in any way indicate you are authorised
 *    to speak on behalf of Mega.
 *
 * 2. If you issue proceedings in any jurisdiction against Mega because you
 *    consider Mega has infringed copyright or any patent right in respect
 *    of the code (including any joinder or counterclaim), your licence to
 *    the code is automatically terminated.
 *
 * 3. THE CODE IS MADE AVAILABLE "AS-IS" AND WITHOUT ANY EXPRESS OF IMPLIED
 *    GUARANTEES AS TO FITNESS, MERCHANTABILITY, NON-INFRINGEMENT OR OTHERWISE.
 *    IT IS NOT BEING PROVIDED IN TRADE BUT ON A VOLUNTARY BASIS ON OUR PART
 *    AND YOURS AND IS NOT MADE AVAILABE FOR CONSUMER USE OR ANY OTHER USE
 *    OUTSIDE THE TERMS OF THIS LICENCE. ANYONE ACCESSING THE CODE SHOULD HAVE
 *    THE REQUISITE EXPERTISE TO SECURE THEIR OWN SYSTEM AND DEVICES AND TO
 *    ACCESS AND USE THE CODE FOR REVIEW PURPOSES. YOU BEAR THE RISK OF
 *    ACCESSING AND USING IT. IN PARTICULAR, MEGA BEARS NO LIABILITY FOR ANY
 *    INTERFERENCE WITH OR ADVERSE EFFECT ON YOUR SYSTEM OR DEVICES AS A
 *    RESULT OF YOUR ACCESSING AND USING THE CODE.
 *
 * Read the full and most up-to-date version at:
 *    https://github.com/meganz/webclient/blob/master/LICENCE.md
 *
 * ***************** END MEGA LIMITED CODE REVIEW LICENCE ***************** */
var dlMethod;

/* jshint -W003 */
var dlmanager = {
    // Keep in track real active downloads.
    // ETA (in seconds) to consider a download finished, used to speed up chunks.
    // Despite the fact that the DownloadQueue has a limitted size,
    // to speed up things for tiny downloads each download is able to
    // report to the scheduler that they are done when it may not be necessarily
    // true (but they are for instance close to their finish)
    dlDoneThreshold: 3,
    // How many queue IO we want before pausing the XHR fetching,
    // useful when we have internet faster than our IO
    ioThrottleLimit: 6,
    ioThrottlePaused: false,
    fetchingFile: false,
    dlLastQuotaWarning: 0,
    dlRetryInterval: 1000,
    dlMaxChunkSize: 16 * 1048576,
    isDownloading: false,
    dlZipID: 0,
    gotHSTS: false,
    resumeInfoTag: 'dlmr!',
    resumeInfoCache: Object.create(null),
    logger: MegaLogger.getLogger('dlmanager'),

    /**
     * Set user flags for the limitation dialogs.
     * @alias dlmanager.lmtUserFlags
     */
    setUserFlags: function() {
        this.lmtUserFlags = 0;

        if (u_type) {
            this.lmtUserFlags |= this.LMT_ISREGISTERED;

            if (Object(u_attr).p) {
                this.lmtUserFlags |= this.LMT_ISPRO;
            }
        }

        mega.achievem.enabled()
            .done(function() {
                dlmanager.lmtUserFlags |= dlmanager.LMT_HASACHIEVEMENTS;
            });

        // dlmanager.lmtUserFlags |= dlmanager.LMT_HASACHIEVEMENTS;
    },

    getResumeInfo: function(dl, callback) {
        'use strict';

        if (!dl) {
            return MegaPromise.reject(EINCOMPLETE);
        }

        if (typeof dl === 'string') {
            dl = {ph: dl};
        }
        var promise;
        var tag = this.getResumeInfoTag(dl);

        if (d) {
            this.logger.debug('getResumeInfo', tag, dl);
        }

        if (this.resumeInfoCache[tag]) {
            this.resumeInfoCache[tag].tag = tag;
            promise = MegaPromise.resolve(this.resumeInfoCache[tag]);
        }
        else {
            promise = M.getPersistentData(tag);
        }

        if (typeof callback === 'function') {
            promise.tryCatch(callback, callback.bind(null, false));
        }

        return promise;
    },

    remResumeInfo: function(dl) {
        'use strict';

        if (!dl) {
            return MegaPromise.reject(EINCOMPLETE);
        }

        if (typeof dl === 'string') {
            dl = {ph: dl};
        }

        if (d) {
            this.logger.debug('remResumeInfo', this.getResumeInfoTag(dl), dl);
        }

        return M.delPersistentData(this.getResumeInfoTag(dl));
    },

    setResumeInfo: function(dl, byteOffset) {
        'use strict';

        if (!dl || !dl.resumeInfo || !dl.hasResumeSupport) {
            return MegaPromise.reject(EINCOMPLETE);
        }

        dl.resumeInfo.mac = dl.mac;
        dl.resumeInfo.byteOffset = byteOffset;

        if (d) {
            this.logger.debug('setResumeInfo', this.getResumeInfoTag(dl), dl.resumeInfo, dl);
        }

        return M.setPersistentData(this.getResumeInfoTag(dl), dl.resumeInfo);
    },

    // @private
    getResumeInfoTag: function(dl) {
        'use strict';

        return this.resumeInfoTag + (dl.ph ? dl.ph : u_handle + dl.id);
    },

    /**
     * For a resumable download, check the filesize on disk
     * @param {String} handle Node handle
     * @param {String} filename The filename..
     * @returns {MegaPromise}
     */
    getFileSizeOnDisk: function(handle, filename) {
        'use strict';

        var promise = new MegaPromise();
        var reject = promise.reject.bind(promise, null);

        if (dlMethod === FileSystemAPI) {
            M.getFileEntryMetadata('mega/' + handle)
                .fail(reject)
                .done(function(metadata) {
                    promise.resolve(metadata.size);
                });
        }
        else if (is_chrome_firefox && typeof OS !== 'undefined') {
            try {
                var root = mozGetDownloadsFolder();

                OS.File.stat(OS.Path.join(root.path, filename))
                    .then(function(info) {
                        promise.resolve(info.size);
                    }, reject);
            }
            catch (ex) {
                reject(ex);
            }
        }
        else {
            reject(EACCESS);
        }

        return promise;
    },

    /**
     * Initialize download
     * @param {ClassFile} file The class file instance
     * @param {Object} gres The API reply to the `g` request
     * @param {Object} resumeInfo Resumable info, if any
     * @returns {MegaPromise}
     */
    initDownload: function(file, gres, resumeInfo) {
        'use strict';

        if (!(file instanceof ClassFile)) {
            return MegaPromise.reject(EARGS);
        }
        if (!file.dl || !Object(file.dl.io).setCredentials) {
            return MegaPromise.reject(EACCESS);
        }
        if (!gres || typeof gres !== 'object' || file.dl.size !== gres.s) {
            return MegaPromise.reject(EFAILED);
        }
        var dl = file.dl;
        var promise = new MegaPromise();

        var dl_urls = [];
        var dl_chunks = [];
        var dl_chunksizes = {};
        var dl_filesize = dl.size;
        var byteOffset = resumeInfo.byteOffset || 0;

        var p = 0;
        var pp = 0;
        for (var i = 1; i <= 8 && p < dl_filesize - i * 131072; i++) {
            dl_chunksizes[p] = i * 131072;
            dl_chunks.push(p);
            pp = p;
            p += dl_chunksizes[p];
        }

        var chunksize = dl_filesize / dlQueue._limit / 2;
        if (chunksize > dlmanager.dlMaxChunkSize) {
            chunksize = dlmanager.dlMaxChunkSize;
        }
        else if (chunksize <= 1048576) {
            chunksize = 1048576;
        }
        else {
            chunksize = 1048576 * Math.floor(chunksize / 1048576);
        }

        /**
        var reserved = dl_filesize - (chunksize * (dlQueue._limit - 1));
        while (p < dl_filesize) {
            dl_chunksizes[p] = p > reserved ? 1048576 : chunksize;
            dl_chunks.push(p);
            pp = p;
            p += dl_chunksizes[p];
        }
        /**/
        while (p < dl_filesize) {
            var length = Math.floor((dl_filesize - p) / 1048576 + 1) * 1048576;
            if (length > chunksize) {
                length = chunksize;
            }
            dl_chunksizes[p] = length;
            dl_chunks.push(p);
            pp = p;
            p += length;
        }
        /**/

        if (!(dl_chunksizes[pp] = dl_filesize - pp)) {
            delete dl_chunksizes[pp];
            delete dl_chunks[dl_chunks.length - 1];
        }

        for (var j = dl_chunks.length; j--;) {
            if (dl_chunks[j] !== undefined) {
                var offset = dl_chunks[j];

                dl_urls.push({
                    url: gres.g + '/' + offset + '-' + (offset + dl_chunksizes[offset] - 1),
                    size: dl_chunksizes[offset],
                    offset: offset
                });
            }
        }

        if (resumeInfo && typeof resumeInfo !== 'object') {
            dlmanager.logger.warn('Invalid resumeInfo entry.', resumeInfo, file);
            resumeInfo = false;
        }

        dl.url = gres.g;
        dl.urls = dl_urls;
        dl.mac = resumeInfo.mac || [0, 0, 0, 0];
        dl.resumeInfo = resumeInfo || Object.create(null);
        dl.byteOffset = dl.resumeInfo.byteOffset = byteOffset;

        var result = {
            chunks: dl_chunks,
            offsets: dl_chunksizes
        };

        var startDownload = function() {
            try {
                dl.io.setCredentials(dl.url, dl.size, dl.n, dl_chunks, dl_chunksizes, resumeInfo);
                promise.resolve(result);
            }
            catch (ex) {
                setTransferStatus(dl, ex);
                promise.reject(ex);
            }
        };

        if (resumeInfo.entry) {
            delete dlmanager.resumeInfoCache[resumeInfo.tag];

            M.readFileEntry(resumeInfo.entry)
                .done(function(ab) {
                    if (ab instanceof ArrayBuffer && ab.byteLength === dl.byteOffset) {
                        dl.pzBufferStateChange = ab;
                    }
                    else {
                        console.warn('Invalid pzBufferStateChange...', ab, dl.byteOffset);
                    }
                })
                .finally(function() {
                    onIdle(startDownload);
                    resumeInfo.entry.remove(function() {});
                    delete resumeInfo.entry;
                });
        }
        else {
            startDownload();
        }

        return promise;
    },

    /**
     * Browser query on maximum downloadable file size
     * @returns {MegaPromise}
     */
    getMaximumDownloadSize: function() {
        'use strict';

        var promise = new MegaPromise();

        var max = function() {
            promise.resolve(Math.pow(2, 53));
        };

        if (dlMethod === FileSystemAPI) {
            var success = function(used, remaining) {
                if (remaining < 1) {
                    // either the user hasn't granted persistent quota or
                    // we're in Incognito..let FileSystemAPI deal with it
                    max();
                }
                else {
                    promise.resolve(Math.max(remaining, MemoryIO.fileSizeLimit));
                }
            };

            if (navigator.webkitPersistentStorage) {
                navigator.webkitPersistentStorage.queryUsageAndQuota(success, max);
            }
            else if (window.webkitStorageInfo) {
                window.webkitStorageInfo.queryUsageAndQuota(1, success, max);
            }
            else {
                // Hmm...
                promise.resolve(-1);
            }
        }
        else if (dlMethod === MemoryIO) {
            promise.resolve(MemoryIO.fileSizeLimit);
        }
        else {
            max();
        }

        return promise;
    },

    newUrl: function DM_newUrl(dl, callback) {
        var gid = dl.dl_id || dl.ph;

        if (callback) {
            if (!this._newUrlQueue) {
                this._newUrlQueue = {};
            }

            if (this._newUrlQueue.hasOwnProperty(gid)) {
                this._newUrlQueue[gid].push(callback);
                return;
            }
            this._newUrlQueue[gid] = [callback];
        }
        if (d) {
            dlmanager.logger.info("Retrieving New URLs for", gid);
        }

        dlQueue.pause();
        dlmanager.dlGetUrl(dl, function(error, res, o) {
            if (error) {
                return later(this.newUrl.bind(this, dl));
            }
            dl.url = res.g;

            var changed = 0;
            for (var i = 0; i < dlQueue._queue.length; i++) {
                if (dlQueue._queue[i][0].dl === dl) {
                    dlQueue._queue[i][0].url = res.g + "/" +
                        dlQueue._queue[i][0].url.replace(/.+\//, '');
                    changed++;
                }
            }
            if (Object(this._newUrlQueue).hasOwnProperty(gid)) {
                this._newUrlQueue[gid]
                    .forEach(function(callback) {
                        callback(res.g, res);
                    });
                delete this._newUrlQueue[gid];
            }
            dlmanager.logger.info("Resuming, got new URL for %s:%s", gid, res.g, changed, res);
            dlQueue.resume();
        }.bind(this));
    },

    uChangePort: function DM_uChangePort(url, port) {
        if (!this.gotHSTS && String(url).substr(0,5) === 'http:') {
            var uri = document.createElement('a');
            uri.href = url;

            if (port) {
                url = url.replace(uri.host, uri.hostname + ':' + port);
            }
            else if (uri.host !== uri.hostname) {
                url = url.replace(uri.host, uri.hostname);
            }
        }

        return url;
    },

    checkHSTS: function(xhr) {
        if (!use_ssl && !this.gotHSTS) {
            try {
                if (String(xhr.responseURL).substr(0, 6) === 'https:') {
                    this.gotHSTS = true;
                }
            }
            catch (ex) {
                if (d) {
                    this.logger.error(ex);
                }
            }
        }
    },

    cleanupUI: function DM_cleanupUI(gid) {
        if (typeof gid === 'object') {
            gid = this.getGID(gid);
        }

        var l = dl_queue.length;
        while (l--) {
            var dl = dl_queue[l];

            if (gid === this.getGID(dl)) {
                if (d) {
                    dlmanager.logger.info('cleanupUI', gid, dl.n, dl.zipname);
                }

                if (dl.io instanceof MemoryIO) {
                    dl.io.abort();
                }
                // oDestroy(dl.io);
                dl_queue[l] = Object.freeze({});
            }
        }
    },

    getGID: function DM_GetGID(dl) {
        return dl.zipid ? 'zip_' + dl.zipid : 'dl_' + (dl.dl_id || dl.ph);
    },

    abort: function DM_abort(gid, keepUI) {
        /* jshint -W074 */
        if (gid === null || Array.isArray(gid)) {
            this._multiAbort = 1;

            if (gid) {
                gid.forEach(function(dl) {
                    dlmanager.abort(dl, keepUI);
                });
            }
            else {
                dl_queue.filter(isQueueActive)
                    .forEach(function(dl) {
                        dlmanager.abort(dl, keepUI);
                    });
            }

            delete this._multiAbort;
            Soon(M.resetUploadDownload);
        }
        else {
            if (typeof gid === 'object') {
                gid = this.getGID(gid);
            }
            else if (!gid || gid[0] === 'u') {
                return;
            }

            var found = 0;
            var l = dl_queue.length;
            while (l--) {
                var dl = dl_queue[l];

                if (gid === this.getGID(dl)) {
                    if (!dl.cancelled) {
                        if (dl.hasResumeSupport) {
                            dlmanager.remResumeInfo(dl).dump();
                        }

                        try {
                            /* jshint -W073 */
                            if (typeof dl.io.abort === "function") {
                                if (d) {
                                    dlmanager.logger.info('IO.abort', gid, dl);
                                }
                                dl.io.abort("User cancelled");
                            }
                        }
                        catch (e) {
                            dlmanager.logger.error(e);
                        }
                    }
                    dl.cancelled = true;
                    if (dl.zipid && Zips[dl.zipid]) {
                        Zips[dl.zipid].cancelled = true;
                    }
                    if (dl.io && typeof dl.io.begin === 'function') {
                        /* Canceled while Initializing? Let's free up stuff
                         * and notify the scheduler for the running task
                         */
                        dl.io.begin();
                    }
                    found++;
                }
            }

            if (!found) {
                this.logger.warn('Download %s was not found in dl_queue', gid);
            }
            else if (found > 1 && gid[0] !== 'z') {
                this.logger.error('Too many matches looking for %s in dl_queue (!?)', gid);
            }

            if (!keepUI) {
                this.cleanupUI(gid);
            }

            /* We rely on `dl.cancelled` to let chunks destroy himself.
             * However, if the dl is paused we might end up with the
             + ClassFile.destroy uncalled, which will be leaking.
             */
            var foreach;
            if (dlQueue._qpaused[gid]) {
                foreach = function(task) {
                    task = task[0];
                    return task instanceof ClassChunk && task.isCancelled() || task.destroy();
                };
            }
            dlQueue.filter(gid, foreach);

            /* Active chunks might are stuck waiting reply,
             * which won't get destroyed itself right away.
             */
            if (GlobalProgress[gid]) {
                var chunk;
                var w = GlobalProgress[gid].working;
                while ((chunk = w.pop())) {
                    var result = chunk.isCancelled();
                    if (!result) {
                        this.logger.error('Download chunk %s(%s) should have been cancelled itself.', gid, chunk);
                        if (d) debugger;
                    }
                }
            }

            if (!this._multiAbort) {
                Soon(M.resetUploadDownload);
            }
        }
    },

    dlGetUrl: function DM_dlGetUrl(dl, callback) {
        'use strict';

        if (dl.byteOffset && dl.byteOffset === dl.size) {
            // Completed download.
            return callback(false, {s: dl.size, g: 'https://localhost.save-file.mega.nz/dl/1234'});
        }

        var req = {
            a: 'g',
            g: 1,
            ssl: use_ssl
        };
        var ctx = {
            object: dl,
            next: callback,
            dl_key: dl.key,
            callback: this.dlGetUrlDone.bind(this)
        };

        if (dl.ph) {
            req.p = dl.ph;
        }
        else if (dl.id) {
            req.n = dl.id;
        }

        if (folderlink || !dl.nauth) {
            api_req(req, ctx, dl.nauth ? 1 : 0);
        }
        else {
            req.enp = dl.nauth;
            api_req(req, ctx);
        }
    },

    dlGetUrlDone: function DM_dlGetUrlDone(res, ctx) {
        var error = EAGAIN;
        var dl = ctx.object;

        if (typeof res === 'number') {
            error = res;
        }
        else if (typeof res === 'object') {
            if (res.efq) {
                dlmanager.efq = true;
            }
            else {
                delete dlmanager.efq;
            }
            if (res.d) {
                error = (res.d ? 2 : 1); // XXX: ???
            }
            else if (res.e) {
                error = res.e;
            }
            else if (res.g) {
                var key = [
                    ctx.dl_key[0] ^ ctx.dl_key[4],
                    ctx.dl_key[1] ^ ctx.dl_key[5],
                    ctx.dl_key[2] ^ ctx.dl_key[6],
                    ctx.dl_key[3] ^ ctx.dl_key[7]
                ];
                var ab = base64_to_ab(res.at);
                var attr = dec_attr(ab, key);

                if (typeof attr === 'object' && typeof attr.n === 'string') {
                    if (have_ab && page !== 'download'
                            && res.s <= 48 * 1048576
                            && is_image(attr.n)
                            && (!res.fa
                                || res.fa.indexOf(':0*') < 0
                                || res.fa.indexOf(':1*') < 0 || ctx.object.preview === -1)) {
                        ctx.object.data = new ArrayBuffer(res.s);
                    }

                    dlmanager.isOverQuota = false;
                    dlmanager.isOverFreeQuota = false;
                    $('.limited-bandwidth-dialog .fm-dialog-close').trigger('click');
                    return ctx.next(false, res, attr, ctx.object);
                }
            }
        }

        dlmanager.dlReportStatus(dl, error);

        ctx.next(error || new Error("failed"));
    },

    dlQueuePushBack: function DM_dlQueuePushBack(aTask) {
        var isValidTask = aTask && (aTask.onQueueDone || aTask instanceof ClassFile);

        dlmanager.logger.debug('dlQueuePushBack', isValidTask, aTask);

        if (ASSERT(isValidTask, 'dlQueuePushBack: Invalid aTask...')) {
            dlQueue.pushFirst(aTask);

            if (dlmanager.ioThrottlePaused) {
                delay('dlQueuePushBack', dlQueue.resume.bind(dlQueue), 40);
            }
        }
    },

    dlReportStatus: function DM_reportstatus(dl, code) {
        this.logger.warn('dlReportStatus', code, this.getGID(dl), dl);

        if (dl) {
            dl.lasterror = code;
            dl.onDownloadError(dl, code);
        }

        if (code === EKEY) {
            // TODO: Check if other codes should raise abort()
            later(function() {
                dlmanager.abort(dl, true);
            });
        }
    },

    dlClearActiveTransfer: function DM_dlClearActiveTransfer(dl_id) {
        if (is_mobile) {
            return;
        }
        var data = JSON.parse(localStorage.aTransfers || '{}');
        if (data[dl_id]) {
            delete data[dl_id];
            if (!$.len(data)) {
                delete localStorage.aTransfers;
            }
            else {
                localStorage.aTransfers = JSON.stringify(data);
            }
        }
    },

    dlSetActiveTransfer: function DM_dlSetActiveTransfer(dl_id) {
        if (is_mobile) {
            return;
        }
        var data = JSON.parse(localStorage.aTransfers || '{}');
        data[dl_id] = Date.now();
        localStorage.aTransfers = JSON.stringify(data);
    },

    isTrasferActive: function DM_isTrasferActive(dl_id) {
        var date = null;

        if (localStorage.aTransfers) {
            var data = JSON.parse(localStorage.aTransfers);

            date = data[dl_id];
        }

        if (typeof dlpage_ph === 'string' && dlpage_ph === dl_id) {
            date = Date.now();
        }

        return date;
    },

    failureFunction: function DM_failureFunction(task, args) {
        var code = args[1].responseStatus || 0;
        var dl = task.task.download;

        if (d) {
            dlmanager.logger.error('Fai1ure',
                dl.zipname || dl.n, code, task.task.chunk_id, task.task.offset, task.onQueueDone.name);
        }

        if (code === 509) {
            if (!dl.log509 && Object(u_attr).p) {
                dl.log509 = 1;
                api_req({ a: 'log', e: 99614, m: 'PRO user got 509' });
            }
            this.showOverQuotaDialog(task);
            dlmanager.dlReportStatus(dl, EOVERQUOTA);
            return 1;
        }

        /* update UI */
        dlmanager.dlReportStatus(dl, EAGAIN);

        if (code === 403 || code === 404) {
            dlmanager.newUrl(dl, function(rg) {
                if (!task.url) {
                    return;
                }
                task.url = rg + "/" + task.url.replace(/.+\//, '');
                dlmanager.dlQueuePushBack(task);
            });
        }
        else {
            /* check for network error  */
            dl.dl_failed = true;
            task.altport = !task.altport;
            api_reportfailure(hostname(dl.url), ulmanager.networkErrorCheck);
            dlmanager.dlQueuePushBack(task);
        }

        return 2;
    },

    getDownloadByHandle: function DM_IdToFile(handle) {
        var dl = null;
        if (handle) {
            for (var i in dl_queue) {
                if (dl_queue.hasOwnProperty(i)) {
                    var dlh = dl_queue[i].ph || dl_queue[i].id;
                    if (dlh === handle) {
                        dl = dl_queue[i];
                        break;
                    }
                }
            }
        }
        return dl;
    },

    throttleByIO: function DM_throttleByIO(writer) {
        writer.on('queue', function() {
            if (writer._queue.length >= dlmanager.ioThrottleLimit && !dlQueue.isPaused()) {
                writer.logger.info("IO_THROTTLE: pause XHR");
                dlQueue.pause();
                dlmanager.ioThrottlePaused = true;

                if (page === 'download') {
                    $('.download.status-txt').text(l[8579]);
                }
            }
        });

        writer.on('working', function() {
            if (writer._queue.length < dlmanager.ioThrottleLimit && dlmanager.ioThrottlePaused) {
                writer.logger.info("IO_THROTTLE: resume XHR");
                dlQueue.resume();
                dlmanager.ioThrottlePaused = false;

                if (page === 'download') {
                    $('.download.status-txt').text(l[258]);
                }
            }
        });
    },

    checkLostChunks: function DM_checkLostChunks(file) {
        'use strict';

        var mac;
        var dl_key = file.key;

        if (file.hasResumeSupport) {
            mac = file.mac;
        }
        else {
            var t = Object.keys(file.macs)
                .map(Number)
                .sort(function(a, b) {
                    return a - b;
                })
                .map(function(v) {
                    return file.macs[v];
                });

            mac = condenseMacs(t, [
                dl_key[0] ^ dl_key[4],
                dl_key[1] ^ dl_key[5],
                dl_key[2] ^ dl_key[6],
                dl_key[3] ^ dl_key[7]
            ], file.mac);
        }

        if (have_ab && (dl_key[6] !== (mac[0] ^ mac[1]) || dl_key[7] !== (mac[2] ^ mac[3]))) {
            return false;
        }

        if (file.data) {
            var options = {
                onPreviewRetry: file.preview === -1
            };
            if (!file.zipid) {
                options.raw = is_rawimage(file.n) || mThumbHandler.has(file.n);
            }
            createnodethumbnail(
                file.id,
                new sjcl.cipher.aes([dl_key[0] ^ dl_key[4], dl_key[1]
                    ^ dl_key[5], dl_key[2] ^ dl_key[6], dl_key[3] ^ dl_key[7]]),
                ++ulmanager.ulFaId,
                file.data,
                options
            );
            file.data = null;
        }

        return true;
    },

    dlWriter: function DM_dl_writer(dl, is_ready) {
        'use strict';

        function finish_write(task, done) {
            task.data = undefined;
            done();

            if (typeof task.callback === "function") {
                task.callback();
            }
            if (dl.ready) {
                // tell the download scheduler we're done.
                dl.ready();
            }
        }

        function safeWrite(data, offset, callback) {
            var abort = function swa(ex) {
                console.error(ex);
                dlFatalError(dl, ex);
            };

            try {
                dl.io.write(data, offset, tryCatch(callback, abort));
            }
            catch (ex) {
                abort(ex);
            }
        }

        dl.writer = new MegaQueue(function dlIOWriterStub(task, done) {
            if (!task.data.byteLength || dl.cancelled) {
                if (d) {
                    dl.writer.logger.error(dl.cancelled ? "download cancelled" : "writing empty chunk");
                }
                return finish_write(task, done);
            }
            var logger = dl.writer && dl.writer.logger || dlmanager.logger;

            // As of Firefox 37, this method will neuter the array buffer.
            var abLen = task.data.byteLength;
            var abDup = dl.data && (is_chrome_firefox & 4) && new Uint8Array(task.data);

            var ready = function _onWriterReady() {
                dl.writer.pos += abLen;

                if (dl.data) {
                    new Uint8Array(
                        dl.data,
                        task.offset,
                        abLen
                    ).set(abDup || task.data);
                }

                if (dl.hasResumeSupport) {
                    if (d > 1) {
                        logger.debug('Condense MACs @ offset %s-%s', task.offset, dl.writer.pos, Object.keys(dl.macs));
                    }

                    for (var pos = task.offset; dl.macs[pos] && pos < dl.writer.pos; pos += 1048576) {
                        dl.mac[0] ^= dl.macs[pos][0];
                        dl.mac[1] ^= dl.macs[pos][1];
                        dl.mac[2] ^= dl.macs[pos][2];
                        dl.mac[3] ^= dl.macs[pos][3];
                        dl.mac = dl.aes.encrypt(dl.mac);
                        delete dl.macs[pos];
                    }
                }

                dlmanager.setResumeInfo(dl, dl.writer.pos)
                    .finally(function() {
                        finish_write(task, done);
                    });
            };

            var writeTaskChunk = function() {
                safeWrite(task.data, task.offset, ready);
            };

            if (dl.pzBufferStateChange) {
                safeWrite(dl.pzBufferStateChange, 0, writeTaskChunk);
                delete dl.pzBufferStateChange;
            }
            else {
                writeTaskChunk();
            }

        }, 1, 'download-writer');

        dlmanager.throttleByIO(dl.writer);

        dl.writer.pos = 0;

        dl.writer.validateTask = function(t) {
            var r = (!is_ready || is_ready()) && t.offset === dl.writer.pos;
            // if (d) this.logger.info('validateTask', r, t.offset, dl.writer.pos, t, dl, dl.writer);
            return r;
        };
    },

    mGetXR: function DM_getxr() {
        'use strict';

        return Object.assign(Object.create(null), {
            update: function(b) {
                var ts = Date.now();
                if (b < 0) {
                    this.tb = Object.create(null);
                    this.st = 0;
                    return 0;
                }
                if (b) {
                    this.tb[ts] = this.tb[ts] ? this.tb[ts] + b : b;
                }
                b = 0;
                for (var t in this.tb) {
                    if (t < ts - this.window) {
                        delete this.tb[t];
                    }
                    else {
                        b += this.tb[t];
                    }
                }
                if (!b) {
                    this.st = 0;
                    return 0;
                }
                else if (!this.st) {
                    this.st = ts;
                }

                if (!(ts -= this.st)) {
                    return 0;
                }

                if (ts > this.window) {
                    ts = this.window;
                }

                return b / ts;
            },

            st: 0,
            window: 60000,
            tb: Object.create(null)
        });
    },

    _quotaPushBack: {},
    _dlQuotaListener: [],

    _onQuotaRetry: function DM_onQuotaRetry(getNewUrl, sid) {
        delay.cancel('overquota:retry');
        this.setUserFlags();

        var ids = dlmanager.getCurrentDownloads();
        // $('.limited-bandwidth-dialog .fm-dialog-close').trigger('click');

        if (d) {
            this.logger.debug('_onQuotaRetry', getNewUrl, ids, this._dlQuotaListener.length, this._dlQuotaListener);
        }

        if (this.onOverquotaWithAchievements) {
            closeDialog();
            topmenuUI();

            dlmanager._achievementsListDialog();
            delete this.onOverquotaWithAchievements;
            return;
        }

        if (this.isOverFreeQuota) {
            closeDialog();
            topmenuUI();

            if (sid) {
                this.isOverFreeQuota = sid;
            }
        }

        if (page === 'download') {
            $('.download.file-info').removeClass('overquota');
        }
        else {
            $('#' + ids.join(',#'))
                .addClass('transfer-queued')
                .find('.transfer-status')
                .removeClass('overquota')
                .text(l[7227]);
        }

        for (var i = 0; i < this._dlQuotaListener.length; ++i) {
            if (typeof this._dlQuotaListener[i] === "function") {
                this._dlQuotaListener[i]();
            }
        }
        this._dlQuotaListener = [];

        var tasks = [];

        for (var gid in this._quotaPushBack) {
            if (this._quotaPushBack.hasOwnProperty(gid)
                    && this._quotaPushBack[gid].onQueueDone) {

                tasks.push(this._quotaPushBack[gid]);
            }
        }
        this._quotaPushBack = {};

        this.logger.debug('_onQuotaRetry', tasks.length, tasks);

        if (getNewUrl && tasks.length) {
            var len = tasks.length;

            tasks.forEach(function(task) {
                var dl = task.task.download;

                dlmanager.newUrl(dl, function(rg) {
                    if (task.url) {
                        task.url = rg + "/" + task.url.replace(/.+\//, '');
                        dlmanager.dlQueuePushBack(task);
                    }

                    if (!--len) {
                        ids.forEach(fm_tfsresume);
                    }
                });
            });
        }
        else {
            tasks.forEach(this.dlQueuePushBack);
            ids.forEach(fm_tfsresume);
        }
    },

    _achievementsListDialog: function($dialog) {
        'use strict';

        if (d) {
            this.logger.info('_achievementsListDialog', this.onOverquotaWithAchievements, $dialog);
        }

        mega.achievem.achievementsListDialog(function() {
            dlmanager._onOverquotaDispatchRetry($dialog);
        });
    },

    _onOverquotaDispatchRetry: function($dialog) {
        'use strict';

        this.setUserFlags();

        if (d) {
            this.logger.info('_onOverquotaDispatchRetry', this.lmtUserFlags, $dialog);
        }

        if (this.onLimitedBandwidth) {
            // pre-warning dialog
            this.onLimitedBandwidth();
        }
        else {
            // from overquota dialog
            this._onQuotaRetry(true);
        }

        if ($dialog) {
            // update transfers buttons on the download page...
            this._overquotaClickListeners($dialog);
        }
    },

    _overquotaInfo: function() {

        api_req({a: 'uq', xfer: 1}, {
            callback: function(res) {
                if (typeof res === "number") {
                    // Error, just keep retrying
                    Soon(this._overquotaInfo.bind(this));
                    return;
                }

                if (this.uqFastTrack || (this.onOverQuotaProClicked && u_type)) {
                    // The user loged/registered in another tab, poll the uq command every
                    // 30 seconds until we find a pro status and then retry with fresh download

                    var proStatus = res.mxfer;
                    this.logger.debug('overquota:proStatus', proStatus);

                    if (proStatus) {
                        // Got PRO, resume dl inmediately.
                        return this._onQuotaRetry(true);
                    }

                    delay('overquota:uqft', this._overquotaInfo.bind(this), 30000);
                }

                var timeLeft = 3600;

                if (Object(res.tah).length) {
                    var add = 1;
                    var size = 0;

                    timeLeft = 3600 - ((res.bt | 0) % 3600);

                    for (var i = 0 ; i < res.tah.length; i++) {
                        size += res.tah[i];

                        if (res.tah[i]) {
                            add = 0;
                        }
                        else if (add) {
                            timeLeft += 3600;
                        }
                    }
                }

                clearInterval(this._overQuotaTimeLeftTick);
                delay('overquota:retry', this._onQuotaRetry.bind(this), timeLeft * 1000);

                var $dialog = $('.fm-dialog.limited-bandwidth-dialog');
                this._overquotaClickListeners($dialog);

                if ($dialog.is(':visible')) {
                    var $countdown = $dialog.find('.countdown').removeClass('hidden');
                    $countdown.safeHTML(secondsToTime(timeLeft, 1));

                    this._overQuotaTimeLeftTick =
                        setInterval(function() {
                            var time = secondsToTime(timeLeft--, 1);

                            if (time) {
                                $countdown.safeHTML(time);
                            }
                            else {
                                $countdown.text('');
                                clearInterval(dlmanager._overQuotaTimeLeftTick);
                            }
                        }, 1000);
                }
            }.bind(this)
        });
    },

    _overquotaClickListeners: function($dialog, flags, preWarning) {
        'use strict';

        var self = this;
        var closeDialog = function() {
            if ($.dialog === 'download-pre-warning') {
                $.dialog = 'was-pre-warning';
            }
            window.closeDialog();
        };
        var onclick = function onProClicked() {
            self.onOverQuotaProClicked = true;
            delay('overquota:uqft', self._overquotaInfo.bind(self), 30000);

            if ($(this).hasClass('reg-st3-membership-bl')) {
                open(getAppBaseUrl() + '#propay_' + $(this).data('payment'));
            }
            else {
                open(getAppBaseUrl() + '#pro');
            }

            api_req({a: 'log', e: 99640, m: 'on overquota pro-plans clicked'});
        };
        var getMoreBonusesListener = function() {
            closeDialog();

            if (flags & dlmanager.LMT_ISREGISTERED) {
                dlmanager._achievementsListDialog($dialog);

                api_req({a: 'log', e: 99641, m: 'on overquota get-more-bonuses clicked'});
            }
            else {
                api_req({a: 'log', e: 99642, m: 'on overquota register-for-bonuses clicked'});

                dlmanager.showRegisterDialog4ach($dialog, flags);
            }
        };

        flags = flags !== undefined ? flags : this.lmtUserFlags;

        if (preWarning) {
            $('.msg-overquota', $dialog).addClass('hidden');
            $('.msg-prewarning', $dialog).removeClass('hidden');

            $('.continue, .continue-download', $dialog)
                .removeAttr('style')
                .rebind('click', this.onLimitedBandwidth.bind(this));

            $('.upgrade', $dialog).rebind('click', function() {
                api_req({a: 'log', e: 99643, m: 'on overquota pre-warning upgrade clicked'});

                // closeDialog();

                // if (preWarning > 1) {
                //     loadingDialog.show();
                    open(getAppBaseUrl() + '#pro');
                    return false;
                // }
                //
                // dlmanager.showRegisterDialog4ach($dialog, flags);
            });

            $('.reg-st3-membership-bl', $dialog).rebind('click', function() {
                open(getAppBaseUrl() + '#propay_' + $(this).data('payment'));
                return false;
            });
        }
        else {
            $('.msg-overquota', $dialog).removeClass('hidden');
            $('.msg-prewarning', $dialog).addClass('hidden');

            $('.continue', $dialog).attr('style', 'display:none');

            $('.upgrade', $dialog).rebind('click', onclick);
            $dialog.find('.reg-st3-membership-bl').rebind('click', onclick);

            if (page === 'download') {
                var $dtb = $('.download.transfer-buttons');

                $('.create-account-button', $dtb).addClass('hidden').unbind('click');
                $('.get-more-bonuses', $dtb).addClass('hidden').unbind('click');

                if (flags & this.LMT_HASACHIEVEMENTS) {
                    if (flags & this.LMT_ISREGISTERED) {
                        $('.get-more-bonuses', $dtb)
                            .removeClass('hidden')
                            .rebind('click', getMoreBonusesListener);
                    }
                    else {
                        $('.create-account-button', $dtb)
                            .removeClass('hidden')
                            .rebind('click', getMoreBonusesListener);
                    }
                }

                $('.see-our-plans', $dtb).removeClass('hidden').rebind('click', onclick);
            }
        }

        $('.bottom-tips a', $dialog).rebind('click', function() {
            open(getAppBaseUrl() +
                '#help/client/webclient/cloud-drive/576ca738886688e7028b4599'
            );
        });

        if (flags & this.LMT_ISREGISTERED) {
            $dialog.addClass('registered');
        }
        else {
            var $oqbbl = $('.overquota-bott-bl', $dialog);

            var showOverQuotaRegisterDialog = function() {
                closeDialog();
                dlmanager.showOverQuotaRegisterDialog();
            };

            if (preWarning && !u_wasloggedin()) {
                api_req({a: 'log', e: 99646, m: 'on pre-warning not-logged-in'});
                $('.default-big-button.login', $oqbbl).addClass('hidden');
            }
            else {
                $('.default-big-button.login', $oqbbl).removeClass('hidden').rebind('click', function() {
                    api_req({a: 'log', e: 99644, m: 'on overquota login clicked'});
                    closeDialog();

                    mega.ui.showLoginRequiredDialog({
                            minUserType: 3,
                            skipInitialDialog: 1
                        })
                        .done(function() {
                            api_req({a: 'log', e: 99645, m: 'on overquota logged into account.'});
                            closeDialog();
                            topmenuUI();
                            dlmanager._onQuotaRetry(true);
                        })
                        .fail(showOverQuotaRegisterDialog);
                });
            }

            $('.default-big-button.create-account', $oqbbl).rebind('click', showOverQuotaRegisterDialog);
        }

        $dialog.addClass('hidden-bottom');
        if (flags & this.LMT_HASACHIEVEMENTS || $dialog.hasClass('gotEFQb')) {
            $dialog.removeClass('hidden-bottom');
        }
        else if (!(flags & this.LMT_ISREGISTERED)) {
            var $pan = $('.not-logged.no-achievements', $dialog);

            if ($pan.length && !$pan.hasClass('flag-pcset')) {
                $pan.addClass('flag-pcset');

                M.req('efqb').done(function(val) {
                    if (val) {
                        $dialog.removeClass('hidden-bottom').addClass('gotEFQb');
                        $pan.text(String($pan.text()).replace('10%', val + '%'));
                    }
                });
            }
        }

        if (flags & this.LMT_HASACHIEVEMENTS) {
            $dialog.addClass('achievements');
            localStorage.gotOverquotaWithAchievements = 1;
            $('.get-more-bonuses', $dialog).rebind('click', getMoreBonusesListener);
        }
    },

    _setOverQuotaState: function DM_setOverQuotaState(dlTask) {
        this.isOverQuota = true;
        localStorage.seenOverQuotaDialog = Date.now();
        this.logger.debug('_setOverQuotaState', dlTask);

        if (typeof dlTask === "function") {
            this._dlQuotaListener.push(dlTask);
        }
        else if (dlTask) {
            this._quotaPushBack[dlTask.gid] = dlTask;
        }

        this.getCurrentDownloads()
            .forEach(function(gid) {
                fm_tfspause(gid, true);
            });
    },

    showOverQuotaRegisterDialog: function DM_freeQuotaDialog(dlTask) {

        this._setOverQuotaState(dlTask);

        // did we get a sid from another tab? (watchdog:setsid)
        if (typeof this.isOverFreeQuota === 'string') {
            // Yup, delay a retry...
            return delay('overfreequota:retry', this._onQuotaRetry.bind(this, true), 1200);
        }
        this.isOverFreeQuota = true;

        if (localStorage.awaitingConfirmationAccount) {
            var accountData = JSON.parse(localStorage.awaitingConfirmationAccount);
            this.logger.debug('showOverQuotaRegisterDialog: awaitingConfirmationAccount!');
            return mega.ui.sendSignupLinkDialog(accountData);
        }

        api_req({a: 'log', e: 99613, m: 'on overquota register dialog shown'});

        mega.ui.showRegisterDialog({
            title: l[17],
            body: '<p>' + l[8834] + '</p><p>' + l[8833] + '</p><h2>' + l[1095] + '</h2>',

            onAccountCreated: function(gotLoggedIn, accountData) {
                if (gotLoggedIn) {
                    // dlmanager._onQuotaRetry(true);
                    dlmanager._onOverquotaDispatchRetry();

                    api_req({a: 'log', e: 99649, m: 'on overquota logged-in through register dialog.'});
                }
                else {
                    localStorage.awaitingConfirmationAccount = JSON.stringify(accountData);
                    mega.ui.sendSignupLinkDialog(accountData);

                    api_req({a: 'log', e: 99650, m: 'on overquota account created.'});
                }
            }
        });
    },

    /**
     * Wrapper around mega.ui.showRegisterDialog()
     * @param {jQuery} [$dialog]   The parent dialog
     * @param {Number} [flags]     Limitation flags
     */
    showRegisterDialog4ach: function DM_showRegisterDialog($dialog, flags) {
        'use strict';

        api_req({a: 'log', e: 99647, m: 'on overquota register-for-achievements dialog shown'});

        if (flags & this.LMT_HASACHIEVEMENTS) {
            this.onOverquotaWithAchievements = true;
        }

        mega.ui.showRegisterDialog({
            onAccountCreated: function(gotLoggedIn, accountData) {
                if (gotLoggedIn) {
                    dlmanager._onOverquotaDispatchRetry($dialog);
                }
                else {
                    localStorage.awaitingConfirmationAccount = JSON.stringify(accountData);
                    mega.ui.sendSignupLinkDialog(accountData);
                }
            },
            onDialogClosed: function() {
                if ($dialog) {
                    fm_showoverlay();
                    $dialog.removeClass('hidden')
                        .find('.fm-dialog-close')
                        .rebind('click.quota', closeDialog);
                }
                delete dlmanager.onOverquotaWithAchievements;
            }
        });
    },

    showLimitedBandwidthDialog: function(res, callback, flags) {
        var $dialog = $('.limited-bandwidth-dialog');

        loadingDialog.hide();
        this.onLimitedBandwidth = function() {
            if (callback) {
                $dialog.removeClass('registered achievements exceeded pro slider');
                $('.bottom-tips a', $dialog).unbind('click');
                $('.continue, .continue-download', $dialog).unbind('click');
                $('.upgrade, .reg-st3-membership-bl', $dialog).unbind('click');
                $('.get-more-bonuses', $dialog).unbind('click');
                if ($.dialog === 'download-pre-warning') {
                    $.dialog = false;
                }
                closeDialog();
                Soon(callback);
                callback = $dialog = undefined;
            }
            delete this.onLimitedBandwidth;
        };

        $('.fm-dialog:visible, .overlay:visible').addClass('arrange-to-back');
        flags = flags !== undefined ? flags : this.lmtUserFlags;

        if (d) {
            // as per ticket 6446
            // /* 01 */ flags = this.LMT_ISREGISTERED | this.LMT_HASACHIEVEMENTS;
            // /* 02 */ flags = this.LMT_HASACHIEVEMENTS;
            // /* 03 */ flags = 0;
            // /* 04 */ flags = this.LMT_ISREGISTERED;

            this.lmtUserFlags = flags;
        }

        api_req({a: 'log', e: 99617, m: 'overquota pre-warning shown.'});

        uiCheckboxes($dialog, 'ignoreLimitedBandwidth');
        this._overquotaClickListeners($dialog, flags, res || true);

        M.safeShowDialog('download-pre-warning', $dialog);
    },

    showOverQuotaDialog: function DM_quotaDialog(dlTask, flags) {
        'use strict';

        flags = flags !== undefined ? flags : this.lmtUserFlags;

        if (d) {
            // as per ticket 6446
            // /* 05 */ flags = this.LMT_ISREGISTERED | this.LMT_HASACHIEVEMENTS;
            // /* 06 */ flags = this.LMT_HASACHIEVEMENTS;
            // /* 07 */ flags = 0;
            // /* 08 */ flags = this.LMT_ISREGISTERED;
            // /* 09 */ flags = this.LMT_ISREGISTERED | this.LMT_ISPRO | this.LMT_HASACHIEVEMENTS;
            // /* 10 */ flags = this.LMT_ISREGISTERED | this.LMT_ISPRO;

            this.lmtUserFlags = flags;
        }

        if (this.efq && !(flags & this.LMT_ISREGISTERED)) {
            return this.showOverQuotaRegisterDialog(dlTask);
        }
        loadingDialog.hide();

        var asyncTaskID = false;
        var $dialog = $('.fm-dialog.limited-bandwidth-dialog');

        this._setOverQuotaState(dlTask);

        if ($dialog.is(':visible')) {
            this.logger.info('showOverQuotaDialog', 'visible already.');
            return;
        }

        if ($('.fm-dialog.achievements-list-dialog').is(':visible')) {
            this.logger.info('showOverQuotaDialog', 'Achievements dialog visible.');
            return;
        }

        $('.fm-dialog:visible, .overlay:visible').addClass('arrange-to-back');
        $dialog
            .removeClass('registered achievements exceeded pro slider')
            .find('.transfer-overquota-txt')
            .safeHTML(l[7100].replace('%1', '<span class="hidden countdown"></span>'))
            .end();

        if (flags & this.LMT_ISPRO) {
            $dialog.addClass('pro');

            asyncTaskID = 'mOverQuota.' + makeUUID();

            if (M.account) {
                // Force data retrieval from API
                M.account.lastupdate = 0;
            }
            M.accountData(function(account) {
                var tfsQuotaLimit = bytesToSize(account.bw, 0).split(' ');
                var tfsQuotaUsed = (account.downbw_used + account.servbw_used);
                var perc = Math.min(100, Math.ceil(tfsQuotaUsed * 100 / account.bw));

                $('.chart.data .size-txt', $dialog).text(bytesToSize(tfsQuotaUsed, 0));
                $('.chart.data .pecents-txt', $dialog).text(tfsQuotaLimit[0]);
                $('.chart.data .gb-txt', $dialog).text(tfsQuotaLimit[1]);
                $('.fm-account-blocks.bandwidth', $dialog).removeClass('no-percs');
                $('.chart.data .perc-txt', $dialog).text(perc + '%');

                // if they granted quota to other users
                if (account.servbw_limit > 0) {
                    $dialog.addClass('slider');

                    $('.bandwidth-slider', $dialog).slider({
                        min: 0, max: 100, range: 'min', value: account.servbw_limit,
                        change: function(e, ui) {
                            if (ui.value < account.servbw_limit) {
                                // retry download if less quota was chosen...
                                loadingDialog.show();
                                M.req({a: 'up', srvratio: ui.value})
                                    .always(function() {
                                        loadingDialog.hide();
                                        dlmanager._onQuotaRetry(true);
                                    });
                            }
                        }
                    });
                }

                mBroadcaster.sendMessage(asyncTaskID);
                asyncTaskID = null;
            });
        }

        M.safeShowDialog('download-overquota', function() {
            var doCloseModal = function closeModal() {
                clearInterval(dlmanager._overQuotaTimeLeftTick);
                $('.fm-dialog-overlay').unbind('click.dloverq');
                $dialog.unbind('dialog-closed');
                closeDialog();
            $('.fm-dialog.arrange-to-back, .overlay.arrange-to-back')
                .removeClass('arrange-to-back');
                return false;
            };
            dlmanager._overquotaInfo();
            dlmanager._overquotaClickListeners($dialog, flags);

            $('.fm-dialog-overlay').rebind('click.dloverq', doCloseModal);

            $dialog
                .addClass('exceeded')
                .removeClass('hidden')
                .rebind('dialog-closed', doCloseModal)
                .find('.fm-dialog-close')
                .rebind('click.quota', doCloseModal);

            api_req({a: 'log', e: 99648, m: 'on overquota dialog shown'});

            if (asyncTaskID) {
                loadingDialog.show();
                mBroadcaster.once(asyncTaskID, function() {
                    loadingDialog.hide();
                });
            }

            return $dialog;
        });
    },

    getCurrentDownloads: function() {
        return array.unique(dl_queue.filter(isQueueActive).map(dlmanager.getGID));
    },

    getCurrentDownloadsSize: function(sri) {
        var size = 0;

        dl_queue
            .filter(isQueueActive)
            .map(function(dl) {
                size += dl.size;

                if (sri) {
                    // Subtract resume info

                    if (dl.byteOffset) {
                        size -= dl.byteOffset;
                    }
                }
            });

        return size;
    },

    getQBQData: function() {
        'use strict';

        var q = {p: [], n: [], s: 0};

        dl_queue
            .filter(isQueueActive)
            .map(function(dl) {
                if (!dl.loaded || dl.size - dl.loaded) {
                    if (dl.ph) {
                        q.p.push(dl.ph);
                    }
                    else {
                        q.n.push(dl.id);
                    }

                    if (dl.loaded) {
                        q.s += dl.loaded;
                    }
                }
            });

        return q;
    },

    /**
     * Check whether MEGAsync is running.
     *
     * @param {String}  minVersion      The min MEGAsync version required.
     * @param {Boolean} getVersionInfo  Do not reject the promise if the min version is not
     *                                  meet, instead resolve it providing an ERANGE result.
     * @return {MegaPromise}
     */
    isMEGAsyncRunning: function(minVersion, getVersionInfo) {
        var timeout = 200;
        var logger = this.logger;
        var promise = new MegaPromise();

        var resolve = function() {
            if (promise) {
                loadingDialog.hide();
                logger.debug('isMEGAsyncRunning: YUP', arguments);

                promise.resolve.apply(promise, arguments);
                promise = undefined;
            }
        };
        var reject = function(e) {
            if (promise) {
                loadingDialog.hide();
                logger.debug('isMEGAsyncRunning: NOPE', e);

                promise.reject.apply(promise, arguments);
                promise = undefined;
            }
        };
        var loader = function() {
            if (typeof megasync === 'undefined') {
                return reject(EACCESS);
            }
            megasync.isInstalled(function(err, is) {
                if (err || !is) {
                    reject(err || ENOENT);
                }
                else {
                    var verNotMeet = false;

                    // if a min version is required, check for it
                    if (minVersion) {
                        var runningVersion = M.vtol(is.v);

                        if (typeof minVersion !== 'number'
                                || parseInt(minVersion) !== minVersion) {

                            minVersion = M.vtol(minVersion);
                        }

                        if (runningVersion < minVersion) {
                            if (!getVersionInfo) {
                                return reject(ERANGE);
                            }

                            verNotMeet = ERANGE;
                        }
                    }

                    var syncData = clone(is);
                    syncData.verNotMeet = verNotMeet;

                    resolve(megasync, syncData);
                }
            });
        };

        loadingDialog.show();
        logger.debug('isMEGAsyncRunning: checking...');

        if (typeof megasync === 'undefined') {
            timeout = 4000;
            M.require('megasync_js').always(loader);
        }
        else {
            loader();
        }

        setTimeout(reject, timeout);

        return promise;
    }
};

/** @name dlmanager.LMT_ISPRO */
/** @name dlmanager.LMT_ISREGISTERED */
/** @name dlmanager.LMT_HASACHIEVEMENTS */
makeEnum(['ISREGISTERED', 'ISPRO', 'HASACHIEVEMENTS'], 'LMT_', dlmanager);

// TODO: move the next functions to fm.js when no possible conflicts
function fm_tfsorderupd() {
    M.t = {};
    $('.transfer-table tr[id]:visible').each(function(pos, node) {
        var t = String(node.id).split('_').shift();
        if (['ul', 'dl', 'zip', 'LOCKed'].indexOf(t) === -1) {
            dlmanager.logger.error('fm_tfsorderupd', 'Unexpected node id: ' + node.id);
        }

        // if (t !== 'LOCKed') {
            M.t[pos] = node.id;
            M.t[node.id] = pos;
        // }
    });
    if (d) {
        dlmanager.logger.info('M.t', M.t);
    }
    return M.t;
}

function fm_tfspause(gid, overquota) {
    if (ASSERT(typeof gid === 'string' && "zdu".indexOf(gid[0]) !== -1, 'Ivalid GID to pause')) {
        if (gid[0] === 'u') {
            ulQueue.pause(gid);
        }
        else {
            dlQueue.pause(gid);
        }

        if (page === 'download') {
            if (overquota === true) {
                setTransferStatus(gid, l[1673]);
                $('.download.file-info').addClass('overquota');
            }
            $('.download .pause-transfer span').text(l[9118]);
            $('.download.scroll-block').addClass('paused');
            $('.download.eta-block span').text('');
            $('.download.speed-block .dark-numbers').text('');
            $('.download.speed-block .light-txt').text(l[1651]).addClass('small');
        }
        else {
            var $tr = $('.transfer-table tr#' + gid);

            if ($tr.hasClass('transfer-started')) {
                $tr.find('.eta').text('').addClass('unknown');
                $tr.find('.speed').text(l[1651]).addClass('unknown');
            }
            $tr.addClass('transfer-paused');
            $tr.removeClass('transfer-started');

            if (overquota === true) {
                $tr.addClass('transfer-error');
                $tr.find('.transfer-status').addClass('overquota').text(l[1673]);
            }
            else {
                $tr.addClass('transfer-queued');
                $tr.removeClass('transfer-error');
                $tr.find('.transfer-status').text(l[7227]);
            }

            if (fminitialized) {
                // FIXME: do not rely on cached DOM nodes and just queue the paused state for transfers
                mega.ui.tpp.pause(gid, gid[0] === 'u' ? 'ul' : 'dl');
            }
        }
        return true;
    }
    return false;
}

function fm_tfsresume(gid) {
    if (ASSERT(typeof gid === 'string' && "zdu".indexOf(gid[0]) !== -1, 'Invalid GID to resume')) {
        if (gid[0] === 'u') {
            ulQueue.resume(gid);

            if (page !== 'download') {
                mega.ui.tpp.resume(gid, 'ul');
            }
        }
        else {
            var $tr = $('.transfer-table tr#' + gid);

            if (page === 'download'
                    && $('.download.file-info').hasClass('overquota')
                    || $tr.find('.transfer-status').hasClass('overquota')) {

                if (page === 'download') {
                    $('.download .pause-transfer').addClass('active');
                    $('.download.scroll-block').addClass('paused');
                }

                if (dlmanager.isOverFreeQuota) {
                    return dlmanager.showOverQuotaRegisterDialog();
                }

                return dlmanager.showOverQuotaDialog();
            }
            dlQueue.resume(gid);

            if (page !== 'download') {
                mega.ui.tpp.resume(gid, 'dl');
            }

            if (page === 'download') {
                $('.download .pause-transfer span').text(l[9112]);
                $('.download.scroll-block').removeClass('paused');
                $('.download.speed-block .light-txt').text('').removeClass('small');
            }
            else {
                $tr.removeClass('transfer-paused');

                if (!$('.transfer-table tr.transfer-started, .transfer-table tr.transfer-initiliazing').length) {

                    $tr.addClass('transfer-initiliazing')
                        .find('.transfer-status').text(l[1042]);
                }
                else {
                    $tr.find('.speed, .eta').removeClass('unknown').text('');
                }
            }
        }
        return true;
    }
    return false;
}

function fm_tfsmove(gid, dir) { // -1:up, 1:down
    /* jshint -W074 */
    var tfs = $('#' + gid);
    var to;
    var act;
    var p1;
    var p2;
    var i;
    var x;
    var mng;
    gid = String(gid);
    mng = gid[0] === 'u' ? ulmanager : dlmanager;
    if (tfs.length !== 1) {
        mng.logger.warn('Invalid transfer node', gid, tfs);
        return;
    }

    if (!GlobalProgress[gid] || GlobalProgress[gid].working.length) {
        mng.logger.warn('Invalid transfer state', gid);
        return;
    }

    if (dir !== -1) {
        to = tfs.next();
        act = 'after';
    }
    else {
        to = tfs.prev();
        act = 'before';
    }

    var id = to && to.attr('id') || 'x';

    if (!GlobalProgress[id] || GlobalProgress[id].working.length) {
        if (id !== 'x') {
            mng.logger.warn('Invalid [to] transfer state', gid, id, to);
        }
        return;
    }

    if (id[0] === gid[0] || "zdz".indexOf(id[0] + gid[0]) !== -1) {
        to[act](tfs);
    }
    else {
        if (d) {
            dlmanager.logger.error('Unable to move ' + gid);
        }
        return;
    }

    fm_tfsorderupd();

    var m_prop;
    var m_queue;
    var mQueue = [];
    if (gid[0] === 'z' || id[0] === 'z') {
        var p = 0;
        var trick = Object.keys(M.t).map(Number).filter(function(n) {
                        return !isNaN(n) && M.t[n][0] !== 'u';
                    });
        for (i in trick) {
            if (trick.hasOwnProperty(i)) {
                ASSERT(i === trick[i] && M.t[i], 'Oops..');
                var mQ = dlQueue.slurp(M.t[i]);
                for (x in mQ) {
                    if (mQ.hasOwnProperty(x)) {
                        (dl_queue[p] = mQ[x][0].dl).pos = p;
                        ++p;
                    }
                }
                mQueue = mQueue.concat(mQ);
            }
        }
        // we should probably fix our Array inheritance
        for (var j = p, len = dl_queue.length; j < len; ++j) {
            delete dl_queue[j];
        }
        dl_queue.length = p;
        dlQueue._queue = mQueue;
        return;
    }

    if (gid[0] === 'u') {
        m_prop = 'ul';
        mQueue = ulQueue._queue;
        m_queue = ul_queue;
    }
    else {
        m_prop = 'dl';
        mQueue = dlQueue._queue;
        m_queue = dl_queue;
    }
    var t_queue = m_queue.filter(isQueueActive);
    if (t_queue.length !== m_queue.length) {
        var m = t_queue.length;
        i = 0;
        while (i < m) {
            (m_queue[i] = t_queue[i]).pos = i;
            ++i;
        }
        m_queue.length = i;
        while (m_queue[i]) {
            delete m_queue[i++];
        }
    }
    for (i in mQueue) {
        if (mQueue[i][0][gid]) {
            var tmp = mQueue[i];
            var m_q = tmp[0][m_prop];
            p1 = Number(i) + dir;
            p2 = m_q.pos;
            tmp[0][m_prop].pos = mQueue[p1][0][m_prop].pos;
            mQueue[p1][0][m_prop].pos = p2;
            mQueue[i] = mQueue[p1];
            mQueue[p1] = tmp;
            p1 = m_queue.indexOf(m_q);
            tmp = m_queue[p1];
            m_queue[p1] = m_queue[p1 + dir];
            m_queue[p1 + dir] = tmp;
            ASSERT(m_queue[p1].pos === mQueue[i][0][m_prop].pos, 'Huh, move sync error..');
            break;
        }
    }
}

function fm_tfsupdate() {
    var i = 0;
    var u = 0;

    var tfse = M.getTransferElements();
    if (!tfse) {
        return false;
    }
    var domTable = tfse.domTable;

    var domCompleted = domTable.querySelectorAll('tr.transfer-completed');
    var completedLen = domCompleted.length;
    if (completedLen) {
        var ttl    = M.getTransferTableLengths();
        var parent = domCompleted[0].parentNode;

        if (completedLen + 4 > ttl.size || M.pendingTransfers > 50 + ttl.used * 4) {
            // Remove completed transfers filling the whole table
            while (completedLen--) {
                parent.removeChild(domCompleted[completedLen]);
            }
            mBroadcaster.sendMessage('tfs-dynlist-flush');
        }
        else {
            // Move completed transfers to the bottom
            while (completedLen--) {
                parent.appendChild(domCompleted[completedLen]);
            }
        }
    }
    if ($.transferHeader) {
        $.transferHeader(tfse);
    }

    /*$('.transfer-table span.row-number').each(function() {
        var $this = $(this);
        $this.text(++i);
        if ($this.closest('tr').find('.transfer-type.upload').length) {
            ++u;
        }
    });*/
    var $trs = domTable.querySelectorAll('tr:not(.transfer-completed)');
    i = $trs.length;
    while (i--) {
        if ($trs[i].classList.contains('transfer-upload')) {
            ++u;
        }
    }
    i = $trs.length - u;
    for (var k in M.tfsdomqueue) {
        if (k[0] === 'u') {
            ++u;
        }
        else {
            ++i;
        }
    }

    M.pendingTransfers = i + u;
    var t;
    if (i && u) {
        t = '\u2191 ' + u + ' \u2193 ' + i;
    }
    else if (i) {
        t =  '\u2193 ' + i;
    }
    else if (u) {
        t = '\u2191 ' + u;
    }
    else {
        t = '';
        mega.ui.tpp.hide();
    }
    tfse.domPanelTitle.textContent = (t);
}

var dlQueue = new TransferQueue(function _downloader(task, done) {
    if (!task.dl) {
        dlQueue.logger.info('Skipping frozen task ' + task);
        return done();
    }
    return task.run(done);
}, 4, 'downloader');

// chunk scheduler
dlQueue.validateTask = function(pzTask) {
    var r = pzTask instanceof ClassChunk || pzTask instanceof ClassEmptyChunk;

    if (!r && pzTask instanceof ClassFile && !dlmanager.fetchingFile) {
        var j = this._queue.length;
        while (j--) {
            if (this._queue[j][0] instanceof ClassChunk) {
                break;
            }
        }

        if ((r = (j === -1)) && $.len(this._qpaused)) {
            fm_tfsorderupd();

            // About to start a new download, check if a previously paused dl was resumed.
            var p1 = M.t[pzTask.gid];
            for (var i = 0; i < p1; ++i) {
                var gid = M.t[i];
                if (this._qpaused[gid] && this.dispatch(gid)) {
                    return -0xBEEF;
                }
            }
        }
    }
    return r;
};

/**
 *  DownloadQueue
 *
 *  Array extension to override push, so we can easily
 *  kick up the download (or queue it) without modifying the
 *  caller codes
 */
function DownloadQueue() {}
inherits(DownloadQueue, Array);

DownloadQueue.prototype.push = function() {
    var pos = Array.prototype.push.apply(this, arguments);
    var id = pos - 1;
    var dl = this[id];
    var dl_id = dl.ph || dl.id;
    var dl_key = dl.key;
    var dlIO;

    if (dl.zipid) {
        if (!Zips[dl.zipid]) {
            Zips[dl.zipid] = new ZipWriter(dl.zipid, dl);
        }
        dlIO = Zips[dl.zipid].addEntryFile(dl);
    }
    else {
        if (dl.preview || Math.min(MemoryIO.fileSizeLimit, 90 * 1048576) > dl.size) {
            dlIO = new MemoryIO(dl_id, dl);
        }
        else {
            dlIO = new dlMethod(dl_id, dl);
        }
    }

    dl.aes = new sjcl.cipher.aes([
        dl_key[0] ^ dl_key[4],
        dl_key[1] ^ dl_key[5],
        dl_key[2] ^ dl_key[6],
        dl_key[3] ^ dl_key[7]
    ]);
    dl.nonce = JSON.stringify([
        dl_key[0] ^ dl_key[4],
        dl_key[1] ^ dl_key[5],
        dl_key[2] ^ dl_key[6],
        dl_key[3] ^ dl_key[7], dl_key[4], dl_key[5]
    ]);

    dl.pos = id; // download position in the queue
    dl.dl_id = dl_id; // download id
    dl.io = dlIO;
    // Use IO object to keep in track of progress
    // and speed
    dl.io.progress = 0;
    dl.io.size = dl.size;
    dl.decrypter = 0;
    dl.n = M.getSafeName(dl.n);

    if (!dl.zipid) {
        dlmanager.dlWriter(dl);
    }
    else {
        dl.writer = dlIO;
    }
    Object.defineProperty(dl, 'hasResumeSupport', {value: dl.io.hasResumeSupport});

    dl.macs = Object.create(null);

    dlQueue.push(new ClassFile(dl));

    return pos;
};

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

if (localStorage.dlMethod) {
    dlMethod = window[localStorage.dlMethod];
}
else if (is_chrome_firefox & 4) {
    dlMethod = FirefoxIO;
}
else if (window.requestFileSystem) {
    dlMethod = FileSystemAPI;
}
else if (MemoryIO.usable()) {
    dlMethod = MemoryIO;
}
else {
    dlMethod = FlashIO;
}

if (typeof dlMethod.init === 'function') {
    dlMethod.init();
}

var dl_queue = new DownloadQueue();

if (is_mobile) {
    dlmanager.ioThrottleLimit = 2;
    dlmanager.dlMaxChunkSize = 4 * 1048576;
    dlMethod = MemoryIO;
}

mBroadcaster.once('startMega', function() {
    'use strict';

    M.onFileManagerReady(true, function() {
        var prefix = dlmanager.resumeInfoTag + u_handle;

        // automatically resume transfers on fm initialization
        M.getPersistentDataEntries(prefix)
            .done(function(entries) {
                entries = entries.map(function(entry) {
                    return entry.substr(prefix.length);
                });

                dbfetch.geta(entries)
                    .always(function() {
                        for (var i = entries.length; i--;) {
                            if (!M.d[entries[i]]) {
                                entries.splice(i, 1);
                            }
                        }

                        if (entries.length) {
                            var $dialog = $('.fm-dialog.resume-transfer');

                            $('.fm-dialog-close, .cancel', $dialog).rebind('click', function() {
                                closeDialog();

                                for (var i = entries.length; i--;) {
                                    M.delPersistentData(prefix + entries[i]);
                                }
                            });

                            $('.big-button.red', $dialog).rebind('click', function() {
                                if (d) {
                                    dlmanager.logger.info('Resuming transfers...', entries);
                                }

                                closeDialog();
                                M.addDownload(entries);
                            });

                            M.safeShowDialog('resume-transfer', $dialog);
                        }
                    });
            });
    });
});
