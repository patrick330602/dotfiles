
angular.module('VDH').controller('VDHSmartNamesCtrl', 
	['$scope', 'VDH.util',
	 	function($scope,VDHUtil) {
			VDHUtil.prepareScope($scope);
			var data0 = {
				xpath: null,
				validXPath: false,
				fullText: "",
				text: "",
				regexp: ".*",
				validRegexp: true,
				advanced: false,
				domains: [],
				domain: null,
				mode: "page-content",
				delay: 0,
				validDelay: true,
			}
			$scope.data = data0; 
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
			function UpdateText() {
				var re, fullText = $scope.data.fullText.trim().replace(/\s+/g,' ');
				
				if($scope.data.mode=="header-url") {
					$scope.data.text = $scope.data.fullText;
				} else {
					try {
						re = new RegExp($scope.data.regexp,"g");
						$scope.data.validRegexp = true;
						var match = re.exec(fullText);
						if(match) {
							if(match[1])
								$scope.data.text = match[1];
							else
								$scope.data.text = match[0];
						} else
							$scope.data.text = "";
					} catch(e) {
						$scope.data.validRegexp = false;
						$scope.data.text = "";
					}
				}
			}
			$scope.$watch('data.xpath',function(xpath) {
				$scope.post('check',{
					mode: $scope.data.mode,
					xpath: xpath,
				});
			});
			$scope.$watch('data.fullText',function() {
				UpdateText();
			});
			$scope.$watch('data.regexp',function() {
				UpdateText();
			});
			$scope.$watch('data.delay',function(delay) {
				$scope.data.validDelay = !isNaN(delay);
			});
			$scope.$watch('data.mode',function() {
				$scope.post('check',{
					mode: $scope.data.mode,
					xpath: $scope.data.xpath,
				});
			});
			$scope.$watch('data.domains',function(domains) {
				if(!($scope.data.domain in domains) && domains.length>0)
					$scope.data.domain = domains[0];
			});
			$scope.save = function() {
				$scope.post('set',{
					domain: $scope.data.domain,
					mode: $scope.data.mode,
					xpath: $scope.data.xpath,
					regexp: $scope.data.regexp,
					delay: $scope.data.delay,
				});
			}
	}]);

