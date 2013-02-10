var Model = {
	clickIndex:0,
	formIndex:0,
	id:{
		button:"button"
	},
	className:
	{
		socialHolder:"social-holder"
	},
	data : null,
	url : {
		site : "site.xml",
		map:'https://maps.google.co.uk/maps?q=',
		youtube:'http://www.youtube.com/embed/',
		email:'http://fahimchowdhury.com/services/mail/mailto.php?t=[t]&f=[f]&s=[s]&b=[b]&i=[i]'
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
};
