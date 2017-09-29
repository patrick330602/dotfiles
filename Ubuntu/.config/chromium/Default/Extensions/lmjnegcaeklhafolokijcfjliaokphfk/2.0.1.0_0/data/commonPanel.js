
angular.module('VDH', ['ngAnimate']).config(['$compileProvider',
    function($compileProvider) {
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(chrome\-extension):/);
    }]).run(['VDH.util',function() { }]);

angular.module('VDH').service('VDH.util',
	[ '$window','$rootScope',
	  function($window,$rootScope) {
		  this.prepareScope = function($scope) {
			  	
			  	var panelName = (function(m) {
			  		return (m && m[1]) || "main";
			  	})(/\bpanel=([^&]*)/.exec($window.location.href));
			  	
				var port = chrome.runtime.connect({name: "vdh:panel:"+panelName});

				$scope.post = function(type,data) {
					port.postMessage(angular.extend({
						type: type,
					},data || {}));
				}
				
				var contentElem = $window.document.getElementById("content");
				var ngContent = angular.element(contentElem);
				var previousHeight = 0;
				$scope.checkSize = function(force) {
					function CheckSize() {
						var height = ngContent[0].offsetHeight;
						if(height!=previousHeight || force) {
							previousHeight = height;
							var html = $window.document.querySelector("html");
							if(html) {
								var body = $window.document.querySelector("body");
								if(body) {
									html.style.height = height;
									body.style.height = height;
									$scope.post("updateGeometry",{
										height: height,
									});
								}
							}
						}
					}
					$window.setTimeout(CheckSize,0);
					$window.setTimeout(CheckSize,1100);
					return true;
				}
				  

				$scope._=function() {
					if(arguments.length==0 || !arguments[0])
						return '';
					var str = chrome.i18n.getMessage(arguments[0].replace(/\-|\./g,'_'));
					var args = arguments;
					var argIndex = 1;
					str = str.replace(/%([1-9][0-9]*)?s/g,function(match,index) {
						if(index)
							return args[parseInt(index)];
						else
							return args[argIndex++];
					});
					return str;
				}

			    var panelTitle = $scope._("Video DownloadHelper");
				var panelTitleElem = document.querySelector(".vdh-panel-title");
				if(panelTitleElem) {
					var panelTitleTag = panelTitleElem.getAttribute("vdh-l10n");
					if(panelTitleTag)
						panelTitle = $scope._(panelTitleTag);
				}
				var headerTitleElem = document.querySelector("head > title");
				if(!headerTitleElem) {
					headerTitleElem = document.createElement("title");
					document.head.appendChild(headerTitleElem);
				}
				while(headerTitleElem.firstChild)
					headerTitleElem.removeChild(headerTitleElem.firstChild);
				headerTitleElem.appendChild(document.createTextNode(panelTitle));
				
				var oldPrefs = {};
				var toClass = {}.toString
				function SetDataValue(target,field,value) {
					if(target[field] === undefined || target[field] === null || toClass.call(value) != "[object Object]")
						target[field] = value;
					else {
						for(var f in value)
							SetDataValue(target[field],f,value[f]);
						for(var f in target[field])
							if(value[f] === undefined && f[0]!='$')
								delete target[field][f];
					}
				}
				function SetData(key,value,smooth) {
					var target = $scope;
					if(!Array.isArray(key))
						key = [ key ];
					for(var i=0;i<key.length-1;i++) {
						var segment = key[i];
						if(target[segment]===undefined)
							target[segment] = {};
						target = target[segment];
					}
					var field=key[key.length-1];
					SetDataValue(target,field,value);

					if(target==$scope && field=="prefs")
						oldPrefs=angular.extend({},value);
					else if(target==$scope.prefs)
						oldPrefs[field]=value;
				}
				port.onMessage.addListener(function(message) {
					switch(message.type) {
					case "set": 
						SetData(message.name,message.value,message.smooth);
						if(message.name=="prefs")
							$scope.$watch("prefs",function(prefs) {
								if(!angular.equals(prefs,oldPrefs))
									$scope.post("setPrefs",{
										prefs: prefs,
									});
							},true);
						break;
					case "multiset":
						message.data.forEach(function(entry) {
							SetData(entry.name,entry.value,entry.smooth);
						});
						break;
					case "openPanel":
						$scope.checkSize(true);
						break;
					case "close":
						window.close();
						break;
					case "initData":
						for(var f in message.initData) {
							if(Array.isArray(message.initData[f]) && !$scope[f])
								$scope[f] = [];
							else if(typeof message.initData[f]=="object" && !$scope[f])
								$scope[f] = {};
							angular.extend($scope[f],message.initData[f]);
						}
						break;
					}
					if(!$scope.$$phase)
						$scope.$apply();
				});
		  }
}]);

