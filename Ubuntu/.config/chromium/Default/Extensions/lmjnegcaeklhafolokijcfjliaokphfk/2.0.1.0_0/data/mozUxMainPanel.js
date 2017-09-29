
angular.module('VDH').controller('VDHMainCtrl', 
	['$scope', 'VDH.util',
	 	function($scope,VDHUtil) {
			
			$scope.hits = {};
			$scope.hitGroups = [];
			$scope.actionHit = null;
			$scope.section = "active";
			$scope.actions = {};
			$scope.logLogs = [];
			
			$scope.command = function(action) {
				$scope.post("actionCommand",{
					action: action,
					hit: $scope.actionHit,
					asDefault: $scope.data.asDefault,
				});
			}
			$scope.data = {
				asDefault: false,
			}

			
			VDHUtil.prepareScope($scope);
			
			const HIT_PROPS = ["description","descrPrefix","adp","size","duration","quality","bitrate","length","mediaDomain","type","extension","originalExt" ];
			
			$scope.buildGroups = function(hits,section) {
				$scope.resetCounters();
				if(!hits) {
					$scope.hitGroups = [];
					return;
				}
				//hits = angular.copy(hits);
				var hitGroups0 = [];
				var hitGroups = {};
				for(var id in hits) {
					var hit = hits[id];
					if(hit.status==section) {
						hit.primary = true;
						if(hit.group) {
							if(hitGroups[hit.group]) {
								hit.primary = false;
								hitGroups[hit.group].push(hit);
							} else
								hitGroups[hit.group] = [ hit ];
						} else
							hitGroups0.push([hit]);
					}
					$scope.counters.all++;
					$scope.counters[hit.status] = $scope.counters[hit.status] || 0;
					$scope.counters[hit.status]++;
				}
				for(var gid in hitGroups) {
					var hitGroup = hitGroups[gid];
					var hit0 = hitGroup[0];
					var commonProps = {};
					HIT_PROPS.forEach(function(prop) {
						if(typeof hit0[prop]=="undefined")
							return;
						var sameValue = true;
						for(var i=1;i<hitGroup.length;i++) {
							var hit = hitGroup[i];
							if(hit[prop]!==hit0[prop]) {
								sameValue = false;
								break;
							}
						}
						if(sameValue)
							for(var i=1;i<hitGroup.length;i++)
								delete hitGroup[i][prop];
					});
					hitGroups0.push(hitGroup);
				}
				$scope.copyHitGroups(hitGroups0);
			}
			
			$scope.copyHitGroups = function(hitGroups) {
				if(hitGroups.length<$scope.hitGroups.length)
					$scope.hitGroups.splice(hitGroups.length, $scope.hitGroups.length - hitGroups.length);
				for(var i=0;i<hitGroups.length;i++) {
					var hitGroup = hitGroups[i];
					var hitGroup0 = $scope.hitGroups[i];
					if(hitGroup0) {
						if(hitGroup.length<hitGroup0.length)
							hitGroup0.splice(hitGroup.length, hitGroup0.length - hitGroup.length);
					}
					
				}
				angular.merge($scope.hitGroups, hitGroups);
			}

			$scope.$watch("hits",function(hits) {
				$scope.buildGroups(hits,$scope.section);
			},true);
			
			$scope.$watch("section",function(section) {
				$scope.buildGroups($scope.hits,section);
			},true);

			$scope.$watch("actions",function(actions) {
				$scope.buildGroups($scope.hits,$scope.section);
			},true);

			$scope.resetCounters = function() {
				$scope.counters = {
					all: 0,
					active: 0,
					inactive: 0,
					orphan: 0,
					pinned: 0,
					running: 0,
				}
			}
			$scope.resetCounters();
			
			$scope.settings = function() {
				$scope.post('settings');
			}
			
			$scope.about = function() {
				$scope.post('about');			
			}

			$scope.convert = function() {
				$scope.post('convert',{});			
			}
			$scope.sites = function() {
				$scope.post('sites',{});			
			}
			$scope.gallery = function() {
				$scope.post('gallery',{});			
			}
			$scope.tpsr = function(action) {
				$scope.post('tpsr',{ action: action });
			}
			$scope.scrap = function(action) {
				$scope.post('scrap',{ action: action });
			}

			$scope.clear = function(what) {
				$scope.post('clear',{ what: what });			
			}
			$scope.canClear = function() {
				if($scope.hits)
					for(var id in $scope.hits) {
						var hit = $scope.hits[id];
						if(hit.status=='active' || hit.status=='inactive' || hit.status=='orphan')
							return true;
					}
				return false;
			}

			$scope.hitClass = function(hit) {
				var classes = [];
				if(hit.primary)
					classes.push("primary");
				return classes.join(" ");
			}

			$scope.lengthString = function(hit) {
				if(!hit.length)
					return null;
				if(hit.length>1024*1024)
					return $scope._('MB',Math.round((hit.length*10)/(1024*1024))/10);
				else if(hit.length>1024)
					return $scope._('KB',Math.round((hit.length*10)/1024)/10);
				else
					return $scope._('Bytes',hit.length);
			}
						
			$scope.description = function(hit) {
				if(hit.description)
					return hit.description;
				var parts = [];
				if(hit.descrPrefix)
					parts.push(hit.descrPrefix);
				if(hit.adp)
					parts.push("ADP");
				if(hit.size)
					parts.push(hit.size);
				if(hit.duration) {
					var hours = Math.floor(hit.duration/3600);
					var mins = Math.floor((hit.duration%3600)/60);
					var secs = hit.duration%60;
					if(hours>0)
						parts.push(hours+":"+(("00"+mins).substr(-2))+":"+(("00"+secs).substr(-2)));
					else
						parts.push(mins+":"+("00"+secs).substr(-2));
				}
				if(hit.quality) {
					var quality = $scope._("quality-"+hit.quality);
					if(quality == "quality-"+hit.quality)
						quality = hit.quality.toUpperCase();
					parts.push(quality);
				}
				if(hit.bitrate) {
					var brValue = hit.bitrate;
					var brUnit = "bps";
					if(hit.bitrate>10000000) {
						brUnit = "Mbps";
						brValue = Math.round(hit.bitrate/1000000);
					} else if(hit.bitrate>1000000) {
						brUnit = "Mbps";
						brValue = Math.round(hit.bitrate/100000)/10;					
					} else if(hit.bitrate>10000) {
						brUnit = "Kbps";
						brValue = Math.round(hit.bitrate/1000);					
					} else if(hit.bitrate>1000) {
						brUnit = "Kbps";
						brValue = Math.round(hit.bitrate/100)/10;					
					}
					parts.push(brValue+brUnit);
				}
				var lengthStr = $scope.lengthString(hit);
				if(lengthStr)
					parts.push(lengthStr);
				if(hit.mediaDomain)
					parts.push($scope._("from-domain",hit.mediaDomain));
				if(hit.type=="audio")
					parts.push($scope._("audio-only"));
				if(hit.extension) {
					if(hit.originalExt && hit.originalExt!=hit.extension)
						parts.push(hit.originalExt.toUpperCase()+">"+hit.extension.toUpperCase());
					parts.push(hit.extension.toUpperCase());
				}
				return parts.join(" - ");
			}

			$scope.titleClass = function(hit) {
				var classes = ["hit-title-text"];
				if($scope.prefs)
					classes.push("hit-title-text-"+$scope.prefs['title.mode']);
				return classes.join(" ");
			}
			
			$scope.moreActions = function(hit) {
				$scope.actionHit = hit;
			}
			
			angular.element(document).bind("transitionend",function()  {
				$scope.checkSize();
			});

			$scope.clearActionHit = function() {
				$scope.actionHit = null;
			}
			
			$scope.log = function(trace) {
				console.info("Log",trace);
			}
			
			$scope.action = function(action,hit,event) {
				$scope.post('action',{
					action: action,
					hitId: hit.id,
					shift: !!event.shiftKey,
				});
			}

			$scope.defaultAction = function(hit) {
				return hit.actions[0];				
			}
			
			$scope.setSection = function(section) {
				$scope.section = section;
			}
			
			$scope.shouldDisplayGroupText = function(section) {
				if($scope.section==section)
					return false;
				if(section=='log' && $scope.logLogs.length==0)
					return false;
				for(var counter in $scope.counters) {
					var count = $scope.counters[counter];
					if(counter==section && count==0)
						return false;
					if(counter!="all" && counter!=section && counter!=$scope.section && count>0)
						return false;
				}
				if(section!='log' && $scope.logLogs.length>0)
					return false;
				return true;
			}
			
			$scope.progress = function(hit) {
				return { width: (hit.progress || 0)+"%" };
			}
			
			$scope.$watch('logs',function(logs) {
				$scope.logLogs.splice(0,$scope.logLogs.length);
				if(logs)
					logs.forEach(function(log) {
						$scope.logLogs.push(log);
					});
			},true);
			
			$scope.hasError = function() {
				for(var i=0;i<$scope.logLogs.length;i++)
					if($scope.logLogs[i].type=='error')
						return true;
				return false;
			}

			$scope.logDetails = function(log) {
				$scope.post('log-details',{
					log: log
				});
			}

			$scope.clearLogs = function() {
				$scope.post('clear-log',{});
				$scope.section = 'active';
			}
			
			$scope.goToTab = function(hit) {
				$scope.post('gototab',{ url: hit.topUrl });
				$scope.section = 'active';
			}
			
			$scope.isWindowsPlatform = function() {
				return navigator.platform.indexOf('Win') > -1;
			}

			$scope.isChromeBrowser = function() {
				return navigator.vendor == "Google Inc.";
			}

			$scope.organizeVideos = function() {
				$scope.post('organize-videos',{});
			}

		}]);

