(function() {

	var playerContainer = document.getElementById("playerContainer");
	if(playerContainer) {
		try {
			var data = JSON.parse(playerContainer.getAttribute("data-config"));
			return {
				type: 'tbts-video-data',
				url: document.URL,
				picture: data.status && data.status.entities && data.status.entities.media && data.status.entities.media.length &&
					( data.status.entities.media[0].media_url_https || data.status.entities.media[0].media_url ),
				title: data.videoInfo && data.videoInfo.title,
				publisher: data.videoInfo && data.videoInfo.publisher && data.videoInfo.publisher.name,
				manifestUrl: data.video_url,
			}
		} catch(e) {
		}
	}
	return null;

})();

