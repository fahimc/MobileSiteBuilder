var Feed = {
	att : {
		dataFill : "dataFill",
		dataFillParent : "dataFillParent",
		dataIndex : "dataIndex",
		fillIndex : "fillIndex",
		dataProp : "dataProp",
		dataValue : "dataValue"
	},
	currentNode : null,
	currentView : null,
	childIndex : 0,
	items : null,
	collection : {},
	xml : null,
	onFeedReady : function(data) {
		// if(!node)return;
		data = data.replace(/\:/g, '');
		Feed.xml = Util.StringtoXML(data);
		var tag = Feed.currentNode.getAttribute('main');
		Feed.items = Feed.xml.getElementsByTagName(tag);
		// console.log(items[a]);
		Feed.mapData();

	},
	mapData : function() {
			
		for ( a = 0; a < Feed.currentNode.childNodes.length; a++) {
				var el = Feed.currentNode.childNodes[a];
			
			if (el.getAttribute && el.getAttribute(Feed.att.dataFill)) {
				
				var dv = el.getAttribute(Feed.att.dataValue);
				
				var name = dv.split("/")[0];
				var att = dv.split("/")[1]? dv.split("/")[1]:"nodeValue";
				
				var dp = el.getAttribute(Feed.att.dataFillParent);
				var df = el.getAttribute(Feed.att.dataFill);
				
				var tag;
				name = name.replace(":", "");
				tag = Feed.getArrayNodeByName(Feed.items, name,att,el.getAttribute(Feed.att.fillIndex));
				//console.log(tag);
				if (tag)
				{
					if(!Feed.collection[el.nodeName])Feed.collection[el.nodeName]=[];
					Feed.collection[el.nodeName].push({item:tag,dp:dp,df:df,node:el});
				}
					
			}
			
			
		}
		Feed.setNode();
		//console.log(Feed.collection);
		
	},
	setNode : function() {
		
		for(var name in Feed.collection)
		{
			for(var d=0;d<Feed.collection[name].length;d++)
			{
			
				Feed.createNode(name,Feed.collection[name][d]);				
			}
		}

	},
	createNode:function(name,obj)
	{
		var node = obj.node;
		
		if(!obj.dp)
		{
			if(obj.df=="nodeValue")
			{
				var ind = node.getAttribute(Feed.att.dataIndex);
				if(ind==undefined)ind=0;
				//console.log(obj.item[ind].value);
				if(node.nodeValue)
				{
					node.nodeValue = obj.item[ind].value;
				}else{
					node.textContent =  obj.item[ind].value;
				}
				
			}else{
				node.setAttribute(obj.df,obj.item[ind].value);
			}
			if(node.getAttribute(Feed.att.dataProp))
			{
				var str =node.getAttribute(Feed.att.dataProp);
				var props = eval('(' + str+ ')');
				for(var pn in props)
				{
					node.setAttribute(pn,props[pn]);
				}
			}
		}else{
			Feed.createChildNodes(node,name,obj);
		}
		//console.log(node,Feed.currentView);
		
		var mod=Module[name](node,Feed.currentView);
		if(mod)Feed.currentView.appendChild(mod);
		Spider.resize();
		
	},
	createChildNodes:function(node,name,obj)
	{
		var modName = obj.dp;
		for(var b=0;b<obj.item.length;b++)
		{
			var childNode = Feed.xml.createElement(modName);
			if(node.getAttribute(Feed.att.dataProp))
			{
				var str =node.getAttribute(Feed.att.dataProp);
				var props = eval('(' + str+ ')');
				for(var pn in props)
				{
					childNode.setAttribute(pn,props[pn]);
				}
			}
			obj.item[b].value=obj.item[b].value.replace("http/","http:/");
			if(obj.df=="nodeValue")
			{
				childNode.nodeValue = obj.item[b].value;
			}else{
				childNode.setAttribute(obj.df,obj.item[b].value);
			}
			//console.log(childNode);
			node.appendChild(childNode);
		}
	},
	nextNode : function() {
		//console.log("nextNode", Feed.childIndex);
		if (Feed.currentNode.childNodes[Feed.childIndex] != undefined) {
			Feed.setNode();
		}
	},
	getItemData : function(child, item) {
		var dv = child.getAttribute(Feed.att.dataValue);
		var att = null;
		var name = dv.split("/")[0];
		if (dv.indexOf('/') >= 0)
			att = dv.split("/")[1];
		var m = Feed.getNodeByName(item, name);
		if (att) {
			att = m.getAttribute(att);
		} else {
			att = m.nodeValue;
		}
		return att;
	},
	createData : function(child, data) {
		//console.log("createData");
		var p = child.getAttribute(Feed.att.dataFillParent);
		var fd = child.getAttribute(Feed.att.dataFill);
		var mod;
		if (p) {
			var node = document.createElement(p);
			node.setAttribute(Feed.att.dataFill, data);
			child.appendChild(node);
			//mod=Module[p](node,Feed.currentView);
			//Feed.currentView.appendChild(mod)
		} else {
			child.setAttribute(Feed.att.dataFill, data);

		}
		return null;
		// console.log(mod);
		// if(mod)Feed.currentView.appendChild(mod);
	},
	getNodeByName : function(item, name) {
		for ( a = 0; a < item.childNodes.length; a++) {
			var el = item.childNodes[a];
			if (el.nodeName == name) {
				return el;
			}

		}
		return null;
	},
	getArrayNodeByName : function(item, name,att,inx) {
		var ar = [];
		inx=inx==undefined?0:inx;
		var lis = item.childNodes ? item.childNodes : item;
		for ( c = 0; c < lis.length; c++) {
			var el = lis[c];
			if (el.getElementsByTagName(name)) {
				var child = el.getElementsByTagName(name)[inx]?el.getElementsByTagName(name)[inx]:el.getElementsByTagName(name);
				var val;
				if(child.getAttribute && att!="nodeValue")
				{
					val = child.getAttribute(att);
					
					
				}else if(att=="nodeValue"){
					val =child.nodeValue;
					if(!val)val=child.textContent;
				}
				if(val)ar.push({node:child,value:val});
			}

		}
		return ar;
	}
}
