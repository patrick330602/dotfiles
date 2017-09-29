define("menus",function(exports) {
	
	const _ = require("sdk/l10n").get;
	
	chrome.contextMenus.create({
		title: _('define-vdh-smartname'),
		contexts: ["selection"],
		onclick: function(info,tab) {
			require("smartnames").defineXPath(tab.id);
		}
	});

	function DoOperation(action) {
		switch(action) {
		case 'about':
			require("./about").toggle();
			break;
		case 'settings':
			require("./settings").toggle();
			break;
		case 'sites':
			require("./sites").show();
			break;
		case 'clearhits':
			require("./hits").clear("all");
			break;
		}	
	}

	exports.doOperation = function(action) {
		DoOperation(action);
	}
	
});
