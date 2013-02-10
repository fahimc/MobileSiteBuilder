var gesture = {
	DEFAULT_LATENCY_INTERVAL : 50,
	DEFAULT_LATENCY : 10,
	handlers : {},
	startX : 0,
	startY : 0,
	minSwipe : 10,
	minSwipeUp : 10,
	TYPE_HORIZONTAL : "TYPE_HORIZONTAL",
	TYPE_VERTICAL : "TYPE_VERTICAL",
	EVENT_UP : "EVENT_UP",
	EVENT_MOVE : "EVENT_MOVE",
	EVENT_DOWN : "EVENT_DOWN",
	EVENT_CLICK : "EVENT_CLICK",
	className : {
		over : "over"
	},
	callbacks : [],
	ignoreList : [],
	isMinSwipe : false,
	currentItem : null,
	mouseDownX : null,
	mouseDownY : null,
	active : true,
	dir : null,
	target : null,
	latencyTimer : null,
	focusOut : null,
	currentItemMouseOver : null,
	latency : this.DEFAULT_LATENCY,
	init : function() {
		document.body.ondragstart = function() {
			return false;
		};

		this.createHandler("onMouseDown");
		this.createHandler("onMouseUp");
		this.createHandler("onMouseMove");
		if ('ontouchstart' in document.documentElement) {
			// this.minSwipe = 5;
			document.addEventListener('touchstart', this.handlers.onMouseDown, true);
			document.addEventListener('touchend', this.handlers.onMouseUp, false);
		} else {
			Utensil.addListener(document.body, "mousedown", this.handlers.onMouseDown);
			Utensil.addListener(document, "mouseup", this.handlers.onMouseUp);
		}

	},
	deactivate : function() {
		this.active = false;
	},
	activate : function() {
		this.active = true;
	},
	addCallback : function(eventName, callback, method) {
		this.callbacks.push({
			e : eventName,
			c : callback,
			m : method
		});
	},
	addToIgnore : function(id) {
		this.ignoreList[id] = id;
	},
	onMouseDown : function(event) {

		this.target = event.srcElement || event.target;
		if (event.touches && event.touches[0].target)
			this.target = event.touches[0].target;

		if (this.target && this.target.className != undefined) {
			this.currentItemMouseOver = this.target;
			if (this.currentItemMouseOver.className && this.currentItemMouseOver.className.replace) {
				this.currentItemMouseOver.className = this.currentItemMouseOver.className.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				this.currentItemMouseOver.className += " " + gesture.className.over;
			}
		}

		if (this.latencyTimer)
			clearInterval(this.latencyTimer);
		this.latency = this.DEFAULT_LATENCY;

		// create a timer to decrease latency
		var root = this;
		this.latencyTimer = setInterval(function() {
			root.onLatency()
		}, this.DEFAULT_LATENCY_INTERVAL);

		this.mouseDownX = this.startX = this.mouseX(event);
		this.mouseDownY = this.startY = this.mouseY(event);

		if ('ontouchstart' in document.documentElement) {

			document.addEventListener('touchmove', this.handlers.onMouseMove, false);
		} else {
			Utensil.addListener(document.body, "mousemove", this.handlers.onMouseMove);
		}
		this.callFunc(this.EVENT_DOWN, event);
	},
	onMouseMove : function(event) {
		this.target = event.srcElement || event.target;

		if (!this.active)
			return;
		var xMovement = this.startX - this.mouseX(event);
		var yMovement = this.startY - this.mouseY(event);

		// which one is greater?
		if (Math.abs(xMovement) > Math.abs(yMovement) && Math.abs(xMovement) >= this.minSwipe) {
			if (!this.dir || this.dir == this.TYPE_HORIZONTAL) {
				this.dir = this.TYPE_HORIZONTAL;
				this.isMinSwipe = true;
				this.currentItem = {
					x : xMovement,
					y : yMovement,
					sx : this.startX,
					sy : this.startY,
					lat : this.latency,
					target : this.target
				};
				this.currentItem.type = this.TYPE_HORIZONTAL;
				this.updateStartXY(event);
				this.callFunc(this.EVENT_MOVE);
			}
		} else if (Math.abs(xMovement) < Math.abs(yMovement) && Math.abs(yMovement) >= this.minSwipeUp) {
			if (!this.dir || this.dir == this.TYPE_VERTICAL) {
				this.dir = this.TYPE_VERTICAL;
				this.currentItem = {
					x : xMovement,
					y : yMovement,
					sx : this.startX,
					sy : this.startY,
					lat : this.latency,
					target : this.target
				};
				if (!this.currentItem.type)
					this.currentItem.type = this.TYPE_VERTICAL;
				this.updateStartXY(event);
				this.callFunc(this.EVENT_MOVE);
			}
		}
		// event.preventDefault();
	},
	updateStartXY : function(event) {
		this.startX = this.mouseX(event);
		this.startY = this.mouseY(event);

	},
	onMouseUp : function(event) {
		this.target = event.srcElement || event.target;
		if (this.target.tagName && (this.target.tagName == "INPUT" || this.target.tagName == "TEXTAREA"))
			return;
		if (gesture.focusOut) {
			gesture.focusOut.blur();
			gesture.focusOut = null;
		}
		if (this.currentItemMouseOver && this.currentItemMouseOver.className && this.currentItemMouseOver.className.replace)
			this.currentItemMouseOver.className = this.currentItemMouseOver.className.replace(gesture.className.over, "");

		// clear latency timer
		if (this.latencyTimer)
			clearInterval(this.latencyTimer);

		if ('ontouchstart' in document.documentElement) {
			document.removeEventListener('touchmove', this.handlers.onMouseMove);
		} else {
			Utensil.removeListener(document.body, "mousemove", this.handlers.onMouseMove);
		}
		if (this.mouseDownX == this.startX && this.mouseDownY == this.startY) {
			this.callFunc(this.EVENT_CLICK, event);
		} else if (this.currentItem && this.currentItem.type == this.TYPE_HORIZONTAL && this.isMinSwipe == true) {
			this.callFunc(this.EVENT_UP);
		} else if (this.currentItem && this.currentItem.type == this.TYPE_VERTICAL) {
			this.callFunc(this.EVENT_UP);
		}
		this.updateStartXY(event);
		this.isMinSwipe = false;
		this.currentItem = {};
		this.dir = null;
	},
	mouseX : function(event) {
		if (event.touches) {
			if (event.touches[0] && event.touches[0].pageX)
				return event.touches[0].pageX;
		}
		return gesture.pageXY(event).pageX;
	},
	mouseY : function(event) {
		if (event.touches) {
			if (event.touches[0] && event.touches[0].pageY)
				return event.touches[0].pageY;
		}

		return gesture.pageXY(event).pageY;
	},
	pageXY : function(event) {
		if (event.pageX == null && event.clientX != null) {
			var doc = document.documentElement, body = document.body;
			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
		}
		return event;
	},
	callFunc : function(eventName, event) {
		for (var a = 0; a < this.callbacks.length; a++) {
			if (this.callbacks[a].e == eventName) {
				this.callbacks[a].c[this.callbacks[a].m](this.currentItem, event);
			}
		}
	},
	createHandler : function(eventName) {
		var root = this;
		this.handlers[eventName] = function(event) {
			root[eventName](event);
			var target = event.srcElement || event.target;
			if (target.id && gesture.ignoreList[target.id] || target.tagName && (target.tagName == "INPUT" || target.tagName == "A" || target.tagName == "TEXTAREA")) {
				target.className = target.className.replace(gesture.className.over, "");
				gesture.focusOut = target;
				if (eventName == 'onMouseUp' || eventName == 'click' || eventName == 'touchend')
					target.click();
			} else {

				event.preventDefault ? event.preventDefault() : event.returnValue = false;
			}

		}
		return this.handlers[eventName];
	},
	onLatency : function() {
		if (this.latency - 1 < 0)
			return;
		this.latency = parseInt(this.latency - 1);

	}
};
