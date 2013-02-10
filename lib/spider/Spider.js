var Spider = {
	init : function() {
		this.style.resetStyles();
		this.element.create(Spider.data.id.UIOverlay, document.body);
		this.element.create(Spider.data.id.scroller, document.body);
		this.style.setOverlay();
		this.style.applyStyles();
		this.initSplash();

		if (window.console === undefined) {
			window.console = {
				log : function(value) {
					Spider.toast(String(value));
				}
			};
		}
		if (window.addEventListener) {
			window.addEventListener("resize", Spider.resize);
			window.addEventListener("orientationchange", Spider.resize);
		} else {
			window.attachEvent("onresize", Spider.resize);
		}

		Spider.event.mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel"//FF doesn't recognize mousewheel as of FF3.x

		Utensil.addListener(document, Spider.event.mousewheelevt, Spider.event.onScrollWheel);
	},
	initSplash : function() {
		var splash = document.getElementById(Spider.data.id.splash);
		if (!splash) {
			Spider.element.setPage(0);
			Spider.element.setScrollers();
			Spider.element.setSwipes();
			this.splashComplete();
		} else {
			TweenLite.to(splash, 0.1, {
				css : {
					alpha : 0
				},
				onComplete : Spider.splashReady
			});
		}

	},
	splashReady : function() {
		var splash = document.getElementById(Spider.data.id.splash);
		splash.style.visibility = "visible";
		TweenLite.to(splash, 0.5, {
			css : {
				alpha : 1
			},
			onComplete : Spider.splashShown
		});
	},
	splashShown : function() {

		var content = document.getElementById(Spider.data.id.content);
		var header = document.getElementById(Spider.data.id.header);
		var footer = document.getElementById(Spider.data.id.footer);

		content.style.visibility = "visible";
		if (header)
			header.style.visibility = "visible";
		if (footer)
			footer.style.visibility = "visible";
		Spider.element.setPage(0);
		Spider.element.setScrollers();
		Spider.element.setSwipes();
		TweenLite.to(splash, 0.5, {
			delay : Spider.data.splash.duration,
			css : {
				alpha : 0
			},
			onComplete : Spider.splashComplete
		});
	},
	splashComplete : function() {
		var content = document.getElementById(Spider.data.id.content);
		Spider.element.setOpacity(content, 1);
		var splash = document.getElementById(Spider.data.id.splash);
		if (splash) {
			splash.style.display = "none";
		}
		Spider.controller.init();
		Event.dispatch(Spider, Spider.event.COMPLETE);

	},
	toast : function(str) {
		var toast = Spider.element.createToast(str);
		var toastHandler = function() {
			var destroy = function() {
				document.body.removeChild(toast);
				delete toast;
			}
			TweenLite.to(toast, 0.5, {
				delay : Spider.data.toastDuration,
				css : {
					alpha : 0
				},
				onComplete : destroy
			});
		}
		TweenLite.to(toast, 0.5, {
			css : {
				alpha : 0.8
			},
			onComplete : toastHandler
		});
	},
	updateScrollers : function() {
		Spider.element.setScrollers();
	},
	navigateTo : function(index) {
		var content = document.getElementById(Spider.data.id.content);

		var x = -(Utensil.stageWidth() * index);
		Spider.controller.currentIndex = index;
		TweenLite.to(content, 0.5, {
			css : {
				left : x + "px"
			},
			onComplete : Spider.controller.handler.onPageChange
		});
	},
	resize : function() {

		//Spider.toast("resize");
		Spider.style.applyStyles();
		var content = document.getElementById(Spider.data.id.content);
		var x = -(Utensil.stageWidth() * Spider.controller.currentIndex);
		TweenLite.to(content, 0.5, {
			css : {
				left : x + "px"
			},
			onComplete : Spider.controller.handler.onPageChange
		});
		Spider.element.setScrollers();
	}
};
Spider.event = {
	COMPLETE : "SPIDER_COMPLETE",
	mousewheelevt : null,
	mouseWheelMovement : 50,
	type : {
		click : 'click',
		onPageChange : 'onPageChange',
		drag : 'drag',
		mouseup : 'mouseup'
	},
	callback : [],
	addListener : function(id, eventName, callback) {
		if (!Spider.event.callback[eventName])
			Spider.event.callback[eventName] = [];
		Spider.event.callback[eventName][id] = callback;
	},
	removeListener : function(id, eventName, callback) {
		if (Spider.event.callback[eventName] && Spider.event.callback[eventName][id]) {
			delete Spider.event.callback[eventName][id];
		}
	},
	onScrollWheel : function(event) {
		var delta = 0;

		if (!event)
			event = window.event;
		if (event.wheelDelta) {
			delta = event.wheelDelta / 60;
		} else if (event.detail) {
			delta = -event.detail / 2;
		}

		Spider.event.moveScroller(-(delta * Spider.event.mouseWheelMovement));
	},
	moveScroller : function(y) {
		var item = {};
		item.type = gesture.TYPE_VERTICAL;
		item.y = y;
		item.target = event.srcElement || event.target;
		if (!item.target.getAttribute)
			item.target = item.target.parentNode;
		item.lat = 0;
		Spider.controller.gestureScroll(item);
	}
};
/*
 * store/retrieve element in the spider class
 */
