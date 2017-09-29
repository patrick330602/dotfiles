define("blacklist",function(exports) {


const simpleStorage = require("sdk/simple-storage");
const simplePrefs = require("sdk/simple-prefs");
const ga = require("ga"); 

const IP_RE = new RegExp("^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");

function DomainsFromUrl(url) {
	var domains = [];
	var domain = /^https?:\/\/([^\/:]+)/.exec(url);
	if(domain) {
		if(IP_RE.test(domain[1]))
			domains.push(domain[1]);
		else {
			var parts = domain[1].split(".");
			while(parts.length>1 && (parts[0]!="co" || parts.length>2)) {
				domains.push(parts.join("."));
				parts.shift();
			}
		}
	}
	return domains;
}

function DomainsMapFromHit(hit) {
	var domains = [];
	if(hit.url)
		domains = domains.concat(DomainsFromUrl(hit.url));
	if(hit.audioUrl)
		domains = domains.concat(DomainsFromUrl(hit.audioUrl));
	if(hit.videoUrl)
		domains = domains.concat(DomainsFromUrl(hit.videoUrl));
	if(hit.topUrl)
		domains = domains.concat(DomainsFromUrl(hit.topUrl));
	if(hit.pageUrl)
		domains = domains.concat(DomainsFromUrl(hit.pageUrl));
	var domainsMap = {};
	domains.forEach(function(domain) {
		domainsMap[domain] = 1;
	});
	return domainsMap;
}

function DomainsFromMap(domainsMap) {
	var domains = Object.keys(domainsMap);
	domains.sort(function(a,b) {
		var segsa = a.split(".").reverse();
		var segsb = b.split(".").reverse();
		while(1) {
			if(segsa.length && !segsb.length)
				return -1;
			else if(!segsa.length && segsb.length)
				return 1;
			else if(!segsa.length && !segsb.length)
				return 0;
			var sega = segsa.shift();
			var segb = segsb.shift();
			if(sega != segb) {
				if(sega < segb)
					return -1;
				else
					return 1;
			}
		}
	});
	return domains;	
}

exports.domainsFromHit = function(hit) {
	var domainsMap = DomainsMapFromHit(hit);
	return DomainsFromMap(domainsMap);	
}

function EnsuresData() {
	if(!simpleStorage.storage.blacklist) {
		simpleStorage.storage.blacklist = {};
		simpleStorage.storage.sync = "blacklist";
	}
}

exports.getAllDomains = function() {
	EnsuresData();
	return DomainsFromMap(simpleStorage.storage.blacklist);	
}

exports.updateDomains = function(domains) {
	EnsuresData();
	var domainsMap = {};
	domains.forEach(function(domain) {
		domainsMap[domain] = 1;
		if(!simpleStorage.storage.blacklist[domain])
			simpleStorage.storage.blacklist[domain] = true;
	});
	for(var domain in simpleStorage.storage.blacklist)
		if(!domainsMap[domain])
			delete simpleStorage.storage.blacklist[domain];
	simpleStorage.storage.sync = "blacklist";
}

exports.addToBlacklist = function(domains) {
	EnsuresData();
	for(var domain in domains)
		if(domains[domain]) {
			simpleStorage.storage.blacklist[domain] = true;
			ga.blacklistAdded(domain);
		}
	simpleStorage.storage.sync = "blacklist";
}

exports.checkHitBlacklisted = function(hit) {
	if(!simplePrefs.prefs['blacklist-enable'])
		return false;
	EnsuresData();
	var domainsMap = DomainsMapFromHit(hit);
	for(var domain in domainsMap)
		if(simpleStorage.storage.blacklist[domain])
			return true;
	return false;
}


});