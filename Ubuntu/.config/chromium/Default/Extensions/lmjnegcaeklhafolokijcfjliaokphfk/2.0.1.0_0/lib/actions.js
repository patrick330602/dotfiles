define("actions",function(exports) {


const $chrome = require("chrome");
const Cc = $chrome.Cc;
const Ci = $chrome.Ci;
const Cu = $chrome.Cu;
const Class = require('sdk/core/heritage').Class;
const merge = require('sdk/util/object').merge;
const _ = require("sdk/l10n").get;
const self = require("sdk/self");
const $viewCore = require("sdk/view/core");
const viewFor = $viewCore.viewFor; 
const path = require("sdk/fs/path");
//const btoa = Cu.import("resource://gre/modules/Services.jsm", {}).btoa;

const simplePrefs = require("sdk/simple-prefs");
const downloads = require("./downloads");
const alerts = require("./alerts");
const panels = require("./panels");
const blacklist = require("./blacklist");
const hits = require("./hits");
const log = require("./log");
const converter = require("./converter");
const utils = require("./utils");

const FNAME_RE = new RegExp("[/\?<>\\:\*\|\":]|[\x00-\x1f\x80-\x9f]|\\\\","g");
const SPACE_RE = new RegExp(" +","g");
const DOTS_RE = new RegExp("\\.","g");
const LEAFNAME_RE = new RegExp("^(.*)-([0-9]+)(\\.?[^\\.]*)$|^(.*?)(\\.[^\\.]*)?$");

var transientStorageDirectory = null;

var Action = Class({
	
	initialize: function(hit) {
		this.hit = hit;
	},
	
	start: function() {
		log.error(_("not-implemented-yet"));
	},
	
	abort: function() {
		log.error(_("action-cannot-abort"));
	},
	
	createUnique: function(file,type,permissions) {
		var forbidden = hits.getFileNamesInUse();
		file.createUnique(type,permissions);
		if(file.path in forbidden) {
			file.remove(true);
			while(1) {
				var m = LEAFNAME_RE.exec(file.leafName);
				if(m[1]!==undefined)
					file.leafName = m[1]+"-"+(parseInt(m[2])+1)+m[3];
				else
					file.leafName = m[4]+"-1"+(m[5]||"");
				if(!(file.path in forbidden) && !file.exists())
					break;
			}
			file.create(type,permissions);
		}
	},
	
	getDefaultTargetFile: function(filename) {
		var file = this.getDownloadDirectory();
		file.append(filename);
		try {
			this.createUnique(file,Ci.nsIFile.NORMAL_FILE_TYPE, 0644);
		} catch(e) {
			throw _("error.cannot-create-target-file",file.path)
		}
		file.remove(true);
		return file;
	},

	getTargetFilePath: function(filename,callback) {
		callback(filename);
	},

	changeDownloadDirectory: function(callback) {
		exports.changeStorageDirectory(this.hit.data.isPrivate,callback);
	},
	
	getDownloadDirectory: function() {
		return exports.getDownloadDirectory(this.hit.data.isPrivate);
	},
	
	getTmpFile: function(ext,url) {
		var extension = "tmp";
		
		if(ext)
			extension = ext;
		else
			if(url) {
				var m = /\.([0-9a-zA-Z]{1,5})(?:\?|$)/.exec(url);
				if(m)
					extension = m[1];
			}
		Cu.import("resource://gre/modules/FileUtils.jsm");
		var file = FileUtils.getFile("TmpD", ["media."+extension]);
		this.createUnique(file,Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
		return file.path;
	},
	
	notifyRunning: function(running) {
		if(running)
			this.hit.setStatus("running");
		else
			this.hit.setReadyStatus();
	},
	
	getFilename: function(options) {
		options = options || {};
		var title = this.hit.data.title || "video";
		var extension = "";
		if(!options.noExtension)
			extension = this.hit.data.extension || "mp4";

		title = title.replace(FNAME_RE,"");
		if(!options.noExtension)
			extension = extension.replace(FNAME_RE,"");

		var spaceRepls = { keep: ' ', remove: '', hyphen: '-', underscore: '_' }
		title = title.replace(SPACE_RE,spaceRepls[simplePrefs.prefs['smartnamer.fname.spaces']]);
		extension = extension.replace(SPACE_RE,spaceRepls[simplePrefs.prefs['smartnamer.fname.spaces']]);

		if(options.dotsByUnderscores)
			title = title.replace(DOTS_RE,"_");
		
		var maxLen = simplePrefs.prefs['smartnamer.fname.maxlen'];
		if(title.length+extension.length+1>maxLen) 
			title = title.substr(0,maxLen-extension.length-1);
		return extension?title+"."+extension:title;
	},
	
	download: function(specs,successFn,errorFn,progressFn) {
		if(this.hit.data.f4f)
			require("./f4f").download(this,specs,successFn,errorFn,progressFn);
		else
			this.regularDownload(specs,successFn,errorFn,progressFn);			
	},
	
	regularDownload: function(specs,successFn,errorFn,progressFn) {
		this.downloadSpecs = specs;
		var lastProgress = -1;
		var $this = this;
		function CheckDone() {
			var done = true;
			var success = true;
			var downloadItemId = null;
			specs.forEach(function(spec) {
				done = done && spec.done;
				success = success && spec.success;
				downloadItemId = downloadItemId || spec.downloadItemId || null;
			});
			if(done) {
				$this.downloadSpecs = null;
				if(success)
					successFn(downloadItemId);
				else
					errorFn();
			}
		}
		specs.forEach(function(spec) {
			spec.progress = 0;
			spec.done = false;
			var downloadSpecs = {
				source: {
					url: spec.url,
					isPrivate: spec.isPrivate,
				},
				target: {
					path: spec.target,
					saveAs: spec.saveAs || false,
				},
				stats: {
					url: spec.url,
					topUrl: $this.hit.data.topUrl,
					isPrivate: spec.isPrivate || false,
				},
			}
			if(spec.referrer)
				downloadSpecs.source.referrer = spec.referrer;
			spec.id = $this.initiateDownload(downloadSpecs,function(
				downloadItemId
			) {
				spec.success = true;
				spec.done = true;
				spec.downloadItemId = downloadItemId;
				CheckDone();
			},function(error) {
				if(error.result==2147500037)
					log.log(error.message);
				else if(error.message)
					log.error(error.message);
				else
					log.error(error);
				spec.success = false;
				spec.done = true;
				CheckDone();
			},function(progress0) {
				var progress = 0;
				spec.progress = progress0;
				specs.forEach(function(spec) {
					progress += spec.progress;
				});
				progress = Math.round(progress / specs.length);
				if(progress!=lastProgress) {
					lastProgress = progress;
					progressFn(progress);
				}
			},spec.headers);
		});
	},
	
	initiateDownload: function(specs,success,error,progress,headers) {
		return downloads.download(specs,success,error,progress,headers);
	},
	
	abortDownload: function() {
		if(this.hit.abortFn) {
			this.hit.abortFn(this);
		} else {
			if(!this.downloadSpecs) {
				log.error(_("no-download-to-abort"));
				return;
			}
			this.downloadSpecs.forEach(function(spec) {
				if(!spec.done)
					downloads.abort(spec.id);
			});
		}
	},
	
	checkConverter: function(callback,message,moreInfo) {
		message = message || _('converter-needed');
		function HandleConverterStatus() {
			if(converter.config().status=='ready')
				callback(true);
			else {
				var actions = [{
					text: _('install-converter'),
					click: "post('installConverter')",
				}];
				if(moreInfo)
					actions.unshift({
						text: moreInfo.text,
						click: "post('moreInfo')",						
					});
				alerts.alert({
					title: _('converter-required'),
					text: message,
					action: actions,
					onMessage: function(message,panel) {
						switch(message.type) {
						case "installConverter":
							panel.hide();
							require("sdk/tabs").open({
								url: "http://www.downloadhelper.net/install-converter3.php",
							});
							break;
						case "moreInfo":
							panel.hide();
							require("sdk/tabs").open({
								url: moreInfo.url,
							});
							break;
						}
					},
				});
				callback(false);
			}
		}
		if(converter.config().status=='ready' && converter.isPresent())
			HandleConverterStatus();
		else
			converter.check(HandleConverterStatus);
	},
	
	notifyProcessed: function() {
		if(!simplePrefs.prefs['notify-ready'])
			return;
		if(this.hit.data.isPrivate && simplePrefs.prefs['no-private-notification'])
			return;
	},
	
	explainQR: function() {
		if(simplePrefs.prefs['qr-message-not-again'])
			return;
		var $this=this;
		panels.togglePanel('qr',{
			contentURL: "qrPanel.html",
			top: 10,
			closeTimeout: 0,
			jsFiles: [
			    "qrPanel.js",
			],
			onShow: function(panel) {
				var converterConfig = converter.config();
				panel.port.emit("contentMessage",{
					type: "set",
					name: "hit",
					value: $this.hit.data,
				});
			},
			onMessage: function(message,panel) {
				switch(message.type) {
				case "goto":
					panel.hide();
					switch(message.where) {
					case 'get-license':
						require("sdk/tabs").open({
							url: "http://www.downloadhelper.net/convert.php",
						});
						break;
					case 'tell-more':
						require("sdk/tabs").open({
							url: "http://www.downloadhelper.net/about-licensing.php",
						});
						break;
					}
					break;
				}
			},
		});			
	},

});

function CopyToClipboard(text) {
    var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = text;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    document.body.removeChild(copyDiv);
}

var DownloadAction = merge(Class({
	
	"extends": Action,
	
	start: function() {
		
		function Start2() {

			if(!this.hit.data._convert)
				converter.updateHit(this.hit);
			
			if(this.hit.data._convert && this.hit.data._convert.audioonly) {
				var licenseStatus = converter.config().license.status; 
				if(licenseStatus!="unneeded" && licenseStatus!="accepted") {
					alerts.alert({
						title: _('converter-needs-reg'),
						text: _('converter-reg-audio'),
						action: {
							text: _('register-converter'),
							click: "post('registerConverter')",
						},
						onMessage: function(message,panel) {
							switch(message.type) {
							case "registerConverter":
								panel.hide();
								require("sdk/tabs").open({
									url: "http://www.downloadhelper.net/convert.php",
								});
								break;
							}
						},
					});
					return;
				}
			}
			
			var $this = this;

			this.getDownloadTargetFilePath(this.getFilename(),function(target) {
				$this.hit.data._finalTarget = target;
				
				$this.notifyRunning(true);
				$this.hit.setCurrentAction($this);
		
				$this.downloadMedia();
			});
		}

		var $this = this;

		function Start() {
			if($this.masked)
				masked.prepareMaskedAction($this,function(err) {
					if(err)
					    console.error("prepareMaskedError:",err);
					else {
						masked.info();
						Start2.call($this);
					}
				});
			else
				Start2.call($this);
		}

		if(!this.hit.data.url && this.hit.data.audioUrl && this.hit.data.videoUrl)
			this.checkConverter(function(ok) {
				if(ok)
					Start.call($this);
			},_('converter-needed-aggregate'),{
				text: _('converter-needed-aggregate-why'),
				url: "http://www.downloadhelper.net/why-converter-needed-aggregation.php",
			});
		else if(this.hit.data.url || this.hit.data.audioUrl || this.hit.data.videoUrl)
			Start.call(this);
		else if(this.hit.data.urls)
			this.downloadGallery();
	},
	
	saveAs: function() {
		return true;
	},

	downloadGallery: function() {
		var $this = this;
		try {
			this.getDownloadTargetDirPath(this.getFilename({
					noExtension:true,
					dotsByUnderscores: true,
				}),function(finalTarget) {
				if(!finalTarget)
					return;

				Cu.import("resource://gre/modules/FileUtils.jsm");
				var directory = new FileUtils.File(finalTarget);
				try {
					$this.createUnique(directory,Ci.nsIFile.DIRECTORY_TYPE, 0755);
				} catch($_) {
					log.error(_("error.cannot-create-target-directory",directory.path));
					return;
				}
				$this.hit.data._finalTarget = directory.path;
				
				transientStorageDirectory = directory.parent.path;
				if(!$this.hit.data.isPrivate)
					simplePrefs.prefs["storagedirectory"] = directory.parent.path;

				$this.notifyRunning(true);
				$this.hit.setCurrentAction($this);
				$this.hit.updateActions();
				
				var downloads = [], indexPrefix = 1;
				
				$this.hit.data.urls.forEach(function(url) {
					var file = directory.clone();
					var m = /([^\/]+)$/.exec(url);
					if(m) {
						var leafName = decodeURIComponent(m[1]);
						if(simplePrefs.prefs['medialink-index-prefix'])
							leafName = "0000".substring(0,4-(""+indexPrefix).length)+indexPrefix+"-"+leafName;
						indexPrefix++;
						file.append(leafName);
						downloads.push({
							url: url,
							target: file.path,
							isPrivate: $this.hit.data.isPrivate,
						})
					}
				});
				
				downloads.forEach(function(download) {
					if($this.hit.data.pageUrl)
						download.referrer = $this.hit.data.pageUrl;
					if($this.hit.data.headers)
						download.headers = $this.hit.data.headers; 
				});

				$this.hit.setOperation('queued...');
				$this.download(downloads,Success,Finish,Progress);
				
			});
		} catch(e) {
			log.error(e);
		}
		
		function Success() {
			if(simplePrefs.prefs['auto-pin'])
				$this.hit.pin();
			$this.hit.data.localContainerPath = $this.hit.data._finalTarget;							
			$this.hit.updateActions();
			$this.notifyProcessed();
			Finish();
		}
		
		function Finish() {
			$this.cleanup();
			$this.hit.setCurrentAction(null);
			$this.notifyRunning(false);
		}
		
		function Progress(progress) {
			$this.hit.setOperation('downloading...');
			$this.hit.setProgress(progress);			
		}


	},
	
	getDownloadTargetDirPath: function(fileName,callback) {
		var windows = require("sdk/windows");
		var activeWindow = windows.browserWindows.activeWindow;
		var window = viewFor(activeWindow);
		var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
		fp.init(window, _("prompt.target-dir"), Ci.nsIFilePicker.modeSave);
		var file = null;
		try {
		    file=this.getDownloadDirectory();
		    file.append(fileName);
			this.createUnique(file,Ci.nsIFile.DIRECTORY_TYPE, 0755);
			file.remove(true);
		} catch($_) {
			log.error(_("error.cannot-create-target-directory",file.path));
			callback(null);
			return;
		}
		fp.displayDirectory=file.parent;
		fp.defaultString=file.leafName;
		
		fp.open(function(result) {
		    activeWindow.activate();
			if (result == Ci.nsIFilePicker.returnOK)
				callback(fp.file.path);
			else
				callback(null);
		});
	},
	
	downloadMedia: function() {
		
		var $this = this, downloads = [];		
		this.hit.data._tmpFiles = [];
		var licenseStatus = converter.config().license.status; 
		this.hit.data._wm = licenseStatus!='accepted' && licenseStatus!='unneeded';
		

		if(this.hit.data.url) {
			this.hit.data._downloadTarget = this.hit.data._finalTarget;
			if(this.hit.data._convert)  {
				var tmpTarget = this.getTmpFile(this.hit.data.extension,this.hit.data.url);
				this.hit.data._downloadTarget = tmpTarget;
				this.hit.data._tmpFiles.push(tmpTarget);
			}
			downloads.push({
				url: this.hit.data.url,
				target: this.hit.data._downloadTarget,
				isPrivate: this.hit.data.isPrivate,
				saveAs: this.saveAs(),
			});
		} else {
			this.hit.data._needsAggregate = true;
			if(this.hit.data.audioUrl) {
				if(!this.hit.data.videoUrl) {
					this.hit.data._nowm=1;
					this.hit.data._needsAggregate = false;
					this.hit.data._downloadTarget = this.hit.data._finalTarget;
					if(this.hit.data._convert) {
						var tmpTarget = this.getTmpFile(this.hit.data.extension,this.hit.data.audioUrl);
						this.hit.data._downloadTarget = tmpTarget;
						this.hit.data._tmpFiles.push(tmpTarget);						
					}
					downloads.push({
						url: this.hit.data.audioUrl,
						target: this.hit.data._downloadTarget,
						isPrivate: this.hit.data.isPrivate,
						saveAs: this.saveAs(),
					});
				} else {
					this.hit.data._audioTarget = this.getTmpFile(null,this.hit.data.audioUrl); 					
					this.hit.data._tmpFiles.push(this.hit.data._audioTarget);						
					downloads.push({
						url: this.hit.data.audioUrl,
						target: this.hit.data._audioTarget,
						isPrivate: this.hit.data.isPrivate,
						saveAs: this.saveAs(),
					});
				}
			}
			if(this.hit.data.videoUrl) {
				if(!this.hit.data.audioUrl) {
					this.hit.data._needsAggregate = false;
					this.hit.data._downloadTarget = this.hit.data._finalTarget;
					if(this.hit.data._convert) {
						var tmpTarget = this.getTmpFile(this.hit.data.extension,this.hit.data.videoUrl);
						this.hit.data._downloadTarget = tmpTarget;
						this.hit.data._tmpFiles.push(tmpTarget);						
					}
					downloads.push({
						url: this.hit.data.videoUrl,
						target: this.hit.data._downloadTarget,				
						isPrivate: this.hit.data.isPrivate,
						saveAs: this.saveAs(),
					});
				} else {
					if(this.hit.data._convert)
						this.hit.data._downloadTarget = this.getTmpFile(this.hit.data.extension,this.hit.data.videoUrl);
					else
						this.hit.data._downloadTarget = this.hit.data._finalTarget;
					this.hit.data._videoTarget = this.getTmpFile(this.hit.data.extension,this.hit.data.videoUrl);
					this.hit.data._tmpFiles.push(this.hit.data._videoTarget);						
					downloads.push({
						url: this.hit.data.videoUrl,
						target: this.hit.data._videoTarget,				
						isPrivate: this.hit.data.isPrivate,
						saveAs: this.saveAs(),
					});
				}
			}
		}

		downloads.forEach(function(download) {
			if($this.hit.data.referrer)
				download.referrer = $this.hit.data.referrer;
			else if($this.hit.data.pageUrl)
				download.referrer = $this.hit.data.pageUrl;	
			if($this.hit.data.headers)
				download.headers = $this.hit.data.headers;
		});
		
		function Success(downloadItemId) {
			
			$this.hit.data.downloadItemId = downloadItemId; 
			
			if($this.hit.data._needsAggregate)
				$this.aggregateMedia();
			else if($this.hit.data._convert)
				$this.convertMedia();
			else {
				if(simplePrefs.prefs['auto-pin'])
					$this.hit.pin();
				$this.hit.updateActions();
				$this.notifyProcessed();
				Finish();
			}			

			require("./funding").newDownload();
		}
		
		function Finish() {
			$this.cleanup();
			$this.hit.setCurrentAction(null);
			$this.notifyRunning(false);
		}
		
		function Progress(progress) {
			$this.hit.setOperation('downloading...');
			$this.hit.setProgress(progress);			
		}

		this.hit.setOperation('queued...');
		this.download(downloads,Success,Finish,Progress);
	},
	
	aggregateMedia: function() {
		var $this = this;
		function Aggregate(info,wm) {
			$this.hit.setOperation('aggregating...');
			converter.aggregate({
				audio: $this.hit.data._audioTarget,
				video: $this.hit.data._videoTarget,
				target: $this.hit.data._downloadTarget,
				wm: wm,
				videoCodec: info.videoCodec,
				fps: info.fps,
			},Success,function(error) {
				console.info("failed aggregate",error)
				Error({
					text: _('failed-aggregating',$this.hit.data.title),
					details: error.details,
				});
			},function(time) {
				if(info.duration) {
					var progress = Math.round(100*time/info.duration);
					$this.hit.setProgress(progress);			
				}
			});			
		}
		if(this.hit.data._convert && this.hit.data._convert.audioonly) {
			Cu.import("resource://gre/modules/osfile.jsm");
			OS.File.copy(this.hit.data._audioTarget,this.hit.data._downloadTarget).
				then(Success,Error);
		} else 
			converter.info(this.hit.data._videoTarget,function(info) {
				if(info.duration)
					$this.hit.data.duration = info.duration;
				if($this.hit.data._wm)
					converter.wmForHeight(info.height,function(wm) {
						if(wm && wm.qr) {
							$this.hit.data._qrTarget = wm.qr;
							$this.hit.data._tmpFiles.push($this.hit.data._qrTarget);
						}
						Aggregate(info,wm);
					},function(error) {
						console.error("wmForHeight",error)
						Error(_('failed-aggregating',$this.hit.data.title));						
					});
				else
					Aggregate(info,null);
			},function(error) {
				Error({
					text: _('failed-getting-info',$this.hit.data.title),
					details: error.details,
				});					
			});
		
		function Success() {
			$this.hit.data._wm = false;
			if($this.hit.data._convert)
				$this.convertMedia();
			else {
				if(simplePrefs.prefs['auto-pin'])
					$this.hit.pin();
				var file = new FileUtils.File($this.hit.data._finalTarget);
				$this.hit.data.localFilePath = file.path,
				$this.hit.data.localContainerPath = file.parent.path;							
				$this.hit.updateActions();
				$this.notifyProcessed();
				if($this.hit.data._qrTarget)
					$this.explainQR();
				Finish();
			}
		}
		
		function Error(error) {
			log.error(error);
			Finish();
		}
		
		function Finish() {
			$this.cleanup();
			$this.hit.setCurrentAction(null);
			$this.notifyRunning(false);
		}

	},
	
	convertMedia: function() {
		var $this = this;
		function Convert(info,wm) {
			$this.hit.setOperation('converting...');
			converter.convert({
					source: $this.hit.data._downloadTarget,
					target: $this.hit.data._finalTarget,
					config: $this.hit.data._convert,
					wm: wm,
				},function() {
					if(simplePrefs.prefs['auto-pin'])
						$this.hit.pin();
					Cu.import("resource://gre/modules/FileUtils.jsm");
					var file = new FileUtils.File($this.hit.data._finalTarget);
					$this.hit.data.localFilePath = file.path,
					$this.hit.data.localContainerPath = file.parent.path;							
					$this.hit.updateActions();
					$this.notifyProcessed();
					if($this.hit.data._qrTarget)
						$this.explainQR();
					Finish();
				},Error,function(time) {
					if(info.duration) {
						var progress = Math.round(100*time/info.duration);
						$this.hit.setProgress(progress);	
					}
				});
		}
		
		if(converter.config().status!='ready')
			
			Error(_('converter-requested-unavail'));
			
		else

			converter.info(this.hit.data._downloadTarget,function(info) {
				if(info.width && info.height)
					$this.hit.data.size = info.width + "x" + info.height;
				if(info.duration)
					$this.hit.data.duration = info.duration;
				if($this.hit.data._wm)
					converter.wmForHeight(info.height,function(wm) {
						if(wm && wm.qr) {
							$this.hit.data._qrTarget = wm.qr;
							$this.hit.data._tmpFiles.push($this.hit.data._qrTarget);
						}
						Convert(info,wm);
					},function(error) {
						Error(_('failed-converting',$this.hit.data.title));						
					});
				else
					Convert(info,null);
			},function(error) {
				Error({
					text: _('failed-getting-info',$this.hit.data.title),
					details: error.details,
				});					
			});

		function Error(error) {
			log.error(error);
			Finish();
		}
		
		function Finish() {
			$this.cleanup();
			$this.hit.setCurrentAction(null);
			$this.notifyRunning(false);
		}
	},
	
	cleanup: function() {
		if(!simplePrefs.prefs["converter-keep-tmp-files"] && this.hit.data._tmpFiles)
			this.hit.data._tmpFiles.forEach(function(tmpFile) {
				var file = new FileUtils.File(tmpFile);
				if(file.exists())
					file.remove(false);				
			});
		delete this.hit.data._tmpFiles;
		delete this.hit.data._needsAggregate;
		delete this.hit.data._audioTarget;
		delete this.hit.data._videoTarget;
		delete this.hit.data._finalTarget;
		delete this.hit.data._downloadTarget;
		delete this.hit.data._qrTarget;
		delete this.hit.data._nowm;
		delete this.hit.data._convert;
	},
	
	getDownloadTargetFilePath: function(filename,callback) {
		return this.getTargetFilePath(filename,callback);		
	},
	
	abort: function() {
		this.abortDownload();
	},
	
}),{
	actionName: "download",
	canPerform: function(hit) {
		if(hit.data.chunked)
			return false;
		return hit.data.url!==undefined || hit.data.audioUrl!==undefined || hit.data.videoUrl!==undefined || hit.data.urls!==undefined;
	},
	priority: 100,
	title: _("action.download.title"),
	description: _("action.download.description"),
	icon: "images/icon-action-download-64.png",
});

var QuickDownloadAction = merge(Class({
	
	"extends": DownloadAction,

	getDownloadTargetFilePath: function(filename,callback) {
		callback(filename);
	},

	getDownloadTargetDirPath: function(fileName,callback) {
		var file = null;
		try {
		    file=this.getDownloadDirectory();
		    file.append(fileName);
			this.createUnique(file,Ci.nsIFile.DIRECTORY_TYPE, 0755);
			file.remove(true);
		} catch($_) {
			log.error(_("error.cannot-create-target-directory",file.path));
			callback(null);
			return;
		}
		callback(file.path);
	},
	
	saveAs: function() {
		return false;
	},

}),{
	actionName: "quickdownload",
	canPerform: function(hit) {
		if(hit.data.chunked)
			return false;
		return hit.data.url!==undefined || hit.data.audioUrl!==undefined || hit.data.videoUrl!==undefined || hit.data.urls!==undefined;
	},
	priority: 90,
	title: _("action.quickdownload.title"),
	description: _("action.quickdownload.description"),
	icon: "images/icon-action-quick-download2-64.png",
});

var ConvertAction = merge(Class({
	
	"extends": QuickDownloadAction,

	start: function() {
		Cu.import("resource://gre/modules/FileUtils.jsm");
		var file = new FileUtils.File(this.hit.data._downloadTarget);
		var leafName = file.leafName;
		var m = /^(.*?)\.([^\.]{1,5})$/.exec(leafName);
		if(m)
			leafName = m[1];
		leafName += "." + this.hit.data.extension
		this.hit.data.length = file.fileSize; 
		var $this = this;
		this.getDownloadTargetFilePath(leafName,function(target) {
			if(!target)
				return;
			$this.hit.data._finalTarget = target;
			$this.notifyRunning(true);
			$this.hit.setCurrentAction($this);
			$this.convertMedia();
		});
	},
	
}),{
	actionName: "convert",
	canPerform: function(hit) {
		return hit.data.local;
	},
	priority: 90,
	title: _("action.convert.title"),
	description: _("action.convert.description"),
	icon: "images/icon-action-convert-b-64.png",
});

var DownloadConvertAction = merge(Class({
	
	"extends": QuickDownloadAction,
	
	start: function() {
		var $this = this;
		
		function Start() {
			var converter = require("./converter");
			
			function TogglePanel() {
				panels.togglePanel('dlconv',{
					contentURL: "dlconvPanel.html",
					top: 10,
					closeTimeout: 0,
					jsFiles: [
					    "lib/jquery.min.js",
					    "lib/bootstrap/bootstrap.min.js",
					    "dlconvPanel.js",
					],
					onShow: function(panel) {
						var converterConfig = converter.config();
						panel.port.emit("contentMessage",{
							type: "set",
							name: "hit",
							value: $this.hit.data,
						});
						panel.port.emit("contentMessage",{
							type: "set",
							name: "formats",
							value: converterConfig.formats,
						});
						panel.port.emit("contentMessage",{
							type: "set",
							name: "codecs",
							value: converterConfig.codecs,
						});
						panel.port.emit("contentMessage",{
							type: "set",
							name: "targets",
							value: converterConfig.targets,
						});
						panel.port.emit("contentMessage",{
							type: "set",
							name: "configs",
							value: converterConfig.configs,
						});
						panel.port.emit("contentMessage",{
							type: "set",
							name: "hasDownloadButton",
							value: true,
						});
						panel.port.emit("contentMessage",{
							type: "set",
							name: "hasDownloadConvButton",
							value: true,
						});
						panel.port.emit("contentMessage",{
							type: "set",
							name: "panelTitle",
							value: _("action.downloadconvert.title"),
						});
						panel.port.emit("contentMessage",{
							type: "set",
							name: "transientStorageDirectory",
							value: transientStorageDirectory,
						});
						panel.port.emit("contentMessage",{
							type: "set",
							name: "renameCheckbox",
							value: true,
						});
					},
					onMessage: function(message,panel) {
						switch(message.type) {
						case "setConfigs":
							converter.setConfigs(message.configs);
							break;
						case "resetConfigs":
							converter.resetConfigs(message.configs);
							panel.port.emit("contentMessage",{
								type: "set",
								name: "converter",
								value: converter.config(),
							});
							break;
						case "showConfigs":
							converter.showConfigs(message.configs);
							break;
						case "changeStorageDirectory":
							$this.changeDownloadDirectory(TogglePanel);
							break;
						case "conversionHelp":
							panel.hide();
							require("sdk/tabs").open({
								url: "http://www.downloadhelper.net/conversion-manual3.php",
							});
							break;
						case "download":
							if(message.config) {
								$this.checkConverter(function(ok) {
									if(ok) {
										var config = converter.config().configs[message.config];
										if(config) {
											if($this.hit.data.extension)
												$this.hit.data.originalExt = $this.hit.data.extension;
											$this.hit.data.extension = config.ext || config.params.f || $this.hit.data.extension;
										}
										$this.hit.data._convert = config || null;
									}
								},_('converter-needed'));
							} else {
								if($this.hit.data.originalExt)
									$this.hit.data.extension = $this.hit.data.originalExt;
								$this.hit.data._convert = null;
							}
							panel.hide();
							QuickDownloadAction.prototype.start.call($this);
							break;
						}
					},
				});			
			}
			TogglePanel();
		}
		
		if(!this.hit.data.url && this.hit.data.audioUrl && this.hit.data.videoUrl)
			this.checkConverter(function(ok) {
				if(ok)
					Start.call($this);
			},_('converter-needed-aggregate'),{
				text: _('converter-needed-aggregate-why'),
				url: "http://www.downloadhelper.net/why-converter-needed-aggregation.php",
			});
		else
			this.checkConverter(function(ok) {
				if(ok)
					Start.call($this);
			});
	},
	
	getDownloadTargetFilePath: function(filename,callback) {
		if(simplePrefs.prefs['dlconv-rename'])
			DownloadAction.prototype.getDownloadTargetFilePath.call(this,filename,callback);
		else
			QuickDownloadAction.prototype.getDownloadTargetFilePath.call(this,filename,callback);
	},
	
}),{
	actionName: "downloadconvert",
	canPerform: function(hit) {
		return hit.data.url!==undefined || hit.data.audioUrl!==undefined || hit.data.videoUrl!==undefined;
	},
	priority: 80,
	title: _("action.downloadconvert.title"),
	description: _("action.downloadconvert.description"),
	icon: "images/icon-action-download-convert-64.png",
});



var CopyUrlAction = merge(Class({
	
	"extends": Action,
	
	start: function() {
		CopyToClipboard(this.hit.data.url);
	},
	
}),{
	actionName: "copyurl",
	canPerform: function(hit) {
		return hit.data.url !== undefined;
	},
	priority: 30,
	title: _("action.copyurl.title"),
	description: _("action.copyurl.description"),
	icon: "images/icon-action-copy-link-64.png",
});

var BlackListAction = merge(Class({
	
	"extends": Action,

	start: function() {
		var $this = this;
		panels.togglePanel('blacklist',{
			top: 10,
			closeTimeout: 0,
			contentURL: "blacklistPanel.html",
			jsFiles: [
			    "lib/jquery.min.js",
			    "lib/bootstrap/bootstrap.min.js",
			    "blacklistPanel.js",
			],
			onShow: function(panel) {
				panel.port.emit("contentMessage",{
					type: "set",
					name: "domains",
					value: blacklist.domainsFromHit($this.hit.data),
				});
			},
			onMessage: function(message,panel) {
				switch(message.type) {
				case "blacklist":
					panel.hide();
					blacklist.addToBlacklist(message.blacklist);
					hits.refresh();
					break;
				}
			},
		});

	}

}),{
	actionName: "blacklist",
	canPerform: function(hit) {
		return hit.data.url !== undefined || hit.data.audioUrl !== undefined || 
			hit.data.videoUrl !== undefined || hit.data.topUrl !== undefined || hit.data.pageUrl !== undefined;
	},
	priority: 20,
	title: _("action.blacklist.title"),
	description: _("action.blacklist.description"),
	icon: "images/icon-action-blacklist-64.png",
});

var DetailsAction = merge(Class({
	
	"extends": Action,
	
	start: function() {
		var $this = this;
		panels.togglePanel('details',{
			top: 10,
			closeTimeout: 0,
			contentURL: "detailsPanel.html",
			jsFiles: "detailsPanel.js",
			onShow: function(panel) {
				panel.port.emit("contentMessage",{
					type: "set",
					name: "hit",
					value: $this.hit.data,
				});
			},
			onMessage: function(message,panel) {
				switch(message.type) {
				case 'copy-to-url':
		            CopyToClipboard(message.value);
					break;
				}
			},
		});
	},
	
}),{
	actionName: "details",
	canPerform: function(hit) {
		return true;
	},
	priority: 0,
	title: _("action.details.title"),
	description: _("action.details.description"),
	icon: "images/icon-action-details-64.png",
});

var DeleteHitAction = merge(Class({
	
	"extends": Action,

	start: function() {
		this.hit.remove();
	},

}),{
	actionName: "deletehit",
	canPerform: function(hit) {
		return true;
	},
	priority: 0,
	title: _("action.deletehit.title"),
	description: _("action.deletehit.description"),
	icon: "images/icon-action-delete-64.png",
});

var OpenLocalFileAction = merge(Class({
	
	"extends": Action,

	start: function() {
		chrome.downloads.open(this.hit.data.downloadItemId);
	},

}),{
	actionName: "openlocalfile",
	canPerform: function(hit) {
		return !!hit.data.downloadItemId;
	},
	priority: 200,
	catPriority: 1,
	title: _("action.openlocalfile.title"),
	description: _("action.openlocalfile.description"),
	icon: "images/icon-action-play-64.png",
});

var OpenLocalContainerAction = merge(Class({
	
	"extends": Action,

	start: function() {
		chrome.downloads.show(this.hit.data.downloadItemId);
	},

}),{
	actionName: "openlocalcontainer",
	canPerform: function(hit) {
		return !!hit.data.downloadItemId;
	},
	priority: 180,
	catPriority: 1,
	title: _("action.openlocalcontainer.title"),
	description: _("action.openlocalcontainer.description"),
	icon: "images/icon-action-open-dir-64.png",
});

var PinAction = merge(Class({
	
	"extends": Action,

	start: function() {
		this.hit.pin();
	},

}),{
	actionName: "pin",
	canPerform: function(hit) {
		return !hit.pinned;
	},
	priority: 0,
	title: _("action.pin.title"),
	description: _("action.pin.description"),
	icon: "images/icon-action-pin-64.png",
});

var AbortAction = merge(Class({
	
	"extends": Action,

	start: function() {
		this.hit.currentAction.abort();
	},

}),{
	actionName: "abort",
	canPerform: function(hit) {
		return !!hit.currentAction;
	},
	priority: 300,
	catPriority: 2,
	title: _("action.abort.title"),
	description: _("action.abort.description"),
	icon: "images/icon-action-abort-64.png",
});

var ScrapRecordAction = merge(Class({
	"extends": Action,
	start: function() {
		require("./scrap").startRecording(this);
	},
}),{
	actionName: "scraprecord",
	canPerform: function(hit) {
		return hit.data.scrapable && !hit.data.scraping && simplePrefs.prefs['scrap.state']!='started';
	},
	priority: 90,
	title: _("action.scraprecord.title"),
	description: _("action.scraprecord.description"),
	icon: "images/icon-action-record-64.png",
});

var ScrapSnapshotAction = merge(Class({
	"extends": Action,
	start: function() {
		require("./scrap").takeSnapshot(this);
	},
}),{
	actionName: "scrapsnapshot",
	canPerform: function(hit) {
		return hit.data.scrapable;
	},
	priority: 80,
	title: _("action.scrapsnapshot.title"),
	description: _("action.scrapsnapshot.description"),
	icon: "images/icon-camera-64.png",
});

var ScrapStopRecordAction = merge(Class({
	"extends": Action,
	start: function() {
		require("./scrap").stopRecording(this);
	},
}),{
	actionName: "scrapstoprecord",
	canPerform: function(hit) {
		return !!hit.data.scraping;
	},
	priority: 110,
	title: _("action.scrapstoprecord.title"),
	description: _("action.scrapstoprecord.description"),
	icon: "images/icon-action-stoprecord-64.png",
});


var actionClasses = {
	'download': DownloadAction,
	'quickdownload': QuickDownloadAction,
	'copyurl': CopyUrlAction,
	'blacklist': BlackListAction,
	'details': DetailsAction,
	'deletehit': DeleteHitAction,
	'openlocalfile': OpenLocalFileAction,
	'openlocalcontainer': OpenLocalContainerAction,
	'pin': PinAction,
	'abort': AbortAction,
}

exports.perform = function(action, hit) {
	var actionClass = actionClasses[action];
	if(actionClass) {
		var actionInst = new actionClass(hit);
		actionInst.start();
	}
}

exports.availableActions = function(hit) {
	var actions = [];
	for(var action in actionClasses) {
		var actionClass = actionClasses[action];
		if(actionClass.canPerform(hit))
			actions.push(action);
	}
	var defActions = [
        simplePrefs.prefs['default-action-0'],
        simplePrefs.prefs['default-action-1'],
        simplePrefs.prefs['default-action-2'],
    ];        
	actions.sort(function(a,b) {
		var classA = actionClasses[a];
		var classB = actionClasses[b];
		var catPrioA = classA.catPriority || 0; 
		var catPrioB = classB.catPriority || 0; 
		if(catPrioB!=catPrioA)
			return catPrioB-catPrioA;
		else {
			if(a==defActions[catPrioA])
				return -1;
			else if(b==defActions[catPrioB])
				return 1;
			else
				return classB.priority - classA.priority; 
		}
	});
	return actions;
}

exports.describeActions = function() {
	var descr = {};
	for(var action in actionClasses) {
		var actionClass = actionClasses[action];
		descr[action] = {
			title: actionClass.title,
			description: actionClass.description,
			icon: actionClass.icon,
			icon18: actionClass.icon.replace("-64.png","-18.png"),
			catPriority: actionClass.catPriority || 0,
		}
	}
	return descr;
}

exports.getBrowserDownloadLastDir = function() {
	try {
		return Cc["@mozilla.org/preferences-service;1"]
			.getService(Ci.nsIPrefService)
			.getBranch("browser.download.")
			.getCharPref("lastDir");
	} catch(e) {
		return null;
	}
}

exports.getDownloadDirectory = function(isPrivate) {
	var fileName = null;
	if(simplePrefs.prefs["storage-last-dir"])
		fileName = exports.getBrowserDownloadLastDir();
	if(!fileName)
		fileName= transientStorageDirectory || simplePrefs.prefs["storagedirectory"];
	var file;
	if(fileName==null || fileName.length==0) {
		file = exports.getDefaultDir();
    	//log.log(_('storage-directory-not-defined',file.path));
	} else {
		try {
		    file=Cc["@mozilla.org/file/local;1"].
		        createInstance(Ci.nsILocalFile);
		    file.initWithPath(fileName);
		    var warning = null;
		    if(file.exists()==false)
		    	warning = _('storage-directory-not-exist',fileName);
		    else if(file.isWritable()==false)
		    	warning = _('storage-directory-not-writable',fileName);
		    else if(file.isDirectory()==false)
		    	warning = _('storage-directory-not-directory',fileName);
		    if(warning) {
		    	file = exports.getDefaultDir();
		    	log.log(_('force-default-storage-directory',warning,file.path));
		    }
		} catch(e) {
	    	file = exports.getDefaultDir();
	    	log.log('storage-directory-error',""+e,file.path);
		}
	}
	if(!file.exists()) {
		file.create(Ci.nsIFile.DIRECTORY_TYPE, 0755);
	}
	transientStorageDirectory = file.path;
	if(!isPrivate)
		simplePrefs.prefs["storagedirectory"] = file.path;
	return file;
}

exports.getDefaultDir = function() {
	var file = null;
	if(simplePrefs.prefs["storage-last-dir"]) {
		try {
			var lastDir = exports.getBrowserDownloadLastDir();
			if(lastDir) {
				Cu.import("resource://gre/modules/FileUtils.jsm");
				file = new FileUtils.File(lastDir);
				return file;
			}
		} catch(e) {}
	}
	try {
		file = Cc["@mozilla.org/file/directory_service;1"]
	                     .getService(Ci.nsIProperties)
	                     .get("Home", Ci.nsIFile);
	} catch(e) {
    	try {
			file=Cc["@mozilla.org/file/directory_service;1"]
		    	.getService(Ci.nsIProperties)
		        .get("TmpD", Ci.nsIFile);
		} catch(e) {
		}
	}
	if(!file.exists()) {
		throw(_("error.nohome"));
	}
	file.append("dwhelper");
	return file;
}

exports.changeStorageDirectory = function(isPrivate,callback) {
	var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
		.getService(Ci.nsIWindowMediator);
	var window = windowMediator.getMostRecentWindow("navigator:browser");
	var activeWindow = require("sdk/windows").browserWindows.activeWindow;
	var fp = Cc["@mozilla.org/filepicker;1"]
		.createInstance(Ci.nsIFilePicker);
	fp.init(window, _("prompt.select-storage-dir"), Ci.nsIFilePicker.modeGetFolder);
	var file = null;
	try {
	    file=Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
	    file.initWithPath(simplePrefs.prefs["storagedirectory"]);
	    if(!file.exists() || !file.isWritable() || !file.isDirectory()) {
	    	file = exports.getDefaultDir();		    	
	    }
	} catch($_) {}
	if(file) {
		fp.displayDirectory=file.parent;
		fp.defaultString=file.leafName;			
	}
	fp.open(function(result) {
	    activeWindow.activate();
		if (result == Ci.nsIFilePicker.returnOK) {
			transientStorageDirectory = fp.file.path;
			if(!isPrivate)
				simplePrefs.prefs["storagedirectory"] = fp.file.path;
		}
		if(callback)
			callback();		
	});
}

exports.Action = Action;
exports.actionClasses = actionClasses;

exports.registerAction = function(actionName, actionClass) {
	actionClasses[actionName] = actionClass;
} 

exports.unregisterAction = function(actionName) {
	delete actionClasses[actionName];
} 

exports.transientStorageDirectory = function() {
	return transientStorageDirectory;
}

;(function(actions) {

	var NoChunkAction = merge(Class({

		"extends": actions.Action,

		start: function() {
			alerts.alert({
				title: _("chrome.stream-no-capture.title"),
				text: [
					_('chrome.stream-no-capture'),
					_('chrome.stream-no-capture2'),
				],
				action: [{
					text: _('chrome.install-firefox'),
					click: "post('installFirefox')",
				},{
					text: _('chrome.install-fx-vdh'),
					click: "post('installFxVDH')",
				}],
				//notAgain: "chrome.hide-chunks",
				//notAgainText: "chrome.stream-no-capture.hide",
				onMessage: function(message,panel) {
					switch(message.type) {
					case "installFirefox":
						panel.hide();
						require("sdk/tabs").open({
								url: "https://getfirefox.com/",
						});
						break;
					case "installFxVDH":
						panel.hide();
						require("sdk/tabs").open({
								url: "https://addons.mozilla.org/addon/video-downloadhelper/",
						});
						break;
					}
				},
			});
		}

	}),{
		actionName: "nochunk",
		canPerform: function(hit) {
			return hit.data.chunked;
		},
		priority: 200,
		title: _("action.stream-no-capture.title"),
		description: _("action.stream-no-capture.description"),
		icon: "images/icon-action-warning-64.png",
	});

	actions.registerAction("nochunk",NoChunkAction);
})(exports);



});