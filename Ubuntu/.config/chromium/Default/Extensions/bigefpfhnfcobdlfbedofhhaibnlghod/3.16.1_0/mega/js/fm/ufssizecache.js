/**
 * UFS Size Cache handling.
 */
function UFSSizeCache() {
    // handle[d, f, b, parent, td, tf, tb]
    this.cache = Object.create(null);
}

// add node n to the folders cache
// assumptions:
// - if n.p is set, n.t is 0 or 1
// - if n.t is 0, n.s is always set
// - if n.t is 1, n.s is never set or set and != 0
UFSSizeCache.prototype.feednode = function(n) {

    if (n.p) {
        if (!this.cache[n.p]) {
            // create previously unknown parent
            this.cache[n.p] = [n.t, 1 - n.t, n.s || 0, false, 0, 0, 0, 0, 0, 0];
        }
        else {
            // update known parent
            if (n.fv) { // this is a versioned file.
                this.cache[n.p][7]++;
                this.cache[n.p][8] += n.s;
            }
            else {
                this.cache[n.p][1 - n.t]++;
                if (n.s) {
                    this.cache[n.p][2] += n.s;
                }
            }
        }

        // record parent linkage
        if (!this.cache[n.h]) {
            if (n.fv) {
                this.cache[n.h] = [0, 0, 0, n.p, 0, 0, 0, 0, 0, 1];
            } else {
                this.cache[n.h] = [0, 0, 0, n.p, 0, 0, 0, 0, 0, 0];
            }
        }
        else {
            this.cache[n.h][3] = n.p;
        }
    }
};

// compute td / tf / tb for all folders
UFSSizeCache.prototype.sum = function() {
    for (var h in this.cache) {
        var p = h;

        do {
            this.cache[p][4] += this.cache[h][0];
            if (this.cache[p][9]) {
                this.cache[p][7] +=  this.cache[h][1];
                this.cache[p][8] +=  this.cache[h][2];
            }
            else {
                this.cache[p][5] +=  this.cache[h][1];
                this.cache[p][6] +=  this.cache[h][2];
            }
        } while ((p = this.cache[p][3]));
    }
};

// Save computed td / tf / tb / tvf /tvb for all folders
// if no root node is provided, cache is a full cloud tree
UFSSizeCache.prototype.save = function(rootNode) {
    this.sum();

    if (d) {
        console.debug('ufsc.save(%s)', rootNode ? rootNode.h : 'undef', rootNode, this);
    }

    for (var h in this.cache) {
        var n = M.d[h];
        if (n) {
            if (rootNode && !this.cache[h][3] && !n.su) {
                if (rootNode.p !== h) {
                    srvlog('UFSSizeCache Error 0xBADF', null, true);
                    console.warn('Uh..oh... internal error, try menu->reload', rootNode.p, h, this.cache[h]);
                    if (d > 1) debugger
                }
                // continue;
            }

            n.td = (n.td || 0) + this.cache[h][4];
            n.tf = (n.tf || 0) + this.cache[h][5];
            n.tb = (n.tb || 0) + this.cache[h][6];
            n.tvf = (n.tvf || 0) + this.cache[h][7];
            n.tvb = (n.tvb || 0) + this.cache[h][8];
            this.addToDB(n);

            if (!this.cache[h][3]) {
                while ((n = M.d[n.p])) {
                    n.td = (n.td || 0) + this.cache[h][4];
                    n.tf = (n.tf || 0) + this.cache[h][5];
                    n.tb = (n.tb || 0) + this.cache[h][6];
                    n.tvf = (n.tvf || 0) + this.cache[h][7];
                    n.tvb = (n.tvb || 0) + this.cache[h][8];
                    this.addToDB(n);
                }
            }
        }
    }

    if (d) {
        this._cache = this.cache;
    }
    delete this.cache;
};

// Add node to indexedDB
UFSSizeCache.prototype.addToDB = function(n) {
    if (fmdb) {
        fmdb.add('f', {
            h: n.h,
            p: n.p,
            s: n.s >= 0 ? n.s : -n.t,
            c: n.hash || '',
            d: n
        });
    }

    if (n.t) {
        this.addTreeNode(n);
    }
};

/**
 * Record folder node, populates M.tree
 * @param {Object} n The folder node to add
 * @param {Boolean} [ignoreDB] Whether updating local state only
 */
