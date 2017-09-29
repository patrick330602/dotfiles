
angular.module('VDH').controller('VDHMainCtrl', 
	['$scope', 'VDH.util',
	 	function($scope,VDHUtil) {
		$scope.hits = {};
		$scope.logs = [];
		$scope.errorLogs = [];
		$scope.logLogs = [];
		$scope.operation = {
			value: "operations"
		}
		VDHUtil.prepareScope($scope);
		
		$scope.$watch("operation.value",function(operation) {
			if(operation!="operations") {
				$scope.post('operation',{
					operation: operation,
				});
			}
			$scope.operation.value = "operations";
		});
		
		$scope.settings = function() {
			$scope.post('settings');
		}
		$scope.about = function() {
			$scope.post('about');			
		}
		$scope.countActive = function() {
			var count = 0;
			for(var id in $scope.hits)
				if($scope.hits[id].status=='active')
					count++;
			return count;
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
		$scope.moreActions = function(hit) {
			$scope.post('more-actions',{
				hit: hit,
			});
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
		$scope.$watch('hits',function(hits) {
			$scope.counters = {
				all: 0,
			}
			for(var id in hits) {
				var hit = hits[id];
				$scope.counters.all++;
				$scope.counters[hit.status] = $scope.counters[hit.status] || 0;
				$scope.counters[hit.status]++;
			}
		},true);
		$scope.hitClass = function(hit) {
			var classes = [ "hit-"+hit.status ];
			if($scope.prefs) {
				if($scope.prefs['hits-animation'])
					classes.push("hits-animation");
				if(hit.adp && (hit.status=='active' || hit.status=='inactive') && $scope.prefs['ui.adp.grey'])
					classes.push("hits-adp-grey");
			}
			return classes.join(" ");
		}
		$scope.clearLogs = function() {
			$scope.post('clear-log',{});						
		}
		$scope.$watch('logs',function(logs) {
			$scope.errorLogs.splice(0,$scope.errorLogs.length);
			$scope.logLogs.splice(0,$scope.logLogs.length);
			logs.forEach(function(log) {
				if(log.type=='error')
					$scope.errorLogs.push(log);
				else if(log.type=='log')
					$scope.logLogs.push(log);
			});
		},true);
		$scope.logDetails = function(log) {
			$scope.post('log-details',{
				log: log
			});
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
		$scope.titleClass = function(hit) {
			var classes = ["hit-title-text"];
			if($scope.prefs)
				classes.push("hit-title-text-"+$scope.prefs['title.mode']);
			return classes.join(" ");
		}
		$scope.goToTab = function(hit) {
			$scope.post('gototab',{ url: hit.topUrl });
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

angular.module('VDH').directive('vdhOpener', 
		[ 
		  function factory() {
		return {
			scope: true,
			require: '?ngModel',
			template: "<div ng-click='toggle()'>"+
				"  <div vdh-panel-button='{image:\"images/icon-less-64.png\"}' ng-click='toggle()' ng-show='opened'></div>"+
				"  <div vdh-panel-button='{image:\"images/icon-more-64.png\"}' ng-click='toggle()' ng-show='!opened'></div>"+
				"</div>", 
		    link: function(scope,element,attrs,ngModel) {
		    	element.addClass("vdh-opener");
				scope.opened=true;
				//if(!ngModel)
				//	return;
				ngModel.$render = function() {
					scope.opened = ngModel.$viewValue;
				};
				scope.$watch("opened",function(opened) {
					ngModel.$setViewValue(opened);
				});
				scope.toggle = function() {
					scope.opened = !scope.opened;
				}
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
		    			var progress = 100*(t0 - hit.orphanStart)/(hit.orphanEnd-hit.orphanStart);
		    			element.css("width",progress+"%");
		    		}
		    	},5000);
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
