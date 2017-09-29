
define("main",function() {

const simplePrefs = require('sdk/simple-prefs');

const vdhPanels = require("panels");
const networkProbe = require("network-probe");
const hits = require("hits");
const actions = require("actions");
const log = require("log");
const about = require("about");
const settings = require("settings");
const tfvws = require("tfvws");
const tbvws = require("tbvws");
const utils = require("utils");

require("tbsn");
require("tbvv");
require("tbts");

const ACTIVE_ICON_STATIC = {
	path: "../data/images/icon-36.png",
}
const INACTIVE_ICON = {
	path: "../data/images/icon-36-off.png",
}

function ReceiveHit(hitData) {
	hits.newData(hitData);
}
networkProbe.addListener(ReceiveHit);
tfvws.addListener(ReceiveHit);
tbvws.addListener(ReceiveHit);

function UpdateHits(hitsData,varPath) {
	//console.info("UpdateHits",hitsData,varPath);
	var varName;
	if(varPath)
		varName = ['hits'].concat(varPath);
	else 
		varName = ['hits'];
	vdhPanels.panelData('main',varName,hitsData);
	if(!varPath) {
		var activeTabCount = 0;
		var anyTabCount = 0;
		var pinnedCount = 0;
		var runningCount = 0;
		
		for(var id in hitsData)
			switch(hitsData[id].status) {
			case 'running':
				runningCount++;
				break;
			case 'active':
				activeTabCount++;
				anyTabCount++;
				break;
			case 'inactive':
				anyTabCount++;
				break;
			case 'pinned':
				pinnedCount++;
				break;
			}

		if(anyTabCount==0 || (simplePrefs.prefs['icon-activation']=='currenttab' && activeTabCount==0))
			chrome.browserAction.setIcon(INACTIVE_ICON);
		else 
			chrome.browserAction.setIcon(ACTIVE_ICON_STATIC);
		
		var badge = "";
		var badgeColor = "#00f";
		switch(simplePrefs.prefs['icon-badge']) {
		case 'tasks':
			badge = runningCount || '';
			break;
		case 'activetab':
			badge = activeTabCount || '';
			break;
		case 'anytab':
			badge = anyTabCount || '';
			break;
		case 'pinned':
			badge = pinnedCount || '';
			break;
		case 'mixed':
			if(pinnedCount>0) {
				badgeColor = "#000";
				badge = pinnedCount;
			} else if(runningCount>0) {
				badgeColor = "#00f";
				badge = runningCount;
			} else if(activeTabCount>0) {
				badgeColor = "#080";
				badge = activeTabCount;
			} else if(anyTabCount>0) {
				badgeColor = "#b59e32";
				badge = anyTabCount;
			}
		}
		chrome.browserAction.setBadgeText({ text: ""+badge });
		chrome.browserAction.setBadgeBackgroundColor({ color: badgeColor });
		
		log.updateBadge();
	}
}

hits.addListener(UpdateHits);

function DeclareMainPanel() {
	var contentURL = "mainPanel.html";
	if(simplePrefs.prefs['display']=='mozilla')
		contentURL = "mozUxMainPanel.html";
	vdhPanels.declarePanel('main',{
		estimatedHeight: 91,
		contentURL: contentURL,
		onShow: function(panel) {
			panel.port.emit("contentMessage",{
				type: "set",
				name: "actions",
				value: actions.describeActions(),
			});
		},
		onHide: function() {
			require("gallery").unselect();
		},
		onMessage: function(message,panel) {
			switch(message.type) {
			case "settings":
				settings.toggle();
				break;
			case "about":
				about.toggle();
				break;
			case "action":
				if(!message.shift)
					panel.hide();
				hits.action(message.action,message.hitId);
				break;
			case "more-actions":
				var hitData = hits.getHitData(message.hit.id);
				ToggleActionsPanel(hitData);
				break;
			case "clear":
				hits.clear(message.what);
				break;
			case "clear-log":
				log.reset();
				hits.forceNotify();
				break;
			case "log-details":
				log.showDetails(message.log);
				break;
			case "convert":
				panel.hide();
				require("converter").convertLocal();
				break;
			case "sites":
				panel.hide();
				require("sites").show();
				break;
			case "gallery":
				require("gallery").checkCurrentPage();
				break;
			case "gallery-select":
				require("gallery").select(message);
				break;
			case "tpsr":
				panel.hide();
				require("tpsr").action(message.action);
				break;
			case "scrap":
				panel.hide();
				require("scrap").action(message);
				break;
			case "operation":
				panel.hide();
				require("menus").doOperation(message.operation);
				break;
			case "gototab":
				utils.gotoTab(message.url);
				break;
			case "actionCommand":
				if(message.asDefault) {
					simplePrefs.prefs['default-action-'+(actions.describeActions()[message.action].catPriority || 0)] = message.action;
					hits.refresh();
				}
				panel.hide();
				hits.action(message.action,message.hit.id);
				break;
			case "organize-videos":
				chrome.tabs.create({
					url: "http://www.downloadhelper.net/organize-videos",
					active: true
				});
				break;
			}
		},
	});
}
DeclareMainPanel();

var actionHit;
function ToggleActionsPanel(hit) {
	actionHit = hit;
	vdhPanels.togglePanel('actions',{
		contentURL: "actionsPanel.html",
		onShow: function(panel) {
			panel.port.emit("contentMessage",{
				type: "set",
				name: "hit",
				value: actionHit,
			});
			panel.port.emit("contentMessage",{
				type: "set",
				name: "actions",
				value: actions.describeActions(),
			});
			panel.port.emit("contentMessage",{
				type: "set",
				name: ["data","asDefault"],
				value: false,
			});
		},
		onHide: function() {
		},
		onMessage: function(message,panel) {
			switch(message.type) {
			case "actionCommand":
				if(message.asDefault) {
					simplePrefs.prefs['default-action-'+(actions.describeActions()[message.action].catPriority || 0)] = message.action;
					hits.refresh();
				}
				panel.hide();
				hits.action(message.action,message.hit.id);
				break;
			}
		},
	});
}

chrome.runtime.onInstalled.addListener(function(details) {
	var self = chrome.runtime.getManifest();
	var selfVersion = /^(.*?)[0-9]+$/.exec(self.version)[1];
	var previousVersion = /^(.*?)[0-9]+$/.exec(details.previousVersion)[1];
	if(details.reason=="update" && previousVersion!=selfVersion)
		chrome.tabs.create({
			url: "http://www.downloadhelper.net/update?from="+details.previousVersion+"&to="+self.version,
			active: true,
		});
	else if(details.reason=="install")
		chrome.tabs.create({
			url: "http://www.downloadhelper.net/welcome-chrome?version="+self.version,
			active: true,
		});
	simplePrefs.prefs['last-version'] = self.version;
});

});
