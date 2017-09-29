define("funding",function(exports) {


const simplePrefs = require("sdk/simple-prefs");
const panels = require("./panels");
const tabs = require("sdk/tabs");
const ga = require("ga"); 

const vdhPanels = require("./panels");

if(simplePrefs.prefs['donate-not-again'] && simplePrefs.prefs['donate-not-again-expire']==0)
	simplePrefs.prefs['donate-not-again-expire'] = Math.round(Date.now()/1000) + 60 * 60 * 24 * 30 * 3;

function Congrats(count) {
	if(simplePrefs.prefs['donate-not-again-expire'] && Math.round(Date.now()/1000)<simplePrefs.prefs['donate-not-again-expire'])
		return;
	var status = require("./converter").config().license.status; 
	if(status!="unneeded" && status!="unchecked")
		return;
	ga.donationOpen() 
	vdhPanels.togglePanel('funding',{
		contentURL: "fundingPanel.html",
		top: 10,
		jsFiles: [
		    "lib/jquery.min.js",
			"lib/bootstrap/bootstrap.min.js",
		    "fundingPanel.js"
		],
		onShow: function(panel) {
			panel.port.emit("contentMessage",{
				type: "set",
				name: "count",
				value: count,
			});				
		},
		onMessage: function(message,panel) {
			switch(message.type) {
			case "donate":
				panel.hide();
				ga.donationGo() 
				tabs.open({
					url: "http://www.downloadhelper.net/donate.php",
				});
				break;
			case "review":
				panel.hide();
				ga.donationReview() 
				tabs.open({
					url: "https://addons.mozilla.org/firefox/addon/video-downloadhelper/reviews/add",
				});
				break;
			case "donate-later":
				panel.hide();
				ga.donationDelay() 
				simplePrefs.prefs['donate-not-again-expire'] = Math.round(Date.now()/1000) +  60 * 60 * 24 * 30;
				break;
			}
		},
	});
}

exports.newDownload = function() {
	var count = simplePrefs.prefs['download-count'];
	count++;
	simplePrefs.prefs['download-count'] = count;
	if(count%100 == 0)
		Congrats(count);
}

exports.donated = function() {
	ga.donationDonate() 
	simplePrefs.prefs['donate-not-again-expire'] = Math.round(Date.now()/1000) +  60 * 60 * 24 * 365;
}



});