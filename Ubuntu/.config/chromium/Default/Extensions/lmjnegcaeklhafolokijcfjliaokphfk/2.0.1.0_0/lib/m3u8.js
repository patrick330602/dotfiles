define("m3u8",function(exports) {

const $chrome = require("chrome");
const Cc = $chrome.Cc;
const Ci = $chrome.Ci;
const Cu = $chrome.Cu;

const merge = require('sdk/util/object').merge;

const EXT_PATTERN = new RegExp("^#(EXT[^\\s:]+)(?::(.*))");
const ATTR_PATTERN = new RegExp("^\\s*([^=\\s]+)\\s*=\\s*(?:\"([^\"]*?)\"|([^,]*)),?\s*(.*?)\s*$");
const STRING_PATTERN = new RegExp("^\\s*\"(.*)\"\\s*$");

function M3U8() {
}

M3U8.prototype = {
	init: function() {
		this.tags = {}
		this.segments = [];
		this.valid = false;		
	},
	parse: function(text,baseUrl) {
		var lines = text.split(/[\r\n]+/);
		if(lines.length==0)
			return;
		if(lines[0].trim()!="#EXTM3U")
			return;
		this.master = true;
		var segments = [];
		var tags = {};
		for(var i=1;i<lines.length;i++) {
			var line = lines[i].trim();
			if(line=="")
				continue;
			if(line[0]=="#") {
				if(line.indexOf("#EXT")!=0)
					continue;
				var m = EXT_PATTERN.exec(line);
				if(!m)
					continue;
				if(m[1]=="EXTINF")
					this.master = false;
				tags[m[1]] = m[2];
			} else
				segments.push({
					url: new URL(line,baseUrl).href,
					tags: merge({},tags),
				});
		}
		if(segments.length==0)
			return;
		for(var tag in segments[0].tags) {
			var value0 = segments[0].tags[tag];
			var common = true;
			for(var i = 1;i<segments.length;i++) {
				var segment = segments[i];
				if(segment.tags[tag]!==value0) {
					common = false;
					break;
				}
			}
			if(common)
				this.tags[tag] = this.parseAttrs(value0);
		}
		for(var i = 0;i<segments.length;i++) {
			var segment = segments[i];
			var segment0 = {
				url: segment.url,
				tags: {},
			}
			for(var tag in segment.tags)
				if(typeof this.tags[tag]=="undefined")
					segment0.tags[tag] = this.parseAttrs(segment.tags[tag]);
			this.segments.push(segment0);
		}
		this.valid = true;
	},
	
	parseAttrs: function(attrs) {
        var m = STRING_PATTERN.exec(attrs);
        if(m)
            return m[1];
		if(attrs.indexOf("=")<0)
            return attrs;
		var attrsMap = {};
		var remains = attrs;
		while(remains.length>0) {
			var m = ATTR_PATTERN.exec(remains);
			if(!m)
				break;
			var attrName = m[1];
			var attrValue = m[2] || m[3];
			attrsMap[attrName] = attrValue;
			remains = m[4];
		}
		return attrsMap;
	},
	
	isMaster: function() {
		return this.valid && this.master;
	},

	isMedia: function() {
		return this.valid && !this.master;
	},
	
	walkThrough: function(callback) {
		var self = this;
		this.segments.forEach(function(segment,index) {
			callback(segment.url,merge({},self.tags,segment.tags),index);
		});
	}
}

function PsJsonM3U8() {}

PsJsonM3U8.prototype = new M3U8();

PsJsonM3U8.prototype.parse = function(text,baseUrl) {
	try {
		var https = baseUrl.indexOf("https") == 0;
		var manifest = JSON.parse(text);
		if(manifest.hls_url && !https)
			this.segments.push({
				url: manifest.hls_url,
				tags: {},
			});
		if(manifest.https_hls_url && https)
			this.segments.push({
				url: manifest.https_hls_url,
				tags: {},
			});
		if(this.segments.length>0) {
			this.valid = true;
			this.master = true;
		}
	} catch(e) {}
}

exports.get = function(text,baseUrl) {
	var m3u8 = new M3U8();
	m3u8.init();
	m3u8.parse(text,baseUrl);
	return (m3u8.valid && m3u8) || null;
}

exports.getPsJson = function(text,baseUrl) {
	var m3u8 = new PsJsonM3U8();
	m3u8.init();
	m3u8.parse(text,baseUrl);
	return (m3u8.valid && m3u8) || null;
}


});