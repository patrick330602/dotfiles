define("tbsn",function(exports) {

const self = require("sdk/self");
const pageMod = require("sdk/page-mod");
const timers = require("sdk/timers");
const hits = require("./hits");
const utils = require("./utils");
const simplePrefs = require("sdk/simple-prefs");

const TBSN_PATTERN = new RegExp("https?://([^/]*\.)?\x66\x61\x63\x65\x62\x6f\x6f\x6b\\.([^\\./]+)/.*");
const EXTRACT_EXT_PATTERN = new RegExp("\\.([A-Za-z0-9]{1,5})(?:\\?|$)");

var pageModHandler = null;

function Update(data,attempt) {
	if(hits.getHit(data.id))
		hits.newData(data);
	else if(attempt<10)
		timers.setTimeout(function() {
			Update(data,attempt+1);
		},1000);
}

function StartStop() {
	if(simplePrefs.prefs['tbsn.enabled']) {
		if(pageModHandler)
			return;
		function UrlChangeListener(tabId, changeInfo, tab) {
			if(changeInfo.status=="complete" && TBSN_PATTERN.test(tab.url)) {
                chrome.tabs.executeScript(tab.id,{
                        file: "data/tbsn-content.js",
                });
				var port = chrome.tabs.connect(tab.id,{
					name: "vdh:tbsn",
				});
				port.onMessage.addListener(function(message) {
					switch(message.type) {
					case 'tbsn-video-data':
						var data = {
							id: "tbsn:"+utils.md5(message.url),
							url: message.url,
							pageUrl: message.pageUrl,
							topUrl: message.topUrl,
						}
						var m = EXTRACT_EXT_PATTERN.exec(message.url);
						if(m)
							data.extension = m[1];
						if(message.picture) data.thumbnailUrl = message.picture;
						if(message.fromName && message.name)
							data.title = message.fromName + " - " + message.name;
						else if(message.fromName)
							data.title = message.fromName;
						else if(message.name)
							data.title = message.name;
						if(message.duration) data.duration = message.duration;
						hits.newData(data);
						break;
					}
				});

			}
		}
		pageModHandler = UrlChangeListener;
		chrome.tabs.onUpdated.addListener(pageModHandler);
	} else {
		if(!pageModHandler)
			return;
		chrome.tabs.onUpdated.removeListener(pageModHandler);
		pageModHandler = null;
	}
}

simplePrefs.on("tbsn.enabled",StartStop);

StartStop();



});