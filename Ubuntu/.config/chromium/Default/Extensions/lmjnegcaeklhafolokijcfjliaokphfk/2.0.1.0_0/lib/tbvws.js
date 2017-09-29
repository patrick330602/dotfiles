
define("tbvws",function(exports) {

	const Request = require("sdk/request").Request;
	const simplePrefs = require('sdk/simple-prefs');
	const merge = require('sdk/util/object').merge;
	const _ = require("sdk/l10n").get;
	const timers = require("sdk/timers");
	const Class = require('sdk/core/heritage').Class;

	const variants = require("variants");
	const utils = require("utils");
	const actions = require("actions");
	const alerts = require("alerts");

	var listeners = [];

	const PARAM_PATTERN = new RegExp("^(.*?)=(.*)$");
	const TYPE_PATTERN = new RegExp("^([^/;]+)\/(?:x-)?([^/;]+)");
	const PM_PATTERN = new RegExp("^https?://([^/]*\.)?\x79\x6f\x75\x74\x75\x62\x65(\.co)?\.([^\./]+)/.*");

	const SIGN_PATTERN = new RegExp("[?&]signature=");
	const ITAG_PATTERN = new RegExp("[?&]itag=([^&]+)");
	const ID_PATTERN = new RegExp("[?&]id=([^&]+)");
	const HV_PATTERN = new RegExp("^https?://([^/]*\.)?\x67\x6f\x6f\x67\x6c\x65\x76\x69\x64\x65\x6f\\.");


	function DecodeVideoData(localData,remoteData) {
		var videoArgs = null;
		try {
			videoArgs = remoteData[1].data.swfcfg.args;
		} catch($_) {}
		if(!videoArgs)
			return;
		var availableVariants = [];
		var videoData = {
			videoId: localData.videoId,
			title: videoArgs.title || _("video"),
			topUrl: localData.topUrl,
			pageUrl: localData.pageUrl,
			from: "tbvws",
			maxVariants: localData.maxVariants,
			autoExec: localData.autoExec,
			isPrivate: localData.isPrivate,
		}
		if(videoArgs.thumbnail_url)
			videoData.thumbnail = videoArgs.thumbnail_url;		
		if(videoArgs.pageUrl)
			videoData.pageUrl = videoArgs.pageUrl; 

		["url_encoded_fmt_stream_map"].forEach(function(field) {
			if(!videoArgs[field])
				return;
			videoArgs[field].split(",").forEach(function(variantDescr) {
				var variant = {};
				variantDescr.split("&").forEach(function(paramStr) {
					var m = PARAM_PATTERN.exec(paramStr);
					if(m)
						variant[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
				});
				if(!variant.url)
					return;
				availableVariants.push(variant);
			});
		});
		var hits = variants.getHitsFromVariants(videoData,availableVariants);
		hits.forEach(function(hit) {
			delete hit.url;
			hit.noyt=1;
			listeners.forEach(function(listener) {
				listener(hit);
			});				
		});
	}

	function GetVideoMeta(videoData) {
		Request({
			url: videoData.baseUrl+"/watch?v="+videoData.videoId+"&spf=navigate",
			onComplete: function(response) {
				if(simplePrefs.prefs['write-video-data-file'])
					utils.saveStringToFile("tbvws-"+videoData.videoId+".json",JSON.stringify(response.json,null,4));
				DecodeVideoData(videoData,response.json);
			},
			headers: {
				referer: videoData.baseUrl+"/results?search_query="+encodeURIComponent(videoData.title),
			},
		}).get();
	}

	function UpdatedTab(tab) {
		if(tab.status!="complete")
			return;
		if(!PM_PATTERN.test(tab.url))
			return;
		if(simplePrefs.prefs["chrome.noyt.enabled"])
			return;
		chrome.tabs.executeScript(tab.id,{
			file: "data/tbvws-content.js",
		},function() {
			if(chrome.runtime.lastError)
				return;
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

	var NoYTAction = merge(Class({
		
		"extends": actions.Action,

		start: function() {
			alerts.alert({
				title: _('chrome.warning-yt'),
				text: [
				    _('chrome.noyt.text'),
				    _('chrome.noyt.text2'),
				],
				action: [{
					text: _('chrome.install-firefox'),
					click: "post('installFirefox')",
				},{
					text: _('chrome.install-fx-vdh'),
					click: "post('installFxVDH')",
				}],
				notAgain: "chrome.noyt.enabled",
				notAgainText: _("chrome.ignore-yt"),
				onMessage: function(message,panel) {
					switch(message.type) {
					case "installFirefox":
						panel.hide();
						require("sdk/tabs").open({
							url: "https://getfirefox.com/",
						});
						break;
					case "installFxVDH":
						panel.hide();
						require("sdk/tabs").open({
							url: "https://addons.mozilla.org/addon/video-downloadhelper/",
						});
						break;
					}
				},
			});
		}

	}),{
		actionName: "noyt",
		canPerform: function(hit) {
			return hit.data.noyt;
		},
		priority: 200,
		title: _("action.noyt.title"),
		description: _("action.noyt.description"),
		icon: "images/icon-action-warning-64.png",
	});

	actions.registerAction("noyt",NoYTAction);
	
});

