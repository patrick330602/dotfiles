

if(typeof snInitialized == "undefined") {
	var snInitialized = true;
	
	chrome.extension.onRequest.addListener(function(message, sender, sendResponse) {
		if(message.type=="current-path") {
			var node = GetSelectedNode();
			sendResponse({
				type: "current-path",
				xpath: node?GenerateXPath(node):null,
				url: window.location.href,
			});			
		} else if(message.type=="text") {
			var text = null, valid = true;
			try {
				text = document.evaluate(message.xpath,document, null, XPathResult.STRING_TYPE, null).stringValue;
			} catch($_) {
				valid = false;
			}
			sendResponse({
				type: "text",
				text: text,
				valid: valid,
			});			
		}
	});

	function GenerateXPath(node) {
		var node0=node;
		var str="";
		while(node.parentNode!=null) {
			var str0="/";
	        if(node.nodeType==Node.TEXT_NODE) {
	            str0+="text()";
	        } else {
	            str0+=node.nodeName.toLowerCase();
			}
			var index=GetNodeChildIndex(node);
	        str0+="["+(index+1)+"]";
			str=str0+str;
			node=node.parentNode;
		}
		str=node.nodeName+str;
		if(str.substr(0,9)=="#document")
			str=str.substring(9);
		return str;
	}

	function GetSelectedNode() {
		var selection = window.getSelection();
		return selection.rangeCount > 0 ?
			selection.getRangeAt(0).startContainer.parentNode:null;
	}

	function GetNodeChildIndex(child) {
	    var i=0;
	    var parent=child.parentNode;
	    var node=parent.firstChild;
	    while(node!=null) {
	        if(node==child)
	            return i;
	        if(node.nodeName==child.nodeName && 
	        	(node.nodeType==Node.ELEMENT_NODE || node.nodeType==Node.TEXT_NODE))
	            i++;
	        node=node.nextSibling;
	    }
	    return -1;
	}
	
}


