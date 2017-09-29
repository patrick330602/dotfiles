define("hits",function(exports) {



const Class = require('sdk/core/heritage').Class;
const merge = require('sdk/util/object').merge;
const timers = require("sdk/timers");
const simplePrefs = require("sdk/simple-prefs");

const utils = require("./utils");
const actions = require("./actions");
const blacklist = require("./blacklist");

const NOTIFY_TIMEOUT = 100;

const UNREADY_STATES = {
		"running": 1,
	} 

const READY_STATES = {
	"initial": 1,
	"active": 1,
	"inactive": 1,
	"orphan": 1,
	"pinned": 1,
} 

var listeners = [];
var hits = {}
var notifyTimer = null;
var updateTimer = null;


function GetActiveTab(callback) {
	chrome.windows.getCurrent(function(window) {
		chrome.tabs.query({
			windowId: window.id,
			highlighted: true,
		},function(tabs) {
			if(tabs.length>0)
				callback(tabs[0]);
			else
				callback(null);
		});
	});				
}

function UpdateCurrentUrl() {
	if(updateTimer)
		timers.clearTimeout(updateTimer);
	updateTimer = timers.setTimeout(DoUpdateCurrentUrl,50);
}


function DoUpdateCurrentUrl() {
	updateTimer = null;
	GetActiveTab(function(tab) {
		if(!tab)
			return;
		var currentUrl = tab.url;
		var urls = {}; 
		chrome.tabs.query({}, function(tabs) {
			for(var tabId in tabs)
				urls[tabs[tabId].url] = 1;
			for(var id in hits) {
				var hit = hits[id];
				if(hit.status=='active' && hit.data.topUrl!=currentUrl) {
					if(hit.data.topUrl in urls)
						hit.setStatus('inactive');
					else
						hit.setStatus('orphan');
				} else if(hit.status=='inactive' && !(hit.data.topUrl in urls))
					hit.setStatus('orphan');
				else if( (hit.status =='inactive' || hit.status=='orphan') && hit.data.topUrl==currentUrl) {
					hit.setStatus('active');
					UpdateHitThumbnail(hit,tab);
				}
			}				
		});			
	});
}

function UpdateHitThumbnail(hit,tab) {
	var hitData = hit.data;
	if(hitData.thumbnail || hitData.thumbnailUrl || hitData._gettingThumbnail)
		return;
	hitData._gettingThumbnail = true;
	chrome.tabs.captureVisibleTab(tab.windowId, {
			format: "jpeg",
			quality: 10,
		}, function(dataUrl) {
			if(chrome.runtime.lastError)
				return;
			if(!dataUrl)
				return;
			var img = new Image();
			img.onload = function() {
				var wWidth = img.width;
        		var wHeight = img.height;
        		var ratio = wHeight/wWidth;

        		var maxWidth = 60;
        		var maxHeight = 48;

        		var oHeight = maxHeight;
        		var oWidth = Math.round(maxHeight / ratio);
        		if(oWidth>maxWidth) {
                	oWidth = maxWidth;
                	oHeight = Math.round(oWidth * ratio);
        		}

				var oCanvas = document.createElementNS("http://www.w3.org/1999/xhtml", "html:canvas");
        		oCanvas.width = oWidth;
        		oCanvas.height = oHeight;
        		var oContext = oCanvas.getContext("2d");
        		oContext.drawImage(img, 0, 0, wWidth, wHeight, 0, 0, oWidth, oHeight);

				exports.newData({
					id: hit.data.id,
					thumbnail: oCanvas.toDataURL("image/jpeg",0.2),
				});

			};
			img.src = dataUrl;
		});
}

chrome.windows.onFocusChanged.addListener(UpdateCurrentUrl);
chrome.windows.onRemoved.addListener(UpdateCurrentUrl);
chrome.tabs.onActivated.addListener(UpdateCurrentUrl);
chrome.tabs.onRemoved.addListener(UpdateCurrentUrl);
chrome.tabs.onUpdated.addListener(UpdateCurrentUrl);

var Hit = Class({
	initialize: function() {
		this.data = {};
		this.dataSign = "mZFLkyvTelC5g8XnyQrpOw==";
		this.timestamp = Date.now();
		this.status = "initial";
		this.progress = -1;
		this.operation = null;
		this.expireTimer = null;
		this.pinned = false;
		this.setReadyStatus();
		this.currentAction = null;
	},
	update: function(data) {
		this.data = merge(this.data,data);
		if(blacklist.checkHitBlacklisted(this.data)) {
			this.remove();
			return;
		}
		this.updateActions();
		if(this.status in READY_STATES)
			this.setReadyStatus();
		var oldSign = this.dataSign;
		this.dataSign=utils.md5(this.data);
		return oldSign != this.dataSign;
	},
	stopExpireTimer: function() {
		if(this.expireTimer) {
			timers.clearTimeout(this.expireTimer);
			this.expireTimer = null;
		}
	},
	restartExpireTimer: function() {
		var $this = this;
		this.stopExpireTimer();
		var t0 = Date.now();
		this.orphanStart = t0;
		this.orphanEnd = t0 + simplePrefs.prefs['orphan-expiration']*1000;
		this.expireTimer = timers.setTimeout(function() {
			$this.expireTimer = null;
			if(hits[$this.data.id])
				$this.remove();
		},simplePrefs.prefs['orphan-expiration']*1000);
	},
	action: function(action) {
		//console.info("perform",action,"on",this.data.id);
		this.progress = 0;
		this.operation = null;
		actions.perform(action,this);
		this.update();
	},
	setStatus: function(status) {
		//console.info("setStatus",status);
		if(status != this.status) {
			this.status = status;
			if(status == 'orphan') {
				this.restartExpireTimer();
			} else
				this.stopExpireTimer();
			this.updateActions();
			NotifyHits();
		}
	},
	setReadyStatus: function() {
		var $this = this;
		chrome.windows.getCurrent(function(window) {
			chrome.tabs.query({}, function(tabs) {
				var activeTab = null;
				tabs.forEach(function(tab) {
					if(tab.windowId==window.id && tab.highlighted)
						activeTab = tab;
				});
				if($this.pinned)
					status = 'pinned';
				else if(activeTab && $this.data.topUrl==activeTab.url) {
					status = 'active';
					UpdateHitThumbnail($this,activeTab);
				} else {
					var urls = {}			
					for(var tabId in tabs)
						urls[tabs[tabId].url] = 1;
					if($this.data.topUrl in urls)
						status = 'inactive';
				}
				$this.setStatus(status);										
			});
		});
	},
	setProgress: function(progress) {
		if(progress != this.progress) {
			this.progress = progress;
			var $this = this;
			listeners.forEach(function(listener) {
				listener(progress,[$this.data.id,"progress"]);
			});
		}
	},
	setOperation: function(operation) {
		if(operation != this.operation) {
			this.operation = operation;
			var $this = this;
			listeners.forEach(function(listener) {
				listener(operation,[$this.data.id,"operation"]);
			});
		}
	},
	updateActions: function() {
		this.data.actions = actions.availableActions(this);
		NotifyHits();
	},
	remove: function() {
		delete hits[this.data.id];
		NotifyHits();
	},
	pin: function() {
		this.pinned = true;
		if(this.status!='running')
			this.setReadyStatus();
	},
	setCurrentAction: function(action) {
		if(action==null)
			this.operation = null;
		this.currentAction = action;
	},
});

function GetHitData(hit) {
	return merge({
		status: hit.status,
		timestamp: hit.timestamp,
		progress: hit.progress,
		operation: hit.operation,
		orphanStart: hit.orphanStart,
		orphanEnd: hit.orphanEnd,
	},hit.data);
}

var modifiers = {};

function DoNotifyHits() {
	notifyTimer = null;
	var hitsData = {};
	for(var id in hits) {
		var hit = hits[id];
		var data = GetHitData(hit);
		hitsData[id] = data;
		for(var mid in modifiers)
			modifiers[mid](data);
	}
	listeners.forEach(function(listener) {
		listener(hitsData);
	});
}

function NotifyHits() {
	if(notifyTimer)
		timers.clearTimeout(notifyTimer);
	notifyTimer = timers.setTimeout(DoNotifyHits,NOTIFY_TIMEOUT);
}

exports.forceNotify = function() {
	NotifyHits();
}

exports.newData = function(data) {
	if(!Array.isArray(data))
		data = [ data ];
	var changed = false;
	data.forEach(function(hitData) {
		var hit = hits[hitData.id];
		if(!hit) {
			if(hitData.topUrl && hitData.pageUrl && hitData.topUrl!=hitData.pageUrl && simplePrefs.prefs['ignore-embedded'])
				return;
			hit = new Hit();
			hits[hitData.id] = hit;
			if(hitData.autoExec)
				timers.setTimeout(function() {
					hit.action(hitData.autoExec);
				},0);
		}
		changed = hit.update(hitData) || changed;
	});
	if(simplePrefs.prefs['max-hits-per-source']>0) {
		var hitSources = {};
		for(var id in hits) {
			var hit = hits[id];
			var sourceUrl = hit.data.pageUrl || hit.data.topUrl;
			if(sourceUrl) {
				var source = hitSources[sourceUrl];
				if(!source) {
					source = [];
					hitSources[sourceUrl] = source;
				}
				source.push(hit);
			}
		}
		for(var sourceId in hitSources) {
			var hitsFromSource = hitSources[sourceId];
			if(hitsFromSource.length>simplePrefs.prefs['max-hits-per-source']) {
				hitsFromSource.sort(function(a,b) {
					return b.timestamp - a.timestamp;
				});
				var deletableCount = 0;
				for(var index = 0; index<hitsFromSource.length; index++) {
					var hit = hitsFromSource[index];
					if((hit.status=='active' || hit.status=='inactive') &&
						++deletableCount>simplePrefs.prefs['max-hits-per-source'])
						hit.remove();
				}
			}
		}
	}
	if(changed) {
		NotifyHits();
	}
}

exports.action = function(action, hitId) {
	var hit = hits[hitId];
	if(hit)
		hit.action(action);
}

exports.remove = function(hitId) {
	var hit = hits[hitId];
	if(hit)
		hit.remove();
}

exports.getHit = function(hitId) {
	return hits[hitId] || null;
}

exports.getF4fHitDataByUrlHint = function(hint) {
	for(var id in hits) {
		var hitData = hits[id].data;
		if(hitData.chunked=="f4f" && hitData._media && hitData._media.urlHint==hint)
			return hitData;
	}
	return null;
}

exports.addListener = function(listener) {
	listeners.push(listener);
}

exports.removeListener = function(listener) {
	var index = listeners.indexOf(listener);
	if(index>=0) {
		listeners.splice(index,1);
	}
}

exports.clear = function(what) {
	for(var id in hits) {
		var hit = hits[id];
		if((what=='all' && hit.status!='running' && hit.status!='pinned') ||
				(what=='pinned' && hit.status == 'pinned') ||
				(what=='inactive' && hit.status == 'inactive') ||
				(what=='orphans' && hit.status=='orphan'))
			hit.remove();
	}
}

exports.refresh = function() {
	for(var id in hits)
		hits[id].update();
}

exports.getHitData = function(id) {
	var hit = hits[id];
	if(hit) {
		hit.update();
		return GetHitData(hit);
	}
	return null;
}

exports.defaultAction = function() {
	var hit = null;
	var activeHits = [];
	for(var id in hits) {
		var hit = hits[id];
		if(hit.status=="active" && hit.data.actions.indexOf("quickdownload")>=0)
			activeHits.push(hit);
	}
	activeHits.sort(function(a,b) {
		if(a.timestamp==b.timestamp)
				return (a.order||0)-(b.order||0);
		return a.timestamp-b.timestamp;
	});
	if(activeHits.length>0)
		exports.action("quickdownload",activeHits[0].data.id);
}

exports.executeDefaultAction = function(id) {
	var hit = hits[id];
	if(hit && hit.data.actions.length>0)
		hit.action(hit.data.actions[0]);
}

exports.registerModifier = function(modifierName, modifier) {
	modifiers[modifierName] = modifier;
} 

exports.unregisterModifier = function(modifierName) {
	delete modifiers[modifierName];
} 

exports.getFileNamesInUse = function() {
	var used = {};
	for(var id in hits) {
		var data = hits[id].data;
		used[data._downloadTarget] = 1;
		used[data._finalTarget] = 1;
		used[data._audioTarget] = 1;
		used[data._videoTarget] = 1;
	}
	delete used[undefined];
	return used;
}

exports.getHitsByReferrer = function(url) {
	var found = [];
	for(var id in hits) {
		var data = hits[id].data;
		if(data.referrer==url)
			found.push(data);
	}
	return found;
}

exports.getHitsByGroup = function(url) {
	var found = [];
	for(var id in hits) {
		var data = hits[id].data;
		if(data.group==url)
			found.push(data);
	}
	return found;
}


});