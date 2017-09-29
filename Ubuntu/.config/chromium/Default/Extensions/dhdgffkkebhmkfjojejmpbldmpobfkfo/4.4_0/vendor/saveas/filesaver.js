/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.3.2
 * 2016-06-16 18:25:19
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

'use strict';var saveAs=saveAs||function(b){if(!("undefined"===typeof b||"undefined"!==typeof navigator&&/MSIE [1-9]\./.test(navigator.userAgent))){var g=b.document.createElementNS("http://www.w3.org/1999/xhtml","a"),p="download"in g,q=/constructor/i.test(b.HTMLElement),l=/CriOS\/[\d]+/.test(navigator.userAgent),r=function(a){(b.setImmediate||b.setTimeout)(function(){throw a;},0)},m=function(a){setTimeout(function(){"string"===typeof a?(b.URL||b.webkitURL||b).revokeObjectURL(a):a.remove()},4E4)},
n=function(a){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob([String.fromCharCode(65279),a],{type:a.type}):a},f=function(a,c,h){h||(a=n(a));var d=this,f="application/octet-stream"===a.type,e,k=function(){for(var a=["writestart","progress","write","writeend"],a=[].concat(a),b=a.length;b--;){var c=d["on"+a[b]];if("function"===typeof c)try{c.call(d,d)}catch(e){r(e)}}};h=function(){if((l||f&&q)&&b.FileReader){var c=new FileReader;c.onloadend=function(){var a=
l?c.result:c.result.replace(/^data:[^;]*;/,"data:attachment/file;");b.open(a,"_blank")||(b.location.href=a);d.readyState=d.DONE;k()};c.readAsDataURL(a);d.readyState=d.INIT}else e||(e=(b.URL||b.webkitURL||b).createObjectURL(a)),f?b.location.href=e:b.open(e,"_blank")||(b.location.href=e),d.readyState=d.DONE,k(),m(e)};d.readyState=d.INIT;p?(e=(b.URL||b.webkitURL||b).createObjectURL(a),setTimeout(function(){g.href=e;g.download=c;var a=new MouseEvent("click");g.dispatchEvent(a);k();m(e);d.readyState=d.DONE})):
h()},c=f.prototype;if("undefined"!==typeof navigator&&navigator.msSaveOrOpenBlob)return function(a,b,c){b=b||a.name||"download";c||(a=n(a));return navigator.msSaveOrOpenBlob(a,b)};c.abort=function(){};c.readyState=c.INIT=0;c.WRITING=1;c.DONE=2;c.error=c.onwritestart=c.onprogress=c.onwrite=c.onabort=c.onerror=c.onwriteend=null;return function(a,b,c){return new f(a,b||a.name||"download",c)}}}("undefined"!==typeof self&&self||"undefined"!==typeof window&&window||this.content);
"undefined"!==typeof module&&module.exports?module.exports.saveAs=saveAs:"undefined"!==typeof define&&null!==define&&null!==define.amd&&define([],function(){return saveAs});
