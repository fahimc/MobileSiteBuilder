var Model = {
	data:null,
	url : {
		site : "site.xml"
	},
	addHandler : function(root,name) {
		if(!root.handler)root.handler={};
			root.handler[name] = function(event) {
				root[name](event);
			}
	},
	removeHandler:function(root,name)
	{
		if(!root.handler)return;
		delete root.handler[name];
	}
}
