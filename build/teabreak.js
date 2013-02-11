/*!
 * VERSION: beta 1.29
 * DATE: 2012-07-23
 * JavaScript (ActionScript 3 and 2 also available)
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * corporate Club GreenSock members, the software agreement that was issued with the corporate 
 * membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
(function(window) {
	
		"use strict";
		var _namespace = function(ns) {
				var a = ns.split("."), 
					p = window, i;
				for (i = 0; i < a.length; i++) {
					p[a[i]] = p = p[a[i]] || {};
				}
				return p;
			},
			gs = _namespace("com.greensock"),
			a, i, e, e2, p, _gsInit,
			_classLookup = {},
			
			//_DepClass is for defining a dependent class. ns = namespace (leaving off "com.greensock." as that's assumed), dep = an array of namespaces that are required, def = the function that will return the class definition (this function will be passed each dependency in order as soon as they arrive), global = if true, the class is added to the global scope (window) or if requirejs is being used, it will tap into that instead.
			_DepClass = function(ns, dep, def, global) {
				this.sc = (_classLookup[ns]) ? _classLookup[ns].sc : []; //subclasses
				_classLookup[ns] = this;
				this.gsClass = null;
				this.def = def;
				var _dep = dep || [],
					_classes = [];
				this.check = function(init) {
					var i = _dep.length, cnt = 0, cur;
					while (--i > -1) {
						if ((cur = _classLookup[_dep[i]] || new _DepClass(_dep[i])).gsClass) {
							_classes[i] = cur.gsClass;
						} else {
							cnt++;
							if (init) {
								cur.sc.push(this);
							}
						}
					}
					if (cnt === 0 && def) {
						var a = ("com.greensock." + ns).split("."),
							n = a.pop(),
							cl = _namespace(a.join("."))[n] = this.gsClass = def.apply(def, _classes);
						
						//exports to multiple environments
						if (global) {
							(window.GreenSockGlobals || window)[n] = cl; //provides a way to avoid global namespace pollution. By default, the main classes like TweenLite, Power1, Strong, etc. are added to window unless a GreenSockGlobals is defined. So if you want to have things added to a custom object instead, just do something like window.GreenSockGlobals = {} before loading any GreenSock files. You can even set up an alias like window.GreenSockGlobals = windows.gs = {} so that you can access everything like gs.TweenLite. Also remember that ALL classes are added to the window.com.greensock object (in their respective packages, like com.greensock.easing.Power1, com.greensock.TweenLite, etc.)
							if (typeof(define) === "function" && define.amd){ //AMD
								define((window.GreenSockAMDPath ? window.GreenSockAMDPath + "/" : "") + ns.split(".").join("/"), [], function() { return cl; });
							} else if (typeof(module) !== "undefined" && module.exports){ //node
								module.exports = cl;
							}
						}
						
						for (i = 0; i < this.sc.length; i++) {
							this.sc[i].check(false);
						}
						
					}
				};
				this.check(true);
			},
			//a quick way to create a class that doesn't have any dependencies. Returns the class, but first registers it in the GreenSock namespace so that other classes can grab it (other classes might be dependent on the class).
			_class = gs._class = function(ns, f, g) {
				new _DepClass(ns, [], function(){ return f; }, g);
				return f;
			};
		
		//used to create _DepClass instances (which basically registers a class that has dependencies). ns = namespace, dep = dependencies (array), f = initialization function which should return the class, g = global (whether or not the class should be added to the global namespace (or if RequireJS is used, it will be defined as a named module instead)
		window._gsDefine = function(ns, dep, f, g) {
			return new _DepClass(ns, dep, f, g);
		};
		
	

/*
 * ----------------------------------------------------------------
 * Ease
 * ----------------------------------------------------------------
 */
		var _baseParams = [0, 0, 1, 1],
			_blankArray = [],
			Ease = _class("easing.Ease", function(func, extraParams, type, power) {
				this._func = func;
				this._type = type || 0;
				this._power = power || 0;
				this._params = extraParams ? _baseParams.concat(extraParams) : _baseParams;
			}, true);
		
		p = Ease.prototype;
		p._calcEnd = false;
		p.getRatio = function(p) {
			if (this._func) {
				this._params[0] = p;
				return this._func.apply(null, this._params);
			} else {
				var t = this._type, 
					pw = this._power, 
					r = (t === 1) ? 1 - p : (t === 2) ? p : (p < 0.5) ? p * 2 : (1 - p) * 2;
				if (pw === 1) {
					r *= r;
				} else if (pw === 2) {
					r *= r * r;
				} else if (pw === 3) {
					r *= r * r * r;
				} else if (pw === 4) {
					r *= r * r * r * r;
				}
				return (t === 1) ? 1 - r : (t === 2) ? r : (p < 0.5) ? r / 2 : 1 - (r / 2);
			}
		};
		
		//create all the standard eases like Linear, Quad, Cubic, Quart, Quint, Strong, Power0, Power1, Power2, Power3, and Power4 (each with easeIn, easeOut, and easeInOut)
		a = ["Linear","Quad","Cubic","Quart","Quint"];
		i = a.length;
		while(--i > -1) {
			e = _class("easing." + a[i], function(){}, true);
			e2 = _class("easing.Power" + i, function(){}, true);
			e.easeOut = e2.easeOut = new Ease(null, null, 1, i);
			e.easeIn = e2.easeIn = new Ease(null, null, 2, i);
			e.easeInOut = e2.easeInOut = new Ease(null, null, 3, i);
		}
		_class("easing.Strong", gs.easing.Power4, true);
		gs.easing.Linear.easeNone = gs.easing.Linear.easeIn;
	

/*
 * ----------------------------------------------------------------
 * EventDispatcher
 * ----------------------------------------------------------------
 */
		p = _class("events.EventDispatcher", function(target) {
			this._listeners = {};
			this._eventTarget = target || this;
		}).prototype;
		
		p.addEventListener = function(type, callback, scope, useParam, priority) {
			priority = priority || 0;
			var list = this._listeners[type],
				index = 0,
				listener, i;
			if (list == null) {
				this._listeners[type] = list = [];
			}
			i = list.length;
			while (--i > -1) {
				listener = list[i];
				if (listener.c === callback) {
					list.splice(i, 1);
				} else if (index === 0 && listener.pr < priority) {
					index = i + 1;
				}
			}
			list.splice(index, 0, {c:callback, s:scope, up:useParam, pr:priority});
		};
		
		p.removeEventListener = function(type, callback) {
			var list = this._listeners[type];
			if (list) {
				var i = list.length;
				while (--i > -1) {
					if (list[i].c === callback) {
						list.splice(i, 1);
						return;
					}
				}
			}
		};
		
		p.dispatchEvent = function(type) {
			var list = this._listeners[type];
			if (list) {
				var i = list.length, listener,
					t = this._eventTarget;
				while (--i > -1) {
					listener = list[i];
					if (listener.up) {
						listener.c.call(listener.s || t, {type:type, target:t});
					} else {
						listener.c.call(listener.s || t);
					}
				}
			}
		};


/*
 * ----------------------------------------------------------------
 * Ticker
 * ----------------------------------------------------------------
 */
 		var _reqAnimFrame = window.requestAnimationFrame, 
			_cancelAnimFrame = window.cancelAnimationFrame, 
			_getTime = Date.now || function() {return new Date().getTime();};
		
		//now try to determine the requestAnimationFrame and cancelAnimationFrame functions and if none are found, we'll use a setTimeout()/clearTimeout() polyfill.
		a = ["ms","moz","webkit","o"];
		i = a.length;
		while (--i > -1 && !_reqAnimFrame) {
			_reqAnimFrame = window[a[i] + "RequestAnimationFrame"];
			_cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
		}
		if (!_cancelAnimFrame) {
			_cancelAnimFrame = function(id) {
				window.clearTimeout(id);
			}
		}
		
		_class("Ticker", function(fps, useRAF) {
			this.time = 0;
			this.frame = 0;
			var _self = this,
				_startTime = _getTime(),
				_useRAF = (useRAF !== false),
				_fps, _req, _id, _gap, _nextTime;
			
			this.tick = function() {
				_self.time = (_getTime() - _startTime) / 1000;
				if (!_fps || _self.time >= _nextTime) {
					_self.frame++;
					_nextTime = _self.time + _gap - (_self.time - _nextTime) - 0.0005;
					if (_nextTime <= _self.time) {
						_nextTime = _self.time + 0.001;
					}
					_self.dispatchEvent("tick");
				}
				_id = _req( _self.tick );
			};
			
			this.fps = function(value) {
				if (!arguments.length) {
					return _fps;
				}
				_fps = value;
				_gap = 1 / (_fps || 60);
				_nextTime = this.time + _gap;
				_req = (_fps === 0) ? function(f){} : (!_useRAF || !_reqAnimFrame) ? function(f) { return window.setTimeout( f, (((_nextTime - _self.time) * 1000 + 1) >> 0) || 1);	} : _reqAnimFrame;
				_cancelAnimFrame(_id);
				_id = _req( _self.tick );
			};
			
			this.useRAF = function(value) {
				if (!arguments.length) {
					return _useRAF
				}
				_useRAF = value;
				this.fps(_fps);
			};
			
			this.fps(fps);
		});
		
		p = gs.Ticker.prototype = new gs.events.EventDispatcher();
		p.constructor = gs.Ticker;


/*
 * ----------------------------------------------------------------
 * Animation
 * ----------------------------------------------------------------
 */
		var Animation = _class("core.Animation", function(duration, vars) {
				this.vars = vars || {};
				this._duration = this._totalDuration = duration || 0;
				this._delay = Number(this.vars.delay) || 0;
				this._timeScale = 1;
				this._active = (this.vars.immediateRender == true);
				this.data = this.vars.data;
				this._reversed = (this.vars.reversed == true);
				
				if (!_rootTimeline) {
					return;
				}
				if (!_gsInit) {
					_ticker.tick(); //the first time an animation (tween or timeline) is created, we should refresh the time in order to avoid a gap. The Ticker's initial time that it records might be very early in the load process and the user may have loaded several other large scripts in the mean time, but we want tweens to act as though they started when the page's onload was fired. Also remember that the requestAnimationFrame likely won't be called until the first screen redraw.
					_gsInit = true;
				}
				
				var tl = this.vars.useFrames ? _rootFramesTimeline : _rootTimeline;
				tl.insert(this, tl._time);
				
				if (this.vars.paused) {
					this.paused(true);
				}
			}),
			_ticker = Animation.ticker = new gs.Ticker();
		
		p = Animation.prototype;
		p._dirty = p._gc = p._initted = p._paused = false;
		p._totalTime = p._time = 0;
		p._rawPrevTime = -1;
		p._next = p._last = p._onUpdate = p._timeline = p.timeline = null;
		p._paused = false;
		
		p.play = function(from, suppressEvents) {
			if (arguments.length) {
				this.seek(from, suppressEvents);
			}
			this.reversed(false);
			return this.paused(false);
		};
		
		p.pause = function(atTime, suppressEvents) {
			if (arguments.length) {
				this.seek(atTime, suppressEvents);
			}
			return this.paused(true);
		};
		
		p.resume = function(from, suppressEvents) {
			if (arguments.length) {
				this.seek(from, suppressEvents);
			}
			return this.paused(false);
		};
		
		p.seek = function(time, suppressEvents) {
			return this.totalTime(Number(time), (suppressEvents != false));
		};
		
		p.restart = function(includeDelay, suppressEvents) {
			this.reversed(false);
			this.paused(false);
			return this.totalTime((includeDelay) ? -this._delay : 0, (suppressEvents != false));
		};
		
		p.reverse = function(from, suppressEvents) {
			if (arguments.length) {
				this.seek((from || this.totalDuration()), suppressEvents);
			}
			this.reversed(true);
			return this.paused(false);
		};
		
		p.render = function() {
			
		};
		
		p.invalidate = function() {
			return this;
		};
		
		p._enabled = function (enabled, ignoreTimeline) {
			this._gc = !enabled; 
			this._active = (enabled && !this._paused && this._totalTime > 0 && this._totalTime < this._totalDuration);
			if (ignoreTimeline != true) {
				if (enabled && this.timeline == null) {
					this._timeline.insert(this, this._startTime - this._delay);
				} else if (!enabled && this.timeline != null) {
					this._timeline._remove(this, true);
				}
			}
			return false;
		};
	
		
		p._kill = function(vars, target) {
			return this._enabled(false, false);
		};
		
		p.kill = function(vars, target) {
			this._kill(vars, target);
			return this;
		};
		
		p._uncache = function(includeSelf) {
			var tween = includeSelf ? this : this.timeline;
			while (tween) {
				tween._dirty = true;
				tween = tween.timeline;
			}
			return this;
		};
	
//----Animation getters/setters --------------------------------------------------------
		
		p.eventCallback = function(type, callback, params, scope) {
			if (type == null) {
				return null;
			} else if (type.substr(0,2) === "on") {
				if (arguments.length === 1) {
					return this.vars[type];
				}
				if (callback == null) {
					delete this.vars[type];
				} else {
					this.vars[type] = callback;
					this.vars[type + "Params"] = params;
					this.vars[type + "Scope"] = scope;
					if (params) {
						var i = params.length;
						while (--i > -1) {
							if (params[i] === "{self}") {
								params = this.vars[type + "Params"] = params.concat(); //copying the array avoids situations where the same array is passed to multiple tweens/timelines and {self} doesn't correctly point to each individual instance.
								params[i] = this;
							}
						}
					}
				}
				if (type === "onUpdate") {
					this._onUpdate = callback;
				}
			}
			return this;
		}
		
		p.delay = function(value) {
			if (!arguments.length) {
				return this._delay;
			}
			if (this._timeline.smoothChildTiming) {
				this.startTime( this._startTime + value - this._delay );
			}
			this._delay = value;
			return this;
		};
		
		p.duration = function(value) {
			if (!arguments.length) {
				this._dirty = false;
				return this._duration;
			}
			this._duration = this._totalDuration = value;
			this._uncache(true); //true in case it's a TweenMax or TimelineMax that has a repeat - we'll need to refresh the totalDuration. 
			if (this._timeline.smoothChildTiming) if (this._active) if (value != 0) {
				this.totalTime(this._totalTime * (value / this._duration), true);
			}
			return this;
		};
		
		p.totalDuration = function(value) {
			this._dirty = false;
			return (!arguments.length) ? this._totalDuration : this.duration(value);
		};
		
		p.time = function(value, suppressEvents) {
			if (!arguments.length) {
				return this._time;
			}
			if (this._dirty) {
				this.totalDuration();
			}
			if (value > this._duration) {
				value = this._duration;
			}
			return this.totalTime(value, suppressEvents);
		};
		
		p.totalTime = function(time, suppressEvents) {
			if (!arguments.length) {
				return this._totalTime;
			}
			if (this._timeline) {
				if (time < 0) {
					time += this.totalDuration();
				}
				if (this._timeline.smoothChildTiming) {
					if (this._dirty) {
						this.totalDuration();
					}
					if (time > this._totalDuration) {
						time = this._totalDuration;
					}
					this._startTime = (this._paused ? this._pauseTime : this._timeline._time) - ((!this._reversed ? time : this._totalDuration - time) / this._timeScale);
					if (!this._timeline._dirty) { //for performance improvement. If the parent's cache is already dirty, it already took care of marking the anscestors as dirty too, so skip the function call here.
						this._uncache(false);
					}
					if (!this._timeline._active) {
						//in case any of the anscestors had completed but should now be enabled...
						var tl = this._timeline;
						while (tl._timeline) {
							tl.totalTime(tl._totalTime, true);
							tl = tl._timeline;
						}
					}
				}
				if (this._gc) {
					this._enabled(true, false);
				}
				if (this._totalTime != time) {
					this.render(time, suppressEvents, false);
				}
			}
			return this;
		};
		
		p.startTime = function(value) {
			if (!arguments.length) {
				return this._startTime;
			}
			if (value != this._startTime) {
				this._startTime = value;
				if (this.timeline) if (this.timeline._sortChildren) {
					this.timeline.insert(this, value - this._delay); //ensures that any necessary re-sequencing of Animations in the timeline occurs to make sure the rendering order is correct.
				}
			}
			return this;
		};
		
		p.timeScale = function(value) {
			if (!arguments.length) {
				return this._timeScale;
			}
			value = value || 0.000001; //can't allow zero because it'll throw the math off
			if (this._timeline && this._timeline.smoothChildTiming) {
				var t = (this._pauseTime || this._pauseTime == 0) ? this._pauseTime : this._timeline._totalTime;
				this._startTime = t - ((t - this._startTime) * this._timeScale / value);
			}
			this._timeScale = value;
			return this._uncache(false);
		};
		
		p.reversed = function(value) {
			if (!arguments.length) {
				return this._reversed;
			}
			if (value != this._reversed) {
				this._reversed = value;
				this.totalTime(this._totalTime, true);
			}
			return this;
		};
		
		p.paused = function(value) {
			if (!arguments.length) {
				return this._paused;
			}
			if (value != this._paused) if (this._timeline) {
				if (!value && this._timeline.smoothChildTiming) {
					this._startTime += this._timeline.rawTime() - this._pauseTime;
					this._uncache(false);
				}
				this._pauseTime = (value) ? this._timeline.rawTime() : null;
				this._paused = value;
				this._active = (!this._paused && this._totalTime > 0 && this._totalTime < this._totalDuration);
			}
			if (this._gc) if (!value) {
				this._enabled(true, false);
			}
			return this;
		};
	

/*
 * ----------------------------------------------------------------
 * SimpleTimeline
 * ----------------------------------------------------------------
 */
		var SimpleTimeline = _class("core.SimpleTimeline", function(vars) {
			Animation.call(this, 0, vars);
			this.autoRemoveChildren = this.smoothChildTiming = true;
		});
		
		p = SimpleTimeline.prototype = new Animation();
		p.constructor = SimpleTimeline;
		p.kill()._gc = false;
		p._first = p._last = null;
		p._sortChildren = false;
		
		p.insert = function(tween, time) {
			tween._startTime = Number(time || 0) + tween._delay;
			if (tween._paused) if (this !== tween._timeline) { //we only adjust the _pauseTime if it wasn't in this timeline already. Remember, sometimes a tween will be inserted again into the same timeline when its startTime is changed so that the tweens in the TimelineLite/Max are re-ordered properly in the linked list (so everything renders in the proper order). 
				tween._pauseTime = tween._startTime + ((this.rawTime() - tween._startTime) / tween._timeScale);
			}
			if (tween.timeline) {
				tween.timeline._remove(tween, true); //removes from existing timeline so that it can be properly added to this one.
			}
			tween.timeline = tween._timeline = this;
			if (tween._gc) {
				tween._enabled(true, true);
			}
			
			var prevTween = this._last;
			if (this._sortChildren) {
				var st = tween._startTime;
				while (prevTween && prevTween._startTime > st) {
					prevTween = prevTween._prev;
				}
			}
			if (prevTween) {
				tween._next = prevTween._next;
				prevTween._next = tween;
			} else {
				tween._next = this._first;
				this._first = tween;
			}
			if (tween._next) {
				tween._next._prev = tween;
			} else {
				this._last = tween;
			}
			tween._prev = prevTween;
			
			if (this._timeline) {
				this._uncache(true);
			}
			return this;
		};
		
		p._remove = function(tween, skipDisable) {
			if (tween.timeline === this) {
				if (!skipDisable) {
					tween._enabled(false, true);
				}
				tween.timeline = null;
				
				if (tween._prev) {
					tween._prev._next = tween._next;
				} else if (this._first === tween) {
					this._first = tween._next;
				}
				if (tween._next) {
					tween._next._prev = tween._prev;
				} else if (this._last === tween) {
					this._last = tween._prev;
				}
				
				if (this._timeline) {
					this._uncache(true);
				}
			}
			return this;
		};
		
		p.render = function(time, suppressEvents, force) {
			var tween = this._first, 
				next;
			this._totalTime = this._time = this._rawPrevTime = time;
			while (tween) {
				next = tween._next; //record it here because the value could change after rendering...
				if (tween._active || (time >= tween._startTime && !tween._paused)) {
					if (!tween._reversed) {
						tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, false);
					} else {
						tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, false);
					}
				}
				tween = next;
			}
		};
				
		p.rawTime = function() {
			return this._totalTime;			
		};
	
	
/*
 * ----------------------------------------------------------------
 * TweenLite
 * ----------------------------------------------------------------
 */
		var TweenLite = _class("TweenLite", function(target, duration, vars) {
				Animation.call(this, duration, vars);
				
				if (target == null) {
					throw "Cannot tween an undefined reference.";
				}
				this.target = target;		
				
				this._overwrite = (this.vars.overwrite == null) ? _overwriteLookup[TweenLite.defaultOverwrite] : (typeof(this.vars.overwrite) === "number") ? this.vars.overwrite >> 0 : _overwriteLookup[this.vars.overwrite];
				
				var jq, i, targ;
				if ((target instanceof Array || target.jquery) && typeof(target[0]) === "object") { 
					this._targets = target.slice(0); //works for both jQuery and Array instances
					this._propLookup = [];
					this._siblings = [];
					for (i = 0; i < this._targets.length; i++) {
						targ = this._targets[i];
						//in case the user is passing in an array of jQuery objects, for example, we need to check one more level and pull things out if necessary...
						if (targ.jquery) { 
							this._targets.splice(i--, 1);
							this._targets = this._targets.concat(targ.constructor.makeArray(targ));
							continue;
						}
						this._siblings[i] = _register(targ, this, false);
						if (this._overwrite === 1) if (this._siblings[i].length > 1) {
							_applyOverwrite(targ, this, null, 1, this._siblings[i]);
						}
					}
					
				} else {
					this._propLookup = {};
					this._siblings = _register(target, this, false);
					if (this._overwrite === 1) if (this._siblings.length > 1) {
						_applyOverwrite(target, this, null, 1, this._siblings);
					}
				}
				
				if (this.vars.immediateRender || (duration === 0 && this._delay === 0 && this.vars.immediateRender != false)) {
					this.render(-this._delay, false, true);
				}
			}, true);
	
		p = TweenLite.prototype = new Animation();
		p.constructor = TweenLite;
		p.kill()._gc = false;
	
