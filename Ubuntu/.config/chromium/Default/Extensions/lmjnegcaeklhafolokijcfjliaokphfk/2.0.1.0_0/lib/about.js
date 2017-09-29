define("about",function(exports) {


const self = chrome.runtime.getManifest();
const tabs = require("sdk/tabs");

const vdhPanels = require("./panels");

function ToggleAboutPanel() {
	vdhPanels.togglePanel('about',{
		contentURL: "aboutPanel.html",
		top: 10,
		jsFiles: "aboutPanel.js",
		onShow: function(panel) {
			panel.port.emit("contentMessage",{
				type: "set",
				name: "addon",
				value: self,
			});			
		},
		onMessage: function(message,panel) {
			switch(message.type) {
			case "goto":
				panel.hide();
				var url = "http://www.downloadhelper.net/";
				switch(message.where) {
				case 'support': 
					url = "https://groups.google.com/forum/#!forum/video-downloadhelper-for-chrome";
					break;
				case 'howto': 
					url = "http://www.downloadhelper.net/howto.php?version="+self.version;
					break;
				case 'alpha-support': 
					url = "https://groups.google.com/forum/#!forum/video-downloadhelper-for-chrome";
					break;
				case 'jocly': 
					url = "https://addons.mozilla.org/firefox/addon/jocly/";
					break;
				case 'cphelper':
					url = "https://www.downloadhelper.net/goto-cphelper";
					break;
				case 'url': 
					url = message.url;
					break;
				}
				tabs.open({
					url: url,
				});
				break;
			}
		},
	});
}

exports.toggle = ToggleAboutPanel;


});