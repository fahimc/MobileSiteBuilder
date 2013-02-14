var Feed = {
	att : {
		dataFill : "dataFill",
		dataFillParent : "dataFillParent",
		dataIndex : "dataIndex",
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
			console.log(Feed.currentNode);
			if (el.getAttribute && el.getAttribute(Feed.att.dataFill)) {
				
				var dv = el.getAttribute(Feed.att.dataValue);
				
				var name = dv.split("/")[0];
				var att = dv.split("/")[1]? dv.split("/")[1]:"nodeValue";
				
				var dp = el.getAttribute(Feed.att.dataFillParent);
				var df = el.getAttribute(Feed.att.dataFill);
				
				var tag;
				name = name.replace(":", "");
				tag = Feed.getArrayNodeByName(Feed.items, name,att);
				//console.log(tag);
				if (tag)
					Feed.collection[el.nodeName] = {item:tag,dp:dp,df:df,node:el};
			}
			console.log(a);
			
		}
		Feed.setNode();
		console.log(Feed.collection);
		
	},
	setNode : function() {
		for(var name in Feed.collection)
		{
			Feed.createNode(name,Feed.collection[name]);
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
				console.log(obj.item[ind].value);
				if(node.nodeValue)
				{
					node.nodeValue = obj.item[ind].value;
				}else{
					node.textContent =  obj.item[ind].value;
				}
				console.log(node );
			}else{
				node.setAttribute(obj.df,obj.item[ind].value);
			}
		}else{
			Feed.createChildNodes(node,name,obj);
		}
		//console.log(node,Feed.currentView);
		var mod=Module[name](node,Feed.currentView);
		if(mod)Feed.currentView.appendChild(mod);
		
	},
	createChildNodes:function(node,name,obj)
	{
		var modName = obj.dp;
		for(var b=0;b<obj.item.length;b++)
		{
			var childNode = Feed.xml.createElement(modName);
			obj.item[b].value=obj.item[b].value.replace("http/","http:/");
			if(obj.df=="nodeValue")
			{
				childNode.nodeValue = obj.item[b].value;
			}else{
				childNode.setAttribute(obj.df,obj.item[b].value);
			}
			node.appendChild(childNode);
		}
	},
	nextNode : function() {
		console.log("nextNode", Feed.childIndex);
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
	getArrayNodeByName : function(item, name,att) {
		var ar = [];
		var lis = item.childNodes ? item.childNodes : item;
		for ( c = 0; c < lis.length; c++) {
			var el = lis[c];
			if (el.getElementsByTagName(name)) {
				
				var val = (att=="nodeValue"?el.getElementsByTagName(name)[0].nodeValue:el.getElementsByTagName(name)[0].getAttribute(att));
			if(!val)val=el.getElementsByTagName(name)[0].textContent;
			
				ar.push({node:el.getElementsByTagName(name)[0],value:val});
			}

		}
		return ar;
	}
}
