var View=
{
	defaultHtml:'<div id="wrapper"><div id="spider-content"></div></div>',
	init:function()
	{
		document.body.innerHTML = this.defaultHtml;
		var content = document.getElementById(Spider.data.id.content);
		var settings = Model.data.getElementsByTagName("settings");
		for (var i = 0; i < settings[0].childNodes.length; i++) {
				var child = settings[0].childNodes[i];
			   if(child.nodeName)
			   {
			   	 switch(child.nodeName)
			   	 {
			   	 	case "content":
			   	 	if(child.getAttribute('swipe') && child.getAttribute('swipe')=="true")content.setAttribute('swipe','true');
			   	 	break;
			   	 }
			   }
		}
		this.buildViews();
	},
	buildViews:function()
	{
		var content = document.getElementById(Spider.data.id.content);
		var views = Model.data.getElementsByTagName("view");
		for (var i = 0; i < views.length; i++) {  
			var child = views[i]; 
			if(child.nodeName)this.createView(child,content);
		}
	},
	createView:function(node,content)
	{
		
		var view = document.createElement('div');
		view.className = node.getAttribute('classname');
		for (var i = 0; i < node.childNodes.length; i++) {   
			if(node.childNodes[i].nodeName!="#text")
			{
				var name = node.childNodes[i].nodeName;
					if(Module[name])
					{
						var mod = Module[name](node.childNodes[i],view);
						if(mod)view.appendChild(mod);
					}
			}
		}
		content.appendChild(view);
	}
}
