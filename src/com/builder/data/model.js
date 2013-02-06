var Model = {
	data : null,
	url : {
		site : "site.xml"
	},
	addHandler : function(root, name) {
		if (!root.handler)
			root.handler = {};
		root.handler[name] = function(event) {
			root[name](event);
		}
	},
	removeHandler : function(root, name) {
		if (!root.handler)
			return;
		delete root.handler[name];
	},
	StringToXML : function(oString) {
		//code for IE
		if (window.ActiveXObject) {
			var oXML = new ActiveXObject("Microsoft.XMLDOM");
			oXML.loadXML(oString);
			return oXML;
		}
		// code for Chrome, Safari, Firefox, Opera, etc.
		else {
			return (new DOMParser()).parseFromString(oString, "text/xml");
		}
	}
}
