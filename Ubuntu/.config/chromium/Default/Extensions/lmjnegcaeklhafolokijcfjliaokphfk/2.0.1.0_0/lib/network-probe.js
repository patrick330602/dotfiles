define("network-probe",function(exports) {

const chunks = require("./chunks");
const _ = require("sdk/l10n").get;
const simplePrefs = require('sdk/simple-prefs');
const utils = require("./utils");
const smartNames = require("./smartnames");

const TYPE_PATTERN = new RegExp("^(audio|video)/(?:x-)?([^; ]+)");
const RANGE_PATTERN = new RegExp("^bytes [0-9]+-[0-9]+/([0-9]+)$");
const EXT_PATTERN = new RegExp("\\.([a-z0-9]{1,5})(?:\\?|#|$)","i");
const NAME_PATTERN = new RegExp("/([^/]+?)(?:\\.([a-z0-9]{1,5}))?(?:\\?|#|$)","i");
const CDFNAME_PATTERN = new RegExp('filename\\s*=\\s*"\\s*([^"]+?)\\s*"');
const TBVWS_DASH_SEG_PATTERN = new RegExp("\\bsource=yt_otf\\b");
const TBSN_PATTERN = new RegExp("^https?://[^/]*\\bfbcdn\\b");
const RES_PATTERN = new RegExp("^resource\\:");
const GV_PATTERN = new RegExp('googlevideo\\.com');

var listeners = [];
var extensions = {};

function UpdateExtensions() {
	extensions = {};
	simplePrefs.prefs["media-extensions"].split("|").forEach(function(ext) {
		extensions[ext] = 1;
	});
}
UpdateExtensions();
simplePrefs.on("media-extensions",UpdateExtensions);

var filterOutRE = null;
function UpdateFilterOut() {
	filterOutRE = null;
	var fo = simplePrefs.prefs['network-filter-out'];
	if(fo)
		try {
			filterOutRE = new RegExp(fo,"i");
		} catch($_) {}
}
simplePrefs.on("network-filter-out",UpdateFilterOut);
UpdateFilterOut();


function GetReqHeader(channel,header) {
	return channel.headers[header.toLowerCase()] || null;
}


function ListenResponse(
request
) {
	if(request.tabId<=0)
		return;
	
	if(GV_PATTERN.test(request.url))
		return;
	
	var headers = {};
	if(request.responseHeaders)
		for(var i=request.responseHeaders.length-1;i>=0;i--) {
			var header = request.responseHeaders[i]; 
			headers[header.name.toLowerCase()] = header.value || header.binaryValue || null;
		}
	function GetRespHeader(channel,header) {
		return headers[header.toLowerCase()] || null;
	}

	var channel = {
		name: request.url,
		headers: headers,
	}
	
	var preserve = false;
	
	var contentLength = GetRespHeader(channel,"Content-Length");
	if(!preserve && contentLength==="0")
		return;
	var length = null;
	var contentRange = GetRespHeader(channel,"Content-Range");
	if(contentRange) {
		var m = RANGE_PATTERN.exec(contentRange);
		if(m)
			length = m[1];
	}
	if(!length)
		length = contentLength;
	length = parseInt(length);
	
	if(simplePrefs.prefs["tbsn.enabled"] && TBSN_PATTERN.test(channel.name) &&
		channel.name.indexOf("bytestart=")>=0)
		return;

	var extMatch = EXT_PATTERN.exec(channel.name);

	var urlExtension = null;
		
	if(extMatch) {
		urlExtension = extMatch[1].toLowerCase();
		if(urlExtension=="m4s" && simplePrefs.prefs["dash.hide-m4s"])
			return;
		if(urlExtension=="ts" && simplePrefs.prefs["mpegts.hide-ts"])
			return;
		if(urlExtension=="f4f")
			return;
		if(!extensions[extMatch[1]])
			extMatch = null;
	}

	var contentType =  GetRespHeader(channel,"Content-Type");
	var contentTypeMatch = TYPE_PATTERN.exec(contentType);


	var chunkedInfo = null;
	if(!preserve) {
		chunkedInfo = chunks.networkHook(channel,{
			contentType: contentType,
		});
		preserve = !!chunkedInfo;
	}
	if(simplePrefs.prefs["tbvws.hide-dash"] && TBVWS_DASH_SEG_PATTERN.test(channel.name)) 
		return;
	if(!preserve && filterOutRE && filterOutRE.test(channel.name))
		return;
	
	if(!preserve && !contentTypeMatch && isNaN(length) && !extMatch)
		return;
	if(!preserve && !contentTypeMatch && !extMatch && (simplePrefs.prefs['mediaweight-threshold']==0 || length<simplePrefs.prefs['mediaweight-threshold']))
		return;
	if(!preserve && !isNaN(length) && length<simplePrefs.prefs['mediaweight-min-size'])
		return;
	
	if(!preserve && filterOutRE && filterOutRE.test(channel.name))
		return;
	
	if(!preserve && contentTypeMatch && contentTypeMatch[2]=="ms-asf" && simplePrefs.prefs['exclude-msasf'])
		return;

	if(!preserve && contentTypeMatch && contentTypeMatch[2].toLowerCase()=="f4f")
		return;

	var hitData = {
		id: "network-probe:"+utils.md5(channel.name),
		url: channel.name,
	};
	
	var contentDisp = GetRespHeader(channel,"Content-Disposition");
	if(contentDisp) {
		var fNameMatch = CDFNAME_PATTERN.exec(contentDisp);
		if(fNameMatch && fNameMatch[1])
			hitData.headerFilename = fNameMatch[1];
	}
	
	
	var nameMatch = NAME_PATTERN.exec(channel.name);
	if(nameMatch)
		hitData.urlFilename = nameMatch[1]; 

	hitData.title = hitData.headerFilename || hitData.urlFilename || _("media");
	
	if(extMatch) {
		hitData.type = "video";
		hitData.extension = extMatch[1];		
	} else if(contentTypeMatch) {
		hitData.type = contentTypeMatch[1];
		hitData.extension = contentTypeMatch[2];
	} else
		hitData.extension = urlExtension;

	
	var length = null;
	var contentRange = GetRespHeader(channel,"Content-Range");
	if(contentRange) {
		var m = RANGE_PATTERN.exec(contentRange);
		if(m)
			length = m[1];
	}
	if(!length)
		length = contentLength;
	length = parseInt(length);
	if(!isNaN(length))
		hitData.length = length;
	
	function WorkerForContent(tab,specForUrl,topUrl,lcExt,chunkedInfo) {
		chrome.tabs.executeScript(tab.id,{
			file: "data/pagedata-content.js",
		},function() {
		    chrome.tabs.sendRequest(tab.id, {
		    	type: "get-title",
		    	specs: [specForUrl.spec],
				thumbnailFromMeta: simplePrefs.prefs["thumbnail.from-meta"]
		    }, function(message) {
		    	if(simplePrefs.prefs['smartnamer.enabled'])
		    		hitData.title = message.title || _("media");
				hitData.thumbnailUrl = message.thumbnailUrl;
				if(chunkedInfo)
					chunkedInfo.handleHit(hitData);
				else {
	    			NotifyHit(hitData);
					smartNames.updateHit(hitData);
				}
		    });
		});
	}

	function HandleURL(tab,window) {
		var isDirectMedia = false;
		try {
			isDirectMedia = /^(audio|video)/.test(window.document.contentType);
		} catch($_) {}
		var topUrl = hitData.topUrl;
		var lcExt = hitData.extension ? hitData.extension.toLowerCase():"";
		var specForUrl = smartNames.specForUrl(topUrl);
		if(!specForUrl.contentNeeded || isDirectMedia) {
	    	hitData.pageUrl = window.url;
	    	if(specForUrl.spec.mode=="obfuscated")
	    		hitData.title = smartNames.getObfuscated(hitData.topUrl);
	    	NotifyHit(hitData);
			smartNames.updateHit(hitData);
		} else if(specForUrl.spec.delay)
			timers.setTimeout(function() {
				WorkerForContent(specForUrl,topUrl,lcExt,chunkedInfo);
			},specForUrl.spec.delay);
		else
			WorkerForContent(tab,specForUrl,topUrl,lcExt,chunkedInfo);
	}
	
	chrome.tabs.get(request.tabId,function(tab) {
		if(tab) {

			hitData.topUrl = tab.url;
			hitData.isPrivate = tab.incognito;
			hitData.title = hitData.headerFilename || hitData.urlFilename || tab.title || _("media");
			var frame0 = null;
			chrome.webNavigation.getAllFrames({
				tabId: request.tabId,
			},function(frames) {
				frames.forEach(function(frame) {
					if(frame.frameId==request.frameId)
						frame0 = frame;
				});
				if(frame0) {
					HandleURL(tab,frame0);
				}
			});
		}
	});
}

function NotifyHit(hitData) {
	listeners.forEach(function(listener) {
		listener(hitData);
	});
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


chrome.webRequest.onResponseStarted.addListener(ListenResponse,{
	urls: ["<all_urls>"]
},["responseHeaders"]);




});