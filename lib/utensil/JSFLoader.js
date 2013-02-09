/*
 * This will load cross-domain files but you need to wrap the contents into a function
 * you can name the function anything but you will need to set the func variable with the name.
 */
( function(window) {
var JSFLoader = 
{
	script:null,
	callback:null,
	func:null,
	 createScript:function() {
		var s = document.createElement("script");
		s.setAttribute("type", "text/javascript");
		var par = this;
		if(s.onreadystatechange===undefined) { 
			s.onload = function(e) {
				par.onScriptLoadComplete(e);
			};
		} else {
			var completed =false;
			s.onreadystatechange = function(e) {
				if (!completed && (s.readyState == 'loaded' ))
				{
					completed=true;
					par.onScriptLoadComplete(e);					
				}
			};
		}

		return s;

	},
	load:function(src,callback,func)
	{
		this.callback = callback;
		this.func = func;
		if(this.script) {
			var s = this.createScript();
			this.script.parentNode.replaceChild(s, this.script);
			this.script = s;
		} else {
			this.script = this.createScript();
			document.getElementsByTagName("head")[0].appendChild(this.script);
		}

		this.script.setAttribute("src", src);
	},
	onScriptLoadComplete:function(e)
	{
	
		var data = window[this.func](); 
		if(this.callback)this.callback(data);  
	}
	
};
Utensil.addPackage(JSFLoader,"JSFLoader");
	JSFLoader = null;
}(window));