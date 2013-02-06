var Model = {
	data : null,
	url : {
		site : "site.xml",
		map:'https://maps.google.co.uk/maps?q=',
		youtube:'http://www.youtube.com/embed/'
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
	}
}