angular.module('VDH').directive('vdhPanelButton', 
	[ 
	  function factory() {
	return {
		scope: true,
		replace: true,
		template: '<div><img vdh-src="image"/></div>',
	    link: function(scope,element,attrs) {
	    	element.addClass("vdh-panel-button");
	    	/*
	    	element.on("mousedown",function() {
		    	element.addClass("pressed");	    		
	    	});
	    	element.on("mouseup mouseout",function() {
		    	element.removeClass("pressed");	    		
	    	});
	    	*/
	    	var options = scope.$eval(attrs.vdhPanelButton);
	    	scope.image = options.image;
	    },
	}
}]);

angular.module('VDH').directive('vdhL10n', 
		[ 
		  function factory() {
		return {
		    link: function(scope,element,attrs) {
		    	attrs.vdhL10n.split(",").forEach(function(tag) {
		    		var m=/^(.*):(.*)$/.exec(tag);
		    		if(m)
		    			element.attr(m[1],scope._(m[2],attrs.vdhL10nArgs));		    			
		    		else
		    			element.text(scope._(tag,attrs.vdhL10nArgs));
		    	});
		    },
		}
	}]);

angular.module('VDH').directive('vdhSrc', 
		[ 
		  function factory() {
		return {
			scope: true,
		    link: function(scope,element,attrs) {
		    	scope.$watch(attrs.vdhSrc,function(src) {
		    		if(src)
		    			element.attr("src",src);
		    		else
		    			element.attr("src","data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=");
		    	});
		    },
		}
	}]);


angular.module('VDH').filter('orderObjectBy', [
	function() {
		return function(items, field, reverse) {
			var filtered = [];
			angular.forEach(items, function(item) {
				filtered.push(item);
			});
			filtered.sort(function (a, b) {
				return (a[field] > b[field] ? 1 : -1);
			});
			if(reverse) filtered.reverse();
			return filtered;
		};
	}]);

angular.module('VDH').filter('keepObjectBy', [
   	function() {
   		return function(items, field, value, index) {
   			var filtered = [];
   			angular.forEach(items, function(item) {
   				if(item[field] == value)
   					filtered.push(item);
   			});
   			if(index) {
   				var obj = {};
   				filtered.forEach(function(item) {
   					obj[item[index]] = item;
   				});
   				return obj;
   			} else
   				return filtered;
   		};
   	}]);

angular.module('VDH').filter('orderHits', [
 	function() {
 		return function(items, field, value) {
 			var filtered = [];
 			angular.forEach(items, function(item) {
				filtered.push(item);
 			});
 			filtered.sort(function(a,b) {
 				var pa = a._priorityClass || 0; 
 				var pb = b._priorityClass || 0; 
 				if(pa!=pb)
 					return pb-pa; 				
 				if(a._priorityCat!==undefined && a._priorityCat===b._priorityCat && a._priority!==b._priority)
 					return (b._priority||0)-(a._priority||0);
 				if(a.timestamp==b.timestamp)
 					return (a.order||0)-(b.order||0);
				return a.timestamp-b.timestamp;
 			});
 			return filtered;
 		};
 	}]);