//----TweenLite defaults, overwrite management, and root updates ----------------------------------------------------
	
		p.ratio = 0;
		p._firstPT = p._targets = p._overwrittenProps = null;
		p._notifyPluginsOfEnabled = false;
		
		TweenLite.version = 12;
		TweenLite.defaultEase = p._ease = new Ease(null, null, 1, 1);
		TweenLite.defaultOverwrite = "auto";
		TweenLite.ticker = _ticker;
		
		var _plugins = TweenLite._plugins = {},
			_tweenLookup = {}, 
			_tweenLookupNum = 0,
			_reservedProps = {ease:1, delay:1, overwrite:1, onComplete:1, onCompleteParams:1, onCompleteScope:1, useFrames:1, runBackwards:1, startAt:1, onUpdate:1, onUpdateParams:1, onUpdateScope:1, onStart:1, onStartParams:1, onStartScope:1, onReverseComplete:1, onReverseCompleteParams:1, onReverseCompleteScope:1, onRepeat:1, onRepeatParams:1, onRepeatScope:1, easeParams:1, yoyo:1, orientToBezier:1, immediateRender:1, repeat:1, repeatDelay:1, data:1, paused:1, reversed:1},
			_overwriteLookup = {none:0, all:1, auto:2, concurrent:3, allOnStart:4, preexisting:5, "true":1, "false":0},
			_rootFramesTimeline = Animation._rootFramesTimeline = new SimpleTimeline(), 
			_rootTimeline = Animation._rootTimeline = new SimpleTimeline();
			
		_rootTimeline._startTime = _ticker.time;
		_rootFramesTimeline._startTime = _ticker.frame;
		_rootTimeline._active = _rootFramesTimeline._active = true;
		
		Animation._updateRoot = function() {
				_rootTimeline.render((_ticker.time - _rootTimeline._startTime) * _rootTimeline._timeScale, false, false);
				_rootFramesTimeline.render((_ticker.frame - _rootFramesTimeline._startTime) * _rootFramesTimeline._timeScale, false, false);
				if (!(_ticker.frame % 120)) { //dump garbage every 120 frames...
					var i, a, p;
					for (p in _tweenLookup) {
						a = _tweenLookup[p].tweens;
						i = a.length;
						while (--i > -1) {
							if (a[i]._gc) {
								a.splice(i, 1);
							}
						}
						if (a.length === 0) {
							delete _tweenLookup[p];
						}
					}
				}
			};
		
		_ticker.addEventListener("tick", Animation._updateRoot);
		
		var _register = function(target, tween, scrub) {
				var id = target._gsTweenID, a, i;
				if (!_tweenLookup[id || (target._gsTweenID = id = "t" + (_tweenLookupNum++))]) {
					_tweenLookup[id] = {target:target, tweens:[]};
				}
				if (tween) {
					a = _tweenLookup[id].tweens;
					a[(i = a.length)] = tween;
					if (scrub) {
						while (--i > -1) {
							if (a[i] === tween) {
								a.splice(i, 1);
							}
						}
					}
				}
				return _tweenLookup[id].tweens;
			},
			
			_applyOverwrite = function(target, tween, props, mode, siblings) {
				var i, changed, curTween;
				if (mode === 1 || mode >= 4) {
					var l = siblings.length;
					for (i = 0; i < l; i++) {
						if ((curTween = siblings[i]) !== tween) {
							if (!curTween._gc) if (curTween._enabled(false, false)) {
								changed = true;
							}
						} else if (mode === 5) {
							break;
						}
					}
					return changed;
				}
				//NOTE: Add 0.0000000001 to overcome floating point errors that can cause the startTime to be VERY slightly off (when a tween's time() is set for example)
				var startTime = tween._startTime + 0.0000000001, 
					overlaps = [], 
					oCount = 0, 
					globalStart;
				i = siblings.length;
				while (--i > -1) {
					if ((curTween = siblings[i]) === tween || curTween._gc || curTween._paused) {
						//ignore
					} else if (curTween._timeline !== tween._timeline) {
						globalStart = globalStart || _checkOverlap(tween, 0);
						if (_checkOverlap(curTween, globalStart) === 0) {
							overlaps[oCount++] = curTween;
						}
					} else if (curTween._startTime <= startTime) if (curTween._startTime + curTween.totalDuration() / curTween._timeScale + 0.0000000001 > startTime) if (!((tween._duration === 0 || !curTween._initted) && startTime - curTween._startTime <= 0.0000000002)) {
						overlaps[oCount++] = curTween;
					}
				}
				
				i = oCount;
				while (--i > -1) {
					curTween = overlaps[i];
					if (mode === 2) if (curTween._kill(props, target)) {
						changed = true;
					}
					if (mode !== 2 || (!curTween._firstPT && curTween._initted)) { 
						if (curTween._enabled(false, false)) { //if all property tweens have been overwritten, kill the tween.
							changed = true;
						}
					}
				}
				return changed;
			},
			
			_checkOverlap = function(tween, reference) {
				var tl = tween._timeline, 
					ts = tl._timeScale, 
					t = tween._startTime;
				while (tl._timeline) {
					t += tl._startTime;
					ts *= tl._timeScale;
					if (tl._paused) {
						return -100;
					}
					tl = tl._timeline;
				}
				t /= ts;
				return (t > reference) ? t - reference : (!tween._initted && t - reference < 0.0000000002) ? 0.0000000001 : ((t = t + tween.totalDuration() / tween._timeScale / ts) > reference) ? 0 : t - reference - 0.0000000001;
			};

	
//---- TweenLite instance methods -----------------------------------------------------------------------------

		p._init = function() {
			if (this.vars.startAt) {
				this.vars.startAt.overwrite = 0;
				this.vars.startAt.immediateRender = true;
				TweenLite.to(this.target, 0, this.vars.startAt);
			}
			var i, initPlugins, pt;
			if (this.vars.ease instanceof Ease) {
				this._ease = (this.vars.easeParams instanceof Array) ? this.vars.ease.config.apply(this.vars.ease, this.vars.easeParams) : this.vars.ease;
			} else if (typeof(this.vars.ease) === "function") {
				this._ease = new Ease(this.vars.ease, this.vars.easeParams);
			} else {
				this._ease = TweenLite.defaultEase;
			}
			this._easeType = this._ease._type;
			this._easePower = this._ease._power;
			this._firstPT = null;
			
			if (this._targets) {
				i = this._targets.length;
				while (--i > -1) {
					if ( this._initProps( this._targets[i], (this._propLookup[i] = {}), this._siblings[i], (this._overwrittenProps ? this._overwrittenProps[i] : null)) ) {
						initPlugins = true;
					}
				}
			} else {
				initPlugins = this._initProps(this.target, this._propLookup, this._siblings, this._overwrittenProps);
			}
			
			if (initPlugins) {
				TweenLite._onPluginEvent("_onInitAllProps", this); //reorders the array in order of priority. Uses a static TweenPlugin method in order to minimize file size in TweenLite
			}
			if (this._overwrittenProps) if (this._firstPT == null) if (typeof(this.target) !== "function") { //if all tweening properties have been overwritten, kill the tween. If the target is a function, it's probably a delayedCall so let it live.
				this._enabled(false, false);
			}
			if (this.vars.runBackwards) {
				pt = this._firstPT;
				while (pt) {
					pt.s += pt.c;
					pt.c = -pt.c;
					pt = pt._next;
				}
			}
			this._onUpdate = this.vars.onUpdate;
			this._initted = true;
		};
		
		p._initProps = function(target, propLookup, siblings, overwrittenProps) {
			var p, i, initPlugins, plugin, a, pt;
			if (target == null) {
				return false;
			}
			for (p in this.vars) {
				if (_reservedProps[p]) { 
					if (p === "onStartParams" || p === "onUpdateParams" || p === "onCompleteParams" || p === "onReverseCompleteParams" || p === "onRepeatParams") if ((a = this.vars[p])) {
						i = a.length;
						while (--i > -1) {
							if (a[i] === "{self}") {
								a = this.vars[p] = a.concat(); //copy the array in case the user referenced the same array in multiple tweens/timelines (each {self} should be unique)
								a[i] = this;
							}
						}
					}
					
				} else if (_plugins[p] && (plugin = new _plugins[p]())._onInitTween(target, this.vars[p], this)) {
					
					//t - target 		[object]
					//p - property 		[string]
					//s - start			[number]
					//c - change		[number]
					//f - isFunction	[boolean]
					//n - name			[string]
					//pg - isPlugin 	[boolean]
					//pr - priority		[number]
					this._firstPT = pt = {_next:this._firstPT, t:plugin, p:"setRatio", s:0, c:1, f:true, n:p, pg:true, pr:plugin._priority};
					i = plugin._overwriteProps.length;
					while (--i > -1) {
						propLookup[plugin._overwriteProps[i]] = this._firstPT;
					}
					if (plugin._priority || plugin._onInitAllProps) {
						initPlugins = true;
					}
					if (plugin._onDisable || plugin._onEnable) {
						this._notifyPluginsOfEnabled = true;
					}
					
				} else {
					this._firstPT = propLookup[p] = pt = {_next:this._firstPT, t:target, p:p, f:(typeof(target[p]) === "function"), n:p, pg:false, pr:0};
					pt.s = (!pt.f) ? parseFloat(target[p]) : target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ]();
					pt.c = (typeof(this.vars[p]) === "number") ? this.vars[p] - pt.s : (typeof(this.vars[p]) === "string") ? parseFloat(this.vars[p].split("=").join("")) : 0;
				}
				if (pt) if (pt._next) {
					pt._next._prev = pt;
				}
			}
			
			if (overwrittenProps) if (this._kill(overwrittenProps, target)) { //another tween may have tried to overwrite properties of this tween before init() was called (like if two tweens start at the same time, the one created second will run first)
				return this._initProps(target, propLookup, siblings, overwrittenProps);
			}
			if (this._overwrite > 1) if (this._firstPT) if (siblings.length > 1) if (_applyOverwrite(target, this, propLookup, this._overwrite, siblings)) {
				this._kill(propLookup, target);
				return this._initProps(target, propLookup, siblings, overwrittenProps);
			}
			return initPlugins;
		};
		
		p.render = function(time, suppressEvents, force) {
			var prevTime = this._time,
				isComplete, callback, pt;
			if (time >= this._duration) {
				this._totalTime = this._time = this._duration;
				this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
				if (!this._reversed) {
					isComplete = true;
					callback = "onComplete";
				}
				if (this._duration === 0) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
					if (time === 0 || this._rawPrevTime < 0) if (this._rawPrevTime !== time) {
						force = true;
					}
					this._rawPrevTime = time;
				}
				
			} else if (time <= 0) {
				this._totalTime = this._time = 0;
				this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
				if (prevTime !== 0 || (this._duration === 0 && this._rawPrevTime > 0)) {
					callback = "onReverseComplete";
					isComplete = this._reversed;
				}
				if (time < 0) {
					this._active = false;
					if (this._duration === 0) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
						if (this._rawPrevTime >= 0) {
							force = true;
						}
						this._rawPrevTime = time;
					}
				} else if (!this._initted) { //if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
					force = true;
				}
				
			} else {
				this._totalTime = this._time = time;
				
				if (this._easeType) {
					var r = time / this._duration, type = this._easeType, pow = this._easePower;
					if (type === 1 || (type === 3 && r >= 0.5)) {
						r = 1 - r;
					}
					if (type === 3) {
						r *= 2;
					}
					if (pow === 1) {
						r *= r;
					} else if (pow === 2) {
						r *= r * r;
					} else if (pow === 3) {
						r *= r * r * r;
					} else if (pow === 4) {
						r *= r * r * r * r;
					}
					
					if (type === 1) {
						this.ratio = 1 - r;
					} else if (type === 2) {
						this.ratio = r;
					} else if (time / this._duration < 0.5) {
						this.ratio = r / 2;
					} else {
						this.ratio = 1 - (r / 2);
					}
					
				} else {
					this.ratio = this._ease.getRatio(time / this._duration);
				}
				
			}
			
			if (this._time === prevTime && !force) {
				return;
			} else if (!this._initted) {
				this._init();
				if (!isComplete && this._time) { //_ease is initially set to defaultEase, so now that init() has run, _ease is set properly and we need to recalculate the ratio. Overall this is faster than using conditional logic earlier in the method to avoid having to set ratio twice because we only init() once but renderTime() gets called VERY frequently.
					this.ratio = this._ease.getRatio(this._time / this._duration);
				}
			}
			
			if (!this._active) if (!this._paused) {
				this._active = true;  //so that if the user renders a tween (as opposed to the timeline rendering it), the timeline is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the tween already finished but the user manually re-renders it as halfway done.
			}
			if (prevTime === 0) if (this.vars.onStart) if (this._time !== 0 || this._duration === 0) if (!suppressEvents) {
				this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || _blankArray);
			}
			
			pt = this._firstPT;
			while (pt) {
				if (pt.f) {
					pt.t[pt.p](pt.c * this.ratio + pt.s);
				} else {
					pt.t[pt.p] = pt.c * this.ratio + pt.s;
				}
				pt = pt._next;
			}
			
			
			if (this._onUpdate) if (!suppressEvents) {
				this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || _blankArray);
			}
			
			if (callback) if (!this._gc) { //check _gc because there's a chance that kill() could be called in an onUpdate
				if (isComplete) {
					if (this._timeline.autoRemoveChildren) {
						this._enabled(false, false);
					}
					this._active = false;
				}
				if (!suppressEvents) if (this.vars[callback]) {
					this.vars[callback].apply(this.vars[callback + "Scope"] || this, this.vars[callback + "Params"] || _blankArray);
				}
			}
			
		};
		
		p._kill = function(vars, target) {
			if (vars === "all") {
				vars = null;
			}
			if (vars == null) if (target == null || target == this.target) {
				return this._enabled(false, false);
			}
			target = target || this._targets || this.target;
			var i, overwrittenProps, p, pt, propLookup, changed, killProps, record;
			if ((target instanceof Array || target.jquery) && typeof(target[0]) === "object") { 
				i = target.length;
				while (--i > -1) {
					if (this._kill(vars, target[i])) {
						changed = true;
					}
				}
			} else {
				if (this._targets) {
					i = this._targets.length;
					while (--i > -1) {
						if (target === this._targets[i]) {
							propLookup = this._propLookup[i] || {};
							this._overwrittenProps = this._overwrittenProps || [];
							overwrittenProps = this._overwrittenProps[i] = vars ? this._overwrittenProps[i] || {} : "all";
							break;
						}
					}
				} else if (target !== this.target) {
					return false;
				} else {
					propLookup = this._propLookup;
					overwrittenProps = this._overwrittenProps = vars ? this._overwrittenProps || {} : "all";
				}

				if (propLookup) {
					killProps = vars || propLookup;
					record = (vars != overwrittenProps && overwrittenProps != "all" && vars != propLookup && (vars == null || vars._tempKill != true)); //_tempKill is a super-secret way to delete a particular tweening property but NOT have it remembered as an official overwritten property (like in BezierPlugin)
					for (p in killProps) {
						if ((pt = propLookup[p])) {
							if (pt.pg && pt.t._kill(killProps)) {
								changed = true; //some plugins need to be notified so they can perform cleanup tasks first
							}
							if (!pt.pg || pt.t._overwriteProps.length === 0) {
								if (pt._prev) {
									pt._prev._next = pt._next;
								} else if (pt === this._firstPT) {
									this._firstPT = pt._next;
								}
								if (pt._next) {
									pt._next._prev = pt._prev;
								}
								pt._next = pt._prev = null;
							}
							delete propLookup[p];
						}
						if (record) { 
							overwrittenProps[p] = 1;
						}
					}
				}
			}
			return changed;
		};
	
		p.invalidate = function() {
			if (this._notifyPluginsOfEnabled) {
				TweenLite._onPluginEvent("_onDisable", this);
			}
			this._firstPT = null;
			this._overwrittenProps = null;
			this._onUpdate = null;
			this._initted = this._active = this._notifyPluginsOfEnabled = false;
			this._propLookup = (this._targets) ? {} : [];
			return this;
		};
		
		p._enabled = function(enabled, ignoreTimeline) {
			if (enabled && this._gc) {
				if (this._targets) {
					var i = this._targets.length;
					while (--i > -1) {
						this._siblings[i] = _register(this._targets[i], this, true);
					}
				} else {
					this._siblings = _register(this.target, this, true);
				}
			}
			Animation.prototype._enabled.call(this, enabled, ignoreTimeline);
			if (this._notifyPluginsOfEnabled) if (this._firstPT) {
				return TweenLite._onPluginEvent(((enabled) ? "_onEnable" : "_onDisable"), this);
			}
			return false;
		};
	
	
//----TweenLite static methods -----------------------------------------------------
		
		TweenLite.to = function(target, duration, vars) {
			return new TweenLite(target, duration, vars);
		};
		
		TweenLite.from = function(target, duration, vars) {
			vars.runBackwards = true;
			if (vars.immediateRender != false) {
				vars.immediateRender = true;
			}
			return new TweenLite(target, duration, vars);
		};
		
		TweenLite.fromTo = function(target, duration, fromVars, toVars) {
			toVars.startAt = fromVars;
			if (fromVars.immediateRender) {
				toVars.immediateRender = true;
			}
			return new TweenLite(target, duration, toVars);
		};
		
		TweenLite.delayedCall = function(delay, callback, params, scope, useFrames) {
			return new TweenLite(callback, 0, {delay:delay, onComplete:callback, onCompleteParams:params, onCompleteScope:scope, onReverseComplete:callback, onReverseCompleteParams:params, onReverseCompleteScope:scope, immediateRender:false, useFrames:useFrames, overwrite:0});
		};
		
		TweenLite.set = function(target, vars) {
			return new TweenLite(target, 0, vars);
		};
		
		TweenLite.killTweensOf = TweenLite.killDelayedCallsTo = function(target, vars) {
			var a = TweenLite.getTweensOf(target), 
				i = a.length;
			while (--i > -1) {
				a[i]._kill(vars, target);
			}
		};
		
		TweenLite.getTweensOf = function(target) {
			if (target == null) { return; }
			var i, a, j, t;
			if ((target instanceof Array || target.jquery) && typeof(target[0]) === "object") { 
				i = target.length;
				a = [];
				while (--i > -1) {
					a = a.concat(TweenLite.getTweensOf(target[i]));
				}
				i = a.length;
				//now get rid of any duplicates (tweens of arrays of objects could cause duplicates)
				while (--i > -1) {
					t = a[i];
					j = i;
					while (--j > -1) {
						if (t === a[j]) {
							a.splice(i, 1);
						}
					}
				}
			} else {
				a = _register(target).concat();
				i = a.length;
				while (--i > -1) {
					if (a[i]._gc) {
						a.splice(i, 1);
					}
				}
			}
			return a;
		};
		
		
		
