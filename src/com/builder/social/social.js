var SocialNetwork = {
	type : null,
	init : function(node) {
		var div = document.createElement('div');
		div.id="fb-root";
		document.body.appendChild(div);
		var js, id = 'facebook-jssdk', ref = document.getElementsByTagName('script')[0];
           if (document.getElementById(id)) {return;}
           js = document.createElement('script'); js.id = id; js.async = true;
           js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
           ref.parentNode.insertBefore(js, ref);
		
		if (SocialNetwork[SocialNetwork.type])
			SocialNetwork[SocialNetwork.type].init(node);
	},
	onClick : function(node) {
		if (SocialNetwork[SocialNetwork.type])
			SocialNetwork[SocialNetwork.type].onClick(node);
	}
};
SocialNetwork.facebook = {
	url : "http://www.facebook.com/sharer.php?u=[x]&t=[y]",
	init : function(node) {

	},
	onClick:function(node)
	{
		var t= node.getAttribute('text');
		var url = SocialNetwork.facebook.url.replace('[y]',t);
		window.open (url,"_blank");
	}
};
