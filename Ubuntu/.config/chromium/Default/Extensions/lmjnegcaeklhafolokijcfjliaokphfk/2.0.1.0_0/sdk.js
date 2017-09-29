

define("sdk/core/heritage",function(exports) {
	
	exports.Class = function(methods) {  
	    var parent,
	        klass = function() { 
	          this.initialize.apply(this, arguments); 
	        },
	        extend = function(destination, source) {   
	          for (var property in source) {
	            destination[property] = source[property];
	          }
	          return destination;
	    };

	    if(methods["extends"]!==undefined)
	    	parent = methods["extends"];

	    if (parent !== undefined) {       
	       extend(klass.prototype, parent.prototype);       
	       klass.prototype.$parent = parent.prototype;
	    }
	    extend(klass.prototype, methods);  
	    klass.prototype.constructor = klass;      
	   
	    if (!klass.prototype.initialize) klass.prototype.initialize = function(){};         
	   
	    return klass;   
	};
	
});


define("sdk/util/object",function(exports) {

	exports.merge = function(source) {
		for(var i=1; i<arguments.length; i++)
			for(var f in arguments[i])
				if(arguments[i].hasOwnProperty(f) && arguments[i][f]!==null && arguments[i][f]!==undefined)
					source[f] = arguments[i][f];
		return source;
	}
	
});


define("sdk/l10n",function(exports) {

	exports.get = function() {
		if(arguments.length==0 || !arguments[0])
			return '';
		var str = chrome.i18n.getMessage(arguments[0].replace(/\-|\./g,'_'));
		var args = arguments;
		var argIndex = 1;
		str = str.replace(/%([1-9][0-9]*)?s/g,function(match,index) {
			if(index)
				return args[parseInt(index)];
			else
				return args[argIndex++];
		});
		return str;
	}
	
});


define("sdk/simple-prefs",function(exports) {
	const defPrefs = require("default-prefs");
	var storedPrefs = localStorage.getItem("prefs");
	var _prefs = {};
	if(storedPrefs)
		try {
			_prefs = JSON.parse(storedPrefs);
		} catch(e) {}
	exports.prefs = {};
	for(var p in defPrefs.prefs) {
		_prefs[p] = _prefs[p]===undefined ? defPrefs.prefs[p] : _prefs[p];
		(function(p) {
			Object.defineProperty(exports.prefs, p, {
				set: function(val) {
					var oldVal = _prefs[p];
					if(oldVal===val)
						return;
					_prefs[p] = val;
					localStorage.setItem("prefs",JSON.stringify(_prefs));
					NotifyListeners(p);
				},
				get: function() {
					return _prefs[p]!==undefined ? _prefs[p] : null;
				}
			});
		})(p);
	}
	localStorage.setItem("prefs",JSON.stringify(_prefs));
	
	exports.getAllPrefs = function() {
		return _prefs;
	}
	exports.setAllPrefs = function(prefs) {
		for(var p in prefs)
			exports.prefs[p] = prefs[p];
	}
	
	var listeners = [];
	
	function NotifyListeners(prefName) {
		listeners.forEach(function(listener) {
			if(prefName.substr(0,listener.prefix.length)==listener.prefix) {
				listener.callback(prefName);
			}
		});
	}

	exports.on = function(prefix,callback) {
		listeners.push({
			prefix: prefix,
			callback: callback,
		});
	}
	
	exports.off = function(prefix,callback) {
		for(var i=listeners.length-1;i>=0;i++) {
			var listener = listeners[i];
			if(listener.prefix==prefix && (!callback || callback==callback))
				listener.splice(i,1);
		}
	}
});

define("sdk/tabs",function(exports) {

	exports.open = function(options) {

		chrome.tabs.create({
			url: options.url,
			active: true,
		});

	}
	
});


define("sdk/timers",function(exports) {

	exports.setTimeout = function(callback,timeout) {
		return setTimeout(callback,timeout || 0);
	}
	exports.clearTimeout = function(timer) {
		clearTimeout(timer);
	}
	exports.setInterval = function(callback,timeout) {
		return setInterval(callback,timeout || 1000);
	}
	
});

define("sdk/simple-storage",function(exports) {

	var knownStores = {};
	try {
		knownStores = JSON.parse(localStorage.getItem("knownStores") || "{}");
	} catch(e) {}

	exports.storage = {}

	for(var f in knownStores)
		try {
			exports.storage[f] = JSON.parse(localStorage.getItem(f));
		} catch(e) {}

	function Save(store) {
		if(exports.storage[store]===undefined) {
			localStorage.removeItem(store);
			if(knownStores[store]) {
				delete knownStores[store];
				localStorage.setItem("knownStores",JSON.stringify(knownStores));
			}
		} else {
			localStorage.setItem(store,JSON.stringify(exports.storage[store]));
			if(!knownStores[store]) {
				knownStores[store] = true;
				localStorage.setItem("knownStores",JSON.stringify(knownStores));
			}
		}
	}
	
	Object.defineProperty(exports.storage, "sync", {
		set: function(store) {
			if(store)
				Save(store);
			else
				for(var f in exports.storage)
					if(f!="sync")
						Save(f);
		},
	});
	
});

define("sdk/request",function(exports) {
	exports.Request = function(options) {
		return {
			get: function() {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", options.url, true);
				xhr.onreadystatechange = function() {
				  if (xhr.readyState == 4) {
					  var response = {
						text:  xhr.responseText,							  
					  }
					  try {
						  var json = JSON.parse(xhr.responseText);
						  response.json = json;
					  } catch($_) {}
					  (options.onComplete || function(){} )(response);
				  }
				}
				xhr.send();				
			}
		}
	}
});
