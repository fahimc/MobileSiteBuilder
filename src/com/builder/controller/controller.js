var Controller = {
	timestamp : null,
	init : function() {
		Util.addMeta();
		this.timestamp = new Date().getTime();
		this.loadData();
		Utensil.addListener(window, 'hashchange', Deeplink.backCheck);
	},
	loadData : function() {

		Model.addHandler(this, "dataLoaded");
		Utensil.URLLoader.load(Model.url.site + "?ts=" + this.timestamp, this.dataLoaded);
	},
	dataLoaded : function(t, x) {
		Model.data = x;
		Controller.checkTracking();
		Style.addDefault();
		View.init();
		Spider.init();
		Model.addHandler(this, "ready");
		Event.addListener(Spider, Spider.event.COMPLETE, Controller.ready);
		Spider.event.addListener(Spider.event.type.onPageChange, Spider.event.type.onPageChange, Controller.onPageChange);
		Deeplink.init();
	},
	ready : function() {

		Event.removeListener(Spider, Spider.event.COMPLETE, Controller.ready);
		Model.removeHandler(this, "ready");

	},
	checkTracking : function() {
		var tracking = Model.data.getElementsByTagName("tracking");
		if (tracking) {
			tracking = tracking[0];
			Tracking.type = tracking.getAttribute('type');
			Tracking.init(tracking);

		}

	},
	checkFB : function() {

	},
	onPageChange : function(index) {
		Deeplink.update(index);
		var view = Model.data.getElementsByTagName("view")[parseInt(index)];
		var id = view.getAttribute('pagename') ? view.getAttribute('pagename') : index;
		Tracking.pageChange(id);
	},
	onGalleryClick : function(obj, event) {
		var element = event.srcElement || event.target;

		var parent;
		if (element.tagName != "P") {
			parent = element.parentNode;
		} else {
			parent = element.parentNode.parentNode;
			element = element.parentNode;
		}
		var ul;
		for (var a = 0; a < parent.childNodes.length; a++) {
			var child = parent.childNodes[a];
			if (child.getAttribute && child.getAttribute(Spider.data.att.swipeName)) {
				ul = child;
				a = parent.childNodes.length;
			}
		}
		var index = ul.getAttribute(Spider.data.att.swipeIndex);
		if (!index) {
			(element.className == Style.className.carouselLeftButton) ? index = 1 : index = 0;
			ul.setAttribute(Spider.data.att.swipeIndex, index);
			ul.style.position = "absolute";
			ul.parentNode.style.position = "relative";
		}
		index = parseInt(index);
		if (element.className == Style.className.carouselLeftButton) {
			index = parseInt(index);
			index--;
			if (index < 0)
				index = 0;
		} else {

			if ((parseInt(index + 1) * ul.parentNode.clientWidth) >= ul.clientWidth - ul.parentNode.clientWidth) {

			} else {
				index++;
			}
		}
		Spider.controller.slideModule(ul, index);
	},
	autoGallery : function(ul) {
		var index = ul.getAttribute(Spider.data.att.swipeIndex);
		if (index == null) {
			index = 0;
			ul.setAttribute(Spider.data.att.swipeIndex, index);
			ul.style.position = "absolute";
			ul.parentNode.style.position = "relative";
		}
		index = parseInt(index);
		var back = false;
		if ((parseInt(index + 1) * ul.parentNode.clientWidth) > ul.clientWidth - ul.parentNode.clientWidth) {
			ul.setAttribute("backward", "true");
			back = true;
		}

		if (parseInt(index - 1) < 0) {
			back = false;
			ul.setAttribute("backward", "false");
		}
		if (ul.getAttribute("backward") && ul.getAttribute("backward") == "true")
			back = true;

		if (back) {
			index--;
		} else {

			index++;
		}

		Spider.controller.slideModule(ul, index, 0.5, Controller.autoGallery, 3);
		delete ul;
	},
	onScriptLoad : function(src,callback,arg) {
		var complete = false;
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.onload = script.onreadystatechange = function() {
			if (!complete && (!this.readyState || this.readyState === 'complete' || (this.readyState === 'loaded' && this.nextSibling != null))) {
				//console.log('loaded via all');
				complete = true;
				if (callback)
					callback(arg);
				//remove listeners
				script.onload = script.onreadystatechange = null;
			} else if (this.readyState === 'loaded' && this.nextSibling == null) {
				//console.log('error via ie');
			}
			script.onerror = function() {
				//console.log('error via everything else');
			}
		}
		script.src= src;
		document.getElementsByTagName('head')[0].appendChild(script);
	}
};