angular.module('VDH').directive('vdhHit', 
	[ 
	  function factory() {
	return {
		//scope: true,
		replace: true,
		templateUrl: 'vdh-hit',
	    link: function(scope,element,attrs) {
	    },
	}
}]);

angular.module('VDH').directive('vdhOrphanTimer', 
		[ '$interval',
		  function factory($interval) {
		return {
		    link: function(scope,element,attrs) {
		    	var timer = $interval(function() {
		    		var hit = scope.$eval(attrs.vdhOrphanTimer);
		    		if(hit.status=='orphan') {
		    			var t0 = Math.max(hit.orphanStart,Math.min(hit.orphanEnd,Date.now()));
		    			var progress = 100 - 100*(t0 - hit.orphanStart)/(hit.orphanEnd-hit.orphanStart);
		    			element.css("width",progress+"%");
		    		}
		    	},1000);
		    	scope.$on("$destroy",function() {
		    		$interval.cancel(timer);
		    	});
		    },
		}
	}]);

angular.module('VDH').directive('vdhTrackMouse', 
		[ '$timeout',
		  function factory($timeout) {
		return {
			scope: true,
		    link: function(scope,element,attrs) {

		    	var timer = null;
		    	var lastNotif = false;
		    	
		    	function NotifyMouse(mouseIn) {
		    		if(scope.hit && scope.hit._trackMouse)
			    		scope.post('gallery-select',{
			    			select: mouseIn,
			    			gallery: scope.hit._gallery,
			    		});
		    	}
		    	function Mouse(mouseIn) {
		    		if(timer)
		    			$timeout.cancel(timer);
		    		timer = $timeout(function() {
		    			if(mouseIn!=lastNotif) {
		    				lastNotif = mouseIn;
		    				NotifyMouse(mouseIn);
		    			}
		    		},100);
		    	}
		    	function MouseIn() {
		    		Mouse(true);
		    	}
		    	function MouseOut() {
		    		Mouse(false);
		    	}
		    	
		    	scope.$watch("hit",function(hit) {
		    		if(hit._trackMouse) {
		    			element.off("mouseover",MouseIn);
		    			element.off("mouseout",MouseOut);
		    			element.on("mouseover",MouseIn);
		    			element.on("mouseout",MouseOut);
		    		}
		    	});
		    	scope.$on("$destroy",function() {
	    			element.off("mouseover",MouseIn);
	    			element.off("mouseout",MouseOut);
	    			if(timer)
	    				$timeout.cancel(timer);
	    			if(lastNotif)
	    				NotifyMouse(false);
		    	});
		    	scope.hit = scope.$eval(attrs.vdhTrackMouse);
		    },
		}
	}]);
