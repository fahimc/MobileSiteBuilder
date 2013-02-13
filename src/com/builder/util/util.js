var Util = {
	addMeta : function() {
		var viewPortTag = document.createElement('meta');
		viewPortTag.id = "viewport";
		viewPortTag.name = "viewport";
		viewPortTag.content = "width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;";
		document.getElementsByTagName('head')[0].appendChild(viewPortTag);
	},
	StringtoXML : function(text) {
		if (window.ActiveXObject) {
			var doc = new ActiveXObject('Microsoft.XMLDOM');
			doc.async = 'false';
			doc.loadXML(text);
		} else {
			var parser = new DOMParser();
			var doc = parser.parseFromString(text, 'text/xml');
		}
		return doc;
	}
};