angular.module('VDH').filter('excludeUnderscoredKey', [
    function() {
    	return function(items) {
    		var filtered = {};
    		for(var id in items) {
    			if(!/^_/.test(id))
    				filtered[id] = items[id];
    		}
    		return filtered;
    	}
    }]);

angular.module('VDH').directive('vdhListEditor', 
		[ 
		  function factory() {
		return {
			scope: true,
			require: '?ngModel',
			replace: true,
			templateUrl: 'vdh-list-editor.html',
		    link: function(scope,element,attrs,ngModel) {
		    	element.addClass("vdh-list-editor");
		    	scope.options = angular.extend({
		    		selected: -1,
		    		order: true,
		    		add: false,
		    		remove: true,
		    		edit: null,
		    		enabled: null,
		    		label: null,
		    	},scope.$eval(attrs.vdhListEditor));
				scope.list=[];
				ngModel.$render = function() {
					scope.list = ngModel.$viewValue;
				};
				scope.$watch("list",function(list) {
					ngModel.$setViewValue(list);
				},true);
				scope.selectIndex = function(index) {
					scope.options.selected = index;
				}
				scope.up = function() {
					if(scope.options.selected<1)
						return;
					var item = scope.list[scope.options.selected];
					scope.list[scope.options.selected] = scope.list[scope.options.selected-1];
					scope.options.selected--;
					scope.list[scope.options.selected] = item;
				}
				scope.down = function() {
					if(scope.options.selected<0 || scope.options.selected>=scope.list.length-1)
						return;
					var item = scope.list[scope.options.selected];
					scope.list[scope.options.selected] = scope.list[scope.options.selected+1];
					scope.options.selected++;
					scope.list[scope.options.selected] = item;
				}
				var addStringElm = angular.element(element[0].querySelector(".vdh-add-string input"));
				scope.add = function() {
					if(!scope.addShown)
						scope.addShown = true;
					else {
						var str = /^\s*(.*?)\s*$/.exec(addStringElm.val())[1];
						if(str) {
							if(scope.options.add===true)
								scope.list.push(str);
							else
								scope.$eval(scope.options.add+"('"+str+"')");
						}
						scope.addShown = false;
					}
				}
				scope.remove = function() {
					if(scope.options.selected<0)
						return;
					scope.list.splice(scope.options.selected,1);
					scope.options.selected = -1;
				}
				scope.edit = function() {
					if(scope.options.selected<0)
						return;
					scope.$eval(scope.options.edit);
				}
				scope.addShown = false;
		    },
		}
	}]);

angular.module('VDH').directive('vdhOptTextInput', 
		[ 
		  function factory() {
		return {
			require: '?ngModel',
			replace: true,
			scope: true,
			template: 
				"<div class='vdh-opt-text-input'>"+
				"  <input type='text' class='ng-hide' ng-model='widgetValues.text'/>"+
				"  <input type='checkbox' ng-model='widgetValues.check'/>"+
				"</div>",
		    link: function(scope,element,attrs,ngModel) {
		    	scope.widgetValues = {
				    check: false,
				    text: '',	    		
		    	}
		    	var inputText = angular.element(element[0].querySelector("input[type=text]"));
				ngModel.$render = function() {
					if(ngModel.$viewValue == null) {
						scope.widgetValues.check = false;
						scope.widgetValues.text = '';
						inputText.addClass("ng-hide");
					} else {
						scope.widgetValues.check = true;
						scope.widgetValues.text = ngModel.$viewValue;
						inputText.removeClass("ng-hide");
					}
				};
				scope.$watch("widgetValues",function(widgetValues) {
					if(widgetValues.check) {
						ngModel.$setViewValue(widgetValues.text);
						inputText.removeClass("ng-hide");
					} else {
						inputText.addClass("ng-hide");
						ngModel.$setViewValue(null);
					}
				},true);
		    },
		}
	}]);