Spider.element = {
	create : function(id, parent, type) {
		var elem = document.createElement( type ? type : 'div');
		elem.id = id;
		parent.appendChild(elem);
	},
	createToast : function(str) {
		var toast = document.createElement('div');
		var p = document.createElement('p');
		p.innerHTML = str;
		toast.appendChild(p);
		Spider.style.setToast(toast, p);
		document.body.appendChild(toast);
		return toast;
	},
	setPage : function(index) {
		var page = Spider.element.getPage(index);
		// if (Utensil.stageHeight() < page.clientHeight) {
		// var scroller =  document.getElementById(Spider.data.id.scroller);
		// scroller.style.height = (((Utensil.stageHeight()-Spider.data.headerHeight-Spider.data.footerHeight)/page.clientHeight) * (Utensil.stageHeight()-Spider.data.headerHeight-Spider.data.footerHeight))+"px";
		// var y = page.style.top.replace("px","");
		// if(y=="")y=0;
		// scroller.style.top = (-((Utensil.stageHeight()/page.clientHeight) * Number(y))+Spider.data.headerHeight) + "px";
		// scroller.style.display = "block";
		// }
	},
	getPage : function(index) {
		var content = document.getElementById(Spider.data.id.content);
		for (var a = 0; a < content.childNodes.length; a++) {
			var child = content.childNodes[a];

			if (child.getAttribute && child.getAttribute("index") != null && child.getAttribute("index") == String(index)) {
				return child;
			}
		}
	},
	getX : function(elem) {

		if (elem && elem.style.left != undefined) {
			return elem.style.left.replace("px", "");
		} else {
			return 0;
		}
	},
	getY : function(elem) {

		if (elem && elem.style.top != "") {
			return elem.style.top.replace("px", "");
		} else {
			return 0;
		}
	},
	setScrollers : function() {
		var nodes = this.getAllElementsWithAttribute(Spider.data.att.scrollable);
		for (var a = 0; a < nodes.length; a++) {
			var holder = nodes[a].parentNode;
			var content = nodes[a];
			content.style.top="0";
			if (content.getAttribute(Spider.data.att.scrollerIndex) == null) {
				
				content.setAttribute(Spider.data.att.scrollerIndex, Spider.data.scroller.index);
				Spider.style.setScrollContent(content);
				Spider.style.setScrollHolder(holder);
				Spider.element.addScroller(holder, content);
				Spider.data.scroller.index++;
			}
			Spider.element.allDescendants(holder, content.getAttribute(Spider.data.att.scrollerIndex), Spider.data.att.scrollParent);
			//if(content.getAttribute(Spider.data.att.scrollerIndex))
			Spider.element.setScrollbarHeight(holder, content);
		}

	},
	setSwipes : function() {
		var nodes = this.getAllElementsWithAttribute(Spider.data.att.swipe);
		var a = 0;
		for ( a = 0; a < nodes.length; a++) {
			if (nodes[a].id && nodes[a].id == Spider.data.id.content) {
			} else {
				var holder = nodes[a];
				holder.setAttribute(Spider.data.att.swipeName, Spider.data.id.swipe + Spider.data.swipe.index);
				this.allDescendants(holder, Spider.data.id.swipe + Spider.data.swipe.index);
				Spider.data.swipe.index++;
			}

		}
	},
	allDescendants : function(node, id, name) {
		for (var i = 0; i < node.childNodes.length; i++) {
			var child = node.childNodes[i];
			if (child.setAttribute)
				child.setAttribute(name != null ? name : Spider.data.att.swipeParent, id);
			this.allDescendants(child, id, name);
		}
	},
	getAllElementsWithAttribute : function(attribute, name) {
		var matchingElements = [];
		var allElements = document.getElementsByTagName('*');
		for (var i = 0; i < allElements.length; i++) {
			if (allElements[i].getAttribute(attribute) != null) {
				if (name != null && allElements[i].getAttribute(attribute) == name)
					return allElements[i];
				// Element exists with attribute. Add to array.
				matchingElements.push(allElements[i]);
			}
		}
		return matchingElements;
	},
	addScroller : function(holder) {
		var scroller = document.createElement('div');
		scroller.id = "scroller-" + Spider.data.scroller.index;
		scroller.className = Spider.data.className.scroller ? Spider.data.className.scroller : "";
		Spider.style.setScroller(scroller);
		holder.appendChild(scroller);
	},
	addScrollHolder : function(content) {
		var parent = content.parentNode;
		var holder = document.createElement('div');
		Spider.style.setScrollHolder(holder);
		parent.removeChild(content)
		parent.appendChild(holder);
		holder.appendChild(content);
		return holder;
	},
	setScrollbarHeight : function(holder, content) {
		var scroller = document.getElementById(Spider.data.id.scroller + content.getAttribute(Spider.data.att.scrollerIndex));

		if (holder.clientHeight < content.clientHeight) {
			scroller.style.display = "block";
			var ratio = holder.clientHeight / content.clientHeight;
			var newh = (ratio * holder.clientHeight);

			if (newh < 10)
				newh = 10;
			scroller.style.height = newh + "px";

		} else {
			scroller.style.display = "none";
		}
	},
	setOpacity : function(elem, val) {
		elem.style['-ms-filter'] = "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + (val * 100) + ")";
		elem.style['filter'] = "alpha(opacity=" + (val * 100) + ")";
		elem.style['-moz-opacity'] = val;
		elem.style['-khtml-opacity'] = val;
		elem.style['opacity'] = val;
	},
	getDragFiller : function(holder) {
		for (var a = 0; a < holder.childNodes.length; a++) {
			var child = holder.childNodes[a];
			if (child && child.getAttribute && child.getAttribute(Spider.data.att.dragFiller)) {
				return child;
			}
		}
		return null;
	}
};
/*
 * stores data values
 */
