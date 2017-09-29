define("downloads",function(exports) {
	
const ga = require('ga');
	
const _ = require("sdk/l10n").get;
const simplePrefs = require('sdk/simple-prefs');

const PROGRESS_TIMEOUT = 1000;

var globalId = 0;
var queue = [];
var runningCount = 0;
var running = {};
//var preparing = {};
var progressTimer = null;

function Failed(specs,reason) {
	runningCount--;
	EnsuresProgressTimer();
	specs.failure(reason);
	TryDownload();	
}

function DoTryDownload() {
	var maxDownloads = simplePrefs.prefs['download.controlled.max'];
	while(queue.length>0 && (maxDownloads==0 || runningCount<maxDownloads)) {
		(function() {
			var specs = queue.shift();
			runningCount++;
			EnsuresProgressTimer();
			specs.lastProgress = -1;
			var downloadSpecs = {
				url: specs.data.source.url,			
				conflictAction: "uniquify",
				filename: specs.data.target.path,
				saveAs: specs.data.target.saveAs || false, 
			}
			if(specs.data.source.referrer)
				downloadSpecs.headers=[{
					name: "referrer",
					value: specs.data.source.referrer, 
				}];
			chrome.downloads.download(downloadSpecs,function(downloadId) {
				if(!downloadId) {
					Failed(specs,_("aborted"));
					EnsuresProgressTimer();
					return;						
				}
				specs.downloadId = downloadId;
				running[specs.id] = specs;
				EnsuresProgressTimer();
			});
			/*
			Cu.import("resource://gre/modules/Downloads.jsm");
			preparing[specs.id] = 1;
			
			Downloads.createDownload(specs.data).then(function(download) {
				Downloads.getList(specs.data.source.isPrivate?Downloads.PRIVATE:Downloads.PUBLIC).then(function(list) {
					if(!preparing[specs.id]) {
						Failed(specs,_("aborted"));
						return;
					}
					delete preparing[specs.id];
					list.add(download);
					specs.download = download;
					running[specs.id] = specs;
					download.start().then(function() {
						delete running[specs.id];
						runningCount--;
						EnsuresProgressTimer();
						TryDownload();
						if(specs.download.succeeded)
							specs.success();
						else
							specs.failure(specs.download.error);
					},function(error) {
						Failed(specs,error);
					});
				},function(error) {
					Failed(specs,error);				
				});
			},function(reason) {
				delete preparing[specs.id];
				Failed(specs,reason);
			});	
			*/	
		})();
	}
}

simplePrefs.on("download.controlled.max",DoTryDownload);

function TryDownload() {
	setTimeout(DoTryDownload,0);
}

function EnsuresProgressTimer() {
	if(progressTimer && runningCount == 0) {
		clearInterval(progressTimer);
		progressTimer = null;
	} else if(!progressTimer && runningCount>0)
		progressTimer = setInterval(UpdateProgress,PROGRESS_TIMEOUT);
}

function UpdateProgress() {
	for(var id in running) {
		(function(id) {
			var spec = running[id];
			chrome.downloads.search({
				id: spec.downloadId,
			},function(downloadItems) {
				if(downloadItems.length>0) {
					var downloadItem = downloadItems[0];
					if(downloadItem.state=="in_progress") {
						var progress = Math.floor(downloadItem.bytesReceived*100/downloadItem.totalBytes);
						if(progress!=spec.lastProgress) {
							spec.lastProgress = progress;
							spec.progress(progress);
						}
					} else {
						delete running[id];
						runningCount--;
						EnsuresProgressTimer();
						TryDownload();
						if(downloadItem.state=="complete") {
							ga.downloadSuccess(spec.data.stats);
							spec.success(downloadItem.id);
						} else {
							ga.downloadError(spec.data.stats,downloadItem.error);
							spec.failure(downloadItem.error);
						}
					}
				} else 
					console.warn("Not found download",id);
			});				
		})(id);
	}
}

function DoNothing() {};

exports.download = function(data,success,failure,progress) {
	var id = ++globalId;
	queue.push({
		id: id,
		data: data,
		success: success || DoNothing,
		failure: failure || DoNothing,
		progress: progress || DoNothing,
	});
	TryDownload();
	return id;
}

exports.abort = function(id) {
	queue.forEach(function(entry,index) {
		if(entry.id == id) {
			entry.failure({
				message: _('download-canceled'),
				result:2147500037,
			});
			queue.splice(index,1);
		}
	});
	if(running[id]) {
		chrome.downloads.cancel(running[id].downloadId);
	}
}
	
});
