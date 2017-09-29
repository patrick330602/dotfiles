
angular.module('VDH').controller('VDHSitesCtrl', 
	['$scope', 'VDH.util',
	 	function($scope,VDHUtil) {
			$scope.sitesMap = {};
			$scope.selected = {
				value: -1,
			}
			VDHUtil.prepareScope($scope);
			$scope.$watch('sites',function(sites) {
				$scope.sitesMap = {};
				if(sites)
					sites.forEach(function(site) {
						$scope.sitesMap[site.id] = site;
					});
			});
			$scope.order = function(field) {
				if(field == $scope.prefs['sites-order-field'])
					$scope.prefs['sites-order-direction'] = 1 - $scope.prefs['sites-order-direction'];
				else {
					$scope.prefs['sites-order-field'] = field;
					if(field=='name')
						$scope.prefs['sites-order-direction'] = 0;
					else
						$scope.prefs['sites-order-direction'] = 1;
				}
			}
			$scope.classes = function(field) {
				var classes = [];
				if($scope.prefs && field == $scope.prefs['sites-order-field']) {
					classes.push('order-field');
					if($scope.prefs['sites-order-direction'])
						classes.push('order-reverse');
				}
				return classes.join(" ");
			}
			$scope.rowClasses = function(site) {
				var classes = [];
				if(site.id == $scope.selected.value)
					classes.push("selected");
				if(site.adult=='1') {
					classes.push("explicit");
					if(!$scope.prefs || $scope.prefs['safe-mode'])
						classes.push("hidden");
				}
				return classes.join(" ");
			}
			$scope.visit = function(site) {
				$scope.post('visit',{site: site.id});
			}
	}]);