/*
 * ----------------------------------------------------------------
 * TweenPlugin   (could easily be split out as a separate file/class, but included for ease of use (so that people don't need to include another <script> call before loading plugins which is easy to forget)
 * ----------------------------------------------------------------
 */
		var TweenPlugin = _class("plugins.TweenPlugin", function(props, priority) {
					this._overwriteProps = (props || "").split(",");
					this._propName = this._overwriteProps[0];
					this._priority = priority || 0;
				}, true);
		
		p = TweenPlugin.prototype;
		TweenPlugin.version = 12;
		TweenPlugin.API = 2;
		p._firstPT = null;		
			
		p._addTween = function(target, prop, start, end, overwriteProp, round) {
			var c;
			if (end != null && (c = (typeof(end) === "number" || end.charAt(1) !== "=") ? Number(end) - start : Number(end.split("=").join("")))) {
				this._firstPT = {_next:this._firstPT, t:target, p:prop, s:start, c:c, f:(typeof(target[prop]) === "function"), n:overwriteProp || prop, r:round};
				if (this._firstPT._next) {
					this._firstPT._next._prev = this._firstPT;
				}
			}
		}
			
		p.setRatio = function(v) {
			var pt = this._firstPT, 
				val;
			while (pt) {
				val = pt.c * v + pt.s;
				if (pt.r) {
					val = (val + ((val > 0) ? 0.5 : -0.5)) >> 0; //about 4x faster than Math.round()
				}
				if (pt.f) {
					pt.t[pt.p](val);
				} else {
					pt.t[pt.p] = val;
				}
				pt = pt._next;
			}
		}
			
		p._kill = function(lookup) {
			if (lookup[this._propName] != null) {
				this._overwriteProps = [];
			} else {
				var i = this._overwriteProps.length;
				while (--i > -1) {
					if (lookup[this._overwriteProps[i]] != null) {
						this._overwriteProps.splice(i, 1);
					}
				}
			}
			var pt = this._firstPT;
			while (pt) {
				if (lookup[pt.n] != null) {
					if (pt._next) {
						pt._next._prev = pt._prev;
					}
					if (pt._prev) {
						pt._prev._next = pt._next;
						pt._prev = null;
					} else if (this._firstPT === pt) {
						this._firstPT = pt._next;
					}
				}
				pt = pt._next;
			}
			return false;
		}
			
		p._roundProps = function(lookup, value) {
			var pt = this._firstPT;
			while (pt) {
				if (lookup[this._propName] || (pt.n != null && lookup[ pt.n.split(this._propName + "_").join("") ])) { //some properties that are very plugin-specific add a prefix named after the _propName plus an underscore, so we need to ignore that extra stuff here.
					pt.r = value;
				}
				pt = pt._next;
			}
		}
		
		TweenLite._onPluginEvent = function(type, tween) {
			var pt = tween._firstPT, 
				changed;
			if (type === "_onInitAllProps") {
				//sorts the PropTween linked list in order of priority because some plugins need to render earlier/later than others, like MotionBlurPlugin applies its effects after all x/y/alpha tweens have rendered on each frame.
				var pt2, first, last, next;
				while (pt) {
					next = pt._next;
					pt2 = first;
					while (pt2 && pt2.pr > pt.pr) {
						pt2 = pt2._next;
					}
					if ((pt._prev = pt2 ? pt2._prev : last)) {
						pt._prev._next = pt;
					} else {
						first = pt;
					}
					if ((pt._next = pt2)) {
						pt2._prev = pt;
					} else {
						last = pt;
					}
					pt = next;
				}
				pt = tween._firstPT = first;
			}
			while (pt) {
				if (pt.pg) if (typeof(pt.t[type]) === "function") if (pt.t[type]()) {
					changed = true;
				}
				pt = pt._next;
			}
			return changed;
		}
		
		TweenPlugin.activate = function(plugins) {
			var i = plugins.length;
			while (--i > -1) {
				if (plugins[i].API === TweenPlugin.API) {
					TweenLite._plugins[(new plugins[i]())._propName] = plugins[i];
				}
			}
			return true;
		}
		
		
		
		//now run through all the dependencies discovered and if any are missing, log that to the console as a warning. This is why it's best to have TweenLite load last - it can check all the dependencies for you. 
		if ((a = window._gsQueue)) {
			for (i = 0; i < a.length; i++) {
				a[i]();
			}
			for (p in _classLookup) {
				if (!_classLookup[p].def) {
					console.log("Warning: TweenLite encountered missing dependency: com.greensock."+p);
				}
			}
		}
		
	
})(window);/*!
 * VERSION: beta 1.26
 * DATE: 2012-05-24
 * JavaScript (ActionScript 3 and 2 also available)
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * corporate Club GreenSock members, the software agreement that was issued with the corporate 
 * membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
(window._gsQueue || (window._gsQueue = [])).push( function() {

	_gsDefine("easing.Back", ["easing.Ease"], function(Ease) {
		
		var gs = window.com.greensock, 
			_class = gs._class, 
			_create = function(n, f) {
				var c = _class("easing." + n, function(){}, true), 
					p = c.prototype = new Ease();
				p.constructor = c;
				p.getRatio = f;
				return c;
			},
			
			//BACK
			_createBack = function(n, f) {
				var c = _class("easing." + n, function(overshoot) {
						this._p1 = (overshoot || overshoot === 0) ? overshoot : 1.70158;
						this._p2 = this._p1 * 1.525;
					}, true), 
					p = c.prototype = new Ease();
				p.constructor = c;
				p.getRatio = f;
				p.config = function(overshoot) {
					return new c(overshoot);
				};
				return c;
			}, 
			BackOut = _createBack("BackOut", function(p) {
				return ((p = p - 1) * p * ((this._p1 + 1) * p + this._p1) + 1);
			}), 
			BackIn = _createBack("BackIn", function(p) {
				return p * p * ((this._p1 + 1) * p - this._p1);
			}), 
			BackInOut = _createBack("BackInOut", function(p) {
				return ((p *= 2) < 1) ? 0.5 * p * p * ((this._p2 + 1) * p - this._p2) : 0.5 * ((p -= 2) * p * ((this._p2 + 1) * p + this._p2) + 2);
			}),  
			
			//BOUNCE
			BounceOut = _create("BounceOut", function(p) {
				if (p < 1 / 2.75) {
					return 7.5625 * p * p;
				} else if (p < 2 / 2.75) {
					return 7.5625 * (p -= 1.5 / 2.75) * p + .75;
				} else if (p < 2.5 / 2.75) {
					return 7.5625 * (p -= 2.25 / 2.75) * p + .9375;
				} else {
					return 7.5625 * (p -= 2.625 / 2.75) * p + .984375;
				}
			}), 
			BounceIn = _create("BounceIn", function(p) {
				if ((p = 1 - p) < 1 / 2.75) {
					return 1 - (7.5625 * p * p);
				} else if (p < 2 / 2.75) {
					return 1 - (7.5625 * (p -= 1.5 / 2.75) * p + .75);
				} else if (p < 2.5 / 2.75) {
					return 1 - (7.5625 * (p -= 2.25 / 2.75) * p + .9375);
				} else {
					return 1 - (7.5625 * (p -= 2.625 / 2.75) * p + .984375);
				}
			}), 
			BounceInOut = _create("BounceInOut", function(p) {
				var invert = (p < 0.5);
				if (invert) {
					p = 1 - (p * 2);
				} else {
					p = (p * 2) - 1;
				}
				if (p < 1 / 2.75) {
					p = 7.5625 * p * p;
				} else if (p < 2 / 2.75) {
					p = 7.5625 * (p -= 1.5 / 2.75) * p + .75;
				} else if (p < 2.5 / 2.75) {
					p = 7.5625 * (p -= 2.25 / 2.75) * p + .9375;
				} else {
					p = 7.5625 * (p -= 2.625 / 2.75) * p + .984375;
				}
				return invert ? (1 - p) * 0.5 : p * 0.5 + 0.5;
			}),
			
			//CIRC
			CircOut = _create("CircOut", function(p) {
				return Math.sqrt(1 - (p = p - 1) * p);
			}),
			CircIn = _create("CircIn", function(p) {
				return -(Math.sqrt(1 - (p * p)) - 1);
			}),
			CircInOut = _create("CircInOut", function(p) {
				return ((p*=2) < 1) ? -0.5 * (Math.sqrt(1 - p * p) - 1) : 0.5 * (Math.sqrt(1 - (p -= 2) * p) + 1);
			}),
			
			//ELASTIC
			_2PI = Math.PI * 2,
			_createElastic = function(n, f, def) {
				var c = _class("easing." + n, function(amplitude, period) {
						this._p1 = amplitude || 1;
						this._p2 = period || def;
						this._p3 = this._p2 / _2PI * (Math.asin(1 / this._p1) || 0);
					}, true), 
					p = c.prototype = new Ease();
				p.constructor = c;
				p.getRatio = f;
				p.config = function(amplitude, period) {
					return new c(amplitude, period);
				};
				return c;
			}, 
			ElasticOut = _createElastic("ElasticOut", function(p) {
				return this._p1 * Math.pow(2, -10 * p) * Math.sin( (p - this._p3) * _2PI / this._p2 ) + 1;
			}, 0.3), 
			ElasticIn = _createElastic("ElasticIn", function(p) {
				return -(this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin( (p - this._p3) * _2PI / this._p2 ));
			}, 0.3), 
			ElasticInOut = _createElastic("ElasticInOut", function(p) {
				return ((p *= 2) < 1) ? -.5 * (this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin( (p - this._p3) * _2PI / this._p2)) : this._p1 * Math.pow(2, -10 *(p -= 1)) * Math.sin( (p - this._p3) * _2PI / this._p2 ) *.5 + 1;
			}, 0.45),
			
			//Expo
			ExpoOut = _create("ExpoOut", function(p) {
				return 1 - Math.pow(2, -10 * p);
			}),
			ExpoIn = _create("ExpoIn", function(p) {
				return Math.pow(2, 10 * (p - 1)) - 0.001;
			}),
			ExpoInOut = _create("ExpoInOut", function(p) {
				return ((p *= 2) < 1) ? 0.5 * Math.pow(2, 10 * (p - 1)) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
			}), 
			
			//Sine
			_HALF_PI = Math.PI / 2,
			SineOut = _create("SineOut", function(p) {
				return Math.sin(p * _HALF_PI);
			}),
			SineIn = _create("SineIn", function(p) {
				return -Math.cos(p * _HALF_PI) + 1;
			}),
			SineInOut = _create("SineInOut", function(p) {
				return -0.5 * (Math.cos(Math.PI * p) - 1);
			}),
			
			//SlowMo
			SlowMo = _class("easing.SlowMo", function(linearRatio, power, yoyoMode) {
				power = (power || power === 0) ? power : 0.7;
				if (linearRatio == null) {
					linearRatio = 0.7;
				} else if (linearRatio > 1) {
					linearRatio = 1;
				}
				this._p = (linearRatio != 1) ? power : 0;
				this._p1 = (1 - linearRatio) / 2;
				this._p2 = linearRatio;
				this._p3 = this._p1 + this._p2;
				this._calcEnd = (yoyoMode === true);
			}, true),
			p = SlowMo.prototype = new Ease();
			
		p.constructor = SlowMo;
		p.getRatio = function(p) {
			var r = p + (0.5 - p) * this._p;
			if (p < this._p1) {
				return this._calcEnd ? 1 - ((p = 1 - (p / this._p1)) * p) : r - ((p = 1 - (p / this._p1)) * p * p * p * r);
			} else if (p > this._p3) {
				return this._calcEnd ? 1 - (p = (p - this._p3) / this._p1) * p : r + ((p - r) * (p = (p - this._p3) / this._p1) * p * p * p);
			}
			return this._calcEnd ? 1 : r;
		};
		SlowMo.ease = new SlowMo(0.7, 0.7);
		
		p.config = SlowMo.config = function(linearRatio, power, yoyoMode) {
			return new SlowMo(linearRatio, power, yoyoMode);
		};
		
		
		//SteppedEase
		var SteppedEase = _class("easing.SteppedEase", function(steps) {
				steps = steps || 1;
				this._p1 = 1 / steps;
				this._p2 = steps + 1;
			}, true);
		p = SteppedEase.prototype = new Ease();	
		p.constructor = SteppedEase;
		p.getRatio = function(p) {
			if (p < 0) {
				p = 0;
			} else if (p >= 1) {
				p = 0.999999999;
			}
			return ((this._p2 * p) >> 0) * this._p1;
		};
		p.config = SteppedEase.config = function(steps) {
			return new SteppedEase(steps);
		};
		
		
		_class("easing.Bounce", {
				easeOut:new BounceOut(),
				easeIn:new BounceIn(),
				easeInOut:new BounceInOut()
			}, true);
		
		_class("easing.Circ", {
				easeOut:new CircOut(),
				easeIn:new CircIn(),
				easeInOut:new CircInOut()
			}, true);
		
		_class("easing.Elastic", {
				easeOut:new ElasticOut(),
				easeIn:new ElasticIn(),
				easeInOut:new ElasticInOut()
			}, true);
			
		_class("easing.Expo", {
				easeOut:new ExpoOut(),
				easeIn:new ExpoIn(),
				easeInOut:new ExpoInOut()
			}, true);
			
		_class("easing.Sine", {
				easeOut:new SineOut(),
				easeIn:new SineIn(),
				easeInOut:new SineInOut()
			}, true);
		
		
		return {
			easeOut:new BackOut(),
			easeIn:new BackIn(),
			easeInOut:new BackInOut()
		};
		
	}, true);

}); if (window._gsDefine) { _gsQueue.pop()(); }/*!
 * VERSION: beta 1.48
 * DATE: 2012-07-28
 * JavaScript 
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * corporate Club GreenSock members, the software agreement that was issued with the corporate 
 * membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
(window._gsQueue || (window._gsQueue = [])).push( function() {
	
	_gsDefine("plugins.CSSPlugin", ["plugins.TweenPlugin","TweenLite"], function(TweenPlugin, TweenLite) {
		
		"use strict";
		
		var CSSPlugin = function() {
				TweenPlugin.call(this, "css");
				this._overwriteProps.pop();
			},
			p = CSSPlugin.prototype = new TweenPlugin("css");
		
		p.constructor = CSSPlugin;
		CSSPlugin.API = 2;
		CSSPlugin.suffixMap = {top:"px", right:"px", bottom:"px", left:"px", width:"px", height:"px", fontSize:"px", padding:"px", margin:"px"};
			
		//set up some local variables and functions that we can reuse for all tweens - we do this only once and cache things to improve performance
		var _NaNExp = /[^\d\-\.]/g,
			_suffixExp = /(\d|\-|\+|=|#|\.)*/g,
			_numExp = /(\d|\.)+/g,
			_opacityExp = /opacity *= *([^)]*)/,
			_opacityValExp = /opacity:([^;]*)/,
			_capsExp = /([A-Z])/g,
			_camelExp = /-([a-z])/gi,
			_camelFunc = function(s, g) { return g.toUpperCase() },
			_horizExp = /(Left|Right|Width)/i,
			_ieGetMatrixExp = /(M11|M12|M21|M22)=[\d\-\.e]+/gi,
			_ieSetMatrixExp = /progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,
			_DEG2RAD = Math.PI / 180,
			_RAD2DEG = 180 / Math.PI,
			_forcePT = {},
			_tempDiv = document.createElement("div"),
			_autoRound, 
			
			//primarily for older versions of IE
			_supportsOpacity = (function() {
				var d = document.createElement("div"), a;
				d.innerHTML = "<a style='top:1px;opacity:.55;'>a</a>";
				if (!(a = d.getElementsByTagName("a")[0])) {
					return false;
				}
				return /^0.55/.test(a.style.opacity);
			})(),
			
			_ieVers = (function() {
				(/MSIE ([0-9]{1,}[\.0-9]{0,})/).exec(navigator.userAgent);
				return parseFloat( RegExp.$1 );
			})(),
			
			//parses a color (like #9F0, #FF9900, or rgb(255,51,153)) into an array with 3 elements for red, green, and blue. Also handles rgba() values (splits into array of 4 elements of course) 
			_parseColor = function(color) {
				if (!color || color === "") {
					return _colorLookup.black;
				} else if (_colorLookup[color]) {
					return _colorLookup[color];
				} else if (typeof(color) === "number") {
					return [color >> 16, (color >> 8) & 255, color & 255];
				} else if (color.charAt(0) === "#") {
					if (color.length === 4) { //for shorthand like #9F0
						color = "#" + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2) + color.charAt(3) + color.charAt(3);
					}
					color = parseInt(color.substr(1), 16);
					return [color >> 16, (color >> 8) & 255, color & 255];
				} else {
					return color.match(_numExp) || _colorLookup.transparent;
				}
			},
			_getIEOpacity = function(obj) {
				return (_opacityExp.test( ((typeof(obj) === "string") ? obj : (obj.currentStyle ? obj.currentStyle.filter : obj.style.filter) || "") ) ? ( parseFloat( RegExp.$1 ) / 100 ) : 1);
			},
			_getComputedStyle = (document.defaultView) ? document.defaultView.getComputedStyle : function(o,s) {},
			
			//gets an individual style property. cs is for computedStyle (a speed optimization - we don't want to run it more than once if we don't have to). calc forces the returned value to be based on the computedStyle, ignoring anything that's in the element's "style" property (computing normalizes certain things for us)
			_getStyle = function(t, p, cs, calc) { 
				if (!_supportsOpacity && p === "opacity") { //several versions of IE don't use the standard "opacity" property - they use things like filter:alpha(opacity=50), so we parse that here.
					return _getIEOpacity(t);
				} else if (!calc && t.style[p]) {
					return t.style[p];
				} else if ((cs = cs || _getComputedStyle(t, null))) {
					t = cs.getPropertyValue(p.replace(_capsExp, "-$1").toLowerCase());
					return (t || cs.length) ? t : cs[p]; //Opera behaves VERY strangely - length is usually 0 and cs[p] is the only way to get accurate results EXCEPT when checking for -o-transform which only works with cs.getPropertyValue()!
				} else if (t.currentStyle) {
					return t.currentStyle[p];
				}
				return null;
			},
			
			//returns at object containing ALL of the style properties in camel-case and their associated values.
			_getStyles = function(t, cs) {  
				var s = {}, i;
				if ((cs = cs || _getComputedStyle(t, null))) {
					if ((i = cs.length)) {
						while (--i > -1) {
							s[cs[i].replace(_camelExp, _camelFunc)] = cs.getPropertyValue(cs[i]);
						}
					} else { //Opera behaves differently - cs.length is always 0, so we must do a for...in loop.
						for (i in cs) {
							s[i] = cs[i];
						}
					}
				} else if ((cs = t.currentStyle || t.style)) {
					for (i in cs) {
						s[i.replace(_camelExp, _camelFunc)] = cs[i];
					}
				}
				if (!_supportsOpacity) {
					s.opacity = _getIEOpacity(t);
				}
				var tr = _getTransform(t, cs, false);
				s.rotation = tr.rotation * _RAD2DEG;
				s.skewX = tr.skewX * _RAD2DEG;
				s.scaleX = tr.scaleX;
				s.scaleY = tr.scaleY;
				s.x = tr.x;
				s.y = tr.y;
				if (s.filters != null) {
					delete s.filters;
				}
				return s;
			},
			
			//analyzes two style objects (as returned by _getStyles()) and only looks for differences between them that contain tweenable values (like a number or color). It returns an object containing only those isolated properties and values for tweening, and optionally populates an array of those property names too (so that we can loop through them at the end of the tween and remove them for css tweens that apply a className - we don't want the cascading to get messed up)
			_cssDif = function(s1, s2, v, d) { 
				var s = {}, val, p;
				for (p in s2) {
					if (p !== "cssText") if (p !== "length") if (isNaN(p)) if (s1[p] != (val = s2[p])) if (val !== _transformProp) if (typeof(val) === "number" || typeof(val) === "string") {
						s[p] = val;
						if (d) {
							d.props.push(p);
						}
					}
				}
				if (v) {
					for (p in v) { //copy properties (except className)
						if (p !== "className") {
							s[p] = v[p];
						}
					}
				}
				return s;
			},
			_transformMap = {scaleX:1, scaleY:1, x:1, y:1, rotation:1, shortRotation:1, skewX:1, skewY:1, scale:1},
			
			_transformProp, //the Javascript (camelCase) transform property, like msTransform, WebkitTransform, MozTransform, or OTransform.
			_prefix, //camelCase vendor prefix like "O", "ms", "Webkit", or "Moz".
			_prefixCSS = (function() { //the non-camelCase vendor prefix like "-o-", "-moz-", "-ms-", or "-webkit-"
				var d = document.body || document.documentElement,
					cs = _getComputedStyle(d, ""),
					a = ["O","-o-","Moz","-moz-","ms","-ms-","Webkit","-webkit-"],
					i = 9;
				while ((i-=2) > -1 && !_getStyle(d, a[i]+"transform", cs)) { }
				if (i > 0) {
					_transformProp = (_prefix = a[i-1]) + "Transform"; 	
					return a[i];
				}
				return null;
			})(),
			_agent = navigator.userAgent,
			_reqSafariFix = false,
			_isSafari = (_agent.indexOf("Safari") !== -1 && _agent.indexOf("Chrome") === -1 && _agent.indexOf("Android") === -1), //non-Android versions of Safari have a bug that prevents changes to "top" and "left" properties from rendering properly if changed on the same frame as a transform UNLESS we set the element's transform-style to "preserve-3d" (VERY odd, I know).
						
			//parses the transform values for an element, returning an object with x, y, scaleX, scaleY, rotation, skewX, and skewY properties. Note: by default (for performance reasons), all skewing is combined into skewX and rotation but skewY still has a place in the transform object so that we can record how much of the skew is attributed to skewX vs skewY. Remember, a skewY of 10 looks the same as a rotation of 10 and skewX of -10.
			_getTransform = function(t, cs, rec) {
				var tm = t._gsTransform, s;
				if (_transformProp) {
					s = _getStyle(t, _prefixCSS + "transform", cs, true);
				} else if (t.currentStyle) {
					//for older versions of IE, we need to interpret the filter portion that is in the format: progid:DXImageTransform.Microsoft.Matrix(M11=6.123233995736766e-17, M12=-1, M21=1, M22=6.123233995736766e-17, sizingMethod='auto expand') Notice that we need to swap b and c compared to a normal matrix.
					s = t.currentStyle.filter.match(_ieGetMatrixExp);
					s = (s && s.length === 4) ? s[0].substr(4) + "," + Number(s[2].substr(4)) + "," + Number(s[1].substr(4)) + "," + s[3].substr(4) + "," + (tm ? tm.x : 0) + "," + (tm ? tm.y : 0) : null;
				}
				var v = (s || "").replace(/[^\d\-\.e,]/g, "").split(","), 
					k = (v.length >= 6),
					a = k ? Number(v[0]) : 1,
					b = k ? Number(v[1]) : 0,
					c = k ? Number(v[2]) : 0,
					d = k ? Number(v[3]) : 1,
					min = 0.000001,
					m = rec ? tm || {skewY:0} : {skewY:0},
					invX = (m.scaleX < 0); //in order to interpret things properly, we need to know if the user applied a negative scaleX previously so that we can adjust the rotation and skewX accordingly. Otherwise, if we always interpret a flipped matrix as affecting scaleY and the user only wants to tween the scaleX on multiple sequential tweens, it would keep the negative scaleY without that being the user's intent.
				
				m.x = (k ? Number(v[4]) : 0);
				m.y = (k ? Number(v[5]) : 0);
				m.scaleX = Math.sqrt(a * a + b * b);
				m.scaleY = Math.sqrt(d * d + c * c);
				m.rotation = (a || b) ? Math.atan2(b, a) : m.rotation || 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).
				m.skewX = (c || d) ? Math.atan2(c, d) + m.rotation : m.skewX || 0;
				if (Math.abs(m.skewX) > Math.PI / 2) {
					if (invX) {
						m.scaleX *= -1;
						m.skewX += (m.rotation <= 0) ? Math.PI : -Math.PI;
						m.rotation += (m.rotation <= 0) ? Math.PI : -Math.PI;
					} else {
						m.scaleY *= -1;
						m.skewX += (m.skewX <= 0) ? Math.PI : -Math.PI;
					}
				}
				//some browsers have a hard time with very small values like 2.4492935982947064e-16 (notice the "e-" towards the end) and would render the object slightly off. So we round to 0 in these cases. The conditional logic here is faster than calling Math.abs().
				if (m.rotation < min) if (m.rotation > -min) if (a || b) {
					m.rotation = 0;
				}
				if (m.skewX < min) if (m.skewX > -min) if (b || c) {
					m.skewX = 0;
				}
				if (rec) {
					t._gsTransform = m; //record to the object's _gsTransform which we use so that tweens can control individual properties independently (we need all the properties to accurately recompose the matrix in the setRatio() method)
				}
				return m;
			},
			
			_dimensions = {width:["Left","Right"], height:["Top","Bottom"]},
			_margins = ["marginLeft","marginRight","marginTop","marginBottom"], 
			_getDimension = function(n, t, cs) {
				var v = parseFloat((n === "width") ? t.offsetWidth : t.offsetHeight),
					a = _dimensions[n],
					i = a.length, 
					cs = cs || _getComputedStyle(t, null);
				while (--i > -1) {
					v -= parseFloat( _getStyle(t, "padding" + a[i], cs, true) ) || 0;
					v -= parseFloat( _getStyle(t, "border" + a[i] + "Width", cs, true) ) || 0;
				}
				return v;
			},
			
			//pass the target element, the property name, the numeric value, and the suffix (like "%", "em", "px", etc.) and it will spit back the equivalent pixel number
			_convertToPixels = function(t, p, v, sfx, recurse) {
				if (sfx === "px" || !sfx) { return v; }
				if (sfx === "auto" || !v) { return 0; }
				var horiz = _horizExp.test(p),
					node = t,
					neg = (v < 0);
				if (neg) {
					v = -v;
				}
				_tempDiv.style.cssText = "border-style:solid; border-width:0; position:absolute; line-height:0;";
				if (sfx === "%" || sfx === "em" || !node.appendChild) {
					node = t.parentNode || document.body;
					_tempDiv.style[(horiz ? "width" : "height")] = v + sfx;
				} else {
					_tempDiv.style[(horiz ? "borderLeftWidth" : "borderTopWidth")] = v + sfx;
				}
				node.appendChild(_tempDiv);
				var pix = parseFloat(_tempDiv[(horiz ? "offsetWidth" : "offsetHeight")]);
				node.removeChild(_tempDiv);
				if (pix === 0 && !recurse) { //in some browsers (like IE7/8), occasionally the value isn't accurately reported initially, but if we run the function again it will take effect. 
					pix = _convertToPixels(t, p, v, sfx, true);
				}
				return neg ? -pix : pix;
			},
			
			//for parsing things like transformOrigin or backgroundPosition which must recognize keywords like top/left/right/bottom/center as well as percentages and pixel values. Decorates the supplied object with the following properties: "ox" (offsetX), "oy" (offsetY), "oxp" (if true, "ox" is a percentage not a pixel value), and "oxy" (if true, "oy" is a percentage not a pixel value)
			_parsePosition = function(v, o) {
				if (v == null || v === "" || v === "auto") {
					v = "0 0";
				}
				o = o || {};
				var x = (v.indexOf("left") !== -1) ? "0%" : (v.indexOf("right") !== -1) ? "100%" : v.split(" ")[0],
					y = (v.indexOf("top") !== -1) ? "0%" : (v.indexOf("bottom") !== -1) ? "100%" : v.split(" ")[1];
				if (y == null) {
					y = "0";
				} else if (y === "center") {
					y = "50%";
				}
				if (x === "center") {
					x = "50%";
				}
				o.oxp = (x.indexOf("%") !== -1);
				o.oyp = (y.indexOf("%") !== -1);
				o.oxr = (x.charAt(1) === "=");
				o.oyr = (y.charAt(1) === "=");
				o.ox = parseFloat(x.replace(_NaNExp, ""));
				o.oy = parseFloat(y.replace(_NaNExp, ""));
				return o;
			},
			
			//takes a value and a default number, checks if the value is relative, null, or numeric and spits back a normalized number accordingly. Primarily used in the _parseTransform() function.
			_parseVal = function(v, d) {
				return (v == null) ? d : (typeof(v) === "string" && v.indexOf("=") === 1) ? Number(v.split("=").join("")) + d : Number(v);
			},
			
			//translates strings like "40deg" or "40" or 40rad" or "+=40deg" to a numeric radian angle, optionally relative to a default value (if "+=" or "-=" prefix is found)
			_parseAngle = function(v, d) { 
				var m = (v.indexOf("rad") === -1) ? _DEG2RAD : 1, 
					r = (v.indexOf("=") === 1);
				v = Number(v.replace(_NaNExp, "")) * m;
				return r ? v + d : v;
			},
			_colorLookup = {aqua:[0,255,255],
							lime:[0,255,0],
							silver:[192,192,192],
							black:[0,0,0],
							maroon:[128,0,0],
							teal:[0,128,128],
							blue:[0,0,255],
							navy:[0,0,128],
							white:[255,255,255],
							fuchsia:[255,0,255],
							olive:[128,128,0],
							yellow:[255,255,0],
							orange:[255,165,0],
							gray:[128,128,128],
							purple:[128,0,128],
							green:[0,128,0],
							red:[255,0,0],
							pink:[255,192,203],
							cyan:[0,255,255],
							transparent:[255,255,255,0]};
							
		
		//gets called when the tween renders for the first time. This kicks everything off, recording start/end values, etc. 
		p._onInitTween = function(target, value, tween) {
			if (!target.nodeType) { //css is only for dom elements
				return false;
			}
			this._target = target;
			this._tween = tween;
			this._classData = this._transform = null; //_transform is only used for scaleX/scaleY/x/y/rotation/skewX/skewY tweens and _classData is only used if className is defined - this will be an array of properties that we're tweening related to the class which should be removed from the target.style at the END of the tween when the className is populated so that cascading happens properly.
			_autoRound = value.autoRound;
			var s = this._style = target.style, 
				cs = _getComputedStyle(target, ""),
				copy, start, v;
			
			if (_reqSafariFix) if (s.zIndex === "") {
				//corrects a bug in [non-Android] Safari that prevents it from repainting elements in their new positions if they don't have a zIndex set. We also can't just apply this inside _parseTransform() because anything that's moved in any way (like using "left" or "top" instead of transforms like "x" and "y") can be affected, so it is best to ensure that anything that's tweening has a z-index. Setting "WebkitPerspective" to a non-zero value worked too except that on iOS Safari things would flicker randomly. Plus zIndex is less memory-intensive.
				 s.zIndex = 0;
			}
			
			if (typeof(value) === "string") { 
				copy = s.cssText;
				start = _getStyles(target, cs);
				s.cssText = copy + ";" + value;
				v = _cssDif(start, _getStyles(target));
				if (!_supportsOpacity && _opacityValExp.test(value)) {
					val.opacity = parseFloat( RegExp.$1 );
				}
				value = v;
				s.cssText = copy;
			} else if (value.className) {
				copy = target.className;
				this._classData = {b:copy, e:(value.className.charAt(1) !== "=") ? value.className : (value.className.charAt(0) === "+") ? target.className + " " + value.className.substr(2) : target.className.split(value.className.substr(2)).join(""), props:[]}
				if (tween._duration) { //if it's a zero-duration tween, there's no need to tween anything or parse the data. In fact, if we switch classes temporarily (which we must do for proper parsing) and the class has a transition applied, it could cause a quick flash to the end state and back again initially in some browsers.
					start = _getStyles(target, cs);
					target.className = this._classData.e;
					value = _cssDif(start, _getStyles(target), value, this._classData);
					target.className = copy;
				} else {
					value = {};
				}
			}
			this._parseVars(value, target, cs, value.suffixMap || CSSPlugin.suffixMap);
			return true;
		}
		
		//feed a vars object to this function and it will parse through its properties and add PropTweens as necessary. This is split out from the _onInitTween() so that we can recurse if necessary, like "margin" should affect "marginLeft", "marginRight", "marginTop", and "marginBottom".
		p._parseVars = function(vars, t, cs, map) {
			var s = this._style, 
				p, v, pt, beg, clr1, clr2, bsfx, esfx, rel, start, copy, isStr;
			
			for (p in vars) {
				
				v = vars[p];
				
				if (p === "transform" || p === _transformProp) {
					this._parseTransform(t, v, cs, map);
					continue;
				} else if (_transformMap[p] || p === "transformOrigin") {
					this._parseTransform(t, vars, cs, map);
					continue;
				} else if (p === "alpha" || p === "autoAlpha") { //alpha tweens are opacity tweens			
					p = "opacity";
				} else if (p === "margin" || p === "padding") {
					copy = (v + "").split(" ");
					rel = copy.length;
					pt = {};
					pt[p + "Top"] = copy[0];
					pt[p + "Right"] = (rel > 1) ? copy[1] : copy[0];
					pt[p + "Bottom"] = (rel === 4) ? copy[2] : copy[0];
					pt[p + "Left"] = (rel === 4) ? copy[3] : (rel === 2) ? copy[1] : copy[0];
					this._parseVars(pt, t, cs, map);
					continue;
				} else if (p === "backgroundPosition" || p === "backgroundSize") {
					pt = _parsePosition(v); //end values 
					start = _parsePosition( (beg = _getStyle(t, p, cs)) ); //starting values
					this._firstPT = pt = {_next:this._firstPT, t:s, p:p, b:beg, f:false, n:"css_" + p, type:3,
							s:start.ox, //x start
							c:pt.oxr ? pt.ox : pt.ox - start.ox, //change in x
							ys:start.oy, //y start
							yc:pt.oyr ? pt.oy : pt.oy - start.oy, //change in y
							sfx:pt.oxp ? "%" : "px", //x suffix
							ysfx:pt.oyp ? "%" : "px", //y suffix
							r:(!pt.oxp && vars.autoRound !== false)};
					pt.e = (pt.s + pt.c) + pt.sfx + " " + (pt.ys + pt.yc) + pt.ysfx; //we can't just use v because it could contain relative values, like +=50px which is an illegal final value.
					continue;
				} else if (p === "border") {
					copy = (v + "").split(" ");
					this._parseVars({borderWidth:copy[0], borderStyle:copy[1] || "none", borderColor:copy[2] || "#000000"}, t, cs, map);
					continue;
				} else if (p === "bezier") {
					this._parseBezier(v, t, cs, map);
					continue;
				} else if (p === "autoRound") {
					continue;
				}
				
				beg = _getStyle(t, p, cs); 
				beg = (beg != null) ? beg + "" : ""; //make sure beginning value is a string. Don't do beg = _getStyle(...) || "" because if _getStyle() returns 0, it will make it "" since 0 is a "falsey" value.
				
				//Some of these properties are in place in order to conform with the standard PropTweens in TweenPlugins so that overwriting and roundProps occur properly. For example, f and r may seem unnecessary here, but they enable other functionality.
				//_next:*	next linked list node		[object]
				//t: 	*	target 						[object]
				//p:	*	property (camelCase)		[string]
				//s: 	*	starting value				[number]
				//c:	*	change value				[number]
				//f:	* 	is function					[boolean]
				//n:	*	name (for overwriting)		[string]
				//sfx:		suffix						[string]
				//b:		beginning value				[string]
				//i:		intermediate value			[string]
				//e: 		ending value				[string]
				//r:	*	round						[boolean]
				//type:		0=normal, 1=color, 2=rgba, 3=positional offset (like backgroundPosition or backgroundSize), 4=unsupported opacity (ie), -1=non-tweening prop	[number]
				this._firstPT = pt = {_next:this._firstPT, 
					  t:s, 
					  p:p, 
					  b:beg,	 
					  f:false,
					  n:"css_" + p,
					  sfx:"",
					  r:false,
					  type:0};
					  
				//if it's an autoAlpha, add a new PropTween for "visibility". We must make sure the "visibility" PropTween comes BEFORE the "opacity" one in order to work around a bug in old versions of IE tht would ignore "visibility" changes if made right after an alpha change. Remember, we add PropTweens in reverse order - that's why we do this here, after creating the original PropTween.
				if (p === "opacity") if (vars.autoAlpha != null) {
					if (beg === "1") if (_getStyle(t, "visibility", cs) === "hidden") { //if visibility is initially set to "hidden", we should interpret that as intent to make opacity 0.
						beg = pt.b = "0";
					}
					this._firstPT = pt._prev = {_next:pt, t:s, p:"visibility", f:false, n:"css_visibility", r:false, type:-1, b:(Number(beg) !== 0) ? "visible" : "hidden", i:"visible", e:(Number(v) === 0) ? "hidden" : "visible"};
					this._overwriteProps.push("css_visibility");
				}
				
				isStr = (typeof(v) === "string");
									
				//color values must be split apart into their R, G, B (and sometimes alpha) values and tweened independently.
				if (p === "color" || p === "fill" || p === "stroke" || p.indexOf("Color") !== -1 || (isStr && !v.indexOf("rgb("))) { //Opera uses background: to define color sometimes in addition to backgroundColor:
					clr1 = _parseColor(beg);
					clr2 = _parseColor(v);
					pt.e = pt.i = ((clr2.length > 3) ? "rgba(" : "rgb(") + clr2.join(",") + ")"; //don't just do pt.e = v because that won't work if the destination color is numeric, like 0xFF0000. We need to parse it.
					pt.b = ((clr1.length > 3) ? "rgba(" : "rgb(") + clr1.join(",") + ")"; //normalize to rgb in case the beginning value was passed in as numeric, like 0xFF0000
					pt.s = Number(clr1[0]);				//red starting value
					pt.c = Number(clr2[0]) - pt.s;		//red change
					pt.gs = Number(clr1[1]);			//green starting value
					pt.gc = Number(clr2[1]) - pt.gs;	//green change
					pt.bs = Number(clr1[2]);			//blue starting value
					pt.bc = Number(clr2[2]) - pt.bs;	//blue change
					pt.type = 1;
					if (clr1.length > 3 || clr2.length > 3) { //detect an rgba() value
						if (_supportsOpacity) {
							pt.as = (clr1.length < 4) ? 1 : Number(clr1[3]);
							pt.ac = ((clr2.length < 4) ? 1 : Number(clr2[3])) - pt.as;
							pt.type = 2;
						} else if (clr2[3] == 0) { //older versions of IE don't support rgba(), so if the destination alpha is 0, just use "transparent" for the color and make it a non-tweening property
							pt.e = pt.i = "transparent";
							pt.type = -1;
						}
					}
					
				} else {
					
					bsfx = beg.replace(_suffixExp, ""); //beginning suffix
					
					if (beg === "" || beg === "auto") {
						if (p === "width" || p === "height") {
							start = _getDimension(p, t, cs);
							bsfx = "px";
						} else {
							start = (p !== "opacity") ? 0 : 1;
							bsfx = "";
						}
					} else {
						start = (beg.indexOf(" ") === -1) ? parseFloat(beg.replace(_NaNExp, "")) : NaN;
					}
					
					if (isStr) {
						rel = (v.charAt(1) === "=");
						esfx = v.replace(_suffixExp, "");
						v = (v.indexOf(" ") === -1) ? parseFloat(v.replace(_NaNExp, "")) : NaN;
					} else {
						rel = false;
						esfx = "";
					}
					
					if (esfx === "") {
						esfx = map[p] || bsfx; //populate the end suffix, prioritizing the map, then if none is found, use the beginning suffix.
					}
					
					pt.e = (v || v === 0) ? (rel ? v + start : v) + esfx : vars[p]; //ensures that any += or -= prefixes are taken care of. Record the end value before normalizing the suffix because we always want to end the tween on exactly what they intended even if it doesn't match the beginning value's suffix.
					
					//if the beginning/ending suffixes don't match, normalize them...
					if (bsfx !== esfx) if (esfx !== "") if (v || v === 0) if (start || start === 0) { 
						start = _convertToPixels(t, p, start, bsfx);
						if (esfx === "%") {
							start /= _convertToPixels(t, p, 100, "%") / 100;
							if (start > 100) { //extremely rare
								start = 100;
							}
							
						} else if (esfx === "em") {
							start /= _convertToPixels(t, p, 1, "em");
							
						//otherwise convert to pixels.
						} else {
							v = _convertToPixels(t, p, v, esfx);
							esfx = "px"; //we don't use bsfx after this, so we don't need to set it to px too.
						}
						if (rel) if (v || v === 0) {
							pt.e = (v + start) + esfx; //the changes we made affect relative calculations, so adjust the end value here.
						}
					}
					
					if ((start || start === 0) && (v || v === 0) && (pt.c = (rel ? v : v - start))) { //faster than isNaN(). Also, we set pt.c (change) here because if it's 0, we'll just treat it like a non-tweening value. can't do (v !== start) because if it's a relative value and the CHANGE is identical to the START, the condition will fail unnecessarily.
						pt.s = start;
						pt.sfx = esfx;
						if (p === "opacity") {
							if (!_supportsOpacity) {
								pt.type = 4;
								pt.p = "filter";
								pt.b = "alpha(opacity=" + (pt.s * 100) + ")";
								pt.e = "alpha(opacity=" + ((pt.s + pt.c) * 100) + ")";
								pt.dup = (vars.autoAlpha != null); //dup = duplicate the setting of the alpha in order to work around a bug in IE7 and IE8 that prevents changes to "visibility" from taking effect if the filter is changed to a different alpha(opacity) at the same time. Setting it to the SAME value first, then the new value works around the IE7/8 bug.
								this._style.zoom = 1; //helps correct an IE issue.
							}
						} else if (_autoRound !== false && (esfx === "px" || p === "zIndex")) { //always round zIndex, and as long as autoRound isn't false, round pixel values (that improves performance in browsers typically)
							pt.r = true;
						}
					} else {
						pt.type = -1;
						pt.i = (p === "display" && pt.e === "none") ? pt.b : pt.e; //intermediate value is typically the same as the end value except for "display"
						pt.s = pt.c = 0;
					}
					
				}
				
				this._overwriteProps.push("css_" + p);
				if (pt._next) {
					pt._next._prev = pt;
				}
			}
			
		}
		
		
		//compares the beginning x, y, scaleX, scaleY, rotation, and skewX properties with the ending ones and adds PropTweens accordingly wherever necessary. We must tween them individually (rather than just tweening the matrix values) so that elgant overwriting can occur, like if one tween is controlling scaleX, scaleY, and rotation and then another one starts mid-tween that is trying to control the scaleX only - this tween should continue tweening scaleY and rotation.
		p._parseTransform = function(t, v, cs, map) {
			if (this._transform) { return; } //only need to parse the transform once, and only if the browser supports it.
			
			var m1 = this._transform = _getTransform(t, cs, true), 
				s = this._style,
				min = 0.000001,
				m2, skewY, p, pt, copy, orig;
			
			if (typeof(v) === "object") { //for values like scaleX, scaleY, rotation, x, y, skewX, and skewY or transform:{...} (object)

				m2 = {scaleX:_parseVal((v.scaleX != null) ? v.scaleX : v.scale, m1.scaleX),
					  scaleY:_parseVal((v.scaleY != null) ? v.scaleY : v.scale, m1.scaleY),
					  x:_parseVal(v.x, m1.x),
					  y:_parseVal(v.y, m1.y)};
					  
				if (v.shortRotation != null) {
					m2.rotation = (typeof(v.shortRotation) === "number") ? v.shortRotation * _DEG2RAD : _parseAngle(v.shortRotation, m1.rotation);
					var dif = (m2.rotation - m1.rotation) % (Math.PI * 2);
					if (dif !== dif % Math.PI) {
						dif += Math.PI * ((dif < 0) ? 2 : -2);
					}
					m2.rotation = m1.rotation + dif;
					
				} else {
					m2.rotation = (v.rotation == null) ? m1.rotation : (typeof(v.rotation) === "number") ? v.rotation * _DEG2RAD : _parseAngle(v.rotation, m1.rotation);
				}
				m2.skewX = (v.skewX == null) ? m1.skewX : (typeof(v.skewX) === "number") ? v.skewX * _DEG2RAD : _parseAngle(v.skewX, m1.skewX);
				
				//note: for performance reasons, we combine all skewing into the skewX and rotation values, ignoring skewY but we must still record it so that we can discern how much of the overall skew is attributed to skewX vs. skewY. Otherwise, if the skewY would always act relative (tween skewY to 10deg, for example, multiple times and if we always combine things into skewX, we can't remember that skewY was 10 from last time). Remember, a skewY of 10 degrees looks the same as a rotation of 10 degrees plus a skewX of -10 degrees.
				m2.skewY = (v.skewY == null) ? m1.skewY : (typeof(v.skewY) === "number") ? v.skewY * _DEG2RAD : _parseAngle(v.skewY, m1.skewY);
				if ((skewY = m2.skewY - m1.skewY)) {
					m2.skewX += skewY
					m2.rotation += skewY;
				}
				//don't allow rotation/skew values to be a SUPER small decimal because when they're translated back to strings for setting the css property, the browser reports them in a funky way, like 1-e7. Of course we could use toFixed() to resolve that issue but that hurts performance quite a bit with all those function calls on every frame, plus it is virtually impossible to discern values that small visually (nobody will notice changing a rotation of 0.0000001 to 0, so the performance improvement is well worth it).
				if (m2.skewY < min) if (m2.skewY > -min) {
					m2.skewY = 0;
				}
				if (m2.skewX < min) if (m2.skewX > -min) {
					m2.skewX = 0;
				}
				if (m2.rotation < min) if (m2.rotation > -min) {
					m2.rotation = 0;
				}
				
				//if a transformOrigin is defined, handle it here...
				if ((orig = v.transformOrigin) != null) {
					if (_transformProp) {
						p = _transformProp + "Origin";
						this._firstPT = pt = {_next:this._firstPT, t:s, p:p, s:0, c:0, n:p, f:false, r:false, b:s[p], e:orig, i:orig, type:-1, sfx:""};
						if (pt._next) {
							pt._next._prev = pt;
						}
					
					//for older versions of IE (6-8), we need to manually calculate things inside the setRatio() function. We record origin x and y (ox and oy) and whether or not the values are percentages (oxp and oyp). 
					} else {
						_parsePosition(orig, m1);
					}
				}
				
			} else if (typeof(v) === "string" && _transformProp) { //for values like transform:"rotate(60deg) scale(0.5, 0.8)"
				copy = s[_transformProp];
				s[_transformProp] = v;
				m2 = _getTransform(t, null, false);
				s[_transformProp] = copy;
			} else {
				return;
			}
			
			if (!_transformProp) {
				s.zoom = 1; //helps correct an IE issue.
			} else if (_isSafari) {
				_reqSafariFix = true;
				//corrects a bug in [non-Android] Safari that causes it to skip rendering changes to "top" and "left" that are made on the same frame/render as a transform update. It also helps work around bugs in iOS Safari that can prevent it from repainting elements in their new positions. We cannot just check for a Webkit browser because some Android devices like the Atrix don't like this "fix". Setting "WebkitPerspective" to a non-zero value worked too except that on iOS Safari things would flicker randomly.
				if (s.WebkitBackfaceVisibility === "") {
					s.WebkitBackfaceVisibility = "hidden";
				}
				//if zIndex isn't set, iOS Safari doesn't repaint things correctly sometimes (seemingly at random). 
				if (s.zIndex === "") {
					s.zIndex = 0;
				}
			}
			
			for (p in _transformMap) {
				if (m1[p] !== m2[p] || _forcePT[p] != null) if (p !== "shortRotation") if (p !== "scale") {
					this._firstPT = pt = {_next:this._firstPT, t:m1, p:p, s:m1[p], c:m2[p] - m1[p], n:p, f:false, r:false, b:m1[p], e:m2[p], type:0, sfx:0};
					if (pt._next) {
						pt._next._prev = pt;
					}
					this._overwriteProps.push("css_" + p);
				}
			}
		};
		
		p._parseBezier = function(v, t, cs, map) {
			if (!window.com.greensock.plugins.BezierPlugin) {
				console.log("Error: BezierPlugin not loaded.");
				return;
			}
			if (v instanceof Array) {
				v = {values:v};
			}
			var values = v.values || [],
				l = values.length,
				points = [],
				b = this._bezier = {_pt:[]},
				bp = b._proxy = {},
				cnt = 0,
				pcnt = 0,
				lookup = {},
				l2 = l - 1,
				oldForce = _forcePT,
				plugin = b._plugin = new window.com.greensock.plugins.BezierPlugin(),
				p, i, pt, bpt, curPoint, tfm;
			for (i = 0; i < l; i++) {
				curPoint = {};
				this._transform = null; //null each time through, otherwise _parseTransform() will abort
				bpt = this._firstPT;
				this._parseVars((_forcePT = values[i]), t, cs, map);
				
				pt = this._firstPT;
				if (i === 0) {
					tfm = this._transform;
					while (pt !== bpt) {
						bp[pt.p] = pt.s;
						b._pt[pcnt++] = lookup[pt.p] = pt; //don't rely on the linked list because it's possible that one would get removed (like overwritten), and if that was the one that was attached (like via _lastPT property), it would leave them all stranded, so the array would be more reliable here.
						if (pt.type === 1 || pt.type === 2) {
							bp[pt.p+"_g"] = pt.gs;
							bp[pt.p+"_b"] = pt.bs;
							if (pt.type === 2) {
								bp[pt.p+"_a"] = pt.as;
							}
						} else if (pt.type === 3) {
							bp[pt.p+"_y"] = pt.ys;
						}
						pt = pt._next;	
					}
					pt = this._firstPT;
				} else {
					this._firstPT = bpt;
					if (bpt._prev) {
						bpt._prev._next = null;
					}
					bpt._prev = null;
					bpt = null;
				}
				
				while (pt !== bpt) {
					if (lookup[pt.p]) {
						curPoint[pt.p] = pt.s + pt.c;
						if (i === l2) {
							lookup[pt.p].e = pt.e; //record the end value
						}
						if (pt.type === 1 || pt.type === 2) {
							curPoint[pt.p+"_g"] = pt.gs + pt.gc;
							curPoint[pt.p+"_b"] = pt.bs + pt.bc;
							if (pt.type === 2) {
								curPoint[pt.p+"_a"] = pt.as + pt.ac;
							}
						} else if (pt.type === 3) {
							curPoint[pt.p+"_y"] = pt.ys + pt.yc;
						}
						if (i === 0) {
							pt.c = pt.ac = pt.gc = pt.bc = pt.yc = 0; //no change - the BezierPlugin instance will handle that, and we'll set the "s" (start) property of the PropTween in the setRatio() method, just copying it from the _bezierProxy object.
						}
					}
					pt = pt._next;	
				}
				points[cnt++] = curPoint;
			}
			this._transform = tfm;
			_forcePT = oldForce;
			v.values = points;
			if (v.autoRotate === 0) {
				v.autoRotate = true;
			}
			if (v.autoRotate) if (!(v.autoRotate instanceof Array)) {
				i = (v.autoRotate == true) ? 0 : Number(v.autoRotate) * Math.PI / 180;
				v.autoRotate = (points[0].left != null) ? [["left","top","rotation",i,true]] : (points[0].x != null) ? [["x","y","rotation",i,true]] : false;
			}
			if ((b._autoRotate = v.autoRotate)) if (!tfm) {
				this._transform = _getTransform(t, cs, true);
			}
			plugin._onInitTween(bp, v, this._tween);
			v.values = values;
		};
		
		
		
		//gets called every time the tween updates, passing the new ratio (typically a value between 0 and 1, but not always (for example, if an Elastic.easeOut is used, the value can jump above 1 mid-tween). It will always start and 0 and end at 1.
		p.setRatio = function(v) {
			var pt = this._firstPT, 
				bz = this._bezier,
				min = 0.000001, val, i, y;
				
			if (bz) {
				bz._plugin.setRatio(v);
				var bpt = bz._pt,
					bp = bz._proxy;
				i = bpt.length;
				while (--i > -1) {
					pt = bpt[i];
					pt.s = bp[pt.p];
					if (pt.type === 1 || pt.type === 2) {
						pt.gs = bp[pt.p+"_g"];
						pt.bs = bp[pt.p+"_b"];
						if (pt.type === 2) {
							pt.as = bp[pt.p+"_a"];
						}
					} else if (pt.type === 3) {
						pt.ys = bp[pt.p+"_y"];
					}
				}
				if (bz._autoRotate) {
					this._transform.rotation = bp.rotation;
				}
			}
			
			//at the end of the tween, we set the values to exactly what we received in order to make sure non-tweening values (like "position" or "float" or whatever) are set and so that if the beginning/ending suffixes (units) didn't match and we normalized to px, the value that the user passed in is used here. We check to see if the tween is at its beginning in case it's a from() tween in which case the ratio will actually go from 1 to 0 over the course of the tween (backwards). 
			if (v === 1 && (this._tween._time === this._tween._duration || this._tween._time === 0)) {
				while (pt) {
					pt.t[pt.p] = pt.e;
					if (pt.type === 4) if (pt.s + pt.c === 1) { //for older versions of IE that need to use a filter to apply opacity, we should remove the filter if opacity hits 1 in order to improve performance.
						this._style.removeAttribute("filter");
						if (_getStyle(this._target, "filter")) { //if a class is applied that has an alpha filter, it will take effect (we don't want that), so re-apply our alpha filter in that case. We must first remove it and then check.
							pt.t[pt.p] = pt.e;
						}
					}
					pt = pt._next;
				}
			
			} else if (v || !(this._tween._time === this._tween._duration || this._tween._time === 0)) {
				
				while (pt) {
					val = pt.c * v + pt.s;
					if (pt.r) {
						val = (val > 0) ? (val + 0.5) >> 0 : (val - 0.5) >> 0; 
					} else if (val < min) if (val > -min) {
						val = 0;
					}
					if (!pt.type) {
						pt.t[pt.p] = val + pt.sfx;						
					} else if (pt.type === 1) { //rgb()
						pt.t[pt.p] = "rgb(" + (val >> 0) + ", " + ((pt.gs + (v * pt.gc)) >> 0) + ", " + ((pt.bs + (v * pt.bc)) >> 0) + ")";
					} else if (pt.type === 2) { //rgba()
						pt.t[pt.p] = "rgba(" + (val >> 0) + ", " + ((pt.gs + (v * pt.gc)) >> 0) + ", " + ((pt.bs + (v * pt.bc)) >> 0) + ", " + (pt.as + (v * pt.ac)) + ")";
					} else if (pt.type === -1) { //non-tweening
						pt.t[pt.p] = pt.i;
					} else if (pt.type === 3) { //positional property with an x and y, like backgroundPosition or backgroundSize
						y = pt.ys + v * pt.yc;
						if (pt.r) {
							y = (y > 0) ? (y + 0.5) >> 0 : (y - 0.5) >> 0; 
						}
						pt.t[pt.p] = val + pt.sfx + " " + y + pt.ysfx;						
					} else {
						if (pt.dup) {
							pt.t.filter = pt.t.filter || "alpha(opacity=100)"; //works around bug in IE7/8 that prevents changes to "visibility" from being applied propertly if the filter is changed to a different alpha on the same frame.
						}
						if (pt.t.filter.indexOf("opacity") === -1) { //only used if browser doesn't support the standard opacity style property (IE 7 and 8)
							pt.t.filter += " alpha(opacity=" + ((val * 100) >> 0) + ")"; //we round the value because otherwise, bugs in IE7/8 can prevent "visibility" changes from being applied properly.
						} else {
							pt.t.filter = pt.t.filter.replace(_opacityExp, "opacity=" + ((val * 100) >> 0)); //we round the value because otherwise, bugs in IE7/8 can prevent "visibility" changes from being applied properly.
						}
					}
					pt = pt._next;
				}
				
			//if the tween is reversed all the way back to the beginning, we need to restore the original values which may have different units (like % instead of px or em or whatever).
			} else {
				while (pt) {
					pt.t[pt.p] = pt.b;
					if (pt.type === 4) if (pt.s === 1) { //for older versions of IE that need to use a filter to apply opacity, we should remove the filter if opacity hits 1 in order to improve performance. 
						this._style.removeAttribute("filter");
						if (_getStyle(this._target, "filter")) { //if a class is applied that has an alpha filter, it will take effect (we don't want that), so re-apply our alpha filter in that case. We must first remove it and then check.
							pt.t[pt.p] = pt.b;
						}
					}
					pt = pt._next;
				}
			}
			
			//apply transform values like x, y, scaleX, scaleY, rotation, skewX, or skewY. We do these after looping through all the PropTweens because those are where the changes are made to scaleX/scaleY/rotation/skewX/skewY/x/y.
			if (this._transform) {
				pt = this._transform; //to improve speed and reduce size, reuse the pt variable as an alias to the _transform property
				//if there is no rotation or skew, browsers render the transform faster if we just feed it the list of transforms like translate() skewX() scale(), otherwise defining the matrix() values directly is fastest.
				if (_transformProp && !pt.rotation && !pt.skewX) {
					this._style[_transformProp] = ((pt.x || pt.y) ? "translate(" + pt.x + "px," + pt.y + "px) " : "") + ((pt.scaleX !== 1 || pt.scaleY !== 1) ? "scale(" + pt.scaleX + "," + pt.scaleY + ")" : "") || "translate(0px,0px)"; //we need to default to translate(0px,0px) to work around a Chrome bug that rears its ugly head when the transform is set to "".
				} else {
					var ang = _transformProp ? pt.rotation : -pt.rotation, 
						skew = _transformProp ? ang - pt.skewX : ang + pt.skewX,
						a = Math.cos(ang) * pt.scaleX,
						b = Math.sin(ang) * pt.scaleX,
						c = Math.sin(skew) * -pt.scaleY,
						d = Math.cos(skew) * pt.scaleY,
						cs;
					//some browsers have a hard time with very small values like 2.4492935982947064e-16 (notice the "e-" towards the end) and would render the object slightly off. So we round to 0 in these cases. The conditional logic here is faster than calling Math.abs().
					if (a < min) if (a > -min) {
						a = 0;
					}
					if (b < min) if (b > -min) {
						b = 0;
					}
					if (c < min) if (c > -min) {
						c = 0;
					}
					if (d < min) if (d > -min) {
						d = 0;
					}
					if (_transformProp) {
						this._style[_transformProp] = "matrix(" + a + "," + b + "," + c + "," + d + "," + pt.x + "," + pt.y + ")";
						
					//only for older versions of IE (6-8), we use a filter and marginLeft/marginTop to simulate the transform.
					} else if ((cs = this._target.currentStyle)) {
						min = b; //just for swapping the variables an inverting them (reused "min" to avoid creating another variable in memory). IE's filter matrix uses a non-standard matrix configuration (angle goes the opposite way, and b and c are reversed and inverted)
						b = -c;
						c = -min;
						var filters = this._style.filter;
						this._style.filter = ""; //remove filters so that we can accurately measure offsetWidth/offsetHeight
						var w = this._target.offsetWidth,
							h = this._target.offsetHeight,
							clip = (cs.position !== "absolute"),
							m = "progid:DXImageTransform.Microsoft.Matrix(M11=" + a + ", M12=" + b + ", M21=" + c + ", M22=" + d,
							ox = pt.x,
							oy = pt.y,
							dx, dy;
						
						//if transformOrigin is being used, adjust the offset x and y
						if (pt.ox != null) {
							dx = ((pt.oxp) ? w * pt.ox * 0.01 : pt.ox) - w / 2;
							dy = ((pt.oyp) ? h * pt.oy * 0.01 : pt.oy) - h / 2;
							ox = dx - (dx * a + dy * b) + pt.x;
							oy = dy - (dx * c + dy * d) + pt.y;
						}
						
						if (!clip) {
							var mult = (_ieVers < 8) ? 1 : -1, //in Internet Explorer 7 and before, the box model is broken, causing the browser to treat the width/height of the actual rotated filtered image as the width/height of the box itself, but Microsoft corrected that in IE8. We must use a negative offset in IE8 on the right/bottom
								marg, prop, dif;
							dx = pt.ieOffsetX || 0;
							dy = pt.ieOffsetY || 0;
							pt.ieOffsetX = Math.round((w - ((a < 0 ? -a : a) * w + (b < 0 ? -b : b) * h)) / 2 + ox);
							pt.ieOffsetY = Math.round((h - ((d < 0 ? -d : d) * h + (c < 0 ? -c : c) * w)) / 2 + oy);
							for (i = 0; i < 4; i++) {
								prop = _margins[i];
								marg = cs[prop];			
								//we need to get the current margin in case it is being tweened separately (we want to respect that tween's changes)
								val = (marg.indexOf("px") !== -1) ? parseFloat(marg) : _convertToPixels(this._target, prop, parseFloat(marg), marg.replace(_suffixExp, "")) || 0;
								//PREVIOUS code: (didn't take into consideration negative right/bottom margins for broken box model in certain versions of IE or concurrent tweens of the margins): this._style[prop] = Math.round( (val - ((i < 2) ? dx - pt.ieOffsetX : dy - pt.ieOffsetY)) ) + "px";
								if (val !== pt[prop]) {
									dif = (i < 2) ? -pt.ieOffsetX : -pt.ieOffsetY; //if another tween is controlling a margin, we cannot only apply the difference in the ieOffsets, so we essentially zero-out the dx and dy here in that case. We record the margin(s) later so that we can keep comparing them, making this code very flexible.
								} else {
									dif = (i < 2) ? dx - pt.ieOffsetX : dy - pt.ieOffsetY;
								}
								this._style[prop] = (pt[prop] = Math.round( val - dif * ((i === 0 || i === 2) ? 1 : mult) )) + "px";
							}
							m += ", sizingMethod='auto expand')";
						} else {
							dx = (w / 2),
							dy = (h / 2);
							//translate to ensure that transformations occur around the correct origin (default is center).
							m += ", Dx=" + (dx - (dx * a + dy * b) + ox) + ", Dy=" + (dy - (dx * c + dy * d) + oy) + ")";
						}
						
						if (filters.indexOf("progid:DXImageTransform.Microsoft.Matrix(") !== -1) {
							this._style.filter = filters.replace(_ieSetMatrixExp, m);
						} else {
							this._style.filter = filters + " " + m;
						}
	
						//at the end or beginning of the tween, if the matrix is normal (1, 0, 0, 1) and opacity is 100 (or doesn't exist), remove the filter to improve browser performance.
						if (v === 0 || v === 1) if (a === 1) if (b === 0) if (c === 0) if (d === 1) if (!clip || m.indexOf("Dx=0, Dy=0") !== -1) if (!_opacityExp.test(filters) || parseFloat(RegExp.$1) === 100) {
							this._style.removeAttribute("filter");
						}
					}
				}
			}
			
			//if we're adding/changing a class, we should do so at the END of the tween, and drop any of the associated properties that are in the target.style object in order to preserve proper cascading.
			if (this._classData) {
				pt = this._classData; //speeds things up slightly and helps minification
				if (v === 1 && (this._tween._time === this._tween._duration || this._tween._time === 0)) {
					var i = pt.props.length;
					while (--i > -1) {
						this._style[pt.props[i]] = "";
					}
					this._target.className = pt.e;
				} else if (this._target.className !== pt.b) {
					this._target.className = pt.b;
				}
			}
		}
		
		//we need to make sure that if alpha or autoAlpha is killed, opacity is too. And autoAlpha affects the "visibility" property.
		p._kill = function(lookup) {
			var copy = lookup, p;
			if (lookup.autoAlpha || lookup.alpha) {
				copy = {};
				for (p in lookup) { //copy the lookup so that we're not changing the original which may be passed elsewhere.
					copy[p] = lookup[p];
				}
				copy.opacity = 1;
				if (copy.autoAlpha) {
					copy.visibility = 1;
				}
			}
			return TweenPlugin.prototype._kill.call(this, copy);
		}
		
		
		TweenPlugin.activate([CSSPlugin]);
		return CSSPlugin;
		
	}, true);
	
}); if (window._gsDefine) { _gsQueue.pop()(); }var Class = {
	/* @method
	 * @desc call this super class. Provide the object and the function as String.
	 * @return Null
	 * */
	_super : function(obj, name) {
		obj.baseConstructor[name].call(obj);
	},
	/* @method
	 * @desc extends a Class
	 * @return Null
	 * */
	extend : function(newObject, toClone) {
		newObject.prototype = new toClone();
		newObject.prototype.baseConstructor = new toClone();
		return newObject.prototype;
	}
};/* @class Utensil
 * @desc JavaScript Toolkit
 */
