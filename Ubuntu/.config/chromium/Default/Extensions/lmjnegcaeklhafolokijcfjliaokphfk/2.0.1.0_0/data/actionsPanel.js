
angular.module('VDH').controller('VDHActionsCtrl', 
	['$scope', 'VDH.util',
	 	function($scope,VDHUtil) {
			VDHUtil.prepareScope($scope);
			$scope.command = function(action) {
				$scope.post("actionCommand",{
					action: action,
					hit: $scope.hit,
					asDefault: $scope.data.asDefault,
				});
			}
			$scope.data = {
				asDefault: false,
			}
	}]);

