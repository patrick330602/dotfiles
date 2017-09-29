
define("panels",function(exports) {

	const merge = require("sdk/util/object").merge;	
	const simplePrefs = require("sdk/simple-prefs");
	const prefs = require("prefs");
	const utils = require("utils");
	const self = chrome.runtime.getManifest();

	
	var vdhPanels = {};
	var vdhPanelData = {};

	function UpdateOptions(options) {
		var options2 = merge({
			showOpts: function() { return {} },
			type: "panel",
			estimatedHeight: 300,
			lang: null,
			contentURL: null,
			jsFiles: [],
			onShow: function() {},
			onHide: function() {},
			onCreate: function() {},
			onDelete: function() {},
			onMessage: function() {},
			closeTimeout: 60000,
			closeTimer: null,
			prefs: true,
		},options || {});
		for(var f in options2)
			options[f] = options2[f];
	}
	
	exports.declarePanel = function(panelName, options) {
		UpdateOptions(options);
		vdhPanels[panelName] = {
			open: false,
			options: options,
		}
		options.lang = self.current_locale;
	}
	
	exports.togglePanel = function(panelName, options) {
		exports.declarePanel(panelName,options);
		if(options.type=="panel") 
			chrome.windows.getCurrent(function(currentWindow) {
				var width = simplePrefs.prefs['max-panel-width'];
				chrome.windows.create({
					url: "data/"+options.contentURL+"?panel="+panelName,
					type: "detached_panel",
					focused: true,
					width: width,
					height: 100,
					left: Math.round((currentWindow.width-width)/2+currentWindow.left),
					top: currentWindow.top,
					
				},function(window) {
					vdhPanels[panelName].windowId = window.id;
					function OnFocusChanged(focusedWindowId) {
						chrome.windows.getCurrent(function(currentWindow) {
							if(currentWindow.id!=window.id)
								chrome.windows.remove(window.id);
						});
					}
					function OnRemoved(removedWindowId) {
						if(removedWindowId==window.id) {
							chrome.windows.onFocusChanged.removeListener(OnFocusChanged);
							chrome.windows.onFocusChanged.removeListener(OnRemoved);
						}
					}
					chrome.windows.onFocusChanged.addListener(OnFocusChanged);
					chrome.windows.onRemoved.addListener(OnRemoved);
				});
			});
		else if(options.type=="tab") {
			var url = chrome.extension.getURL("data/"+options.contentURL+"?panel="+panelName);
			utils.gotoTab(url,function(foundTab) {
				if(!foundTab)
					chrome.tabs.create({
						url: url,
					},function(tabs) {});
			});
		}
	}
	
	exports.openPanel = exports.togglePanel;
	
	exports.panelData = function(panelName,varName,varValue) {
		var panelData = vdhPanelData[panelName];
		if(!panelData) {
			panelData = {};
			vdhPanelData[panelName] = panelData;
		}
		if(!Array.isArray(varName))
			varName = [ varName ];
		var target = panelData;
		for(var i=0;i<varName.length-1;i++) {
			var field = varName[i];
			if(target[field]===undefined)
				target[field] = {};
			target = target[field];
		}
		target[varName[varName.length-1]] = varValue;
		var panel = vdhPanels[panelName];
		if(panel && panel.proxy) {
			panel.proxy.port.emit("contentMessage",{
				type: "set",
				name: varName,
				value: varValue,
			});
		}
	}
	
	chrome.runtime.onConnect.addListener(function(port) {
		var m = /^vdh:panel:(.*)/.exec(port.name);
		if(!m)
			return;
		var panelName = m[1];
		var panel = vdhPanels[panelName];
		if(!panel) {
			console.warn("Connection for an undeclared panel",panelName);
			return;
		}
		panel.proxy = {
			port: {
				emit: function(msgType,data) {
					var message = merge({
						msgType,msgType,
					},data);
					port.postMessage(message);
				},
			},
			hide: function() {
				port.postMessage({type:"close"});				
			},
		};
		port.onMessage.addListener(function(message) {
			switch(message.type) {
			case "updateGeometry":
				if(panel.windowId)
					chrome.windows.update(panel.windowId,{
						height: message.height,
					});
				break;
			case "setPrefs":
				prefs.set(message.prefs);
				break;
			case "closed":
				break;
			default:
				panel.options.onMessage(message,panel.proxy);
			}
		});
		port.onDisconnect.addListener(function(msg) {
			panel.proxy = null;
			panel.options.onHide(panel.proxy);
			panel.options.onDelete(panel.proxy);
		});
		var panelData = vdhPanelData[panelName];
		if(panelData) {
			panel.proxy.port.emit("contentMessage",{
				type: "initData",
				initData: panelData,
			});
		}
		panel.proxy.port.emit("contentMessage",{
			type: "openPanel",
		});
		if(panel.options.prefs)
			panel.proxy.port.emit("contentMessage",{
				type: "set",
				name: "prefs",
				value: simplePrefs.getAllPrefs(),
			});
		panel.options.onCreate(panel.proxy);
		panel.options.onShow(panel.proxy);
	});
	
	function UpdatePref(key,value) {
		for(var i in vdhPanels) {
			var panel = vdhPanels[i];
			if(panel.proxy)
				try {
					panel.proxy.port.emit('contentMessage',{
						type: "set",
						name: ["prefs",key],
						value: value,
					});
				} catch($_) {}
		}
	}

	prefs.addListener(UpdatePref);

	
});