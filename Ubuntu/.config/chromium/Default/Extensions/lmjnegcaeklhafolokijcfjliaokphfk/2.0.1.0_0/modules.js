
(function($this) {

	var modules = {}

	function FixModuleName(moduleName) {
		if(moduleName[0]=="." && moduleName[1]=="/")
			return moduleName.substr(2);
		else
			return moduleName;
	}
	
	$this.define = function(moduleName,moduleDef) {
		moduleName = FixModuleName(moduleName);
		moduleDef(modules[moduleName] || (modules[moduleName] = {}));
	}
	
	$this.require = function(moduleName) {
		moduleName = FixModuleName(moduleName);
		return modules[moduleName] || (modules[moduleName] = {});
	}
	
})(this);



