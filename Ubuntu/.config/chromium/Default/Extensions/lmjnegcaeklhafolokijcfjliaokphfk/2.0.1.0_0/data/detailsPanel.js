
angular.module('VDH').controller('VDHDetailsCtrl', 
	['$scope', 'VDH.util',
	 	function($scope,VDHUtil) {
			VDHUtil.prepareScope($scope);
			$scope.selected = {
				field: null, 
			}
			$scope.copyToClipboard = function() {
				var value = $scope.hit[$scope.selected.field];
				if(typeof value=="object")
					value = JSON.stringify(value);
				$scope.post("copy-to-url",{ value: value });
			}
	}]);

