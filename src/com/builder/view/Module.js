var Module={
	setup:function(node,obj)
	{
		obj.className = node.getAttribute('classname');
	}
};

/*
 * Image module
 */
Module.image =function(node,view)
{
	var img = document.createElement('img');
	Module.setup(node,img);
	img.src = node.getAttribute('src');
	return img;
};
/*
 * HTML module
 */
Module.html =function(node,view)
{
	var child = (node.firstChild.nodeName!="#text")?node.firstChild:node.childNodes[1];
	var ht = child.nodeValue.replace("<![CDATA[", "");
	ht=ht.replace("]]>", "");
	view.innerHTML+=ht;
	return null;
};