angular.module('VDH').directive('vdhOptSelect', 
		[ 
		  function factory() {
		return {
			require: '?ngModel',
			replace: true,
			scope: true,
			template: function(element,attrs) {
				return "<div class='vdh-opt-select'>"+
					"  <select class='ng-hide' ng-model='widgetValues.option' required='required' ng-options='"+attrs.vdhOptSelect+"'>"+
					"    <option style='display:none' value=''>?</option>"+
					"  </select>"+
					"  <input type='checkbox' ng-model='widgetValues.check'/>"+
					"</div>";
			},
			link: function(scope,element,attrs,ngModel) {
		    	scope.widgetValues = {
				    check: false,
				    option: null,	    		
		    	}
		    	var select = angular.element(element[0].querySelector("select"));
				ngModel.$render = function() {
					if(ngModel.$viewValue == null) {
						scope.widgetValues.check = false;
						scope.widgetValues.option = null;
						select.addClass("ng-hide");
					} else {
						scope.widgetValues.check = true;
						scope.widgetValues.option = ngModel.$viewValue;
						select.removeClass("ng-hide");
					}
				};
				scope.$watch("widgetValues",function(widgetValues) {
					if(widgetValues.check) {
						ngModel.$setViewValue(widgetValues.option);
						select.removeClass("ng-hide");
					} else {
						select.addClass("ng-hide");
						ngModel.$setViewValue(null);
					}
				},true);
		    },
		}
	}]);

angular.module('VDH').directive('vdhConvconfEditor', 
		[ 
		  function factory() {
		return {
			require: '?ngModel',
			replace: true,
			scope: true,
			templateUrl: "convconf-editor.html", 
		    link: function(scope,element,attrs,ngModel) {
		    	var controlledParams = {};
		    	var cpNodes = element[0].querySelectorAll("[vdh-param]");
		    	for(var i = 0;i<cpNodes.length;i++) {
		    		var cpNode = cpNodes.item(i);
		    		controlledParams[cpNode.getAttribute("vdh-param")] = 1;
		    	}
		    	
				scope.values = {
					tab: 'general',
					resetRequested: false,
				}
				scope.audioChannels = [{
					ac: 0,
					label: scope._('convconf-acnone'),
				},{
					ac: 1,
					label: scope._('convconf-mono'),
				},{
					ac: 2,
					label: scope._('convconf-stereo'),
				}];
				ngModel.$render = function() {
					if(!ngModel.$viewValue)
						return;
					scope.cconfigs = ngModel.$viewValue;
					
					if(scope.cconfigs && !scope.cconfigs[scope.currentConfigId.value]) {
						var bestId = null;
						var validId = null;
						for(var conf in scope.cconfigs) {
							if(conf) {
								if(!validId)
									validId = conf;
								if(/wmv/i.test(scope.cconfigs[conf].title)) {
									bestId = conf;
									break;
								}
							}
						}
						if(bestId)
							scope.currentConfigId.value = bestId;
						else if(validId)
							scope.currentConfigId.value = validId;
					}
				}
				
				scope.resetConfigs = function() {
					scope.post("resetConfigs",{});
				}
				
				scope.newConfig = function() {
					if(!scope.cconfigs)
						return;
					var id = ""+Date.now();
					var config = {
						title: scope._('custom-output'),
						ext: 'mp4',
						params: {},
					}
					scope.cconfigs[id] = config;
					scope.currentConfigId.value = id;
				}
				
				scope.duplicateConfig = function() {
					if(!scope.cconfigs)
						return;
					var origConfig = scope.cconfigs[scope.currentConfigId.value]; 
					if(!origConfig)
						return;
					var id = ""+Date.now();
					var config = JSON.parse(JSON.stringify(origConfig));
					config.title = scope._('copy-of',origConfig.title);
					config.id = id;
					delete config.readonly;
					scope.cconfigs[id] = config;
					scope.currentConfigId.value = id;
				}
				
				scope.removeConfig = function() {
					if(!scope.cconfigs)
						return;
					delete scope.cconfigs[scope.currentConfigId.value];
					scope.currentConfigId.value = null;
					for(var id in scope.cconfigs) {
						scope.currentConfigId.value = id;
						break;
					}
				}
				
				var crashConfig = {
					crash: true,
					params: {},
				}
				scope.config = crashConfig;
				
				function UpdateParameters(config) {
					var extraParams = {};
					for(var param in config.params)
						if(controlledParams[param]===undefined)
							extraParams[param] = config.params[param];
					if(config.extra) {
						var itemName = null;
						config.extra.split(/\s+/).forEach(function(item) {
							if(item.length==0)
								return;
							if(item[0]=="-" && itemName) {
								extraParams[itemName] = 1;
								itemName = null;
							}
							if(itemName) {
								extraParams[itemName] = item;
								itemName = null;
							} else if(item[0]=="-")
								itemName = item.substr(1);
						});
						if(itemName)
							extraParams[itemName] = 1;
					}
					var extra=[];
					for(var param in extraParams)
						if(controlledParams[param]!==undefined) {
							config.params[param] = extraParams[param]; 
							delete extraParams[param];
						} else {
							extra.push("-"+param);
							extra.push(extraParams[param]);
							config.params[param] = extraParams[param]; 
						}
					config.extra = extra.length==0 ? null : extra.join(" ");
				}
				
				function UpdateConfig() {
					if(scope.cconfigs && scope.currentConfigId.value)
						scope.config = scope.cconfigs[scope.currentConfigId.value] || crashConfig;
					else
						scope.config = crashConfig;					
				}
				scope.$watch('cconfigs',function(configs,oldConfigs) {
					UpdateConfig();
					if(configs)
						ngModel.$setViewValue(scope.cconfigs);
				},true);
				scope.$watch('currentConfigId.value',function(cci) {
					if(scope.cconfigs && cci && scope.cconfigs[cci])
						UpdateParameters(scope.cconfigs[cci]);
					UpdateConfig();
				});
				
				scope.resetClasses = function() {
					if(scope.cconfigs)
						for(var id in scope.cconfigs)
							if(!scope.cconfigs[id].readonly)
								return "";
					
					return "vdh-disabled";
				}
				
				scope.configsArray = function() {
					var arr = [];
					if(scope.cconfigs) {
						for(var id in scope.cconfigs) {
							var config = scope.cconfigs[id];
							config.id = id;
							arr.push(config)
							
						}
						arr.sort(function(a,b) {
							return a.title.toLowerCase()>b.title.toLowerCase()?1:-1;
						});
					}
					return arr;
				}
		    },
		}
	}]);

