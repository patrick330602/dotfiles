define("tfvws",function(exports) {


const Request = require("sdk/request").Request;
const simplePrefs = require('sdk/simple-prefs');
const merge = require('sdk/util/object').merge;
const _ = require("sdk/l10n").get;

const variants = require("./variants");
const utils = require("./utils");

var OS = null, encoder = null;
var listeners = [];

const PARAM_PATTERN = new RegExp("^(.*?)=(.*)$");
const TYPE_PATTERN = new RegExp("^([^/;]+)\/(?:x-)?([^/;]+)");
const PM_PATTERN = new RegExp("^https?://([^/]*\.)?\x64\x61\x69\x6c\x79\x6d\x6f\x74\x69\x6f\x6e(\.co)?\.([^\./]+)/.*");

function DecodeVideoData(localData) {
	var videoData = {
		videoId: localData.videoId,
		title: localData.data.title || _("video"),
		topUrl: localData.topUrl,
		from: "tfvws",
	}
	if(localData.data.duration)
		videoData.duration = localData.data.duration;

	var availableVariants = [];

	for(var quality in localData.data.qualities) {
		if(quality=="auto")
			continue;
		localData.data.qualities[quality].forEach(function(variant,index) {
			var type = "mp4";
			var m = /\/(.*)/.exec(variant.type);
			if(m)
				type = m[1];
			var size;
			m = /cdn\/[^\/]*?([0-9]+x[0-9]+)\//.exec(variant.url);
			if(m)
				size = m[1];
			availableVariants.push({
				itag: quality+"-"+index,
				url: variant.url,
				size: size,
			});			
		});
	}
	var hits = variants.getHitsFromVariants(videoData,availableVariants);
	hits.forEach(function(hit) {
		listeners.forEach(function(listener) {
			listener(hit);
		});				
	});
}

function GetVideoMeta(videoData) {
	//console.info("GetVideoMeta",JSON.stringify(videoData,null,4));
	if(simplePrefs.prefs['write-video-data-file'])
		utils.saveStringToFile("tfvws-"+videoData.videoId+".json",JSON.stringify(videoData,null,4));
	DecodeVideoData(videoData);
}

function UpdatedTab(tab) {
	if(tab.status!="complete")
		return;
	if(!PM_PATTERN.test(tab.url))
		return;
	chrome.tabs.executeScript(tab.id,{
		file: "data/tfvws-content.js",
		runAt: "document_start"
	},function() {
	    chrome.tabs.sendRequest(tab.id, {
	    	type: "detect-video"
	    }, function(message) {
	    	if(message.type=="detected-video" && message.hasVideo) {
	    		message.topUrl = tab.url;
	    		message.isPrivate = tab.incognito;
	    		GetVideoMeta(message);		    		
	    	}
	    });
	});

}

chrome.tabs.query({},function(tabs) {
	tabs.forEach(function(tab) {
		UpdatedTab(tab);
	});
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	UpdatedTab(tab);		
});

exports.addListener = function(listener) {
	listeners.push(listener);
}

exports.removeListener = function(listener) {
	var index = listeners.indexOf(listener);
	if(index>=0) {
		listeners.splice(index,1);
	}
}



});