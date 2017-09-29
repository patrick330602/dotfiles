define("chunks",function(exports) {

const $chrome = require("chrome");
const Cc = $chrome.Cc;
const Ci = $chrome.Ci;
const Cu = $chrome.Cu;
const CC = $chrome.CC;

const merge = require('sdk/util/object').merge;
const timers = require("sdk/timers");
const simplePrefs = require("sdk/simple-prefs");
const _ = require("sdk/l10n").get;
const Request = require("sdk/request").Request;

const hits = require("./hits");
const utils = require("./utils");
const log = require("./log");
const m3u8 = require("./m3u8");
const hls = require("./hls");
const dash = require("./dash");
const f4f = require("./f4f");
const amf = require("./amf");

const JSON_MASTER_PATTERN = new RegExp("^https?://.*/master\\.json");
const DASH_XML_CT_PATTERN = new RegExp("dash.*mpd");
const M3U8_PATTERN = new RegExp("^https?://.*\\.m3u8(?:\\?|$)");
const JSON_HLS_PS_PATTERN = new RegExp("^https?://api\\.periscope\\.tv/api/v2/getAccessPublic");
const EMPTY_LINE_PATTERN = new RegExp("^\\s*$");

const F4F_PATTERN = new RegExp("^https?://.*\\.f4m(?:\\?|$)");
const F4F_PATTERN_FRAG = new RegExp("^(https?://.*)Seg1\\-Frag([0-9]+)(\\?.*)?$");


exports.networkHook = function(channel,meta) {
	if(!simplePrefs.prefs["chunks.enabled"])
		return null;
	var probe = null;
	if(simplePrefs.prefs["dash.enabled"]) {
		if(JSON_MASTER_PATTERN.test(channel.name))
			probe = new Dash(channel.name,"json",meta);
		else if(meta.contentType && DASH_XML_CT_PATTERN.test(meta.contentType.toLowerCase()))
			probe = new Dash(channel.name,"xml",meta);
	}
	if(simplePrefs.prefs["hls.enabled"]) {
		if(M3U8_PATTERN.test(channel.name))
			probe = new Hls(channel.name);
		else if(JSON_HLS_PS_PATTERN.test(channel.name))
			probe = new Hls(channel.name,"json");		
		else if(meta.contentType && meta.contentType.toLowerCase().indexOf("mpegurl")>=0)
			probe = new Hls(channel.name);
	}
	if(!probe && simplePrefs.prefs["f4f.enabled"]) {
		probe = F4f.getProbe(channel);
	}
	if(probe) {
		if(!probe.skipManifest) {
			Request({
				url: channel.name,
				onComplete: function(response) {
					probe.handleManifest(response.text);
					probe.checkReady();
				},
			}).get();

		}
		return probe;
	}
	return null;
}

function Probe() {
}

Probe.prototype = {
	init: function(type) {
		this.type = type;
		this.receivedChunks = [];
	},
	handleHit: function(hitData) {
		this.hitData = hitData;
		this.checkReady();
	},
	checkReady: function() {},
	handleManifest: function() {},
	handle: function() {},
};

function Dash(url,format,meta) {
	this.format = format;
	this.manifestUrl = url;
	this.meta = meta;
	this.init("dash");
}

Dash.prototype = new Probe();

Dash.prototype.handleManifest = function(body) {
	try {
		if(this.format=="json") {
			var mpd = JSON.parse(body);
			if(mpd && Array.isArray(mpd.video) && mpd.video.length>0 && Array.isArray(mpd.video[0].segments) && mpd.video[0].segments.length>0)
				this.mpd = mpd;
		} else if(this.format=="xml") {
		}
	} catch(e) { 
		console.error("Error parsing DASH manifest",e.message || e); 
	}
}
Dash.prototype.checkReady = function() {
	if(this.hitData && (this.mpd || this.handler))
		this.handle();
}
Dash.prototype.handle = function() {
	var hash = utils.md5(this.hitData.url);
	var self = this;
	if(this.handler)
		this.handler(this.hitData);
	else if(this.mpd)
		this.mpd.video.forEach(function(video,index) {
			var hitData = merge({},self.hitData,{
				id: "dash:"+hash+"-"+index,
				"extension": "mp4",
				_mpd: video,
				length: null,
				chunked: "dash",
				descrPrefix: _("dash-streaming"),
				group: "grp-"+hash,
			});
			hitData._mpd.commonBaseUrl = self.mpd.base_url;
			if(video.width && video.height)
				hitData.size = video.width + "x" + video.height;
			if(video.duration)
				hitData.duration = Math.round(video.duration);
			hits.newData(hitData);
		});
}

function Hls(url,masterFormat) {
	this.init("hls");
	this.masterFormat = masterFormat || "m3u8"; 
	this.mediaUrl = url;
}

Hls.prototype = new Probe();

Hls.prototype.handleHit = function(hitData) {
	delete hitData.length;
	hitData.group = "grp-" + utils.md5(hitData.url);
	if(simplePrefs.prefs["m3u8.details"])
		hitData.masterManifest = hitData.url;
	Probe.prototype.handleHit.call(this,hitData);
}

Hls.prototype.handleManifest = function(body) {
	var manifest = null;
	if(this.masterFormat=="m3u8")
		manifest = m3u8.get(body,this.mediaUrl);
	else if(this.masterFormat=="json")
		manifest = m3u8.getPsJson(body,this.mediaUrl);
	if(manifest) {
		if(manifest.isMaster())
			this.master = manifest;
		else if(manifest.isMedia())
			this.media = manifest;
	}
}
Hls.prototype.checkReady = function() {
	if(this.hitData && (this.master || this.media))
		this.handle();
}
Hls.prototype.handle = function() {
	if(this.master)
		hls.handleMaster(this.master,this.hitData);
	else if(this.media)
		hls.handleMedia(this.media,this.hitData,this.mediaUrl);
}

function F4f(url) {
	this.init("f4f");
	this.f4fUrl = url;
	if(simplePrefs.prefs['f4f.frag-index']) {
		var url0 = new URL(url);
		var rootUrl = /^([^\?]*?)([^\/]*\?.*|[^\/]*)$/.exec(url0.protocol+"//"+url0.host+url0.pathname)[1];
		F4f.waitingForFrag[rootUrl] = this;
	}
}

F4f.getProbe = function(channel) {
	if(F4F_PATTERN.test(channel.name)) {
		return new F4f(channel.name);
	} else if(simplePrefs.prefs['f4f.frag-index']) {
		var m = F4F_PATTERN_FRAG.exec(channel.name);
		if(m) {
			var rootUrl = channel.name;
			while(true) {
				var url0 = new URL(rootUrl);
				var rootUrl = /^(https?:\/\/[^\/]+\/.*?)(\/|[^\/]+)$/.exec(url0.protocol+"//"+url0.host+url0.pathname);
				if(!rootUrl) {
					// manifest was missed, construct the probe from the data fragment
					var probe = new F4f(channel.name);
					//probe.startFrag = parseInt(m[2]);
					probe.startFrag = 1;
					probe.postFrag = m[3];
					probe.skipManifest = true;
					probe.rootUrl = m[1];
					probe.medias = {};
					probe.medias[m[1]] = {
						urlHint: m[1],
					}
					return probe;
				}
				rootUrl = rootUrl[1];
				var probe1 = F4f.waitingForFrag[rootUrl];
				if(probe1)
					delete F4f.waitingForFrag[rootUrl];
				else
					for(var pid in F4f.waitingForFrag) {
						var probe0 = F4f.waitingForFrag[pid];
						for(var mid in probe0.medias) {
							var media = probe0.medias[mid];
							if(media.urlHint==rootUrl) {
								delete F4f.waitingForFrag[pid];
								probe1 = probe0;
								break;
							}
						}
						if(probe1)
							break;
					}
				if(probe1) {
					var hit = hits.getF4fHitDataByUrlHint(m[1]);
					if(hit)
						return null;
					if(!probe1.startFrag)
						probe1.startFrag = parseInt(m[2]);
					if(!probe1.postFrag)
						probe1.postFrag = m[3];
					probe1.checkReady();
					return null;
				}
			}
		}
		return null;
	}	
}

F4f.waitingForFrag = {};

F4f.prototype = new Probe();

F4f.prototype.checkReady = function() {
	if(this.hitData && this.medias && (this.startFrag || !simplePrefs.prefs['f4f.frag-index']))
		this.handle();
}

F4f.prototype.handleManifest = function(body) {
	var doc = new DOMParser().parseFromString(body, "application/xml");
	var durationElement = doc.querySelector("duration");
	if(durationElement)
		this.duration = parseInt(durationElement.firstChild.nodeValue);
	var bis = doc.querySelectorAll("bootstrapInfo");
	this.medias = {};
	for(var i=0;i<bis.length;i++) {
		var bi = bis.item(i);
		var id = bi.getAttribute("id");
		var data = (bi.firstChild && utils.toByteArray(bi.firstChild.nodeValue)) || null;
		this.medias[id] = {
			bootstrap: data,
		}
	}
	var mes = doc.querySelectorAll("media");
	for(var i=0;i<mes.length;i++) {
		var m = mes.item(i);
		var mid = m.getAttribute("bootstrapInfoId");
		var media = this.medias[mid];
		if(media) {
			media.bitrate = parseInt(m.getAttribute("bitrate"))*1000;
			media.urlHint = new URL(m.getAttribute("url"),this.f4fUrl).href;
			var metaElement = m.querySelector("metadata");
			if(metaElement) {
				var metaBytes = (metaElement.firstChild && utils.toByteArray(metaElement.firstChild.nodeValue)) || null;
				if(metaBytes) {
					var metaVars = amf.decode(metaBytes);
					if(metaVars && metaVars.length>=2 && metaVars[0]=="onMetaData")
						media.meta = metaVars[1];
				}
			}
		}
	}
}

F4f.prototype.handle = function() {
	var group = "grp-" + utils.md5(this.rootUrl || this.hitData.url);
	for(var id in this.medias) {
		var media = this.medias[id];
		if(this.skipManifest) {
			var oldHitData = hits.getF4fHitDataByUrlHint(media.urlHint);
			if(oldHitData)
				continue;
		}
		this.hitData.url = this.rootUrl || this.hitData.url;
		var hash = utils.md5(this.hitData.url+id);
		var hitData = merge({},this.hitData,{
			id: "f4f:"+hash,
            "extension": "flv",
			bitrate: media.bitrate,
			_media: media,
			length: null,
			chunked: "f4f",
			descrPrefix: _("f4f-streaming"),
			startFrag: this.startFrag,
			postFrag: this.postFrag || "",
			group: group,
		});
		if(this.duration)
			hitData.duration = this.duration;
		if(media.meta) {
			var meta = media.meta;
			if(meta.duration)
				hitData.duration = Math.round(meta.duration);
			if(meta.width && meta.height)
				hitData.size = meta.width + "x" + meta.height;
			if(meta.filesize)
				hitData.length = meta.filesize;
			if(meta.framerate)
				hitData.fps = meta.framerate;
		}
		hits.newData(hitData);
	}
}

exports.download = function(action,specs,successFn,errorFn,progressFn) {
	specs.ignoreSpecs = true;
	var chunkSet = null;
	switch(action.hit.data.chunked) {
	case "hls":
		chunkSet = hls.getChunkSet(action.hit.data);
		break;
	case "dash":
		chunkSet = new dash.DashChunkset();
		chunkSet.init(action.hit.data);
		break;
	case "f4f":
		chunkSet = new f4f.F4fChunkset();
		chunkSet.init(action.hit.data);
		break;
	}
	if(!chunkSet) {
		log.error("Requested download of chunked stream, but no chunkset found");
		action.cleanup();
		action.hit.setCurrentAction(null);
		action.notifyRunning(false);
		return;
	}
	chunkSet.download(action,specs,successFn,errorFn,progressFn);
}



});