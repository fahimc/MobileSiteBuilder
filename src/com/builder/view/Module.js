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
