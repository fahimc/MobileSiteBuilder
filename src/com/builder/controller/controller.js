var Controller=
{
	timestamp:null,
	init:function()
	{
		Util.addMeta();
		this.timestamp=new Date().getTime();
		this.loadData();
		
	},
	loadData:function()
	{
		
		Model.addHandler(this,"dataLoaded");
		Utensil.URLLoader.load(Model.url.site+"?ts="+this.timestamp,this.dataLoaded);
	},
	dataLoaded:function(t,x)
	{
		Model.data = x;
		Style.addDefault();
		View.init();
		Spider.init();
		Model.addHandler(this,"ready");
		Event.addListener(Spider, Spider.event.COMPLETE, Controller.ready);
	},
	ready:function()
	{
		
		Event.removeListener(Spider, Spider.event.COMPLETE, Controller.ready);
		Model.removeHandler(this,"ready");
	}
	
}
