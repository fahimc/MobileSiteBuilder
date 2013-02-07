var Deeplink=
{
	init:function()
	{
		if(location.hash)
		{
			var  hash = location.hash.replace("#",'');
			if(Number(hash))
			{
				View.navigateTo(hash);
			}else{
				
			}
		}
	},
	update:function(index)
	{
		var views = Model.data.getElementsByTagName("view");
		if(views[index])
		{
			var name = views[index].getAttribute('pagename')?views[index].getAttribute('pagename'):index;
			location.hash =name;			
		}
	}
}
