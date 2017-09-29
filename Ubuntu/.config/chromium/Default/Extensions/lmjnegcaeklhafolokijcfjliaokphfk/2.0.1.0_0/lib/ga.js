
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-1041911-53']);
//_gaq.push(['_trackPageview']);
(function() {
	  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  ga.src = 'https://ssl.google-analytics.com/ga.js';
	  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

const DOMAIN_RE = new RegExp("//([^:/]*)"); 
const BASE_RE = new RegExp("([^\\.]+)\.(?:co\\.)?[^\\.]+$");
const SAMPLING_FACTOR = 100;

define("ga",function(exports) {

	exports.downloadSuccess = function(data) {
		if(Math.floor(Math.random()*SAMPLING_FACTOR)>0)
			return;
		try {
			var topDomain = DOMAIN_RE.exec(data.topUrl)[1];
			var mediaDomain = DOMAIN_RE.exec(data.url)[1];
			var label = topDomain+'/';
			if(data.isPrivate)
				label += 'P'
			try {
				var baseTopDomain = BASE_RE.exec(topDomain)[1];
				var baseMediaDomain = BASE_RE.exec(mediaDomain)[1];
				if(baseTopDomain==baseMediaDomain)
					label += 'H';
			} catch(_e) {}
			_gaq.push(['_trackEvent', 'Video', 'download',label]);
		} catch(e) {}
	}
	
	exports.downloadError = function(data,error) {
		try {
			var topDomain = DOMAIN_RE.exec(data.topUrl)[1];
			_gaq.push(['_trackEvent', 'Video', 'fail',domain+":"+(error||"UNSPECIFIED")]);
		} catch(e) {}
	}

	exports.donationOpen = function() {
		try {
			_gaq.push(['_trackEvent', 'Donation', 'open']);
		} catch(e) {}
	}
	
	exports.donationGo = function() {
		try {
			_gaq.push(['_trackEvent', 'Donation', 'go']);
		} catch(e) {}
	}
	
	exports.donationReview = function() {
		try {
			_gaq.push(['_trackEvent', 'Donation', 'review']);
		} catch(e) {}
	}
	
	exports.donationDelay = function() {
		try {
			_gaq.push(['_trackEvent', 'Donation', 'delay']);
		} catch(e) {}
	}
	
	exports.donationDonate = function() {
		try {
			_gaq.push(['_trackEvent', 'Donation', 'donate']);
		} catch(e) {}
	}
	
	exports.blacklistAdded = function(domain) {
		try {
			_gaq.push(['_trackEvent', 'Blacklist', 'added', domain]);
		} catch(e) {}
	}
	
});
