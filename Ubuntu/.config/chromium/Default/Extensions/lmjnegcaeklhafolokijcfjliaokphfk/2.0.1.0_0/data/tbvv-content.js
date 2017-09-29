(function() {

	var configElem = document.getElementById("configuration");

	if(configElem && configElem.firstChild) {
		try {
			var config = JSON.parse(configElem.firstChild.nodeValue);
			if(config.post) {
				return {
					type: 'tbvv-video-data',
					data: config.post,
					pageUrl: window.location.href,
					topUrl: document.referrer
				};
			}
		} catch(e) {
		}
	}

	return null;

})();
