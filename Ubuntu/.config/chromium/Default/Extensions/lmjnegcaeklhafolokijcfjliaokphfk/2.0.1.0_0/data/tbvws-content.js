
function CheckPage(sendResponse) {

	var url=window.location.href;
	function GetVideoId() {
		var m = /[\?&]v=([a-zA-Z0-9\-_]+)/.exec(url);
		if(m)
			return m[1];
		m = /\/embed\/([a-zA-Z0-9\-_]+)/.exec(url);
		if(m)
			return m[1];
		return null;
	}

	var videoId = GetVideoId();

	var videoMessage = {
		type: "detected-video",
		pageUrl: url,
	}

	if(videoId) {
		videoMessage.videoId = videoId;
		videoMessage.source = url;
		var m = /^(https?:\/\/(?:[^\/]*\.)?\x79\x6f\x75\x74\x75\x62\x65(?:\.co)?\.(?:[^\.\/]+))\//.exec(url);
		if(m)
			videoMessage.baseUrl = m[1];
	}

	videoMessage.hasVideo = !!videoId;	

	sendResponse(videoMessage);	
}

chrome.extension.onRequest.addListener(function(message, sender, sendResponse) {
	if(message.type=="detect-video") {
		CheckPage(sendResponse);
	}
});
