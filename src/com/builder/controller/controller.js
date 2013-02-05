var Controller=
{
	init:function()
	{
		
		
		this.loadData();
		
	},
	loadData:function()
	{
		
		Model.addHandler(this,"dataLoaded");
		Utensil.URLLoader.load(Model.url.site,this.dataLoaded);
	},
	dataLoaded:function(t,x)
	{
		Model.data = x;
		View.init();
		Spider.init();
		Model.addHandler(this,"ready");
		Event.addListener(Spider, Spider.event.COMPLETE, this.handler.ready);
	},
	ready:function()
	{
		
		Event.removeListener(Spider, Spider.event.COMPLETE, this.handler.ready);
		Model.removeHandler(this,"ready");
	}
	
}