window.Utensil = {
	/* @method
	 * @desc create a document element
	 * @return Null
	 */
	createElement : function(value) {
		return document.createElement(value);
	},
	/* @method
	 * @desc Add an element to the body.
	 * @return Null
	 */
	addChild : function(value) {
		document.body.appendChild(value);
	},
	/* @method
	 * @desc will return the width of the window.
	 * @return Number
	 */
	stageWidth : function() {

		return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	},
	/* @method
	 * @desc will return the height of the window.
	 * @return Number
	 */
	stageHeight : function() {
		return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	},
	/* @method
	 * @desc Provide it with an element and it will return the X position.
	 * @return Number
	 */
	getX : function(obj, raw) {
		if(raw) {
			var curleft = 0;
			var curtop = 0;
			if(obj.offsetParent) {
				do {
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;
				} while (obj = obj.offsetParent);
			}
			return curleft;
		}
		return isNaN(parseInt(obj.style.left.replace("px", ""))) ? 0 : parseInt(obj.style.left.replace("px", ""));
	},
	/* @method
	 * @desc Provide it with an element and it will return the Y position.
	 * @return Number
	 */
	getY : function(obj, raw) {
		if(raw) {
			var curtop = 0;
			if(obj.offsetParent)
				while(1) {
					curtop += obj.style.top;
					if(!obj.offsetParent)
						break;
					obj = obj.offsetParent;
				}
			else if(obj.y)
				curtop += obj.y;
			return curtop;
		}
		return isNaN(parseInt(obj.style.top.replace("px", ""))) ? 0 : parseInt(obj.style.top.replace("px", ""));
	},
	/* @method
	 * @desc Provide it with an element and it will return the width.
	 * @return Number
	 */
	getWidth : function(obj) {
		return isNaN(parseInt(obj.style.width.replace("px", ""))) ? 0 : parseInt(obj.style.width.replace("px", ""));
	},
	/* @method
	 * @desc Provide it with an element and it will return the height.
	 * @return Number
	 */
	getHeight : function(obj) {
		return isNaN(parseInt(obj.style.height.replace("px", ""))) ? 0 : parseInt(obj.style.height.replace("px", ""));
	},
	/* @method
	 * @desc Sends out comma delimited alerts.
	 * @return Null
	 */
	trace : function() {
		var toSend = "";
		for(var i in arguments) {
			toSend += arguments[i] + ",";
		}
		alert(toSend);

	},
	/* @method
	 * @desc Resets the element provided.
	 * @return Null
	 */
	resetStyle : function(obj) {
		obj.style.position = "absolute";
		obj.style.margin = "0";
		obj.style.padding = "0";

	},
	/* @method
	 * @desc Provide it with an element and an event to return the mouse X position.
	 * @return Number
	 */
	mouseX : function(elem, e) {
		var x;
		if(e.pageX) {
			x = e.pageX;
		} else {
			x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;

		}
		x -= elem.offsetLeft;
		return x;
	},
	/* @method
	 * @desc Provide it with an element and an event to return the mouse Y position.
	 * @return Number
	 */
	mouseY : function(elem, e) {
		var y;
		if(e.pageY) {
			y = e.pageY;
		} else {
			y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;

		}
		y -= elem.offsetTop;
		return y;
	},
	mouseLeave : function(e) {

		if(!e)
			var e = window.event;
		var tg = (window.event) ? e.srcElement : e.target;
		var reltg = (e.relatedTarget) ? e.relatedTarget : e.toElement;
		while(reltg != tg && reltg.nodeName != 'BODY')
		reltg = reltg.parentNode
		if(reltg == tg)
			return;
		// Mouseout took place when mouse actually left layer
		// Handle event
	},
	/* @method
	 * @desc loads an Image and calls a callback function.
	 * @return Null
	 */
	ImageLoader : function(src, callback) {
		var image = new Image();
		image.onload = function() { callback(image);
		};
		image.src = src;
	},
	/* @method
	 * @desc Send data via POST or GET methods
	 * @return Null
	 */
	postURL : function(path, params, method) {
		method = method || "post";
		// Set method to post by default, if not specified.

		// The rest of this code assumes you are not using a library.
		// It can be made less wordy if you use one.
		var form = document.createElement("form");
		form.setAttribute("method", method);
		form.setAttribute("action", path);

		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", "data");
		hiddenField.setAttribute("value", params);

		form.appendChild(hiddenField);

		document.body.appendChild(form);
		form.submit();
	},
	/* @method
	 * @desc Load a URL/File
	 * @return Null
	 */
	URLLoader : {
		xhttp : "",
		cb : "",
		load : function(url, callback, method, params) {
			this.cb = callback;
			if(window.XMLHttpRequest) {
				this.xhttp = new XMLHttpRequest();
			} else// IE 5/6
			{
				this.xhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}

			if(!method)
				method = "GET";
			if(method == "GET" && params) {
				url += "?" + params;

			}
			var par = this;
			this.xhttp.onreadystatechange = function() {
				par.onStatus()
			};
			this.xhttp.open(method, url, true);
			if(method == "POST") {
				this.xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				this.xhttp.setRequestHeader("Content-length", params.length);
				this.xhttp.setRequestHeader("Connection", "close");
			}
			try {
				this.xhttp.send(params);
			} catch(e) {

			}
		},
		onStatus : function(e) {
			if(this.xhttp.readyState == 4) {
				if(this.xhttp.status == 200 || window.location.href.indexOf("http") == -1) {
					this.cb(this.xhttp.responseText, this.xhttp.responseXML);

				} else {
					//trace("error 1")
				}
			} else {
				//trace("error 2")
			}
		}
	},
	tweener : {
		index : 0,
		rotate : function(props, value) {
			if(Utensil.getTransformProperty() != "ie") {
				props.transform += " rotate(" + value + "deg)";
			}
		},
		scale : function(props, value) {
			if(Utensil.getTransformProperty() != "ie") {
				props.transform += " scale(" + value + ")";
			}
		},
		transition : function(props, prop, value) {
			if(Utensil.getTransformProperty() != "ie") {
				switch(prop) {
					case "left":
						props.transform += " translateX(" + value + ") ";
						break;
					case "top":
						props.transform += " translateY(" + value + ") ";
						break;
					case "rotateY":
						props.transform += " rotateY(" + value + "deg) ";
						props.transition += Utensil.getTransformProperty() + "transform-style: preserve-3d; ";
						break;
					default:
						props.transition += prop + ":" + value + ";";
				}

			}
		},
		tranisitionEndList : {
			'transition' : 'transitionEnd',
			'OTransition' : 'oTransitionEnd',
			'MSTransition' : 'msTransitionEnd',
			'MozTransition' : 'transitionend',
			'WebkitTransition' : 'webkitTransitionEnd'
		},
		TransitionEnd : function() {
			var t;
			var el = document.createElement('fakeelement');
			for(t in this.tranisitionEndList) {
				if(el.style[t] !== undefined) {
					return this.tranisitionEndList[t];
				}
			}
			el = null;
			t = null;
		}
	},
	/* @method
	 * @desc animates an elements property.
	 * @return Null
	 */
	tween : function(obj, duration, args, type, callback, delay) {

		if(this.getTransformProperty() != "ie") {
			if(!duration)
				duration = 1;
			if(!type)
				type = "linear";
			if(!delay) {
				delay = "0s";

			} else {
				delay += "s";
			}
			var props = {
				transform : "",
				transition : "",
				filter : ""

			};
			for(var prop in args) {
				if(this.tweener[prop]) {
					this.tweener[prop](props, args[prop]);
				} else {

					this.tweener.transition(props, prop, args[prop]);

				}
			}

			this.addListener(obj, this.tweener.TransitionEnd(), innerCallback, false);

			var index = this.tweener.index++;
			var style = document.createElement('style');
			style.type = 'text/css';
			style.id = "utensil-animate-" + index;
			style.innerHTML = ".utensil-animate-" + index + "{";

			style.innerHTML += props.transition;
			if(props.transform != "")
				style.innerHTML += this.getTransformProperty() + "transform: " + props.transform + "; ";
			style.innerHTML += this.getTransformProperty() + "transition: all" + " " + duration + "s " + type + " " + delay + "; ";
			style.innerHTML += "}";
			document.getElementsByTagName('head')[0].appendChild(style);
			obj.className += " utensil-animate-" + index;
		} else {
			this.tweenIE(obj, duration, args, type, callback, delay);
			//style.innerHTML += "filter: " + props.filter + "; ";
		}

		function innerCallback() {
			//document.getElementsByTagName('head')[0].removeChild(style);
			//obj.className=obj.className.replace("utensil-animate-" + index,"");
			style = null;
			index = null;
			props = null;
			Utensil.removeListener(obj, Utensil.tweener.TransitionEnd(), innerCallback, false);
			if(callback)
				callback();
		}

	},
	tweenIE : function(obj, duration, args, type, callback, delay) {
	},
	/* @method
	 * @desc Returns the CSS transform prefix
	 * @return String
	 */
	getTransformProperty : function(element) {
		// Note that in some versions of IE9 it is critical that
		// msTransform appear in this list before MozTransform
		var properties = ['transition', 'WebkitTransition', 'msTransition', 'MozTransition', 'OTransition'];
		var p;
		while( p = properties.shift()) {

			if( typeof document.body.style[p] != 'undefined') {
				switch(p) {
					case 'transition':
						p = "";
						break;
					case 'WebkitTransition':
						p = "-webkit-";
						break;
					case 'MozTransition':
						p = "-moz-";
						break;
					case 'OTransition':
						p = "-o-";
						break;
					case 'msTransition':
						p = "-ms-";
						break;
					default:
						p = "ie";
				}
				return p;
			}
		}
		return "ie";
	},
	/* @
	 * @desc Provides detail of the browser.
	 * @return Null
	 */
	Browser : {
		/*
		 * @desc Browser.getInternetExplorerVersion() Gets the IE Version.
		 * @return String
		 */
		getInternetExplorerVersion : function() {
			var rv = -1;
			// Return value assumes failure.
			if(navigator.appName == 'Microsoft Internet Explorer') {
				var ua = navigator.userAgent;
				var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				if(re.exec(ua) != null)
					rv = parseFloat(RegExp.$1);
			}
			return rv;
		},
		/*
		 * @desc Browser.isIE returns true if broswer is IE.
		 * @return Boolean
		 */
		isIE : (navigator.appVersion.indexOf("MSIE") != -1),
		/*
		 * @desc Browser.isIE9() returns true if broswer is IE9.
		 * @return Boolean
		 */
		isIE9 : function() {
			return Utensil.Browser.getInternetExplorerVersion() > 8
		},
		/*
		 * @desc Browser.isMobile returns true if broswer is mobile.
		 * @return Boolean
		 */
		isMobile : (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()))

	},
	/* @method
	 * @desc Provide it an event and it will get the target (cross-broswer).
	 * @return String
	 */
	getTarget : function(event) {
		return (event.currentTarget) ? event.currentTarget : event.srcElement;
	},
	events : {

	},
	/* @method
	 * @desc A Cross Browser event listener.
	 * @return Null
	 */
	addListener : function(obj, event, callback) {
		if(obj.attachEvent) {
			obj.attachEvent("on" + event, callback);
		} else {
			obj.addEventListener(event, callback);
		}
	},
	/* @method
	 * @desc A Cross Browser remove event listener.
	 * @return Null
	 */
	removeListener : function(obj, event, callback) {
		if(obj.detachEvent) {
			obj.detachEvent("on" + event, callback);
		} else {
			obj.removeEventListener(event, callback);
		}
	},
	/* @method
	 * @desc Add packages to the Utensil framework.
	 * @return Null
	 */
	addPackage : function(packages, packageName) {
		var parent = this;
		if(packageName && !this[packageName]) {
			this[packageName] = {};
			parent = this[packageName];
		}
		for(var keys in packages) {
			var obj = packages[keys];
			parent[keys] = obj;
		}
	}
};
var Event = {
	COMPLETE : "EVENT_COMPLETE",
	PROGRESS : "EVENT_PROGRESS",
	/*
	 * event handlers
	 */
	addListener : function(obj, type, callback, scope) {
		var args = [];
		var numOfArgs = arguments.length;
		for(var i = 0; i < numOfArgs; i++) {
			args.push(arguments[i]);
		}
		args = args.length > 3 ? args.splice(3, args.length - 1) : [];
		if(!obj.listeners)
			obj.listeners = {};
		if( typeof obj.listeners[type] != "undefined") {
			obj.listeners[type].push({
				scope : scope,
				callback : callback,
				args : args
			});
		} else {
			obj.listeners[type] = [{
				scope : scope,
				callback : callback,
				args : args
			}];
		}
	},
	removeListener : function(obj, type, callback, scope) {
		if( typeof obj.listeners[type] != "undefined") {
			var numOfCallbacks = obj.listeners[type].length;
			var newArray = [];
			for(var i = 0; i < numOfCallbacks; i++) {
				var listener = obj.listeners[type][i];
				if(listener.scope == scope && listener.callback == callback) {

				} else {
					newArray.push(listener);
				}
			}
			obj.listeners[type] = newArray;
		}
	},
	dispatch : function(obj, type, target) {
		var numOfListeners = 0;
		var event = {
			type : type,
			target : target
		};
		var args = [];
		var numOfArgs = arguments.length;
		for(var i = 0; i < numOfArgs; i++) {
			args.push(arguments[i]);
		};
		args = args.length > 2 ? args.splice(2, args.length - 1) : [];
		args = [event].concat(args);
		if(obj && obj.listeners && typeof obj.listeners[type] != "undefined") {
			var numOfCallbacks = obj.listeners[type].length;
			for(var i = 0; i < numOfCallbacks; i++) {
				var listener = obj.listeners[type][i];
				if(listener && listener.callback) {
					listener.args = args.concat(listener.args);
					listener.callback.apply(listener.scope, listener.args);
					numOfListeners += 1;
				}
			}
		}
	}
};
var ResourceManager = {
	assetJson : [],
	assets : null,
	copyUrl : null,
	copy : null,
	currentIndex : 0,
	currentAsset : null,
	images : [],
	totalAssets : 0,
	preloadImages : true,
	addAssets : function(value) {
		/*
		 * store assets objects into an array
		 */

		this.assetJson.push(value);
	},
	addCopy : function(value) {
		/*
		 * store assets objects into an array
		 */
		if( typeof (value) == "string") {
			this.copyUrl = value;
		} else {
			this.copy = value;
		}
	},
	mergeObjects : function() {
		this.assets = {};
		for(var a = 0; a < this.assetJson.length; a++) {
			for(prop in this.assetJson[a]) {
				this.assets[prop] = this.assetJson[a][prop];
			}
		}
		this.assetJson = null;
	},
	init : function() {
		this.currentIndex = 0;
		this.checkAssetJson(this.currentIndex);
	},
	checkAssetJson : function(index) {

		if(this.assetJson[index]) {
			this.currentIndex = index;
			if( typeof (this.assetJson[index]) == "string") {
				Utensil.URLLoader.load(this.assetJson[index], this.onAssetLoaded);
			} else {
				this.onAssetLoaded();
			}
		} else {
			this.assetsInitialised();
		}

	},
	assetsInitialised : function() {
		this.currentIndex = 0;
		this.mergeObjects();
		this.loadAsset();
	},
	loadAsset : function() {

		if(this.assets) {
			var index = 0;
			for(var prop in this.assets) {
				if(index == this.currentIndex) {
					this.currentAsset = this.assets[prop];
					this.currentAsset.name = prop;
				}
				index++;
			}
			this.totalAssets = index;

			var par = this;

			if(this.currentAsset != null && this.currentAsset.path != null) {
				this.currentIndex++;
				var suffixAr = this.currentAsset.path.split(".");
				var suffix = suffixAr[suffixAr.length - 1];
				var isImage = (suffix.toLowerCase().indexOf("jpg") >= 0 || suffix.toLowerCase().indexOf("jpeg") >= 0 || suffix.toLowerCase().indexOf("png") >= 0 || suffix.toLowerCase().indexOf("gif") >= 0);
				if(this.preloadImages == true && isImage) {

					var img = new Image();
					this.images[this.currentAsset.name] = img;
					Utensil.addListener(img, "load", function() {
						par.onAssetComplete();
					});
					img.src = this.currentAsset.path;
				} else {
					par.onAssetComplete();
				}
			}
		}
	},
	onAssetComplete : function(event) {

		this.currentAsset = null;
		if(this.currentIndex >= this.totalAssets) {
			this.currentIndex = 0;
			if(this.copyUrl) {
				Utensil.URLLoader.load(this.copyUrl, this.onCopyLoaded);
			} else {
				Event.dispatch(this, Event.COMPLETE);
			}
		} else {
			this.loadAsset();
		}
	},
	onAssetLoaded : function(t, x) {
		if(t)
			ResourceManager.assetJson[ResourceManager.currentIndex] = eval("(" + t + ')');
		ResourceManager.currentIndex++;
		ResourceManager.checkAssetJson(ResourceManager.currentIndex);
	},
	onCopyLoaded : function(t, x) {

		ResourceManager.copy = eval("(" + t + ')');
		Event.dispatch(ResourceManager, Event.COMPLETE);
	},
	getAssetByName : function(value) {
		for(var prop in this.assets) {
			if(prop == value) {
				var asset = this.assets[prop];
				var suffix = asset.path.split(".")[1];
				var isImage = (suffix.toLowerCase().indexOf("jpg") >= 0 || suffix.toLowerCase().indexOf("jpeg") >= 0 || suffix.toLowerCase().indexOf("png") >= 0 || suffix.toLowerCase().indexOf("gif") >= 0);
				if(this.preloadImages == true && isImage) {
					var img = this.images[asset.name];
					return img;
				} else {
					return asset;
				}
			}
		}
		return null;
	},
	getCopyByID : function(value) {
		if(this.copy[value])
			return this.copy[value];
	}
};
var Layout = function() {
};

