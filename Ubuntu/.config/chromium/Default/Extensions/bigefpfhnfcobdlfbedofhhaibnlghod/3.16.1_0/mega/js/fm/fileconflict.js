(function _fileconflict(global) {
    'use strict';

    var keepBothState = Object.create(null);
    var saveKeepBothState = function(target, node, name) {
        if (!keepBothState[target]) {
            keepBothState[target] = Object.create(null);
        }
        keepBothState[target][name] = node;
    };

    var ns = {
        /**
         * Check files against conflicts
         * @param {Array} files An array of files to check for conflicts
         * @param {String} target The target node handle
         * @param {String} op Operation, one of copy, move, or upload
         * @param {Number} [defaultAction] The optional default action to perform
         * @returns {MegaPromise} Resolves with a non-conflicting array
         * @memberof fileconflict
         */
        check: function(files, target, op, defaultAction) {
            var noFileConflicts = !!localStorage.noFileConflicts;
            var promise = new MegaPromise();
            var conflicts = [];
            var result = [];

            var setName = function(file, name) {
                try {
                    Object.defineProperty(file, 'name', {
                        writable: true,
                        configurable: true,
                        value: M.getSafeName(name)
                    });
                }
                catch (e) {}
            };

            for (var i = files.length; i--;) {
                var file = files[i];

                if (typeof file === 'string') {
                    file = clone(M.d[file] || false);
                }

                if (!file) {
                    console.warn('Got invalid file...');
                    continue;
                }

                try {
                    // this could throw NS_ERROR_FILE_NOT_FOUND
                    var test = file.size;
                }
                catch (ex) {
                    ulmanager.logger.warn(file.name, ex);
                    continue;
                }

                var found = null;
                var nodeTarget = file.target || target;
                var nodeName = M.getSafeName(file.name);

                if (M.c[nodeTarget] && !file.t) {
                    found = this.getNodeByName(nodeTarget, nodeName, true);
                }

                if (!found) {
                    found = this.locateFileInUploadQueue(nodeTarget, nodeName);
                }

                if (found && !noFileConflicts) {
                    conflicts.push([file, found]);
                }
                else {
                    setName(file, nodeName);
                    result.push(file);
                }
            }

            var resolve = function() {
                keepBothState = Object.create(null);
                result.fileConflictChecked = true;
                promise.resolve(result);
            };

            if (conflicts.length) {
                var repeat;
                var self = this;
                var save = function(file, name, action, node) {
                    if (file) {
                        setName(file, name);

                        result.push(file);

                        if (action === ns.REPLACE) {
                            file._replaces = node.h;
                        }
                    }
                    saveKeepBothState(target, node, name);
                };

                switch (defaultAction) {
                    case ns.REPLACE:
                    case ns.DONTCOPY:
                    case ns.KEEPBOTH:
                        repeat = defaultAction;
                }

                (function _prompt(a) {
                    var file = a.pop();

                    if (file) {
                        var node = file[1];
                        file = file[0];

                        if (repeat) {
                            var name = file.name;

                            switch (repeat) {
                                case ns.DONTCOPY:
                                    break;
                                case ns.KEEPBOTH:
                                    name = self.findNewName(name, target);
                                /* fallthrough */
                                case ns.REPLACE:
                                    save(file, name, repeat, node);
                                    break;
                            }
                            _prompt(a);
                        }
                        else {
                            self.prompt(op, file, node, a.length, target)
                                .always(function(file, name, action, checked) {
                                    if (file === -0xBADF) {
                                        result = [];
                                        resolve();
                                    }
                                    else {
                                        if (checked) {
                                            repeat = action;
                                        }
                                        save(file, name, action, node);

                                        _prompt(a);
                                    }
                                });
                        }
                    }
                    else {
                        resolve();
                    }

                })(conflicts);
            }
            else {
                resolve();
            }

            return promise;
        },

        /**
         * Prompt duplicates/fileconflict dialog.
         * @param {String} op Operation, one of copy, move, or upload
         * @param {Object} file The source file
         * @param {Object} node The existing node
         * @param {Number} remaining The remaining conflicts
         * @returns {MegaPromise}
         */
        prompt: function(op, file, node, remaining, target) {
            var promise = new MegaPromise();
            var $dialog = $('.fm-dialog.duplicate-conflict');
            var name = M.getSafeName(file.name);

            $('.info-txt-fn', $dialog).safeHTML(escapeHTML(l[16486]).replace('%1', '<strong>' + name + '</strong>'));

            var $a1 = $('.action-block.a1', $dialog);
            var $a2 = $('.action-block.a2', $dialog);
            var $a3 = $('.action-block.a3', $dialog);

            switch (op) {
                case 'copy':
                    $('.red-header', $a1).text(l[16496]);
                    $('.red-header', $a2).text(l[16500]);
                    $('.red-header', $a3).text(l[17095]);
                    $('.light-grey', $a1).text(l[16498]);
                    $('.light-grey', $a3).text(l[16515]);
                    break;
                case 'move':
                    $('.red-header', $a1).text(l[16495]);
                    $('.red-header', $a2).text(l[16499]);
                    $('.red-header', $a3).text(l[17096]);
                    $('.light-grey', $a1).text(l[16497]);
                    $('.light-grey', $a3).text(l[16514]);
                    break;
                case 'upload':
                    $('.red-header', $a1).text(l[17093]);
                    $('.red-header', $a2).text(l[16490]);
                    $('.red-header', $a3).text(l[17094]);
                    //FIXME: the following link needs to update once there is a help link regarding file versioning.
                    var link = "https://mega.nz/help/client/webclient/";
                    $('.light-grey', $a1).html(
                        escapeHTML(l[17097])
                        .replace(
                        '[A]', '<a id = "versionhelp"\n' +
                        'href="' + link + '" target="_blank" class="red">')
                        .replace('[/A]', '</a>'));
                    $('.light-grey', $a3).text(l[16493]);
                    break;
            }

            $('.file-name', $a1).text(name);
            $('.file-size', $a1).text(bytesToSize(file.size || file.s));
            $('.file-date', $a1).text(time2date(file.mtime || file.ts || (file.lastModified / 1000), 2));

            $('.file-name', $a2).text(node.name);
            $('.file-size', $a2).text(bytesToSize(node.size || node.s));
            $('.file-date', $a2).text(time2date(node.mtime || node.ts, 2));

            $('.file-name', $a3).text(this.findNewName(file.name, target));

            var done = function(file, name, action) {
                closeDialog();
                promise.resolve(file, name, action, $('#duplicates-checkbox').attr('checked'));
            };

            $a1.rebind('click', function() {
                done(file, $('.file-name', this).text(), ns.REPLACE);
            });
            $a2.rebind('click', function() {
                done(null, 0, ns.DONTCOPY);
            });
            $a3.rebind('click', function() {
                done(file, $('.file-name', this).text(), ns.KEEPBOTH);
            });

            $('#versionhelp').rebind('click', function(ev) {
                ev.stopPropagation();
                ev.preventDefault();
                window.open(this.href, '_blank');
            });
            $('.skip-button', $dialog).rebind('click', function() {
                done(null, 0, ns.DONTCOPY);
            });
            $('.cancel-button, .fm-dialog-close', $dialog).rebind('click', function() {
                done(-0xBADF);
            });

            $('#duplicates-checkbox', $dialog)
                .switchClass('checkboxOn', 'checkboxOff')
                .parent()
                .switchClass('checkboxOn', 'checkboxOff');

            var $chk = $('.bottom-checkbox', $dialog).addClass('hidden');

            if (remaining) {
                $chk.removeClass('hidden')
                    .find('.radio-txt')
                    .safeHTML(escapeHTML(l[16494]).replace('[S]2[/S]', '<span>' + remaining + '</span>'));
            }

            uiCheckboxes($dialog);
            M.safeShowDialog('fileconflict-dialog', $dialog);

            return promise;
        },

        /**
         * Given a filename, create a new one appending (1)..(n) as needed.
         * @param {String} oldName The old file name
         * @returns {String}
         */
        getNewName: function(oldName) {
            var newName;
            var idx = oldName.match(/\((\d+)\)(?:\..*?)?$/);

            if (idx) {
                idx = idx[1] | 0;

                newName = oldName.replace('(' + (idx++) + ')', '(' + idx + ')');
            }
            else {
                newName = oldName.split('.');

                if (newName.length > 1) {
                    var ext = newName.pop();
                    newName = newName.join('.') + ' (1).' + ext;
                }
                else {
                    newName += ' (1)';
                }
            }

            return newName;
        },

        /**
         * Find new name
         * @param {String} name The old file name
         * @param {String} target The target to lookup at
         * @returns {String}
         */
        findNewName: function(name, target) {
            var newName = name;

            do {
                newName = this.getNewName(newName);
            } while (this.getNodeByName(target, newName));

            return newName;
        },

        /**
         * Find node by name.
         * @param {String} target The target to lookup at
         * @param {String} name The name to check against
         * @param {Boolean} [matchSingle] only return a single matching node
         * @returns {Object} The found node
         */
        getNodeByName: function(target, name, matchSingle) {
            var res;

            if (keepBothState[target] && keepBothState[target][name]) {
                return keepBothState[target][name];
            }

            for (var h in M.c[target]) {
                var n = M.d[h] || false;

                if (n.name === name) {

                    if (!matchSingle) {
                        return n;
                    }

                    if (res) {
                        return null;
                    }
                    res = n;
                }
            }

            return res;
        },

        /**
         * Locate file in the upload queue
         * @param {String} target The target to lookup at
         * @param {String} name The name to check against
         * @returns {Object} The queue entry found
         */
        locateFileInUploadQueue: function(target, name) {
            for (var i = ul_queue.length; i--;) {
                var q = ul_queue[i] || false;

                if (q.target === target && q.name === name) {
                    return q;
                }
            }
        },

        REPLACE: 1,
        DONTCOPY: 2,
        KEEPBOTH: 3
    };

    Object.defineProperty(global, 'fileconflict', {value: ns});

})(this);
