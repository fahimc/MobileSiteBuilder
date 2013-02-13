var Feed = {
	att : {
		dataFill : "dataFill",
		dataFillParent : "dataFillParent",
		dataValue : "dataValue"
	},
	currentNode : null,
	currentView : null,
	childIndex : 0,
	items:null,
	onFeedReady : function(data) {
		// if(!node)return;
		var xml = Util.StringtoXML(data);
		var tag = Feed.currentNode.getAttribute('main');
		Feed.items = xml.getElementsByTagName(tag);
		
			// console.log(items[a]);
			Feed.setNode();
		
	},
	setNode : function() {

			if (Feed.currentNode.childNodes[Feed.childIndex] && Feed.currentNode.childNodes[Feed.childIndex].nodeName != "#text") {
				var child = Feed.currentNode.childNodes[Feed.childIndex];

				if (child.getAttribute(Feed.att.dataFill)) {
					
					for ( a = 0; a < Feed.items.length; a++) {
						var data =Feed.getItemData(child, Feed.items[a]);
						Feed.createData(child,data);
						console.log(data);
					}
					
					Feed.childIndex++;
					//Feed.setNode();
					
				}

			}
			Feed.childIndex++;
			// Feed.setNode();
		
	},
	getItemData : function(child, item) {
		var dv = child.getAttribute(Feed.att.dataValue);
		var att;
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
	createData:function(child,data)
	{
		var p = child.getAttribute(Feed.att.dataFillParent);
		var fd = child.getAttribute(Feed.att.dataFill);
		var mod;
		if(p)
		{
			var node =document.createElement(p);
			node.setAttribute(Feed.att.dataFill,data);
			mod=Module[p](node,Feed.currentView);
		}else{
			child.setAttribute(Feed.att.dataFill,data);
			mod=Module[child.nodeName](child,Feed.currentView);
		}
		console.log(mod);
		if(mod)Feed.currentView.appendChild(mod);
	},
	getNodeByName : function(item, name) {
		for ( a = 0; a < item.childNodes.length; a++) {
			var el = item.childNodes[a];
			if (el.nodeName == name) {
				return el;
			}

		}
		return null;
	}
}
