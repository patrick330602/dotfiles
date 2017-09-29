define("tbvv",function(exports) {

const self = require("sdk/self");
const pageMod = require("sdk/page-mod");
const timers = require("sdk/timers");
const events = require("sdk/system/events");

const hits = require("./hits");
const utils = require("./utils");
const simplePrefs = require("sdk/simple-prefs");

const TBVV_PATTERN = new RegExp("https?://(.*\\.)?vine.co/.*");
const EXTRACT_EXT_PATTERN = new RegExp("\\.([A-Za-z0-9]{1,5})(?:\\?|$)");

var pageModHandler = null;

function Update(message,attempt) {
	var vdata = message.data;
	var hit = null;
	var original = null;
	for(var i=0;i<vdata.videoUrls.length;i++) {
		var variant = vdata.videoUrls[i];
		if(variant.id=="original") {
			original = variant;
		}
		var id = "network-probe:" + utils.md5(variant.videoUrl);
		hit = hits.getHit(id);
		if(hit)
			break;
	}
	if(hit) {
		var data = {
			id: hit.data.id,
			thumbnailUrl: vdata.thumbnailUrl
		}
		data.title = vdata.description || (vdata.user && vdata.user.username) || hit.data.title;
		hits.newData(data);
	} else if(attempt<10)
		timers.setTimeout(function() {
			Update(message,attempt+1);
		},1000);
	else if(original) {
		var hdata = {
			id: "network-probe:" + utils.md5(original.videoUrl),
			url: original.videoUrl,
			referrer: message.pageUrl,
			pageUrl: message.pageUrl,
			topUrl: message.topUrl,
			thumbnailUrl: vdata.thumbnailUrl,
			title: vdata.description || (vdata.user && vdata.user.username) || "Video",
		};
		var m = EXTRACT_EXT_PATTERN.exec(original.videoUrl);
		if(m)
			hdata.extension = m[1];
		hits.newData(hdata);
	}
}

function StartStop() {
	if(simplePrefs.prefs['tbvv.enabled']) {
		if(pageModHandler)
			return;
		function FrameLoaded(details) {
			chrome.tabs.executeScript(details.tabId,{
				file: "data/tbvv-content.js",
				frameId: details.frameId
			},function(result) {
				if(Array.isArray(result) && result.length>0)
					Update(result[0],0);
			});
		}
		pageModHandler = FrameLoaded;
		chrome.webNavigation.onDOMContentLoaded.addListener(pageModHandler,{
			url: [{hostSuffix: "vine.co"}]
		});
	} else {
		if(!pageModHandler)
			return;
		chrome.webNavigation.onDOMContentLoaded.removeListener(pageModHandler);
		pageModHandler = null;
	}
}

simplePrefs.on("tbvv.enabled",StartStop);

StartStop();



});