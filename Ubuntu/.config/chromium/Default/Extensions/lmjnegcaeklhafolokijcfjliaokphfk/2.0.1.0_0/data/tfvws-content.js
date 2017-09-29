
var url = window.location.href;

var videoMessage = null;

var scripts = document.querySelectorAll('script');
for(var i=0; i<scripts.length; i++) {
	var script = scripts[i];
	if(script.getAttribute("src"))
		continue;
	var nodeText = script.firstChild;
	if(!nodeText)
		continue;
	var m = /buildPlayer\((.*)\);/.exec(nodeText.nodeValue);
	if(!m)
		m = /window\.playerV5 *=.*?,(.*)\);/.exec(nodeText.nodeValue);
	if(!m)
		continue;
	try {
		var data = JSON.parse(m[1]);
		videoMessage = {
			type: "detected-video",
			pageUrl: url,
			source: url,
			videoId: data.metadata.id,
			hasVideo: true,
			data: data.metadata,
		}
		break;
	} catch($_) {};
}

chrome.extension.onRequest.addListener(function(message, sender, sendResponse) {
	if(message.type=="detect-video") {
		if(videoMessage)
			sendResponse(videoMessage);
	}
});
