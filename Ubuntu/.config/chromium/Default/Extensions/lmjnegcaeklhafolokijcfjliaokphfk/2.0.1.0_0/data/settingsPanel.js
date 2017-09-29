
angular.module('VDH').controller('VDHSettingsCtrl', 
	['$scope', 'VDH.util',
	 	function($scope,VDHUtil) {
			$scope.tabs = {
				current: "home",
				dropdown: "more",
			}
			$scope.platform = "";
			$scope.mediaExtensions = [];
			$scope.medialinkExtensions = [];
			$scope.storageDirectory = {
				value: "",
			};
			$scope.smartnames = null;
			$scope.maskedPassword = "";
			$scope.changingMaskedPassword = false;

			VDHUtil.prepareScope($scope);
			$scope.$watch("transientStorageDirectory || prefs['storagedirectory']",function(dir) {
				$scope.storageDirectory.value = dir || "";
			});
			$scope.$watch("tabs.dropdown",function(value) {
				if(value && value!="more")
					$scope.tabs.current = value;
				$scope.tabs.dropdown = "more";
			});
			$scope.$watch("prefs['media-extensions']",function(exts) {
				if(exts)
					$scope.mediaExtensions = exts.split("|");
				else
					$scope.mediaExtensions = [];
			});
			$scope.$watch("mediaExtensions",function(exts) {
				if($scope.prefs)
					if(exts)
						$scope.prefs['media-extensions'] = exts.join("|");
					else
						$scope.prefs['media-extensions'] = "";
			},true);
			$scope.$watch("prefs['medialink-extensions']",function(exts) {
				if(exts)
					$scope.medialinkExtensions = exts.split("|");
				else
					$scope.medialinkExtensions = [];
			});
			$scope.$watch("medialinkExtensions",function(exts) {
				if($scope.prefs)
					if(exts)
						$scope.prefs['medialink-extensions'] = exts.join("|");
					else
						$scope.prefs['medialink-extensions'] = "";
			},true);
			$scope.activationModes = [{
				mode: "anytab",
				text: $scope._("icon-activation-mode-anytab"),
			},{
				mode: "currenttab",
				text: $scope._("icon-activation-mode-currenttab"),
			}];
			$scope.topMainModes = [{
				mode: "icons",
				text: $scope._("shortcut-icons-dropdown"),
			},{
				mode: "links",
				text: $scope._("links-list"),
			}];
			$scope.$watch('blacklist',function(blacklist) {
				if(blacklist)
					$scope.post("blacklist",{
						blacklist: blacklist,
					});
			},true);
			$scope.$watch('variants',function(variants) {
				if(variants)
					$scope.post("variants",{
						variants: variants,
					});
			},true);
			$scope.$watch('adpVariants',function(variants) {
				if(variants)
					$scope.post("adpVariants",{
						variants: variants,
					});
			},true);
			$scope.resetVariants = function() {
				$scope.post("resetVariants",{});				
			}
			$scope.changeStorageDirectory = function() {
				$scope.post("changeStorageDirectory",{});								
			}
			$scope.saveTransientStorageDirectory = function() {
				$scope.prefs['storagedirectory'] = $scope.storageDirectory.value;
			}
			$scope.purchaseLicense = function() {
				$scope.post("getLicenseKey",{});									
			}
			$scope.donation = function() {
				$scope.post("gotoDonation",{});									
			}
			$scope.gotoJocly = function() {
				$scope.post("gotoJocly");
			}
			$scope.gotoCphelper = function() {
				$scope.post("gotoCphelper");
			}
			$scope.spacesModes = [{
				mode: "keep",
				text: $scope._("smartnamer.fname.spaces.keep"),
			},{
				mode: "remove",
				text: $scope._("smartnamer.fname.spaces.remove"),
			},{
				mode: "hyphen",
				text: $scope._("smartnamer.fname.spaces.hyphen"),
			},{
				mode: "underscore",
				text: $scope._("smartnamer.fname.spaces.underscore"),
			}];
			$scope.orderAdaptativeVariants = function() {
				$scope.post("orderAdpVariants",{});								
			}
			$scope.badgeModes = [{
				mode: 'none',
				text: $scope._('icon-badge-none'),
			},{
				mode: 'tasks',
				text: $scope._('icon-badge-tasks'),
			},{
				mode: 'activetab',
				text: $scope._('icon-badge-activetab'),
			},{
				mode: 'anytab',
				text: $scope._('icon-badge-anytab'),
			},{
				mode: 'pinned',
				text: $scope._('icon-badge-pinned'),
			},{
				mode: 'mixed',
				text: $scope._('icon-badge-mixed'),
			}];
			$scope.cmenuModes = [{
				mode: 'quick',
				text: $scope._('cmenu-mode-quick'),
			},{
				mode: 'all',
				text: $scope._('cmenu-mode-all'),
			},{
				mode: 'both',
				text: $scope._('cmenu-mode-both'),
			},{
				mode: 'none',
				text: $scope._('cmenu-mode-none'),
			}];
			$scope.compOpModes = [{
				mode: 'about',
				text: $scope._('about'),
			},{
				mode: 'settings',
				text: $scope._('settings'),
			},{
				mode: 'convert',
				text: $scope._('convert-local-files'),
			},{
				mode: 'sites',
				text: $scope._('supported-sites'),
			},{
				mode: 'gallery',
				text: $scope._('capture-gallery'),
			},{
				mode: 'clearhits',
				text: $scope._('clear-hits'),
			}];
			$scope.smModes = [{
				mode: "header-url",
				text: $scope._("smartnamer.get-name-from-header-url"),
			},{
				mode: "page-title",
				text: $scope._("smartnamer.get-name-from-page-title"),
			},{
				mode: "page-content",
				text: $scope._("smartnamer.get-name-from-page-content"),
			},{
				mode: "obfuscated",
				text: $scope._("smartnamer.get-obfuscated-name"),
			}];
			$scope.toolbarModes = [{
				mode: "maincomp",
				text: $scope._("tbmode.maincomp"),
			},{
				mode: "main",
				text: $scope._("tbmode.main"),
			},{
				mode: "comp",
				text: $scope._("tbmode.comp"),
			}];
			$scope.displayModes = [{
				mode: "normal",
				text: $scope._("display-mode.normal"),
			},{
				mode: "compact",
				text: $scope._("display-mode.compact"),
			},{
				mode: "mozilla",
				text: $scope._("display-mode.mozilla"),
			}];
			$scope.scrapAlignModes = [{
				mode: "cut",
				text: $scope._("scrap.8x8-align.cut"),
			},{
				mode: "extend",
				text: $scope._("scrap.8x8-align.extend"),
			}];
			$scope.scrapMouseModes = [{
				mode: "never",
				text: $scope._("scrap.mouse.never"),
			},{
				mode: "always",
				text: $scope._("scrap.mouse.always"),
			},{
				mode: "metakey",
				text: $scope._("scrap.mouse.metakey"),
			},{
				mode: "not-metakey",
				text: $scope._("scrap.mouse.not-metakey"),
			}];
			$scope.titleModes = [{
				mode: "right",
				text: $scope._("title.mode.ellipsis-right"),
			},{
				mode: "left",
				text: $scope._("title.mode.ellipsis-left"),
			},{
				mode: "multiline",
				text: $scope._("title.mode.multiline"),
			}];
			$scope.threadsModes = [{
				mode: "auto",
				text: "auto",
			}];
			for(var i=1;i<=8;i++)
				$scope.threadsModes.push({
					mode: ""+i,
					text: ""+i,
				});
			$scope.editSmartname = function(snEntry) {
				$scope.currentSmartname.value = snEntry;
			}
			$scope.currentSmartname = {
				value: null
			}
			$scope.addSmartname = function(domain) {
				if($scope.smartnames)
					for(var i=0;i<$scope.smartnames.length;i++) {
						var sn = $scope.smartnames[i];
						if(sn.domain==domain) {
							$scope.smartnames.splice(i,1);
							break;
						}
					}
				$scope.currentSmartname.value = {
					domain: domain,
					mode: "page-content",
					xpath: "/html/head/title",
					regexp: ".*",
					delay: 0,
				}
				$scope.smartnames.push($scope.currentSmartname.value);
			}
			$scope.$watch('smartnames',function(smartnames) {
				if(smartnames) {
					smartnames.forEach(function(sn) {
						sn.label = sn.domain + " - " + $scope._('smartnamer.'+sn.mode);
						if(sn.mode=="page-title")
							sn.xpath = "/html/head/title";
						if(isNaN(sn.delay))
							sn.delay = 0;
						sn.delay = sn.delay || 0;
					});
					$scope.post("smartnames",{
						smartnames: smartnames,
					});
				}
			},true);
			$scope.changeMaskedPassword = function() {
				$scope.maskedPassword = "";
				$scope.changingMaskedPassword = true;
				$scope.post("getMaskedPassword");
			}
			$scope.saveMaskedPassword = function() {
				$scope.changingMaskedPassword = false;
				$scope.post("setMaskedPassword",{password: $scope.maskedPassword});
				$scope.maskedPassword = "";
			}
	}]);