Spider.data = {
	headerPecent : 0.1,
	footerPecent : 0.05,
	headerHeight : 0,
	footerHeight : 0,
	toastDuration : 1,
	swipeDuration : 0.1,
	ready : false,
	isTablet : (/ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(navigator.userAgent.toLowerCase())),
	att : {
		scrollable : "scrollable",
		scrollerIndex : "scroller-index",
		swipe : "swipe",
		swipeIndex : "swipe-index",
		swipeParent : "swipe-parent",
		scrollParent : "scroll-parent",
		swipeName : "swipe-name",
		navigate : "navigate",
		draggable : "draggable",
		dragFiller : 'drag-filler',
		dragPercent : "drag-percent",
		legend : "legend",
		autoswipe : "autoswipe",
	},
	id : {
		content : "spider-content",
		wrapper : "wrapper",
		splash : "splash",
		UIOverlay : "UIOverlay",
		resetStyle : "resetStyle",
		scroller : "ui-scroller",
		footer : "footer",
		header : "header",
		scroller : "scroller-",
		swipe : "swipe-"
	},
	className : {
		scroller : null
	},
	html : {
		resetCSS : "html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video { margin: 0; padding: 0; border: 0; font-size: 100%; font: inherit; vertical-align: baseline; } /* HTML5 display-role reset for older browsers */ article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section { display: block; } body { line-height: 1; } ol, ul { list-style: none; } blockquote, q { quotes: none; } blockquote:before, blockquote:after, q:before, q:after { content: ''; content: none; } table { border-collapse: collapse; border-spacing: 0; } html,body{width:100%;height:100%;overflow:hidden;} body{font-family: Arial, Helvetica, sans-serif;zoom:1;} .leftFloat{float:left;} input{-webkit-user-modify: read-write-plaintext-only;}"
	},
	splash : {
		duration : 3
	},
	content : {
		length : 0
	},
	scroller : {
		index : 0
	},
	swipe : {
		index : 0
	}
};
/*
 * sets styles
 */
