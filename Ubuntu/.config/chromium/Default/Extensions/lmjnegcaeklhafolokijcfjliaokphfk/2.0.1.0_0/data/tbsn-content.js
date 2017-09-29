
chrome.runtime.onConnect.addListener(function(port) {
	if(port.name!="vdh:tbsn")
		return;


	var videos = {};
	var image_re = new RegExp("url\\(\"(.*)\"\\)");
	var extract_vid_re = new RegExp("/videos/([0-9]{10,})");
	var unblob_re = new RegExp("^(?:blob\\:)?(.*)");
	var contentHeight = 0;


	function GetVideoData(videoId) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status == 200) {
				var resp = JSON.parse(xmlhttp.responseText);
				if(!resp.source)
					return;
				var message = {
					type: 'tbsn-video-data',
					url: resp.source,
					pageUrl: window.location.href,
					topUrl: window.top.location.href,
				}
				message.source = resp.source;
				if(resp.name) message.name = resp.name;
				if(resp.picture) message.picture = resp.picture;
				if(resp.from && resp.from.name) message.fromName = resp.from.name;
				if(resp.length) message.duration = Math.round(resp.length);
				port.postMessage(message);
			}
		}
		xmlhttp.open("GET", "https://graph.facebook.com/"+videoId+"?fields=name,picture,source,from,length", true);
		xmlhttp.send();
	}

	function CheckVideos() {
		if(document.body.clientHeight<=contentHeight)
			return;
		contentHeight=document.body.clientHeight;
		var elems = document.querySelectorAll("[data-video-id]");
		for(var i=0; i<elems.length; i++) {
			var elem = elems[i];
			var videoId = elem.getAttribute("data-video-id");
			if(!videos[videoId]) {
				videos[videoId] = 1;
				GetVideoData(videoId);

			}
		}
	}

	CheckVideos();

	setInterval(CheckVideos,1000);

});