angular.module('VDH').controller('VDHConverterSettingsCtrl', 
		['$scope', 'VDH.util',
		 	function(scope,VDHUtil) {
	    	scope.licenseStatusClasses = function() {
	    		if(scope.converter)
	    			return 'vdh-settings-license-'+scope.converter.license.status;
	    		return "";
	    	}
			scope.checkConverter = function() {
				delete scope.converter;
				scope.post("checkConverter",{});												
			}
			scope.updateConverter = function() {
				scope.post("updateConverter",{url: scope.converter.update.url});
			}
			scope.convPanel = {
				value: 'checking',
				current: null,
				output: false,
			}
			scope.ruleLabel = function(rule) {
				var ext, domain, target;
				if(rule.ext==null)
					ext=scope._('any-format');
				else
					ext=rule.ext.toUpperCase();
				if(rule.domain==null)
					domain=scope._('any-domain');
				else
					domain=rule.domain;
				if(scope.configs[rule.config])
					target=scope.configs[rule.config].title;
				else
					target=scope._('undefined-output'); 
				if(rule.convert)
					 return scope._('convert-format-from-domain',ext,domain,target);
				else
					return scope._('do-no-convert-format-from-domain',ext,domain);
			}
			scope.deleteRule = function(index) {
				scope.post("deleteRule",{
					index: index,
				});				
			}
			scope.resetConverterRules = function() {
				scope.post("resetConverterRules",{});				
			}
			scope.newRule = function() {
				var rule = {
					convert: true,
					domain: null,
					ext: null,
					config: "90195ab2-d891-443c-a164-8f0953ec8975",
				}
				scope.converter.rules.unshift(rule);
				scope.convPanel.current = rule;
			}
			scope.upRule = function(index) {
				var tmp = scope.converter.rules[index-1];
				scope.converter.rules[index-1] = scope.converter.rules[index];
				scope.converter.rules[index] = tmp;
			}
			scope.downRule = function(index) {
				var tmp = scope.converter.rules[index+1];
				scope.converter.rules[index+1] = scope.converter.rules[index];
				scope.converter.rules[index] = tmp;
			}
			scope.$watch('converter.rules',function(rules) {
				scope.post("updateRules",{
					rules: rules,
				});								
			},true);
			scope.currentConfigId = {
				value: null,
			}
			scope.editOutput = function() {
				scope.convPanel.output = true;
				scope.currentConfigId = {
					value: scope.convPanel.current.config,
				}
			}
			scope.$watch("currentConfigId.value",function(configId) {
				if(configId && scope.convPanel.current) {
					scope.convPanel.current.config = configId;
				}
			});
			scope.convPanel = {
				value: 'checking',
				current: null,
				output: false,
			}
			scope.conversionOutputs = function() {
				scope.convPanel = {
					value: 'outputs',
					current: null,
					output: false,
				}
			}
			scope.$watch("converter",function(converter) {
				if(converter) {
					scope.convPanel = {
						value: 'main',
						current: null,
						output: false,
					}
				} else
					scope.convPanel = {
						value: 'checking',
						current: null,
						output: false,
					}
			});
			scope.formats = {};
			scope.codecs = {};
			scope.configs = {};
			scope.$watch("converter",function(converter) {
				if(converter) {
					scope.formats = converter.formats;
					scope.codecs = converter.codecs;
					if(converter.configs) {
						for(var f in scope.configs)
							if(scope.configs.hasOwnProperty(f))
								delete scope.configs[f];
						angular.extend(scope.configs,converter.configs);
						converter.configs = null;
					}
				}
			},true);
			
			scope.$watch("configs",function(configs) {
				if(configs && Object.keys(configs).length>0)
					scope.post("setConfigs",{ configs: configs });
			},true);

			scope.$watch("converter.license",function(license) {
				scope.convPanel.checkingLicense = false;
			},true);
			scope.installConverter = function() {
				scope.post("installConverter",{});				
			}
			scope.conversionHelp = function() {
				scope.post("conversionHelp",{});				
			}
			scope.validateLicense = function(key) {
				key = key || /^\s*(.*.)\s*$/.exec(scope.convPanel.inputLicense)[1];
				scope.post("validateLicense",{key: key });
				scope.convPanel.enterLicense = false;
				scope.convPanel.checkingLicense = true;
				scope.convPanel.requestedCheck = true;
			}
			scope.inputLicenseValid = function() {
				return scope.convPanel.inputLicense && !/^\s*$/.test(scope.convPanel.inputLicense);
			}
			scope.getLicenseKey = function() {
				scope.post("getLicenseKey",{});									
			}
			scope.validateIfValid = function() {
				if(scope.inputLicenseValid())
					scope.validateLicense(scope.convPanel.inputLicense);
			}
		}]);