Layout.prototype = {
	verticalGap : 0,
	horizontalGap : 0,
	left : 0,
	top : 0,
	bottom : 0,
	right : 0,
	arrange : function(obj) {
	}
};

var VerticalLayout = function() {
	this.arrange = function(e) {
		var obj = e.childContainer;
		var currentY = 0;
		for(var count = 0; count < obj.childNodes.length; count++) {
			var child = obj.childNodes[count];
			child.style.top = currentY + "px";
			var h = child.clientHeight;
			if(h == 0)
				h = child.style.height.replace("px", "");
			currentY += parseInt(h) + this.verticalGap;
		}
	}
};
Class.extend(VerticalLayout, Layout);

var HorizontalLayout = function() {
	this.arrange = function(e) {
		var obj = e.childContainer;
		var currentX = 0;
		for(var count = 0; count < obj.childNodes.length; count++) {
			var child = obj.childNodes[count];
			child.style.left = currentX + "px";
			var w = child.clientWidth;
			if(w == 0)
				w = child.style.width.replace("px", "");
			currentX += parseInt(w) + this.horizontalGap;
		}
	}
};
Class.extend(HorizontalLayout, Layout);

var PaddedLayout = function() {
	this.arrange = function(e) {
		var obj = e.childContainer;
		for(var count = 0; count < obj.childNodes.length; count++) {
			var child = obj.childNodes[count];
			var x = parseInt(child.style.left.replace("px", "") ? child.style.left.replace("px", "") : 0);
			var y = parseInt(child.style.top.replace("px", "") ? child.style.top.replace("px", "") : 0);
			child.style.top = parseInt(y + this.top) + "px";
			child.style.left = parseInt(x + this.left) + "px";

		}
	}
};
Class.extend(PaddedLayout, Layout);
var GridLayout = function() {
	this.arrange = function(e) {
		var obj = e.wrapper ? e.wrapper : e.childContainer;
		var currentX = this.left;
		var currentY = this.top;
		var col = 0;
		var row = 0;
		var maxWidth = parseInt(e.width() - this.right);
		this.clearGrid(obj);
		for(var count = 0; count < obj.childNodes.length; count++) {
			var child = obj.childNodes[count];
			if(child.className.indexOf("scroll") < 0 && child.className.indexOf("mcontentwrapper") < 0) {

				var x = parseInt(child.style.left.replace("px", "") ? child.style.left.replace("px", "") : 0);
				var y = parseInt(child.style.top.replace("px", "") ? child.style.top.replace("px", "") : 0);

				if(count > 0) {

					if(currentX + parseInt(child.clientWidth) >= maxWidth) {
						row++;
						col = 0;
						currentX = this.left;
					}
				}
				if(row > 0) {
					var data = this.getChildHeight(obj, row - 1, col);
					;
					currentY = parseInt(data.y) + parseInt(data.height) + parseInt(this.verticalGap);
				}
				child.style.top = parseInt(currentY) + "px";
				child.style.left = parseInt(currentX) + "px";
				child.setAttribute("gridCol", col);
				child.setAttribute("gridRow", row);
				currentX += parseInt(child.clientWidth) + parseInt(this.horizontalGap);
				col++;
			}
		}
	}
	this.getChildHeight = function(obj, r, c) {
		for(var count = 0; count < obj.childNodes.length; count++) {
			var child = obj.childNodes[count];
			if(parseInt(child.getAttribute("gridCol")) == c && parseInt(child.getAttribute("gridRow")) == r) {
				return {
					height : child.clientHeight,
					y : parseInt(child.style.top.replace("px", "") ? child.style.top.replace("px", "") : 0)
				};
			}
		}
	}
	this.clearGrid = function(obj) {
		for(var count = 0; count < obj.childNodes.length; count++) {
			var child = obj.childNodes[count];
			child.setAttribute("gridCol", "");
			child.setAttribute("gridRow", "");
		}
	}
};
Class.extend(GridLayout, Layout);
var ScrollLayout = function() {

	this.arrange = function(e) {
		if(!window.scrollerIndex)
			window.scrollerIndex = 0;

		if(!this.trackId)
			this.trackId += window.scrollerInde;
		if(!this.holderId)
			this.holderId += window.scrollerInde;
		if(!this.thumbId)
			this.thumbId += window.scrollerInde;
		if(!this.thumbId)
			window.scrollerIndex++;

		this.e = e;
		var c = e.childContainer;
		e.height(this.scrollHeight);
		this.maxHeight = e.childContainer.clientHeight;
		//
		for(var count = 0; count < e.childContainer.childNodes.length; count++) {
			var child = e.childContainer.childNodes[count];
			var y = child.style.top ? child.style.top.replace("px", "") : 0;
			var h = child.clientHeight;

			var max = parseInt(y) + parseInt(h);
			if(max > this.maxHeight) {
				this.maxHeight = max;
			}

		}
		if(this.maxHeight > this.scrollHeight) {
			this.childHeight(e.childContainer, this.maxHeight);
			this.removeScroller();
			this.createScrollbar(e);
		} else {
			
			this.removeScroller();
		}
	}
	this.createScrollbar = function(e) {
		if(!e)return;
		var c = e.childContainer;
		if(!this.holder) {
			this.holder = document.createElement("div");
			this.holder.id = this.holderId;
			this.holder.style.overflow = "hidden";
			this.holder.style.position = "relative";
			//this.resetStyle(this.holder);
			this.childHeight(this.holder, this.scrollHeight);
			e.display.removeChild(c);
			this.holder.appendChild(c);
			e.display.appendChild(this.holder);
		}
		if(!this.track) {
			this.track = document.createElement("div");
			this.track.id = this.trackId;
			this.resetStyle(this.track);
			this.track.className = this.trackStyle;
			this.childHeight(this.track, this.scrollHeight);
			e.addUIChild(this.track);
			this.childX(this.track, parseInt(e.width()));
			this.childWidth(c, parseInt(e.width()) - ( parseInt(this.horizontalGap)));
			this.childWidth(this.holder, parseInt(e.width()) - (parseInt(this.horizontalGap)));

		}
		if(!this.thumb) {
			this.thumb = document.createElement("div");
			this.thumb.id = this.thumbId;
			this.resetStyle(this.thumb);
			this.thumb.className = this.thumbStyle;
			this.thumb.style.cursor = "pointer";
			var thumbHeight = this.scrollHeight / this.maxHeight;
			this.childHeight(this.thumb, thumbHeight * this.scrollHeight);
			this.track.appendChild(this.thumb);

			var root = this;
			this.onMouseDownHandler = function(e) {
				root.onMouseDown(e);
			}
			this.onScrollWheelHandler = function(e) {
				root.onScrollWheel(e);
			}
			Utensil.addListener(this.thumb, "mousedown", this.onMouseDownHandler);
			this.addEvent(e.display, "mousewheel", this.onScrollWheelHandler);
		}
	}
	this.removeScroller = function() {
		var c = this.e.childContainer;

		if(this.track) {
			if(document.getElementById(this.trackId))
				document.getElementById(this.trackId).parentNode.removeChild(this.track);
			this.track = null;

		}
		if(this.thumb) {
			if(document.getElementById(this.thumbId))
				document.getElementById(this.trackId).parentNode.removeChild(this.thumb);
			Utensil.removeListener(this.thumb, "mousedown", this.onMouseDownHandler);
			this.thumb = null;

			if(this.holder) {
				if(document.getElementById(this.holderId)) {
					this.e.display.removeChild(this.holder);
					this.holder.removeChild(c);
				}
				this.e.display.appendChild(c);
				this.holder = null;
			}

			this.removeEvent(this.e.display, "mousewheel", this.onScrollWheelHandler);
		}
		this.reset();
	}
	this.reset = function() {
		this.e.childContainer.style.top = "0px";
	}
	this.onScrollWheel = function(e) {
		e = e ? e : window.event;
		var wheelData = e.detail ? e.detail * -1 : e.wheelDelta / 40;
		this.startY = (parseInt(this.childY(this.thumb)) + Number(wheelData));
		this.onMouseMove(e, parseInt(this.childY(this.thumb)) - Number(wheelData));
	}
	this.onMouseDown = function(e) {
		this.startX = Utensil.mouseX(document.body, e);
		this.startY = Utensil.mouseY(document.body, e) - this.childY(this.thumb);
		var root = this;
		this.onMouseMoveHandler = function(e) {
			root.onMouseMove(e);
		}
		this.onMouseUpHandler = function(e) {
			root.onMouseUp(e);
		}
		Utensil.addListener(document.body, "mousemove", this.onMouseMoveHandler);
		Utensil.addListener(document.body, "mouseup", this.onMouseUpHandler);
		if(e && e.preventDefault) {
			e.preventDefault();
		} else {
			window.event.returnValue = false;
		}
		return false;
	}
	this.onMouseMove = function(e, data) {
		var y = data != undefined ? data : (Utensil.mouseY(document.body, e) - this.startY);
		var p = 0;
		if(y <= 0)
			y = 0;

		if(Number(y) + parseInt(this.thumb.clientHeight) >= this.scrollHeight) {
			y = this.scrollHeight - parseInt(this.thumb.clientHeight);
			p = this.paddingBottom;

		}

		this.childY(this.thumb, y);
		var thumbHeight = this.maxHeight / this.scrollHeight;
		this.e.childContainer.style.top = -(parseInt(this.childY(this.thumb) * thumbHeight) + p) + "px";
		if(e && e.preventDefault) {
			e.preventDefault();
		} else {
			window.event.returnValue = false;
		}
		return false;
	}
	this.onMouseUp = function(e) {
		Utensil.removeListener(document.body, "mousemove", this.onMouseMoveHandler);
		Utensil.removeListener(document.body, "mouseup", this.onMouseUpHandler);
	}
	this.childX = function(div, xx) {
		if(xx == undefined) {
			return div.style.left ? div.style.left.replace("px", "") : 0;
		} else {
			div.style.left = xx + "px";
		}
	};
	this.childY = function(div, y) {
		if(y == undefined) {
			return div.style.top ? div.style.top.replace("px", "") : 0;
		} else {
			div.style.top = y + "px";
		}
	};
	this.childWidth = function(div, value) {
		if(value == undefined) {
			return div.style.width ? div.style.width.replace("px", "") : 0;
		} else {
			div.style.width = value + "px";
		}
	};
	this.childHeight = function(div, value) {
		if(value == undefined) {
			return div.style.height ? div.style.height.replace("px", "") : 0;
		} else {
			div.style.height = value + "px";
		}
	}
	this.resetStyle = function(elem) {
		elem.style.position = "absolute";
		elem.style.top = "0px";
	}
	this.addEvent = function(element, eventName, callback) {
		if( typeof (element) == "string")
			element = document.getElementById(element);
		if(element == null)
			return;
		if(element.addEventListener) {
			if(eventName == 'mousewheel')
				element.addEventListener('DOMMouseScroll', callback, false);
			element.addEventListener(eventName, callback, false);
		} else if(element.attachEvent)
			element.attachEvent("on" + eventName, callback);
	}
	this.removeEvent = function(element, eventName, callback) {
		if( typeof (element) == "string")
			element = document.getElementById(element);
		if(element == null)
			return;
		if(element.removeEventListener) {
			if(eventName == 'mousewheel')
				element.removeEventListener('DOMMouseScroll', callback, false);
			element.addEventListener(eventName, callback, false);
		} else if(element.detachEvent)
			element.detachEvent("on" + eventName, callback);
	}
};
Class.extend(ScrollLayout, Layout);
var _ = ScrollLayout.prototype;
_.track;
_.thumb;
_.holder;
_.scrollHeight = 10;
_.paddingBottom = 10;
_.trackStyle = "scrollTrack";
_.thumbStyle = "scrollThumb";
_.holderId = "scrollHolder";
_.trackId = "scrollTrack";
_.thumbId = "scrollThumb";
_.e;
_.startX;
_.startY;
_.maxHeight = 0;
var DisplayObject = function() {
	/*
	 * local variables
	 */
	this.display = null;
	this.elemName = "div";
};
/*
 * public variables
 */
