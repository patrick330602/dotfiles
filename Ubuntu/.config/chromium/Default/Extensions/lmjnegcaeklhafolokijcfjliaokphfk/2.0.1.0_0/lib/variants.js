
define("variants",function(exports) {

const merge = require('sdk/util/object').merge;

const TYPE_RE = new RegExp("^(audio|video)/(?:x\\-)?([^;]+)(?:;\\+codecs=\"(.+)\")?$");

const knownVariants = {
	        "22": {
	            "extension": "mp4",
	            "quality": "hd720",
	            "audioCodec": "+mp4a.40.2",
	            "videoCodec": "avc1.64001F",
	            "enabled": true,
	            "label": "MP4 - 1280x720",
	            "size": "1280x720",
	        },
	        "18": {
	            "extension": "mp4",
	            "quality": "medium",
	            "audioCodec": "+mp4a.40.2",
	            "videoCodec": "avc1.42001E",
	            "enabled": true,
	            "label": "MP4 - 480x360",
	            "size": "480x360",
	        },
	        "43": {
	            "extension": "webm",
	            "quality": "medium",
	            "audioCodec": "+vorbis",
	            "videoCodec": "vp8.0",
	            "enabled": true,
	            "label": "WEBM - 480x360",
	            "size": "480x360",
	        },
	        "5": {
	            "extension": "flv",
	            "quality": "small",
	            "audioCodec": null,
	            "videoCodec": null,
	            "enabled": true,
	            "label": "FLV - 320x240",
	            "size": "320x240",
	        },
	        "36": {
	            "extension": "3gpp",
	            "quality": "small",
	            "audioCodec": "+mp4a.40.2",
	            "videoCodec": "mp4v.20.3",
	            "enabled": true,
	            "label": "3GPP - 320x240",
	            "size": "320x240",
	        },
	        "17": {
	            "extension": "3gpp",
	            "quality": "small",
	            "audioCodec": "+mp4a.40.2",
	            "videoCodec": "mp4v.20.3",
	            "enabled": true,
	            "label": "3GPP - 176x144",
	            "size": "176x144",
	        },
}

exports.getHitsFromVariants = function(video,variants,options) {
	var hits = {};
	variants.forEach(function(variant) {
		if(!variant.url)
			return;
		var id = video.from+":"+variant.itag;
		var type = "audio/video";
		var audioCodec = null;
		var videoCodec = null;
		var extension = null;

		var typeMatch = TYPE_RE.exec(variant.type);
		if(typeMatch) {
			extension = typeMatch[2];
			if(typeMatch[1]=="audio") {
				type = "audio";
				audioCodec = typeMatch[3] || null;
			} else if(typeMatch[3]) {
				var codecs = typeMatch[3].split(",");
				if(codecs.length==1) {
					type = "video";
					videoCodec = codecs[0];
				} else {
					videoCodec = codecs[0];
					audioCodec = codecs[1];
				}
			} else if(typeMatch[1]=="video") {
				type = "video";
			}
		}
		
		if(type==="audio/video") {
			var hitData = {
				id: video.from+":"+video.videoId+":"+variant.itag,
				url: variant.url,
			}
			if(variant.quality)
				hitData.quality = variant.quality;
			if(variant.size)
				hitData.size = variant.size;
			if(variant.fps)
				hitData.fps = variant.fps;

			if(variant.itag) {
				var knownVariant = knownVariants[variant.itag];
				if(knownVariant) {
					if(!extension && knownVariant.extension)
						hitData.extension = knownVariant.extension;
					if(!hitData.quality && knownVariant.quality)
						hitData.quality = knownVariant.quality;
					if(!hitData.size && knownVariant.size)
						hitData.size = knownVariant.size;
				}
			}
			hitData.extension = extension || "mp4";

			hits[id] = hitData;
		}
	});
	var pubHits = [];
	for(varId in hits) {
		pubHits.push(merge({},video,hits[varId]));
	}
	return pubHits;
}
	
});
