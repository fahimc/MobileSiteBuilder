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
	init : function(node) {
		var account = node.getAttribute('account');
		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', account]);
		_gaq.push(['_trackPageview']);

		var ga = document.createElement('script');
		ga.type = 'text/javascript';
		ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(ga, s);

	},
	click : function(id) {
		_gaq.push(['_trackEvent', id, 'clicked']);
	},
	pageChange : function(id) {
		_gaq.push(['_trackEvent', id, 'pageChange']);
	}
}; 