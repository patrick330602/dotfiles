
if(typeof pdInitialized == "undefined") {
	var pdInitialized = true;

	var windowLocation = window.location.href; 

	chrome.extension.onRequest.addListener(function(message, sender, sendResponse) {
		if(message.type=="get-title") {
			var thUrl = null;
			if(message.thumbnailFromMeta) {
				var thSels = [{
					sel: "meta[property='og:image:secure_url']",
					attr: "content"
				},{
					sel: "meta[property='og:image']",
					attr: "content"
				},{
					sel: "link[rel='thumbnail']",
					attr: "href"
				},{
					sel: "link[rel='image_src']",
					attr: "href"
				},{
					sel: "meta[property='twitter:image']",
					attr: "content"
				}];
				for(var i=0;i<thSels.length && !thUrl;i++) {
					var thSel = thSels[i];
					var elem = document.querySelector(thSel.sel);
					if(elem)
						thUrl = elem.getAttribute(thSel.attr) || null;
				}
			}
			if(thUrl) {
				var link = document.createElement("a");
				link.href = thUrl;
				thUrl = link.href; // make url absolute
			}
			if(message.title) {
				sendResponse({
					title: message.title,
					url: windowLocation,
					thumbnailUrl: thUrl,
				});
				return;
			}

			var specs = message.specs.concat([{
				xpath: "/html/head/title",
			}]);
			for(var i = 0;i<specs.length;i++) {
				var spec = specs[i];
				var title = null;
				try {
					title = document.evaluate(spec.xpath,document, null, XPathResult.STRING_TYPE, null).stringValue;
				} catch($_) {
				}
				if(title) {
					try {
						var re = new RegExp(spec.regexp || ".*","g");
						var match = re.exec(title.trim().replace(/\s+/g,' '));
						if(match) {
							if(match[1])
								title = match[1];
							else
								title = match[0];
							if(title.length==0)
								title = null;
						} else
							title = null;
					} catch(e) {
						title = null;
					}
				}
				if(title) {
					sendResponse({
						title: title,
						url: windowLocation,
						thumbnailUrl: thUrl,
					});
					return;
				}
			}
			sendResponse({
				title: null,
				url: windowLocation,
				thumbnailUrl: thUrl,
			});
		}
	});
}