Spider.style = {
	resetStyles : function() {
		var style = document.createElement('style');
		style.id = Spider.data.id.resetStyle;
		document.getElementsByTagName('head')[0].appendChild(style);

		this.style = document.createElement("style")
		this.style.setAttribute("rel", "stylesheet")
		this.style.setAttribute("type", "text/css")
		style.id = Spider.data.id.resetStyle;
		document.getElementsByTagName("head")[0].appendChild(this.style);

		if (this.style.styleSheet) {// IE

			this.style.styleSheet.cssText = Spider.data.html.resetCSS;

		} else {
			this.style.appendChild(document.createTextNode(Spider.data.html.resetCSS));
		}

	},
	applyStyles : function() {
		var wrapper = document.getElementById(Spider.data.id.wrapper);
		var content = document.getElementById(Spider.data.id.content);
		var splash = document.getElementById(Spider.data.id.splash);
		//var scroller = document.getElementById(Spider.data.id.scroller);
		var header = document.getElementById(Spider.data.id.header);
		var footer = document.getElementById(Spider.data.id.footer);

		if (header) {
			header.style.width = Utensil.stageWidth() + "px";
			//header.style.height = (Utensil.stageHeight()*Spider.data.headerPecent)+"px";
			//	Spider.data.headerHeight=(Utensil.stageHeight()*Spider.data.headerPecent);
			//header.style.position = "absolute";

		}

		if (footer) {
			footer.style.width = Utensil.stageWidth() + "px";
			//footer.style.height = (Utensil.stageHeight()*Spider.data.footerPecent)+"px";
			//Spider.data.footerHeight=(Utensil.stageHeight()*Spider.data.footerPecent);
			footer.style.position = "absolute";
			footer.style.bottom = "0";

		}

		wrapper.style.width = "100%";
		wrapper.style.height = "100%";
		wrapper.style.minHeight = "100%";
		wrapper.style.overflow = "hidden";
		wrapper.style.position = "relative";

		if (content) {

			content.style.height = "100%";
			content.style.height = (Utensil.stageHeight() - ( header ? header.clientHeight : 0) - ( footer ? footer.clientHeight : 0)) + "px";
			//content.style.minHeight = "100%";
			content.style.position = "absolute";
			content.style.overflow = "hidden";
			content.style.width = (content.childNodes.length * Utensil.stageWidth()) + "px";

			for (var a = 0; a < content.childNodes.length; a++) {
				var child = content.childNodes[a];

				if (child.style) {
					if (!child.getAttribute('index')) {
						child.className += " leftFloat";
						child.setAttribute("index", Spider.data.content.length);
						Spider.data.content.length++;
					}

					child.style.width = Utensil.stageWidth() + "px";
					//child.style.top = Spider.data.headerHeight+"px";
					child.style.position = "relative";
					//child.style.left = (Spider.data.content.length * Utensil.stageWidth())+"px";
					//child.style.cssFloat = "left";

				}

			}
		}
		if (splash) {
			splash.style.width = "100%";
			splash.style.height = "100%";
			splash.style.minHeight = "100%";
			splash.style.overflow = "hidden";
			splash.style.position = "absolute";
			splash.style.top = "0";
		}

	},
	setScrollHolder : function(holder) {
		holder.style.overflow = "hidden";
		holder.style.position = "relative";
	},
	setOverlay : function() {
		var overlay = document.getElementById(Spider.data.id.UIOverlay);
		overlay.style.display = "none";

	},
	setScroller : function(scroller) {
		scroller.style.width = "5px";
		scroller.style.height = "100%";
		//scroller.style.minHeight=Utensil.stageHeight()+"px";
		scroller.style.position = "absolute";
		scroller.style.top = "0";
		scroller.style.right = "0";
		scroller.style.display = "none";
		scroller.style['-moz-border-radius'] = "20px";
		scroller.style['-webkit-border-radius'] = "20px";
		scroller.style['-khtml-border-radius'] = "20px";
		scroller.style['border-radius'] = "20px";
		if(scroller.style['-ms-filter'])scroller.style['-ms-filter'] = "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";
		scroller.style['filter'] = "alpha(opacity=50)";
		scroller.style['-moz-opacity'] = "0.5";
		scroller.style['-khtml-opacity'] = "0.5";
		scroller.style['opacity'] = "0.5";
		if (!Spider.data.className.scroller)
			scroller.style.backgroundColor = "#333";
	},
	setScrollContent : function(content) {
		content.style.position = "absolute";
	},
	setToast : function(toast, p) {
		toast.style.position = "absolute";
		toast.style.top = "20%";

		toast.style.width = "40%";
		p.style.padding = "20px";
		toast.style['-moz-border-radius'] = "10px";
		toast.style['-webkit-border-radius'] = "10px";
		toast.style['-khtml-border-radius'] = "10px";
		toast.style['border-radius'] = "10px";
		toast.style['-ms-filter'] = "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
		toast.style['filter'] = "alpha(opacity=0)";
		toast.style['-moz-opacity'] = "0";
		toast.style['-khtml-opacity'] = "0";
		toast.style['opacity'] = "0";
		toast.style.backgroundColor = "#000";
		toast.style.color = "#e4e4e4";
		toast.style.textAlign = "center";
		toast.style.overflow = "hidden";
		toast.style["word-wrap"] = "break-word";

		toast.style.left = ((Utensil.stageWidth() - (Utensil.stageWidth() * 0.4)) * 0.5) + "px";
	}
};
Spider.controller = {
	currentIndex : 0,
	swipeMode : false,
	isVertical : false,
	isDrag : false,
	currentFocus : null,
	drag : {
		element : null,
		filler : null
	},
	init : function() {
		gesture.init();
		gesture.addCallback(gesture.EVENT_UP, Spider.controller, "gestureSwipe");
		gesture.addCallback(gesture.EVENT_DOWN, Spider.controller, "mouseDown");
		gesture.addCallback(gesture.EVENT_MOVE, Spider.controller, "gestureScroll");
		gesture.addCallback(gesture.EVENT_CLICK, Spider.controller, "gestureClick");

		var content = document.getElementById(Spider.data.id.content);
		if (content.getAttribute('swipe') && content.getAttribute('swipe') == "true")
			this.swipeMode = true;
	},
	mouseDown : function(item, event) {
		var element = event.srcElement || event.target;
		if (element && element.getAttribute(Spider.data.att.draggable)) {
			Spider.controller.isDrag = true;
			Spider.controller.drag.element = element;
			Spider.controller.drag.filler = Spider.element.getDragFiller(element.parentNode);
			element.style.position = "absolute";
			element.parentNode.style.position = "relative";
		} else if (element.tagName == "INPUT") {
			element.focus();
			this.currentFocus = element;
		} else if (this.currentFocus) {
			this.currentFocus.blur();
		}
	},
	gestureSwipe : function(item, event) {
		if (Spider.controller.isDrag) {
			Spider.controller.isDrag = false;
			if (Spider.event.callback[Spider.event.type.mouseup] && Spider.event.callback[Spider.event.type.mouseup]['document'])
				Spider.event.callback[Spider.event.type.mouseup]['document'](null, event);
				
			return;
		}
		Spider.controller.isVertical = false;
		var module = item.target;
		if (module && module.id != Spider.data.id.content && module && module.getAttribute && module.getAttribute(Spider.data.att.swipeParent)) {
			var parent = Spider.element.getAllElementsWithAttribute(Spider.data.att.swipeName, module.getAttribute(Spider.data.att.swipeParent));
			if (parent.getAttribute(Spider.data.att.autoswipe))
			{
				Spider.controller.swipePage(item);
				return;
			}
			var index = parent.getAttribute ? parent.getAttribute(Spider.data.att.swipeIndex) : null;
			if (!index) {
				item.x >= 0 ? index = 1 : index = 0;
				parent.setAttribute(Spider.data.att.swipeIndex, index);
				parent.style.position = "absolute";
				parent.parentNode.style.position = "relative";

			} else {
				index = parseInt(index);
				if (item.x < 0) {
					index--;
					if (index < 0)
						index = 0;
				} else {

					if ((parseInt(index + 1) * parent.parentNode.clientWidth) > parent.clientWidth - parent.parentNode.clientWidth) {

					} else {
						index++;
					}

				}
				parent.setAttribute(Spider.data.att.swipeIndex, index);
			}

			var x = -(parent.childNodes[0].clientWidth * index);
			if (x <= -((parent.childNodes[0].clientWidth * parent.childNodes.length) - parent.parentNode.clientWidth)) {
				x = -((parent.childNodes[0].clientWidth * parent.childNodes.length) - parent.parentNode.clientWidth);
				parent.setAttribute(Spider.data.att.swipeIndex, index - 1);
			}
			TweenLite.killTweensOf(parent);
			TweenLite.to(parent, 0.2, {
				css : {
					left : x + "px"
				}
			});

		} else if (this.swipeMode) {
			Spider.controller.swipePage(item);
			
		} else if (item && item.type == gesture.TYPE_VERTICAL) {
			var page = Spider.element.getPage(this.currentIndex);
			var y = Number(Spider.element.getY(page)) - Number(item.y * item.lat);

			if (y > 0)
				y = 0;
			if (y < -(page.clientHeight - Utensil.stageHeight()))
				y = -(page.clientHeight - Utensil.stageHeight());
			TweenLite.to(content, Spider.data.swipeDuration, {
				css : {
					top : y + "px"
				},
				onComplete : Spider.controller.handler.onPageChange
			});

		}

	},
	swipePage:function(item)
	{
		if (item && item.type == gesture.TYPE_HORIZONTAL && Math.abs(item.x) >= 1) {
				var content = document.getElementById(Spider.data.id.content);
				if (item.x < 0) {
					this.currentIndex--;
					if (this.currentIndex < 0)
						this.currentIndex = 0;
				} else {
					this.currentIndex++;

					if (this.currentIndex >= Spider.data.content.length)
						this.currentIndex = Spider.data.content.length - 1;
				}
				var x = -(Utensil.stageWidth() * this.currentIndex);

				TweenLite.to(content, 0.5, {
					css : {
						left : x + "px"
					},
					onComplete : Spider.controller.handler.onPageChange
				});
			}
	},
	gestureScroll : function(item) {

		if (Spider.controller.isDrag) {
			var element = Spider.controller.drag.element;
			var filler = Spider.controller.drag.filler;
			var left = element.style.left.replace("px", "");
			if (left == "")
				left = 0;
			var x = (left - item.x);
			if (x < 0)
				x = 0;
			if (x > element.parentNode.clientWidth)
				x = element.parentNode.clientWidth - element.clientWidth;
			element.style.left = x + "px";
			if (filler)
				filler.style.width = (x + (element.clientWidth * 0.5)) + "px";
			var percent = Math.round((x / (element.parentNode.clientWidth - element.clientWidth)) * 100);
			if (percent > 100)
				percent = 100;
			element.setAttribute(Spider.data.att.dragPercent, percent);
			if (element.getAttribute(Spider.data.att.legend)) {
				var legend = document.getElementById(element.getAttribute(Spider.data.att.legend));
				if (legend) {
					legend.innerHTML = Math.round(percent);
				}
			}
			if (Spider.event.callback[Spider.event.type.drag] && Spider.event.callback[Spider.event.type.drag][element.id])
				Spider.event.callback[Spider.event.type.drag][element.id]({
					percent : percent
				}, event);
		} else if (item.type == gesture.TYPE_VERTICAL) {
			Spider.controller.isVertical = true;
			var page = item.target;
			if (page && page.getAttribute && page.getAttribute(Spider.data.att.scrollParent)) {
				page = Spider.element.getAllElementsWithAttribute(Spider.data.att.scrollerIndex, page.getAttribute(Spider.data.att.scrollParent));

				var index = page.getAttribute(Spider.data.att.scrollerIndex);
				var scroller = document.getElementById(Spider.data.id.scroller + index);
				if (page.parentNode.clientHeight < page.clientHeight) {
					var y = Number(Spider.element.getY(page)) - Number(item.y * (item.lat == 0 ? 1 : item.lat));
					//if (y <= 0 && y > -(page.clientHeight - page.parentNode.clientHeight))
					//{
					//page.style.top = y + "px";
					//}
					if (y > 0)
						y = 0;
					if (y < -(page.clientHeight - page.parentNode.clientHeight))
						y = -(page.clientHeight - page.parentNode.clientHeight);
					scroller.style.top = (-((page.parentNode.clientHeight / page.clientHeight) * Number(y))) + "px";
					TweenLite.to(page, 0.1, {
						css : {
							top : y + "px"
						}
					});
				}

			}

		}
	},
	gestureClick : function(item, event) {
		var element = event.srcElement || event.target;
		if (element && element.getAttribute(Spider.data.att.navigate)) {
			var index = parseInt(element.getAttribute(Spider.data.att.navigate));
			this.currentIndex = index;
			var content = document.getElementById(Spider.data.id.content);
			var x = -(Utensil.stageWidth() * index);
			TweenLite.to(content, 0.5, {
				css : {
					left : x + "px"
				},
				onComplete : Spider.controller.handler.onPageChange
			});
		}

		if (element.id && Spider.event.callback[Spider.event.type.click] && Spider.event.callback[Spider.event.type.click][element.id]) {
			Spider.event.callback[Spider.event.type.click][element.id](item, event);
		} else if (element.parentNode && element.parentNode.id && Spider.event.callback[Spider.event.type.click] && Spider.event.callback[Spider.event.type.click][element.parentNode.id]) {

			Spider.event.callback[Spider.event.type.click][element.parentNode.id](item, event);
		}
	},
	slideModule : function(ul, index, duration, callback, delay) {
		if (ul.childNodes[0].clientWidth == 0) {
			if (callback)
			var d=duration?duration:0.2;
				setTimeout(function(){callback(ul);},d*1000);
			return;
		}
		ul.setAttribute(Spider.data.att.swipeIndex, index);
		var x = -(ul.childNodes[0].clientWidth * index);
		if (x < -((ul.childNodes[0].clientWidth * ul.childNodes.length) - ul.parentNode.clientWidth)) {
			x = -((ul.childNodes[0].clientWidth * ul.childNodes.length) - ul.parentNode.clientWidth);
			ul.setAttribute(Spider.data.att.swipeIndex, index - 1);
		}

		var complete = function() {
			if (callback) {
				callback(ul);
			}
		};
		TweenLite.killTweensOf(ul);
		TweenLite.to(ul, duration ? duration : 0.2, {
			delay : delay ? delay : 0,
			css : {
				left : x + "px"
			},
			onComplete : complete
		});
		delete ul;
		delete complete;
	},
	handler : {
		onPageChange : function() {
			Spider.element.setPage(Spider.controller.currentIndex);
			for (var e in Spider.event.callback[Spider.event.type.onPageChange]) {
				Spider.event.callback[Spider.event.type.onPageChange][e](Spider.controller.currentIndex);
			}
		}
	}
};