define("tbts",function(exports) {

const self = require("sdk/self");
const pageMod = require("sdk/page-mod");
const timers = require("sdk/timers");
const events = require("sdk/system/events");

const hits = require("./hits");
const utils = require("./utils");
const simplePrefs = require("sdk/simple-prefs");

const TBTS_PATTERN = new RegExp("https?://twitter.com/.*/videos/tweet/.*");

var pageModHandler = null;

function Update(vdata,attempt) {
	var matchingHits = hits.getHitsByGroup("grp-"+utils.md5(vdata.manifestUrl));
	if(matchingHits.length>0) {
		var data = [];
		var title = null;
		var title = (vdata.publisher && vdata.title && vdata.publisher + " - " + vdata.title) ||
			vdata.publisher || vdata.title;
		matchingHits.forEach(function(hitData) {
			var hdata = {
				id: hitData.id,
			}
			hdata.title = title || hdata.title;
			hdata.thumbnailUrl = vdata.picture || hdata.thumbnailUrl;
			data.push(hdata);
		});
		hits.newData(data);
	} else if(attempt<10)
		timers.setTimeout(function() {
			Update(vdata,attempt+1);
		},1000);
}

function StartStop() {
	if(simplePrefs.prefs['tbts.enabled']) {
		if(pageModHandler)
			return;
		function FrameLoaded(details) {
			chrome.tabs.executeScript(details.tabId,{
				file: "data/tbts-content.js",
				frameId: details.frameId
			},function(result) {
				if(Array.isArray(result) && result.length>0 && result[0])
					Update(result[0],0);
			});
		}
		pageModHandler = FrameLoaded;
		chrome.webNavigation.onDOMContentLoaded.addListener(pageModHandler,{
			url: [{
				hostEquals: "twitter.com",
				pathContains: "/videos/tweet/"
			}]
		});
	} else {
		if(!pageModHandler)
			return;
		chrome.webNavigation.onDOMContentLoaded.removeListener(pageModHandler);
		pageModHandler = null;
	}
}

simplePrefs.on("tbts.enabled",StartStop);

StartStop();



});