DisplayObject.prototype = {
	/*
	 * holds the style properties if the display doesn't exist
	 */
	props : {},
	/*
	 * add the default styles
	 */
	style : function(display) {
		display.style.position = "absolute";
	},
	/*
	 *  this function sets the display and its styles
	 */
	init : function() {

		var d = document.createElement(this.elemName);
		this.display = d;
		for(prop in this.props) {
			this.styleProp(prop, this.props[prop].value, this.props[prop].suffix);
		}
		this.style(d);
	},
	/*
	 *  a helper method to update and retrieve a style value
	 */
	styleProp : function(prop, value, suffix) {
		if(!this.display) {
			this.props[prop] = {
				value : value,
				suffix : suffix
			};
			return value;
		}
		if(value != undefined) {
			this.display.style[prop] = value + ( suffix ? suffix : "");
		} else {
			return this.display.style[prop] ? this.display.style[prop].replace("px", "") : "";
		}
	},
	className : function(value) {
		if(value != undefined) {
			this.display.className = value;
		} else {
			return this.display.className;
		}
	},
	x : function(value) {
		return Number(this.styleProp("left", value, "px"));
	},
	y : function(value) {
		return Number(this.styleProp("top", value, "px"));
	},
	width : function(value) {
		return Number(this.styleProp("width", value, "px"));
	},
	height : function(value) {
		var h = 0;
		if(this.display)
			h = this.display.clientHeight;
		return Number(this.styleProp("height", value, "px") != "" ? this.styleProp("height", value, "px") : h);
	},
	visible : function(value) {
		if(value != undefined) {value == true ? value = "visible" : value = "hidden";
			this.styleProp("visibility ", value);
		} else {
			return this.styleProp("visibility ", value) == "visible" ? true : false;

		}
	},
	alpha : function(value) {
		if(value != undefined) {
			this.props.alpha = value;
			if(this.display) {
				this.display.style["opacity"] = value;
				this.display.style["-khtml-opacity"] = value;
				this.display.style["-moz-opacity"] = value;
				this.display.style["filter"] = "alpha(opacity=" + (value * 100) + ")";
				this.display.style["-ms-filter"] = "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + (value * 100) + ")";
			}
		} else {
			return this.props.alpha == undefined ? 1 : this.props.alpha;
		}
	},
	buttonMode : function(value) {
		if(value == true) {
			this.display.style.cursor = "pointer";
		} else {
			this.display.style.cursor = "auto";
		}
	}
};
var UIElement = function() {
	
};
(function() {
	/*
	 * local variables
	 */
	var _ = Class.extend(UIElement, DisplayObject);
	/*
	 * public functions
	 */
	_.layoutCollection = null;
	_.childContainer = null;
	_.state = "";
	_.build = function() {
		/*
		 * build code
		 */
		Class._super(this, "init");
		var c = document.createElement("div");
		this.childContainer = c;
		this.display.appendChild(c);
		this.styleChildContainer();
	}
	_.styleChildContainer = function() {
		this.childContainer.style.position = "relative";
		this.childContainer.style.display = "block";
	}
	_.addChild = function(value) {
		this.childContainer.appendChild(value.display ? value.display : value);
	}
	_.removeChild = function(value) {
		this.childContainer.removeChild(value.display ? value.display : value);
	}
	_.addUIChild = function(value) {
		this.display.appendChild(value.display ? value.display : value);
	}
	_.removeUIChild = function(value) {
		if(!value)return;
		
		this.display.removeChild(value.display ? value.display : value);
	}
	_.layout = function(value) {
		if(!this.layoutCollection)this.layoutCollection=[];
		if(value != undefined) {
			this.layoutCollection.push(value);
		} else {
			return this.layoutCollection[this.layoutCollection.length - 1];
		}
	}
	_.setStyle = function() {

	}
	_.arrange = function() {
		if(!this.layoutCollection)return;
		for(var a = 0; a < this.layoutCollection.length; a++) {
			this.layoutCollection[a].arrange(this);
		}
	}
	_.bareWidth = function() {
		return this.childContainer.clientWidth;
	}
	_.bareHeight = function() {
		return this.childContainer.clientHeight;
	}
})();
var Label = function() {
	this.field
	this.text = function(value) {
		if(!this.field) {
			this.field = document.createElement("div");
			this.field.style.position = "relative";
			this.addChild(this.field);
		}
		if(value != undefined) {
			this.field.innerHTML = value;
		} else {
			return this.field.innerHTML;
		}
	}
};
(function() {
	/*
	 * local variables
	 */
	var _ = Class.extend(Label, UIElement);
	/*
	 * public functions
	 */

})();

