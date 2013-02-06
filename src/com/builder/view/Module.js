var Module = {
	setup : function(node, obj) {
		obj.className = node.getAttribute('classname');
		// obj.style.width = node.getAttribute('width');
		// obj.style.height = node.getAttribute('height');
		for (var i = 0; i < node.attributes.length; i++) {
			var attrib = node.attributes[i];
			var has=false;
			for ( var prop in obj.style ) {
				if(prop==attrib.name)has=true;
			}
			if(has)obj.style[attrib.name] = attrib.value;
		}
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
	var t = document.createElement('p');
	div.setAttribute('scrollable','true');
	holder.appendChild(div);
	div.appendChild(t);
	
	t.innerHTML = child.nodeValue;
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
	holder.style.width = w;
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
}
