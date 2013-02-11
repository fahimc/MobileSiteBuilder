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
			   	 	case "title":
			   	 	 document.title = child.getAttribute('text');
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
		var holder = document.createElement('div');
		holder.style.width="100%";
		holder.style.height="100%";
		Style.pageHolder(holder);
		var page= document.createElement('div');
		if(node.getAttribute('scrollable'))
		{
			page.setAttribute('scrollable','true');			
		}else{
			page.style.height = "inherit";
		}
		page.style.width = "inherit";
		
		view.className = node.getAttribute('classname')? node.getAttribute('classname'):Style.className.view;
		for (var i = 0; i < node.childNodes.length; i++) {   
			if(node.childNodes[i].nodeName!="#text")
			{
				var name = node.childNodes[i].nodeName;
					if(Module[name])
					{
						var mod = Module[name](node.childNodes[i],page);
						if(mod)page.appendChild(mod);
					}
			}
		}
		holder.appendChild(page);
		view.appendChild(holder);
		content.appendChild(view);
	},
	navigateTo:function(index)
	{
		Spider.navigateTo(index);
	}
};