angular.module('VDH').directive('converterSettings', 
		[ 
		  function factory() {
		return {
			replace: true,
			scope: true,
			templateUrl: "converter-settings.html", 
		}
	}]);


angular.module('VDH').directive('vdhRuleEditor', 
		[ 
		  function factory() {
		return {
			require: '?ngModel',
			replace: true,
			scope: true,
			templateUrl: "rule-editor.html", 
		    link: function(scope,element,attrs,ngModel) {
		    	scope.rule = {
		    		convert: false,
		    		ext: null,
		    		domain: null,
		    		config: null,
		    	}
		    	var selectRow = angular.element(element[0].querySelector(".vdh-settings-select-row"));
				ngModel.$render = function() {
		    		if(ngModel.$viewValue) {
		    			scope.rule.convert = ngModel.$viewValue.convert; 
		    			scope.rule.ext = ngModel.$viewValue.ext; 
		    			scope.rule.domain = ngModel.$viewValue.domain; 
		    			scope.rule.config = ngModel.$viewValue.config;
		    			if(scope.rule.convert)
		    				selectRow.removeClass("ng-hide");
		    			else
		    				selectRow.addClass("ng-hide");
		    		}	
				};
				scope.$watch("rule",function(values) {
					if(ngModel.$viewValue) {
						ngModel.$setViewValue(angular.extend(ngModel.$viewValue,{
							convert: scope.rule.convert,
							ext: scope.rule.ext,
							domain: scope.rule.domain,
							config: scope.rule.config,
						}));
		    			if(scope.rule.convert)
		    				selectRow.removeClass("ng-hide");
		    			else
		    				selectRow.addClass("ng-hide");
					}
				},true);
				
				scope.$watch("convPanel.current.config",function(configId) {
					ngModel.$rollbackViewValue();
				});
		    },
		}
	}]);

