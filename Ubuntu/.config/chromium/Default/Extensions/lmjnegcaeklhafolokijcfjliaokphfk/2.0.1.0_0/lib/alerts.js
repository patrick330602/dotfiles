define("alerts",function(exports) {


const panels = require("./panels");

exports.alert = function(options) {
	panels.openPanel('alert',{
		contentURL: "alertPanel.html",
		closeTimeout: 0,
		jsFiles: [
		    "alertPanel.js"
		],
		onShow: function(panel) {
			panel.port.emit("contentMessage",{
				type: "set",
				name: "options",
				value: options,
			});
		},
		onMessage: function(message,panel) {
			if(options.onMessage)
				options.onMessage(message,panel);
		},
		onHide: function() {
			if(options.onHide)
				options.onHide();
		},
	});
}


});