angular.module('VDH').directive('vdhImageRoll', 
		[ '$interval',
		  function factory($interval) {
		return {
		    link: function(scope,element,attrs) {
				var imgs = element[0].querySelectorAll("img");
				var index = imgs.length-1;
				function Next() {
					angular.element(imgs.item(index)).css("opacity","0");
					index = (index+1) % imgs.length;
					angular.element(imgs.item(index)).css("opacity","1");
				}
				Next();
				function ScheduleNext() {
					Next();
				}
				var repeater = $interval(ScheduleNext,2000);
				scope.$on("$destroy",function() {
					$interval.cancel(repeater);
				});
		    },
		}
	}]);

angular.module('VDH').directive('vdhJoclyAd', 
		[ 
		  function factory() {
		return {
			replace: true,
			templateUrl: 'jocly-ad.html',
		    link: function(scope,element,attrs,ngModel) {
		    },
		}
	}]);

angular.module('VDH').directive('vdhCphelperAd',
		[
		  function factory() {
		return {
			replace: true,
			templateUrl: 'cphelper-ad.html',
		    link: function(scope,element,attrs,ngModel) {
		    },
		}
	}]);

angular.module('VDH').directive('vdhNewline', 
		[ 
		  function factory() {
		return {
		    link: function(scope,element,attrs) {
		    	element.on("keypress",function(event) {
			    	if((event.which || event.keyCode) == 13)
			    		scope.$eval(attrs.vdhNewline);
		    	});
		    },
		}
	}]);

