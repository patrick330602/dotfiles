MegaData.prototype.accountData = function(cb, blockui) {
    "use strict";

    var account = Object(this.account);
    var reuseData = account.lastupdate > Date.now() - 30000;

    if (reuseData && (!account.stats || !account.stats[M.RootID])) {
        if (d) {
            console.error('Track down how we get here...', M.RootID, account.stats && Object.keys(account.stats));
        }
        reuseData = false;
    }

    if (reuseData && cb) {
        cb(account);
    }
    else {
        var uqres = false;
        var pstatus = u_attr.p;
        var mRootID = M.RootID;

        if (blockui) {
            loadingDialog.show();
        }

        api_req({a: 'uq', strg: 1, xfer: 1, pro: 1, v: 1}, {
            account: account,
            callback: function(res, ctx) {
                loadingDialog.hide();

                if (typeof res === 'object') {
                    for (var i in res) {
                        ctx.account[i] = res[i];
                    }
                    ctx.account.type = res.utype;
                    // ctx.account.stime = res.scycle;
                    // ctx.account.scycle = res.snext;
                    ctx.account.expiry = res.suntil;
                    ctx.account.space = Math.round(res.mstrg);
                    ctx.account.space_used = Math.round(res.cstrg);
                    ctx.account.bw = Math.round(res.mxfer);
                    ctx.account.servbw_used = Math.round(res.csxfer);
                    ctx.account.downbw_used = Math.round(res.caxfer);
                    ctx.account.servbw_limit = Math.round(res.srvratio);

                    // If a subscription, get the timestamp it will be renewed
                    if (res.stype === 'S') {
                        ctx.account.srenew = res.srenew;
                    }

                    if (!Object(res.balance).length) {
                        ctx.account.balance = [['0.00', 'EUR']];
                    }

                    uqres = res;
                }
            }
        });

        api_req({a: 'uavl'}, {
            account: account,
            callback: function(res, ctx) {
                if (typeof res !== 'object') {
                    res = [];
                }
                ctx.account.vouchers = voucherData(res);
            }
        });

        api_req({a: 'maf', v: mega.achievem.RWDLVL}, {
            account: account,
            callback: function(res, ctx) {
                if (typeof res === 'object') {
                    ctx.account.maf = res;
                }
            }
        });

        api_req({a: 'utt'}, {
            account: account,
            callback: function(res, ctx) {
                if (typeof res !== 'object') {
                    res = [];
                }
                ctx.account.transactions = res;
            }
        });

        // Get (f)ull payment history
        // [[payment id, timestamp, price paid, currency, payment gateway id, payment plan id, num of months purchased]]
        api_req({a: 'utp', f: 1}, {
            account: account,
            callback: function(res, ctx) {
                if (typeof res !== 'object') {
                    res = [];
                }
                ctx.account.purchases = res;
            }
        });

        /* x: 1, load the session ids
         useful to expire the session from the session manager */
        api_req({a: 'usl', x: 1}, {
            account: account,
            callback: function(res, ctx) {
                if (typeof res !== 'object') {
                    res = [];
                }
                ctx.account.sessions = res;
            }
        });

        api_req({a: 'ug'}, {
            cb: cb,
            account: account,
            callback: function(res, ctx) {
                if (typeof res === 'object') {
                    if (res.p) {
                        u_attr.p = res.p;
                        if (u_attr.p) {
                            topmenuUI();
                        }
                    }
                }

                if (pstatus !== u_attr.p) {
                    ctx.account.justUpgraded = Date.now();

                    M.checkStorageQuota(2);
                }

                if (!u_attr.p && uqres) {
                    ctx.account.servbw_used = 0;

                    if (uqres.tah) {
                        var bwu = 0;

                        for (var w in uqres.tah) {
                            bwu += uqres.tah[w];
                        }

                        ctx.account.downbw_used = bwu;
                        if (uqres.tal) {
                            ctx.account.bw = uqres.tal;
                        }
                    }
                }

                // Prepare storage footprint stats.
                var cstrgn = ctx.account.cstrgn = Object(ctx.account.cstrgn);
                var stats = ctx.account.stats = Object.create(null);
                var groups = [M.RootID, M.InboxID, M.RubbishID];
                var root = array.to.object(groups);
                var exp = Object(M.su.EXP);

                groups = groups.concat(['inshares', 'outshares', 'links']);
                for (var i = groups.length; i--;) {
                    stats[groups[i]] = array.to.object(['items', 'bytes', 'files', 'folders', 'vbytes', 'vfiles'], 0);
                    // stats[groups[i]].nodes = [];
                }

                for (var handle in cstrgn) {
                    var data = cstrgn[handle];
                    var target = 'outshares';

                    if (root[handle]) {
                        target = handle;
                    }
                    else if (M.c.shares[handle]) {
                        target = 'inshares';
                    }
                    // stats[target].nodes.push(handle);

                    if (exp[handle] && !M.getNodeShareUsers(handle, 'EXP').length) {
                        continue;
                    }

                    stats[target].items++;
                    stats[target].bytes += data[0];
                    stats[target].files += data[1];
                    stats[target].folders += data[2];
                    stats[target].vbytes += data[3];
                    stats[target].vfiles += data[4];
                }

                // calculate root's folders size
                if (M.c[M.RootID]) {
                    var t = Object.keys(M.c[M.RootID]);
                    var s = Object(stats[M.RootID]);

                    s.fsize = s.bytes;
                    for (var i = t.length; i--;) {
                        var node = M.d[t[i]] || false;

                        if (!node.t) {
                            s.fsize -= node.s;
                        }
                    }
                }

                // calculate public links items/size
                var links = stats.links;
                Object.keys(exp)
                    .forEach(function(h) {
                        links.files++;
                        links.bytes += Object(M.tree[h]).tb || M.d[h] && M.d[h].s || 0;
                    });

                ctx.account.lastupdate = Date.now();

                if (d) {
                    console.log('stats', JSON.stringify(stats));
                }

                if (!ctx.account.bw) {
                    ctx.account.bw = 1024 * 1024 * 1024 * 1024 * 1024 * 10;
                }
                if (!ctx.account.servbw_used) {
                    ctx.account.servbw_used = 0;
                }
                if (!ctx.account.downbw_used) {
                    ctx.account.downbw_used = 0;
                }

                M.account = ctx.account;

                if (res.ut) {
                    localStorage.apiut = res.ut;
                }

                // transfers quota
                var tfsq = {max: account.bw, used: account.downbw_used};

                if (u_attr.p) {
                    tfsq.used += account.servbw_used;
                }
                else if (M.maf) {
                    tfsq.used += account.servbw_used;
                    var max = (M.maf.transfer.base + M.maf.transfer.current);
                    if (max) {
                        // has achieved quota
                        tfsq.ach = true;
                        tfsq.max = max;
                    }
                }

                tfsq.left = tfsq.max - tfsq.used;
                tfsq.perc = Math.round(tfsq.used * 100 / tfsq.max);

                M.account.tfsq = tfsq;

                if (mRootID !== M.RootID) {
                    // TODO: Check if this really could happen and fix it...
                    console.error('mRootID changed while loading...', mRootID, M.RootID);
                }

                if (ctx.cb) {
                    ctx.cb(ctx.account);
                }
            }
        });
    }
};


function voucherData(arr) {
    var vouchers = [];
    var varr = arr[0];
    var tindex = {};
    for (var i in arr[1]) {
        tindex[arr[1][i][0]] = arr[1][i];
    }
    for (var i in varr) {
        var redeemed = 0;
        var cancelled = 0;
        var revoked = 0;
        var redeem_email = '';
        if ((varr[i].rdm) && (tindex[varr[i].rdm])) {
            redeemed = tindex[varr[i].rdm][1];
            redeem_email = tindex[varr[i].rdm][2];
        }
        if (varr[i].xl && tindex[varr[i].xl]) {
            cancelled = tindex[varr[i].xl][1];
        }
        if (varr[i].rvk && tindex[varr[i].rvk]) {
            revoked = tindex[varr[i].rvk][1];
        }
        vouchers.push({
            id: varr[i].id,
            amount: varr[i].g,
            currency: varr[i].c,
            iss: varr[i].iss,
            date: tindex[varr[i].iss][1],
            code: varr[i].v,
            redeemed: redeemed,
            redeem_email: redeem_email,
            cancelled: cancelled,
            revoked: revoked
        });
    }
    return vouchers;
}
