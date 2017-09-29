
define("prefs", function(exports) {

const simplePrefs = require('sdk/simple-prefs');

var listeners = [];

simplePrefs.on("",function(prefKey) {
	var newValue = simplePrefs.prefs[prefKey];
	listeners.forEach(function(listener) {
		listener(prefKey,newValue);
	});
});

exports.prefs = function() {
	return simplePrefs.getAllPrefs();
}

exports.addListener = function(listener) {
	listeners.push(listener);
}

exports.removeListener = function(listener) {
	var index = listeners.indexOf(listener);
	if(index>=0)
		listeners.splice(index,1);
}

exports.set = function(newPrefs) {
	for(var prefName in newPrefs) {
		var prefValue = newPrefs[prefName];
		simplePrefs.prefs[prefName] = prefValue;
	}
}

});

