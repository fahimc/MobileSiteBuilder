var Canvas = {
	stage : null,
	beginFill : function(obj) {

		if (!this.supportsSvg()) {
			this.stage = document.createElement('div');
		} else {
			this.stage = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

			
			this.stage.style.overflow = 'visible';
			this.stage.style.position = 'absolute';
			this.stage.setAttribute('version', '1.1');
			this.stage.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		}
		this.stage.style.position = "relative";
		obj.appendChild(this.stage);
	},
	strokeColor : "#333",
	strokeThickness : "2",
	drawLine : function(x1, y1, x2, y2) {
		var line;
		if (!this.supportsSvg()) {
			document.namespaces.add("v", "urn:schemas-microsoft-com:vml", "#default#VML");
			var line = document.createElement("v:line");
			line.strokecolor = this.strokeColor;
			line.from = x1+","+y1;
			line.to = x2+","+y2;
			line.strokeweight = this.strokeThickness+"px";
			line.style.position = "absolute";
		} else {
			var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			// var line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
			line.setAttribute('x1', x1);
			line.setAttribute('y1', y1);
			line.setAttribute('x2', x2);
			line.setAttribute('y2', y2);
			// line.setAttribute('points', x1+","+y1+","+x2+","+y2);
			line.setAttribute('stroke', this.strokeColor);
			line.setAttribute('fill', this.strokeColor);
			line.setAttribute('stroke-width', this.strokeThickness);
		}

		this.stage.appendChild(line);

		//}
	},
	supportsSvg : function() {
		 return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect;
	}
};