var Button = function() {

}; (function() {
	/*
	 * local variables
	 */
	var _ = Class.extend(Button, UIElement);
	/*
	 * public functions
	 */
	_.bgImage = null;
	_.buttonMouseOver = null;
	_.buttonMouseOut = null;
	_.buttonMouseClick = null;
	_.labelClassName = function(value) {
		this.label.className(value);
	}
	_.label = null;
	_.build = function() {
		/*
		 * build code
		 */
		Class._super(this, "build");

		this.label = new Label();
		this.label.build();

		this.label.text("");
		this.addChild(this.label);
		this.disableSelection(this.label.display);
	}
	_.setStyle = function() {
		Class._super(this, "setStyle");
		this.label.width(this.width());
		if(!this.labelClassName) {
			this.label.display.style.textAlign = "center";
		}
	}
	_.asset = function(value) {
		if(value) {
			this.bgImage = new Image();
			this.bgImage.src = typeof (value) == "object" ? value.src : value;
			this.display.style.backgroundImage = "url(" + this.bgImage.src + ")";

		}
	}
	_.text = function(value) {
		if(value != undefined) {
			this.label.display.innerHTML = value;
		} else {
			return this.label.displayinnerHTML;
		}
	}
	_.activate = function() {
		this.display.style.cursor = "pointer";
		var par = this;
		this.buttonMouseOver = function(event) {
			par.onMouseOver(event)
		};
		this.buttonMouseOut = function(event) {
			par.onMouseOut(event)
		};
		this.buttonMouseClick = function(event) {
			par.onMouseClick(event)
		};
		Utensil.addListener(this.display, "mouseover", this.buttonMouseOver);
		Utensil.addListener(this.display, "mouseout", this.buttonMouseOut);
		Utensil.addListener(this.display, "mousedown", this.buttonMouseClick);
	}
	_.deactivate = function() {
		this.display.style.cursor = "default";
		Utensil.removeListener(this.display, "mouseover", this.buttonMouseOver);
		Utensil.removeListener(this.display, "mouseout", this.buttonMouseOut);
		Utensil.removeListener(this.display, "mousedown", this.buttonMouseClick);
		this.buttonMouseOver = null;
		this.buttonMouseOut = null;
	}
	_.onMouseOver = function(event) {
		//	this.display.style.backgroundPositionY = -this.height() + "px";
		this.display.style.backgroundPosition = "0px -" + this.height() + "px";
	}
	_.onMouseOut = function(event) {
		// this.display.style.backgroundPositionY = "0px";
		this.display.style.backgroundPosition = "0px " + "0px";
	}
	_.onMouseClick = function(event) {
		// this.display.style.backgroundPositionY = -(this.height() * 2) + "px";
		this.display.style.backgroundPosition = "0px -" + (this.height() * 2) + "px";
	}
	_.disable = function() {
		this.deactivate();
		// this.display.style.backgroundPositionY = -(this.height() * 3) + "px";
		this.display.style.backgroundPosition = "0px -" + (this.height() * 3) + "px";
	}
	_.disableSelection = function(target) {
		target.style["-moz-user-select"] = "-moz-none";
		target.style["-khtml-user-select"] = "none";
		target.style["-ms-user-select"] = "none";
		target.style["user-selectt"] = "none";
		target.style["-webkit-user-select"] = "none";
	}
})();
var Sprite = function() {
};
(function() {
	/*
	 * local variables
	 */
	var _ = Class.extend(Sprite, UIElement);
	/*
	 * public functions
	 */

	_.drawRect = function(x, y, w, h, c, z) {
		this.x(x);
		this.y(y);
		this.width(w);
		this.height(h);
		this.setColor(c);
	};
	_.drawRoundRect = function(x, y, w, h, rad, c) {

		this.x(x);
		this.y(y);
		this.width(w);
		this.height(h);
		this.setColor(c);
		this.setCorners(rad);

	}
	_.drawCircle = function(x, y, rad, c) {

		this.x(x);
		this.y(y);
		this.width(rad * 2);
		this.height(rad * 2);
		this.setColor(c);
		this.setCorners(rad);

	}
	_.setColor = function(c) {
		this.display.style.backgroundColor = c;
	};
	_.setCorners = function(rad) {
		this.display.style.behavior = 'url(lib/com/wezside/component/border-radius.htc)';
		this.display.style.webkitBorderRadius = rad + "px";
		this.display.style.MozBorderRadius = rad + "px";
		this.display.style['-moz-border-radius'] = rad + "px";
		this.display.style.borderRadius = rad + "px";
		this.display.style['border-radius'] = rad + 'px ' + rad + 'px ' + rad + 'px ' + rad + 'px';
	}
})();
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
					if (y <= -(page.clientHeight - page.parentNode.clientHeight))
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
};(function(window) {
	var searchBox;
	var searchButton;
	var searchList;
	var searchBar;

	function Main() {
		if (window.addEventListener) {
			window.addEventListener("load", onLoad);

		} else {
			window.attachEvent("onload", onLoad);
		}
		
		
		
	}

	function onLoad() {

		//Spider.init();
		Controller.init();
	}

	function onReady() {

	}

	Main();
})(window);
var Util = {
	addMeta : function() {
		var viewPortTag = document.createElement('meta');
		viewPortTag.id = "viewport";
		viewPortTag.name = "viewport";
		viewPortTag.content = "width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;";
		document.getElementsByTagName('head')[0].appendChild(viewPortTag);
	}
};
var View=
{
	defaultHtml:'<div id="wrapper"><div id="spider-content"></div></div>',
	init:function()
	{
		document.body.innerHTML = this.defaultHtml;
		var content = document.getElementById(Spider.data.id.content);
		var settings = Model.data.getElementsByTagName("settings");
		for (var i = 0; i < settings[0].childNodes.length; i++) {
				var child = settings[0].childNodes[i];
			   if(child.nodeName)
			   {
			   	 switch(child.nodeName)
			   	 {
			   	 	case "content":
			   	 	if(child.getAttribute('swipe') && child.getAttribute('swipe')=="true")content.setAttribute('swipe','true');
			   	 	break;
			   	 	case "title":
			   	 	 document.title = child.getAttribute('text');
			   	 	break;
			   	 }
			   }
		}
		this.buildViews();
	},
	buildViews:function()
	{
		var content = document.getElementById(Spider.data.id.content);
		var views = Model.data.getElementsByTagName("view");
		for (var i = 0; i < views.length; i++) {  
			var child = views[i]; 
			if(child.nodeName)this.createView(child,content);
		}
	},
	createView:function(node,content)
	{
		var view = document.createElement('div');
		var holder = document.createElement('div');
		holder.style.width="100%";
		holder.style.height="100%";
		Style.pageHolder(holder);
		var page= document.createElement('div');
		if(node.getAttribute('scrollable'))
		{
			page.setAttribute('scrollable','true');			
		}else{
			page.style.height = "inherit";
		}
		page.style.width = "inherit";
		
		view.className = node.getAttribute('classname')? node.getAttribute('classname'):Style.className.view;
		for (var i = 0; i < node.childNodes.length; i++) {   
			if(node.childNodes[i].nodeName!="#text")
			{
				var name = node.childNodes[i].nodeName;
					if(Module[name])
					{
						var mod = Module[name](node.childNodes[i],page);
						if(mod)page.appendChild(mod);
					}
			}
		}
		holder.appendChild(page);
		view.appendChild(holder);
		content.appendChild(view);
	},
	navigateTo:function(index)
	{
		Spider.navigateTo(index);
	}
};
var Style=
{
	style:null,
	className:
	{
		module:"module-",
		header:"blackheader",
		nav:"blacknav",
		blacktheme:"blacktheme",
		navButton:"navbutton",
		button:"blackbutton",
		footer:"module-footer",
		carouselLeftButton:"carouselleftbutton",
		carouselRightButton:"carouselrightbutton",
		formInputTitle:"forminputtitle",
		formInputHolder:"forminputholder",
		formTextArea:"formtextarea",
		formInput:"forminput",
		homeIcon:"home-icon",
		tablecell:"tablecell",
		view:"view",
		pageNav:"page-nav",
		clearBoth:"clearboth"
	},
	defaultStyle:".pageScroller{background-color: #333;}.floatLeft{float:left;}.social-holder{overflow:hidden;height:25px;}.view{background-color: #fff;height: 100%;}@import url(http://fonts.googleapis.com/css?family=Roboto+Condensed:700,400); @import url(http://fonts.googleapis.com/css?family=Roboto:500,400); @font-face { font-family: 'FontAwesome'; src: url('http://fahimchowdhury.com/fonts/fontawesome-webfont.eot?v=3.0.1'); src: url('http://fahimchowdhury.com/fonts/fontawesome-webfont.eot?#iefix&v=3.0.1') format('embedded-opentype'), url('http://fahimchowdhury.com/fonts/fontawesome-webfont.woff?v=3.0.1') format('woff'), url('http://fahimchowdhury.com/fonts/fontawesome-webfont.ttf?v=3.0.1') format('truetype'); font-weight: normal; font-style: normal; } .blacktheme { min-height:45px; width:100%; background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2JhKDU4LDY3LDc0LDEpOyIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYmEoMjIsMzEsMzgsMSk7IiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZ3JhZGllbnQpIiBoZWlnaHQ9IjEwMCUiIHdpZHRoPSIxMDAlIiAvPjwvc3ZnPg==); /* Opera 11.10+ */ background: -o-linear-gradient(top, rgba(58,67,74,1), rgba(22,31,38,1)); /* Firefox 3.6+ */ background: -moz-linear-gradient(top, rgba(58,67,74,1), rgba(22,31,38,1)); /* Chrome 7+ & Safari 5.03+ */ background: -webkit-gradient(linear, left top, left bottom, color-stop(0, rgba(58,67,74,1)), color-stop(1, rgba(22,31,38,1))); /* IE5.5 - IE7 */ filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr=#FF3A434A,EndColorStr=#FF161F26); /* IE8 */ -ms-filter: 'progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr=#FF3A434A,EndColorStr=#FF161F26)'; } .blackheader { text-align: center; } .blackheader p { color: #fff; padding-top: 10px; font-family: 'Roboto Condensed', sans-serif; font-weight: 700; } .blacknav { background: #172027; width:100%; margin-left: auto; margin-right: auto; } .blacknav .navbutton { background: #172027; border-right: 1px solid #394249; min-height: 40px; text-align: center; float: left; cursor: pointer; color:#fff; } .blacknav .navbutton.last { border-right: 0px solid #394249; } .blacknav .navbutton:hover { background: #5998c8; color:#fff; } .blacknav .navbutton p{ margin-top: 10px; font-family: 'Roboto Condensed', sans-serif; font-weight: 700; font-size: 1em; } .clearboth { clear: both; } .blackbutton { margin-top:8px; margin-bottom:8px; margin-left:auto; margin-right:auto; text-align:center; border: 1px solid #111 /*{a-bup-border}*/; -moz-box-shadow: 0px 1px 4px /*{global-box-shadow-size}*/ rgba(0,0,0,.3) /*{global-box-shadow-color}*/; -webkit-box-shadow: 0px 1px 4px /*{global-box-shadow-size}*/ rgba(0,0,0,.3) /*{global-box-shadow-color}*/; box-shadow: 0px 1px 4px /*{global-box-shadow-size}*/ rgba(0,0,0,.3) /*{global-box-shadow-color}*/; width:90%; min-height:40px; -moz-border-radius: 1em; -webkit-border-radius: 1em; -khtml-border-radius: 1em; border-radius: 1em; text-shadow: 0 /*{a-bup-shadow-x}*/ 1px /*{a-bup-shadow-y}*/ 1px /*{a-bup-shadow-radius}*/ #111 /*{a-bup-shadow-color}*/; cursor: pointer; } .blackbutton p { color: #fff; margin-top: 10px; text-shadow: 0 /*{a-bup-shadow-x}*/ 1px /*{a-bup-shadow-y}*/ 1px /*{a-bup-shadow-radius}*/ #111 /*{a-bup-shadow-color}*/; font-weight: bold; } .blackbutton:hover { border: 1px solid #000 /*{a-bhover-border}*/; background: #444 /*{a-bhover-background-color}*/; font-weight: bold; color: #fff /*{a-bhover-color}*/; text-shadow: 0 /*{a-bhover-shadow-x}*/ 1px /*{a-bhover-shadow-y}*/ 1px /*{a-bhover-shadow-radius}*/ #111 /*{a-bhover-shadow-color}*/; background-image: -webkit-gradient(linear, left top, left bottom, from( #555 /*{a-bhover-background-start}*/), to( #383838 /*{a-bhover-background-end}*/)); /* Saf4+, Chrome */ background-image: -webkit-linear-gradient( #555 /*{a-bhover-background-start}*/, #383838 /*{a-bhover-background-end}*/); /* Chrome 10+, Saf5.1+ */ background-image: -moz-linear-gradient( #555 /*{a-bhover-background-start}*/, #383838 /*{a-bhover-background-end}*/); /* FF3.6 */ background-image: -ms-linear-gradient( #555 /*{a-bhover-background-start}*/, #383838 /*{a-bhover-background-end}*/); /* IE10 */ background-image: -o-linear-gradient( #555 /*{a-bhover-background-start}*/, #383838 /*{a-bhover-background-end}*/); /* Opera 11.10+ */ background-image: linear-gradient( #555 /*{a-bhover-background-start}*/, #383838 /*{a-bhover-background-end}*/); } .carouselleftbutton { position:absolute; top:50%; margin-top:-15px; width:30px; height:30px; background:#333; -moz-border-radius: 30px; -webkit-border-radius: 30px; -khtml-border-radius: 30px; border-radius: 30px; text-align: center; cursor: pointer; } .carouselleftbutton p { color: #fff; margin-top: 7px; font-weight: bold; font-family: 'Roboto Condensed', sans-serif; } .carouselrightbutton { position:absolute; top:50%; right:0; margin-top:-15px; width:30px; height:30px; background:#333; -moz-border-radius: 30px; -webkit-border-radius: 30px; -khtml-border-radius: 30px; border-radius: 30px; text-align: center; cursor: pointer; } .carouselrightbutton p { color: #fff; margin-top: 7px; font-weight: bold; font-family: 'Roboto Condensed', sans-serif; } .module-carousel { margin-left: auto; margin-right: auto; } .forminputholder { width:90%; margin-left:auto; margin-right:auto; margin-top: 10px; } .forminputtitle { width:100%; font-family: 'Roboto', sans-serif; margin-bottom: 5px; } .forminput { width:95%; padding-left:5%; min-height:30px; -moz-box-shadow: inset 0px 1px 4px rgba(0,0,0,.2); -webkit-box-shadow: inset 0px 1px 4px rgba(0,0,0,.2); box-shadow: inset 0px 1px 4px rgba(0,0,0,.2); -webkit-background-clip: padding-box; -moz-background-clip: padding; background-clip: padding-box; -moz-border-radius: .6em /*{global-radii-blocks}*/; -webkit-border-radius: .6em /*{global-radii-blocks}*/; border-radius: .6em /*{global-radii-blocks}*/; border: 1px solid #aaa /*{c-body-border}*/; color: #333 /*{c-body-color}*/; text-shadow: 0 /*{c-body-shadow-x}*/ 1px /*{c-body-shadow-y}*/ 0 /*{c-body-shadow-radius}*/ #fff /*{c-body-shadow-color}*/; background: #f9f9f9 /*{c-body-background-color}*/; background-image: -webkit-gradient(linear, left top, left bottom, from( #f9f9f9 /*{c-body-background-start}*/), to( #eee /*{c-body-background-end}*/)); /* Saf4+, Chrome */ background-image: -webkit-linear-gradient( #f9f9f9 /*{c-body-background-start}*/, #eee /*{c-body-background-end}*/); /* Chrome 10+, Saf5.1+ */ background-image: -moz-linear-gradient( #f9f9f9 /*{c-body-background-start}*/, #eee /*{c-body-background-end}*/); /* FF3.6 */ background-image: -ms-linear-gradient( #f9f9f9 /*{c-body-background-start}*/, #eee /*{c-body-background-end}*/); /* IE10 */ background-image: -o-linear-gradient( #f9f9f9 /*{c-body-background-start}*/, #eee /*{c-body-background-end}*/); /* Opera 11.10+ */ background-image: linear-gradient( #f9f9f9 /*{c-body-background-start}*/, #eee /*{c-body-background-end}*/); } .formtextarea { min-height: 100px; } .tablecell { float:left; height:100%; overflow: hidden; } .module-table { margin: 20px; } .module-text { min-height:100%; width:100%; display: block; } .pageHeader { color: #FFF; width: 100%; height: 35px; background: #172027; border-bottom: 2px solid #333; text-align: center; } .pageHeader p { padding-left: 20px; padding-top: 10px; font-weight: bold; text-align: center; } .page-nav { height:20px; margin: 10px; } .home-icon { width:20px; height:100%; cursor: pointer; } .page-nav li { float:left; padding-right: 5px; padding-left: 5px; border-left: 1px solid #e4e4e4; } .module-footer { font-size:11px; min-height:0; padding-bottom:10px; }",
	pageHolder:function(holder)
	{
		holder.style.height=Utensil.stageHeight();
		holder.style.width=Utensil.stageWidth();
		
	},
	addDefault:function()
	{
		Spider.data.className.scroller = "pageScroller";
		this.style = document.createElement("style")
		this.style.setAttribute("rel", "stylesheet")
		this.style.setAttribute("type", "text/css")
		this.style.setAttribute("id", "defaultStyle")

		document.getElementsByTagName("head")[0].appendChild(this.style);
		if (localStorage)
			localStorage.setItem('styleData', this.defaultStyle);
		if (this.style.styleSheet) {// IE

			this.style.styleSheet.cssText = this.defaultStyle;

		} else {
			this.style.appendChild(document.createTextNode(this.defaultStyle));
		}
	}
};
var Module = {
	type:
	{
		image:"image"
	},
	appid : "tb0802132202",
	setup : function(node, obj) {
		if (node) {

				obj.className = node.getAttribute('classname')?node.getAttribute('classname'):Style.className.module+node.nodeName;
			if (node.getAttribute('id'))
				obj.id = node.getAttribute('id');
			for (var i = 0; i < node.attributes.length; i++) {
				var attrib = node.attributes[i];
				var has = false;
				for (var prop in obj.style ) {
					if (prop == attrib.name)
						has = true;
				}
				if (has)
					obj.style[attrib.name] = attrib.value;
			}
		}
		var navTo = node.getAttribute('navigateTo');
		if (navTo) {
			this.setButton(obj);
			Spider.event.addListener(obj.id, 'click', function() {
				Module.onChangePage(obj.id,navTo);
			});
		};
		var link = node.getAttribute('link');
		if (link) {
			this.setButton(obj);
			Spider.event.addListener(obj.id, 'click', function() {
				Tracking.click(obj.id);
				window.open(link, node.getAttribute('target') ? node.getAttribute('target') : "_self");
			});
		}
		delete node;
		delete navTo;
		delete link;
		return obj;
	},
	onChangePage:function(id,navTo)
	{
		Tracking.pageChange(id);
				Deeplink.update(navTo);
				Spider.navigateTo(navTo);
	},
	setButton : function(obj) {
		if (!obj.id) {
			obj.id = Model.id.button + Model.clickIndex;
			Model.clickIndex++;
		}
	},

	setChildren : function(node, obj) {
		for (var i = 0; i < node.childNodes.length; i++) {
			if (node.childNodes[i].nodeName != "#text") {
				var name = node.childNodes[i].nodeName;
				if (Module[name]) {
					var mod = Module[name](node.childNodes[i], obj,node);
					if (mod)
						obj.appendChild(mod);
					delete mod;
				}
			}
		}
	}
};

