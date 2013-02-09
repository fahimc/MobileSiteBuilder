var Tracking = {
	type : null,
	init : function(tracking) {
		if (Tracking[Tracking.type])
			Tracking[Tracking.type].init(tracking);
	},
	click : function(id) {
		if (Tracking[Tracking.type])
			Tracking[Tracking.type].click(id);
	},
	pageChange : function(id) {
		if (Tracking[Tracking.type])
			Tracking[Tracking.type].pageChange(id);
	}
};
Tracking.google = {
	account : null,
	pageTracker : null,
	init : function(node) {
		Controller.onScriptLoad(('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js', Tracking.google.onScriptLoad, node);
	},
	onScriptLoad : function(node) {
		Tracking.google.account = node.getAttribute('account');
		Tracking.google.pageTracker = _gat._createTracker(Tracking.google.account);
		Tracking.google.pageTracker._initData();
		Tracking.google.pageTracker._trackPageview();
	},
	click : function(id) {
		Tracking.google.pageTracker._trackEvent('_trackEvent', id, 'clicked');
	},
	pageChange : function(id) {
		Tracking.google.pageTracker._trackEvent('_trackEvent', id, 'pageChange');
	}
};
