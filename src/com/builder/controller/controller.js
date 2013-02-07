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
		Controller.checkTracking();
		Style.addDefault();
		View.init();
		Spider.init();
		Model.addHandler(this,"ready");
		Event.addListener(Spider, Spider.event.COMPLETE, Controller.ready);
		Spider.event.addListener(Spider.event.type.onPageChange, Spider.event.type.onPageChange, Controller.onPageChange);
		Deeplink.init();
	},
	ready:function()
	{
		
		Event.removeListener(Spider, Spider.event.COMPLETE, Controller.ready);
		Model.removeHandler(this,"ready");
		
	},
	checkTracking:function()
	{
		var tracking = Model.data.getElementsByTagName("tracking");
		if(tracking)
		{
			tracking=tracking[0];
			Tracking.type =  tracking.getAttribute('type');
			Tracking.init(tracking);
			
		}
		
	},
	onPageChange:function(index)
	{
		Deeplink.update(index);
	}
	
}
