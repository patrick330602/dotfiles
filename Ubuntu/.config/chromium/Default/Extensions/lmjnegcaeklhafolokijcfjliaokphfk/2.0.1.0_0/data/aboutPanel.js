
angular.module('VDH').controller('VDHAboutCtrl', 
	['$scope', 'VDH.util',
	 	function($scope,VDHUtil) {
			VDHUtil.prepareScope($scope);
			$scope.goTo = function(where) {
				$scope.post('goto',{where:where});
			}
			$scope.versionType = function() {
				if(!$scope.addon)
					return 'unknown';
				if(/a/.test($scope.addon.version))
					return 'alpha';
				if(/b/.test($scope.addon.version))
					return 'beta';
				return 'release';
			}
	}]);

angular.module('VDH').directive('vdhLocaleCredits', 
		[ '$compile',
		  function factory($compile) {
		return {
			scope: true,
			replace: true,
		    link: function(scope,element,attrs) {
		    	element.addClass("vdh-locale-credits ng-hide");
		    	var lc = scope._('locale-credits','@@@');
		    	if(lc=='locale-credits')
		    		return;
		    	var lct = scope._('locale-credits-translators');
		    	if(lct=='locale-credits-translators')
		    		return;
		    	if(/^\s*!/.test(lct))
		    		return;
		    	var lctArr = lct.split(",");
		    	var lcu = scope._('locale-credits-urls');
		    	if(lcu=='locale-credits-urls')
		    		lcu = '';
		    	var lcuArr = lcu.split(",");
		    	scope.translators = {};
		    	var links = [];
		    	lctArr.forEach(function(t,index) {
		    		var name = /^\s*(.*?)\s*$/.exec(t)[1];
		    		if(!name)
		    			return;
		    		var url = lcuArr[index] || null;
		    		if(url && /^\s*https?:/.test(url)) {
		    			url = /^\s*(.*?)\s*$/.exec(url)[1];
		    			scope.translators[index] = url;
		    			links.push("<a ng-click='gotoTranslator("+index+")'>"+name+"</a>");
		    		} else
		    			links.push(name);
		    	});
		    	if(links.length==0)
		    		return;
		    	var templateFn = $compile("<div>"+lc.replace('@@@',links.join(", "))+"</div>");
		    	element.append(templateFn(scope));
		    	element.removeClass("ng-hide");
		    	scope.gotoTranslator = function(index) {
		    		scope.post("goto",{where:'url',url:scope.translators[index]});
		    	}
		    },
		}
	}]);
