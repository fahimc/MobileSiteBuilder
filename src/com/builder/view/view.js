var View=
{
	defaultHtml:'<div id="wrapper"><div id="spider-content" swipe="true"><div></div></div></div>',
	init:function()
	{
		document.body.innerHTML = this.defaultHtml;
		this.buildViews();
	},
	buildViews:function()
	{
		var views = Model.data.getElementsByTagName("view");
		for (var i = 0; i < views.length; i++) {   
			this.createView(views[i]);
		}
	},
	createView:function(node)
	{
		
		
		for (var i = 0; i < node.childNodes.length; i++) {   
			if(node.childNodes[i].nodeValue)
			{
				
			}
		}
	}
}
