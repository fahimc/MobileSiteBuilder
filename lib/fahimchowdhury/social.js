var social = {
	url : "",
	facebookWidth : 75,
	facebookHeight : 26,
	twitterHeight : 20,
	twitterWidth : 82,
	googleSize : "medium",
	facebookPrefix : "https://www.facebook.com/plugins/like.php?",
	twitterPrefix : "https://platform.twitter.com/widgets/tweet_button.html?count=true",
	buildFacebook : function() {
		var iframe = document.createElement("iframe");
		iframe.style.width = this.facebookWidth + "px";
		iframe.style.height = this.facebookHeight + "px";
		iframe.style.border = "none";
		iframe.style.overflow = "hidden";
		iframe.src = this.facebookPrefix + "href=" + this.url + "&send=false&layout=button_count&width=" + this.facebookWidth + "&show_faces=false&action=like&colorscheme=light&font&height=" + this.facebookHeight;
		iframe.setAttribute("frameborder", "0");
		iframe.setAttribute("allowTransparency", "true");
		iframe.setAttribute("scrolling", "no");

		return iframe;
	},
	buildTwitter : function() {
		var iframe = document.createElement("iframe");
		iframe.style.width = this.twitterWidth + "px";
		iframe.style.height = this.twitterHeight + "px";
		iframe.style.border = "none";
		iframe.style.overflow = "hidden";
		iframe.src = this.twitterPrefix + "&counturl=" + this.url + "&url=" + this.url;
		iframe.setAttribute("frameborder", "0");
		iframe.setAttribute("allowTransparency", "true");
		iframe.setAttribute("scrolling", "no");

		return iframe;
	},
	buildGoogle : function() {
		var po = document.createElement('script');
		po.type = 'text/javascript';
		po.async = true;
		po.src = 'https://apis.google.com/js/plusone.js';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(po, s);

		var elem = document.createElement("g:plusone");
		elem.setAttribute("size", this.googleSize);
		return elem;

	}
}