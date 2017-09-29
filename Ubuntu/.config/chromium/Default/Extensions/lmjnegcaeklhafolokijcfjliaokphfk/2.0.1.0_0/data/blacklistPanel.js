
angular.module('VDH').controller('VDHBlacklistCtrl', 
	['$scope', 'VDH.util',
	 	function($scope,VDHUtil) {
			VDHUtil.prepareScope($scope);
			$scope.selected = {}
			$scope.$watch('domains',function(domains) {
				$scope.selected = {}
				if(domains)
					domains.forEach(function(domain) {
						$scope.selected[domain] = false;
					});
			});
			$scope.hasSelection = function() {
				var selected = false;
				for(var domain in $scope.selected)
					if($scope.selected[domain])
						selected = true;
				return selected;
			}
			$scope.blacklist = function() {
				$scope.post("blacklist",{
					blacklist: $scope.selected,
				});
			}
	}]);

