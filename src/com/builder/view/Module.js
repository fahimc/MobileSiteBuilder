var Module = {
	setup : function(node, obj) {
		obj.className = node.getAttribute('classname');

		for (var i = 0; i < node.attributes.length; i++) {
			var attrib = node.attributes[i];
			var has=false;
			for ( var prop in obj.style ) {
				if(prop==attrib.name)has=true;
			}
			if(has)obj.style[attrib.name] = attrib.value;
		}
		
		var navTo = node.getAttribute('navigateTo');
		if(navTo)
		{
			obj.onclick=function()
			{
				Spider.navigateTo(navTo);
			};
		};
	},
	setChildren : function(node, obj) {
		for (var i = 0; i < node.childNodes.length; i++) {
			if (node.childNodes[i].nodeName != "#text") {
				var name = node.childNodes[i].nodeName;
				if (Module[name]) {
					var mod = Module[name](node.childNodes[i], page);
					if (mod)
						obj.appendChild(mod);
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
	Module.setup(node, img);
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
	div.setAttribute('scrollable','true');
	div.appendChild(p);
	holder.appendChild(div);
	div.appendChild(t);
	
	p.innerHTML = child.nodeValue;
	Module.setup(node, holder);
	return holder;
};
/*
 * Carousel module
 */
Module.carousel = function(node, view) {
	var w = node.getAttribute('width');
	var h = node.getAttribute('height');
	var holder = document.createElement('div');
	var ul = document.createElement('ul');
	ul.setAttribute('swipe', 'true');
	var li;
	if (!w)
		w = 0;
	if (!h)
		h = 0;
	holder.style.width = w>Utensil.stageWidth()?Utensil.stageWidth():w;
	holder.style.height = h;
	holder.style.overflow = "hidden";
	Module.setup(node, holder);
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
	return holder;
};
/*
 * map module
 */
Module.map=function(node, view)
{
	var w = node.getAttribute('width');
	var h = node.getAttribute('height');
	var iframe = document.createElement('iframe');
	iframe.width = w;
	iframe.height = h;
	iframe.setAttribute('frameborder','0');
	iframe.setAttribute('scrolling','no');
	iframe.setAttribute('marginheight','0');
	iframe.setAttribute('marginwidth','0');
	var url = Model.url.map+node.getAttribute('lat')+","+node.getAttribute('lng')+"&output=embed";
	console.log(url);
	iframe.setAttribute('src',url);
	Module.setup(node, iframe);
	return iframe;
};
/*
 * header module
 */
Module.header = function(node, view) {
	var div = document.createElement('div');
	Module.setup(node, div);
	var img = document.createElement('img');
	img.src = node.getAttribute('src');
	div.appendChild(img);
	return div;
};