/*
 * Image module
 */
Module.image = function(node, view) {
	var img = document.createElement('img');
	img.src = node.getAttribute('src');
	img = Module.setup(node, img);
	return img;
};
/*
 * HTML module
 */
Module.html = function(node, view) {
	var child = (node.firstChild.nodeName != "#text") ? node.firstChild : node.childNodes[1];
	var ht = child.nodeValue.replace("<![CDATA[", "");
	ht = ht.replace("]]>", "");
	view.innerHTML += ht;
	return null;
};
/*
 * text module
 */
Module.text = function(node, view) {
	var child = (node.firstChild.nodeName != "#text") ? node.firstChild : node.childNodes[1];
	var holder = document.createElement('div');
	var div = document.createElement('div');
	var t = document.createElement('div');
	var p = document.createElement('p');
	
	if(node.getAttribute('height'))
	{
		div.setAttribute('scrollable', 'true');
	div.appendChild(p);
	holder.appendChild(div);
	div.appendChild(t);
	}else{
		holder.appendChild(p);
	}
	p.innerHTML = child.nodeValue;
	var h = (p.clientHeight);
	var w = (p.clientWidth);
	holder = Module.setup(node, holder);
	return holder;
};
/*
 * Carousel module
 */
Module.carousel = function(node, view) {
	var w = node.getAttribute('width');
	var h = node.getAttribute('height');
	var holder = document.createElement('div');
	holder.className = "carouselholder";
	holder.style.position = "relative";
	var ul = document.createElement('ul');
	ul.setAttribute('swipe', 'true');

	var li;
	if (!w)
		w = 0;
	if (!h)
		h = 0;
	holder.style.width = w > Utensil.stageWidth() ? Utensil.stageWidth() : w;
	holder.style.height = h;
	holder.style.overflow = "hidden";
	var children = 0;
	for (var i = 0; i < node.childNodes.length; i++) {
		if (node.childNodes[i].nodeName != "#text") {
			var name = node.childNodes[i].nodeName;
			if (Module[name]) {
				children++;
				li = document.createElement('li');
				li.className = "floatLeft";
				var mod = Module[name](node.childNodes[i], li);
				if (mod)
					li.appendChild(mod);
				ul.appendChild(li);
			}
		}
	}
	ul.style.width = (children * w.replace('px', '')) + "px";
	ul.style.height = h;
	holder.appendChild(ul);
	holder = Module.setup(node, holder);

	/*
	 * buttons
	 */
	if (!node.getAttribute('auto') && !node.getAttribute('disablebuttons')) {
		var left = document.createElement('div');
		left.className = Style.className.carouselLeftButton;
		left.innerHTML = '<p><</p>';
		left.id = Model.id.button + Model.clickIndex;
		holder.appendChild(left);

		Model.clickIndex++;

		var right = document.createElement('div');
		right.className = Style.className.carouselRightButton;
		right.innerHTML = '<p>></p>';
		right.id = Model.id.button + Model.clickIndex;
		holder.appendChild(right);

		Model.clickIndex++;

		Spider.event.addListener(left.id, 'click', Controller.onGalleryClick);
		Spider.event.addListener(right.id, 'click', Controller.onGalleryClick);
	} else if (node.getAttribute('auto')) {
		//setInterval(function() {
		ul.setAttribute('autoswipe', 'true');
		Controller.autoGallery(ul);
		//}, 3000);
	}
	return holder;
};
/*
 * map module
 */
Module.map = function(node, view) {
	var w = node.getAttribute('width');
	var h = node.getAttribute('height');
	var iframe = document.createElement('iframe');
	iframe.width = w;
	iframe.height = h;
	iframe.setAttribute('frameborder', '0');
	iframe.setAttribute('scrolling', 'no');
	iframe.setAttribute('marginheight', '0');
	iframe.setAttribute('marginwidth', '0');
	var url = Model.url.map + node.getAttribute('lat') + "," + node.getAttribute('lng') + "&output=embed";
	iframe.setAttribute('src', url);
	Module.setup(node, iframe);
	return iframe;
};
/*
 * header module
 */
Module.header = function(node, view) {
	var div = document.createElement('div');
	Module.setup(node, div);
	div.className = Style.className.blacktheme + " " + Style.className.header;
	var obj;
	if (node.getAttribute('src')) {
		obj = document.createElement('img');
		obj.src = node.getAttribute('src');
	} else if (node.getAttribute('text')) {
		obj = document.createElement('p');
		obj.innerHTML = node.getAttribute('text');
	}
	var nav =Module.pageNav(node,view);
	if(nav)div.appendChild(nav);
	div.appendChild(obj);
	return div;
};
/*
 * youtube module
 */
Module.youtube = function(node, view) {
	var w = node.getAttribute('width');
	var h = node.getAttribute('height');
	var iframe = document.createElement('iframe');
	iframe.width = w;
	iframe.height = h;
	iframe.setAttribute('frameborder', '0');
	iframe.setAttribute('type', 'text/html');
	iframe.setAttribute('scrolling', 'no');
	iframe.setAttribute('marginheight', '0');
	iframe.setAttribute('marginwidth', '0');
	var url = Model.url.youtube + node.getAttribute('videoid');
	iframe.setAttribute('src', url);
	iframe = Module.setup(node, iframe);
	return iframe;
};
Module.social = function(node, view) {
	SocialNetwork.init(node);
	social.url = window.location.href;
	var holder = document.createElement('div');
	holder.className = Model.className.socialHolder;
	var obj;
	if (node.getAttribute('facebook')) {

		var w = node.getAttribute('fbwidth') ? node.getAttribute('fbwidth') : "49";
		var fh = document.createElement('div');
		var f = document.createElement('div');
		f.className = "fb-like";
		f.style.width = "600px";
		fh.style.width = w + "px";
		fh.style.overflow = "hidden";
		// social.facebookHeight  =node.getAttribute('fbheight')?node.getAttribute('fbheight'):"100";
		// obj =social.buildFacebook();
		fh.appendChild(f);
		holder.appendChild(fh);
	}
	if (node.getAttribute('twitter')) {
		obj = social.buildTwitter();
		holder.appendChild(obj);
	}
	if (node.getAttribute('google')) {
		obj = social.buildGoogle();
		holder.appendChild(obj);
	}
	return holder;
};
/*
 * navbar Module
 */
Module.navbar = function(node, view) {
	var div = document.createElement('div');
	div.className = Style.className.nav;
	var b;
	var p;
	var navbuttons = Model.data.getElementsByTagName("navbutton");
	var buttonWidth = (Math.round((Utensil.stageWidth() ) / navbuttons.length) / Utensil.stageWidth()) * 100;
	for (var i = 0; i < navbuttons.length; i++) {
		var child = navbuttons[i];
		b = document.createElement('div');
		Module.setup(child, b);
		b.className = (i == navbuttons.length - 1) ? Style.className.navButton + " last" : Style.className.navButton + "";
		b.style.width = (i == navbuttons.length - 1 ? buttonWidth : buttonWidth - 2 ) + "%";
		if (child.getAttribute('text')) {
			p = document.createElement('p');
			p.innerHTML = child.getAttribute('text');
			b.appendChild(p);
		}

		div.appendChild(b);
	}
	b = document.createElement('div');
	b.className = Style.className.clearBoth;
	div.appendChild(b);

	return div;
};
/*
 * button module
 */
Module.button = function(node, view) {
	var div = document.createElement('div');
	Module.setup(node, div);
	var obj = document.createElement('p');
	obj.innerHTML = node.getAttribute('text');
	div.appendChild(obj);
	Module.setup(node, div);
	if(!node.getAttribute('classname'))div.className = Style.className.blacktheme + " " + Style.className.button;
	return div;
};
/*
 * form module
 */
Module.form = function(node, view) {
	var div = document.createElement('div');
	Model.formIndex++;
	div.setAttribute("formindex", Model.formIndex);
	div.setAttribute("formtype", node.getAttribute('type'));
	if (node.getAttribute('src'))
		div.setAttribute("formsrc", node.getAttribute('src'));
	Module.setChildren(node, div);
	return div;
};
/*
 * submit module
 */
Module.submit = function(node, view) {
	var div = Module.button(node, view);
	div.id = Model.id.button + Model.clickIndex;
	Model.clickIndex++;

	Spider.event.addListener(div.id, 'click', function() {

		var parent = div.parentNode;
		var index = parent.getAttribute("formindex");
		var children = Spider.element.getAllElementsWithAttribute("formindex");
		var t;
		var f;
		var s;
		var b;
		for (var a = 0; a < children.length; a++) {

			var child = children[a];
			if (child && child.getAttribute && child.getAttribute("inputtype")) {
				switch(child.getAttribute("inputtype")) {
					case "to":
						t = child.value;
						break;
					case "body":
						b = child.value;
						break;
					case "subject":
						s = child.value;
						break;
					case "from":
						f = child.value;
						break;

				}
			}

		}

		if (t && f && s && b) {
			var url;
			
			url = (parent.getAttribute("formsrc") != null ? parent.getAttribute("formsrc") : Model.url.email);
			var url = url.replace('[t]', t);
			url = url.replace('[f]', f);
			url = url.replace('[s]', s);
			url = url.replace('[b]', b);
			url = url.replace('[i]', Module.appid);
			var scriptTag;
			if (!document.getElementById('mailscript')) {
				scriptTag = document.createElement('SCRIPT');
				scriptTag.type = "text/javascript";
				scriptTag.id = "mailscript";
			} else {
				scriptTag = document.getElementById('mailscript');
			}
			try {
				scriptTag.src = url + "&count" + Math.random() + "=" + Math.random() + "&callback=emailCallback";
				document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);
			} catch(e) {
				console.log(e);
			}

			for (var a = 0; a < children.length; a++) {
				//if(children[a].value)children[a].value="";
			}
			delete children;
		}
	});
	return div;
};
window.emailCallback = function(data) {
	Spider.toast(data);
};
/*
 * input module
 */
Module.input = function(node, view) {
	var ul = document.createElement('ul');
	ul.className = Style.className.formInputHolder;

	var li = document.createElement('li');
	li.className = Style.className.formInputTitle;
	li.innerHTML = "<p>" + node.getAttribute('text') + "</p>";
	ul.appendChild(li);
	li = document.createElement('li');
	var input;
	if (node.getAttribute('type') == "body") {
		input = document.createElement('textarea');
		input.className = Style.className.formInput + " " + Style.className.formTextArea;
	} else {
		input = document.createElement('input');
		input.className = Style.className.formInput;
	}
	input.setAttribute("inputtype", node.getAttribute('type'));
	input.setAttribute("formindex", Model.formIndex);
	switch(node.getAttribute('type')) {
		case "password":
			input.setAttribute("type", "password");
			break;
		default:
			input.setAttribute("type", "text");
			break;
	}

	li.appendChild(input);
	ul.appendChild(li);
	return ul;
};
Module.hidden = function(node, view) {
	var input = document.createElement('input');
	input.type = "hidden";
	input.value = node.getAttribute('value');
	if (node.getAttribute('type'))
		input.setAttribute("inputtype", node.getAttribute('type'));
	input.setAttribute("formindex", Model.formIndex);
	return input;
};
Module.footer = function(node, view) {
	var div = Module.header(node, view);
	div.className +=" "+Style.className.footer;
	div.style.position = "fixed";
	div.style.bottom = "0";
	view.appendChild(div);
	return null;
};
Module.table=function(node, view)
{
	var div = document.createElement('div');
	var border = node.getAttribute('tableborder');
	var color = node.getAttribute('bordercolor')?node.getAttribute('bordercolor'):"#333";
	if(border)div.style.borderTop =  border+"px  solid "+color;
	Module.setChildren(node, div);
	Module.setup(node, div);
	return div;

};
Module.row= function(node, div,parentNode)
{
	var row = document.createElement('ul');
	var border = parentNode.getAttribute('tableborder');
	var color = parentNode.getAttribute('bordercolor')?parentNode.getAttribute('bordercolor'):"#333";
	if(border)
	{
		row.style.borderBottom = border+"px  solid "+color;
		row.style.borderLeft =  border+"px  solid "+color;
		row.style.borderRight =  border+"px  solid "+color;
	}
	var cols = parentNode.getAttribute('cols');
	var defaultWidth = (100/cols)+"%";
	var currentCol=1;
	var maxHeight = 0;
	for (var i = 0; i < node.childNodes.length; i++) {
			if (node.childNodes[i].nodeName != "#text") {
				var li = document.createElement('li');
				var w = parentNode.getAttribute('colwidth'+(currentCol))?parentNode.getAttribute('colwidth'+(currentCol)):defaultWidth;
				li.className = Style.className.tablecell;
				li.style.width = w;
				if(border && currentCol<cols)li.style.borderRight = border+"px  solid "+color;
				var name = node.childNodes[i].nodeName;
				if (Module[name]) {
					var mod = Module[name](node.childNodes[i], row,node);
					if (mod)
					{
						if(name==Module.type.image)
						{
							
							var handler = function(){
								if(this.clientHeight>maxHeight)
								Module.setRowHeight(row,this.clientHeight);
								Utensil.removeListener(this,"load",handler);
								}
							Utensil.addListener(mod,"load",handler);
						}
						document.body.appendChild(mod);
						var h = mod.clientHeight;
						document.body.removeChild(mod);
						li.appendChild(mod);
						row.appendChild(li);	
						if(h>maxHeight)maxHeight=h;			
					}
					delete mod;
					currentCol++
				}
				
			}
			if(currentCol>cols || i == node.childNodes.length-1)
			{
				i=node.childNodes.length;
				var li = document.createElement('li');
				li.className = Style.className.clearBoth;
				row.appendChild(li);
			}
		}
	Module.setRowHeight(row,maxHeight);	
	Module.setup(node, row);
	return row;
};
Module.setRowHeight=function(row,maxHeight)
{
	for (var i = 0; i < row.childNodes.length; i++) {
		if (row.childNodes[i].nodeName != "#text" && row.childNodes[i].className && row.childNodes[i].className!=Style.className.clearBoth) {
			row.childNodes[i].style.height = maxHeight+"px";
		}
	}
};
Module.pageNav=function(node,view)
{
	var ul = document.createElement('ul');
	ul.style.position="absolute";
	ul.style.right="0";
	ul.style.top="0";
	ul.className=Style.className.pageNav;
	
	if(node.getAttribute('home'))
	{
		var li = document.createElement('li');
		li.appendChild(Module.home(node,view));
		ul.appendChild(li);
	}
	var li = document.createElement('li');
	li.className =Style.className.clearBoth;
	ul.appendChild(li);
	return ul;
};
Module.home = function(node,view)
{
	var div = document.createElement('div');
	div.className=Style.className.homeIcon;
	
	
	div.id = Model.id.button + Model.clickIndex;
	Model.clickIndex++;
	
	Canvas.beginFill(div);
	Canvas.strokeThickness=2;
	Canvas.strokeColor="#e4e4e4";
	Canvas.drawLine(10,0,20,10);
	Canvas.drawLine(10,0,0,10);
	
	Canvas.drawLine(10,3,16,10);
	Canvas.drawLine(10,3,4,10);
	
	Canvas.drawLine(4,10,4,17);
	Canvas.drawLine(4,17,16,17);
	Canvas.drawLine(16,17,16,10);
	
	
	Spider.event.addListener(div.id, 'click', function() {
		Module.onChangePage(div.id,0);
	});
		
	return div;
};
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
var Deeplink=
{
	init:function()
	{
		if(location.hash)
		{
			var  hash = location.hash.replace("#",'');
			if(!isNaN(Number(hash)))
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
	},
	backCheck:function()
	{
		
		Deeplink.init();
	}
};
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
		Event.dispatch(TeaBreak, TeaBreak.event.COMPLETE);
	},
	ready : function() {

		Event.removeListener(Spider, Spider.event.COMPLETE, Controller.ready);
		Model.removeHandler(this, "ready");

	},
	checkTracking : function() {
		var tracking = Model.data.getElementsByTagName("tracking");
		if (tracking && tracking[0]) {
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
var TeaBreak={
	event:{
		COMPLETE:'COMPLETE'
	}
};
var Model = {
	clickIndex:0,
	formIndex:0,
	id:{
		button:"button"
	},
	className:
	{
		socialHolder:"social-holder"
	},
	data : null,
	url : {
		site : "site.xml",
		map:'https://maps.google.co.uk/maps?q=',
		youtube:'http://www.youtube.com/embed/',
		email:'http://fahimchowdhury.com/services/mail/mailto.php?t=[t]&f=[f]&s=[s]&b=[b]&i=[i]'
	},
	addHandler : function(root, name) {
		if (!root.handler)
			root.handler = {};
		root.handler[name] = function(event) {
			root[name](event);
		}
	},
	removeHandler : function(root, name) {
		if (!root.handler)
			return;
		delete root.handler[name];
	}
};
var Canvas = {
	stage : null,
	beginFill : function(obj) {

		if (!this.supportsSvg()) {
			this.stage = document.createElement('div');
		} else {
			this.stage = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

			
			this.stage.style.overflow = 'visible';
			this.stage.style.position = 'absolute';
			this.stage.setAttribute('version', '1.1');
			this.stage.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		}
		this.stage.style.position = "relative";
		obj.appendChild(this.stage);
	},
	strokeColor : "#333",
	strokeThickness : "2",
	drawLine : function(x1, y1, x2, y2) {
		var line;
		if (!this.supportsSvg()) {
			document.namespaces.add("v", "urn:schemas-microsoft-com:vml", "#default#VML");
			var line = document.createElement("v:line");
			line.strokecolor = this.strokeColor;
			line.from = x1+","+y1;
			line.to = x2+","+y2;
			line.strokeweight = this.strokeThickness+"px";
			line.style.position = "absolute";
		} else {
			var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			// var line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
			line.setAttribute('x1', x1);
			line.setAttribute('y1', y1);
			line.setAttribute('x2', x2);
			line.setAttribute('y2', y2);
			// line.setAttribute('points', x1+","+y1+","+x2+","+y2);
			line.setAttribute('stroke', this.strokeColor);
			line.setAttribute('fill', this.strokeColor);
			line.setAttribute('stroke-width', this.strokeThickness);
		}

		this.stage.appendChild(line);

		//}
	},
	supportsSvg : function() {
		 return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect;
	}
};
