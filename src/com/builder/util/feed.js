var Feed = {
	att : {
		dataFill : "dataFill",
		dataFillParent : "dataFillParent",
		dataValue : "dataValue"
	},
	currentNode : null,
	currentView : null,
	childIndex : 0,
	items : null,
	collection : {},
	xml:null,
	onFeedReady : function(data) {
		// if(!node)return;
		data = data.replace(/\:/g,'');
		Feed.xml = Util.StringtoXML(data);
		var tag = Feed.currentNode.getAttribute('main');
		Feed.items = Feed.xml.getElementsByTagName(tag);
		// console.log(items[a]);
		Feed.mapData();

	},
	mapData : function() {
		for ( a = 0; a < Feed.currentNode.childNodes.length; a++) {
			if (Feed.currentNode.childNodes[a].nodeName != "#text") {
				var el = Feed.currentNode.childNodes[a];
				console.log(el);
				var dv = el.getAttribute(Feed.att.dataValue);
				var name = dv.split("/")[0];
				var tag;
				name=name.replace(":","");
				console.log(Feed.items);
				tag =  Feed.xml.getElementsByTagName(name);
				if (tag)
					Feed.collection[el.nodeName] = tag;
			}

		}
		console.log(Feed.collection);
	},
	setNode : function() {
		console.log("setNode");
		if (Feed.currentNode.childNodes[Feed.childIndex] && Feed.currentNode.childNodes[Feed.childIndex].nodeName != "#text") {
			var child = Feed.currentNode.childNodes[Feed.childIndex];

			//console.log(data);
			if (child.getAttribute(Feed.att.dataFill)) {
				for ( a = 0; a < Feed.items.length; a++) {
					//var data =Feed.getItemData(child, Feed.items[a]);
					//var cn = Feed.createData(child,data);
				}

				console.log(Feed.items)
				//Feed.setNode();

			}
			console.log(child);
			mod = Module[child.nodeName](child, Feed.currentView);
			Feed.currentView.appendChild(mod);
		}
		Feed.childIndex++;

		setTimeout(Feed.nextNode, 100);
		return null;

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
	getArrayNodeByName : function(item, name) {
		var ar=[];
		for ( a = 0; a < item.childNodes.length; a++) {
			var el = item.childNodes[a];
			if (el.nodeName == name) {
				ar.push(el);
			}

		}
		return ar;
	}
}