angular.module('VDH').directive('vdhHotkey', 
		[ 
		  function factory() {
		return {
			require: '?ngModel',
			replace: true,
			scope: true,
			templateUrl: "hotkey-widget.html", 
		    link: function(scope,element,attrs,ngModel) {
		    	var ACCEL = 'CTRL'; 
		    	scope.modifiers = [{
		    		mode: "accel",
		    		text: ACCEL,
		    	},{
		    		mode: "accel-shift",
		    		text: ACCEL+"+SHIFT",		    		
		    	},{
		    		mode: "alt-shift",
		    		text: "SHIFT+ALT",		    		
		    	},{
		    		mode: "accel-alt",
		    		text: ACCEL+"+ALT",		    		
		    	},{
		    		mode: "accel-alt-shit",
		    		text: ACCEL+"+SHIFT+ALT",		    		
		    	}];
		    	
		    	scope.keys = [];
		    	for(var i = 0; i < 26; i++) {
		    		var letter = String.fromCharCode(i+"a".charCodeAt(0));
		    		scope.keys.push({
		    			key: letter,
		    			text: letter.toUpperCase(),
		    		});
		    	}
		    	for(var i = 1; i <= 12; i++) {
		    		scope.keys.push({
		    			key: "f"+i,
		    			text: "F"+i,
		    		});
		    	}
		    	
		    	scope.key = {
		    		enabled: false,
		    	}
		    	
				ngModel.$render = function() {
		    		if(ngModel.$viewValue) {
		    			var m = /^(.*)-(.*?)$/.exec(ngModel.$viewValue);
		    			if(m) {
			    			scope.key.enabled = true;
		    				scope.key.modifier = m[1];
		    				scope.key.key = m[2];
		    			}
		    		} else
		    			scope.key.enabled = false;
				};

				scope.$watch("key",function(key) {
					if(key.enabled)
						ngModel.$setViewValue(key.modifier+"-"+key.key);
					else
						ngModel.$setViewValue("");
				},true);
				
		    },
		}
	}]);

