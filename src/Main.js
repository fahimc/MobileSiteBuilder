(function(window) {
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
