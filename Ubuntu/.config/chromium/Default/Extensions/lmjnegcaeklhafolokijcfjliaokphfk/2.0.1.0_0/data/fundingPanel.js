
angular.module('VDH').controller('VDHFundingCtrl', 
	['$scope', 'VDH.util',
	 	function($scope,VDHUtil) {
			VDHUtil.prepareScope($scope);
			$scope.donate = function() {
				$scope.post('donate',{});
			}
			$scope.notAgain = function() {
				$scope.post('donate-later',{});
			}
			$scope.review = function() {
				$scope.post('review',{});
			}
	}]);