UFSSizeCache.prototype.addTreeNode = function(n, ignoreDB) {
    var p = n.su ? 'shares' : n.p;

    if (!M.tree[p]) {
        M.tree[p] = Object.create(null);
    }
    var tmp = M.tree[p][n.h] = Object.create(null);
    tmp.name = n.name;
    tmp.ts = n.ts;
    tmp.td = n.td || 0;
    tmp.tf = n.tf || 0;
    tmp.tb = n.tb || 0;
    tmp.tvf = n.tvf || 0;
    tmp.tvb = n.tvb || 0;
    tmp.h = n.h;
    tmp.p = n.p;
    tmp.t = M.IS_TREE;

    if (ignoreDB) {
        if (n.t & M.IS_TREE) tmp.t = n.t;
    }
    else {
        if (n.fav)                                                   tmp.t |= M.IS_FAV;
        if (M.su.EXP && M.su.EXP[n.h])                               tmp.t |= M.IS_LINKED;
        if (M.getNodeShareUsers(n, 'EXP').length || M.ps[n.h])       tmp.t |= M.IS_SHARED;
        if (M.getNodeShare(n).down === 1)                            tmp.t |= M.IS_TAKENDOWN;
    }

    if (n.su) {
        tmp.su = n.su;

        if (!M.tree[n.p]) {
            M.tree[n.p] = Object.create(null);
        }
        M.tree[n.p][n.h] = tmp;
    }

    if (fmdb && !ignoreDB) {
        fmdb.add('tree', {
            h: n.h,
            d: tmp
        });
    }
};

/**
 * Remove folder node
 * @param {String} h The ufs node's handle
 * @param {String} p The ufs parent node for h
 */
UFSSizeCache.prototype.delTreeNode = function(h, p) {
    if (M.tree[h]) {
        for (var k in M.tree[h]) {
            this.delTreeNode(k, h);
        }
        delete M.tree[h];
    }
    if (M.tree[p] && M.tree[p][h]) {
        delete M.tree[p][h];

        var len = 0;
        for (var j in M.tree[p]) {
            len++;
            break;
        }
        if (!len) {
            delete M.tree[p];
        }
    }

    if (fmdb) {
        fmdb.del('tree', h);
    }
};

/**
 * Compute node addition back to root
 * @param {Object} n The ufs node
 * @param {Boolean} [ignoreDB] Hint: do not set it...
 */
UFSSizeCache.prototype.addNode = function(n, ignoreDB) {
    var td, tf, tb, tvf, tvb;

    if (n.t) {
        td = (n.td || 0) + 1;
        tf = (n.tf || 0);
        tb = (n.tb || 0);
        tvf = (n.tvf || 0);
        tvb = (n.tvb || 0);
    }
    else {
        td = 0;
        tf = (n.fv) ? 0 : 1;
        tb = (n.fv) ? 0 : n.s;
        tvf = (n.fv) ? 1 : 0;
        tvb = (n.fv) ? n.s : 0;
    }
    if (!ignoreDB) {
        // if a new folder was created, save it to db
        this.addToDB(n);
    }
    if (d) {
        console.debug('ufsc.add', n.h, td, tf, tb, tvf, tvb);
    }

    while ((n = M.d[n.p])) {
        n.td = (n.td || 0) + td;
        n.tf = (n.tf || 0) + tf;
        n.tb = (n.tb || 0) + tb;
        n.tvf = (n.tvf || 0) + tvf;
        n.tvb = (n.tvb || 0) + tvb;
        this.addToDB(n);
    }
};

/**
 * Compute node deletions back to root
 * @param {Object} h The ufs node's handle
 * @param {Boolean} [ignoreDB] Hint: do not set it...
 */
UFSSizeCache.prototype.delNode = function(h, ignoreDB) {
    var n = M.d[h];

    if (n) {
        var td, tf, tb, tvf, tvb;

        if (n.t) {
            td = n.td + 1;
            tf = n.tf;
            tb = n.tb;
            tvf = n.tvf;
            tvb = n.tvb;

            this.delTreeNode(n.h, n.p);
        }
        else {
            td = 0;
            tf = (n.fv) ? 0 : 1;
            tb = (n.fv) ? 0 : n.s;
            tvf = (n.fv) ? 1 : 0;
            tvb = (n.fv) ? n.s : 0;
        }

        if (d) {
            console.debug('ufsc.del', h, td, tf, tb, tvf, tvb);

            if (!td && td !== 0) debugger;
        }

        while ((n = M.d[n.p])) {
            n.td -= td;
            n.tf -= tf;
            n.tb -= tb;
            n.tvf -= tvf;
            n.tvb -= tvb;
            this.addToDB(n);
        }
    }
    else if (d && ignoreDB) {
        console.error('ufsc.delNode: Node not found', h);
    }
};
