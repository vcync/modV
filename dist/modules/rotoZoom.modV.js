var rotoZoom = function() {
	this.info = {
		name: 'rotoZoom',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'range', variable: 'zoomIntensity', min: 1, max: 100, label: 'Zoom Amplitude', varType: 'int'},
			{type: 'range', variable: 'zoomSpeed', min: 0.00001, max: 0.03, step: 0.00001, label: 'Zoom Frequency', varType: 'float'},
			{type: 'range', variable: 'distortSpeed', min: 0.0001, max: 0.5, step: 0.0001, label: 'Distort Speed', varType: 'float'},
			{type: 'checkbox', variable: 'distort', label: 'Distort'},
			{type: 'checkbox', variable: 'srOnOff', label: 'Rotate/Swing Toggle'},
			{type: 'checkbox', variable: 'swing', label: 'Swing / Rotate'},
			{type: 'range', variable: 'rotSpeed', min: 400, max: 10000, step: 1, label: 'Rotate Speed', varType: 'int'}
		]
	};
	
	var that = this;

	var newCanvas2 = document.createElement('canvas');
	var newCtx2 = newCanvas2.getContext("2d");

	this.tileWidth = 1;
	this.tileHeight = 1;

	this.init = function(canvas) {
		newCanvas2.width = canvas.width;
		newCanvas2.height = canvas.height;
	};
	
	this.zoomIntensity = 50;
	this.zoomSpeed = 0.01;
	this.distortSpeed = 0.01;
	this.distort = false;
	this.srOnOff = false;
	this.rotSpeed = 400;
	this.swing = false;
		
	var sinVal = 0;
	var distortVal = 0;
	
	function sine() {
		return that.zoomIntensity * Math.sin(sinVal);
	}
	
	var degree = 0;

	function boundingBox(rw, rh, radians) {
					
		var x1 = -rw/2,
			x2 = rw/2,
			x3 = rw/2,
			x4 = -rw/2,
			y1 = rh/2,
			y2 = rh/2,
			y3 = -rh/2,
			y4 = -rh/2;

		var x11 = x1 * Math.cos(radians) + y1 * Math.sin(radians),
			y11 = -x1 * Math.sin(radians) + y1 * Math.cos(radians),
			x21 = x2 * Math.cos(radians) + y2 * Math.sin(radians),
			y21 = -x2 * Math.sin(radians) + y2 * Math.cos(radians), 
			x31 = x3 * Math.cos(radians) + y3 * Math.sin(radians),
			y31 = -x3 * Math.sin(radians) + y3 * Math.cos(radians),
			x41 = x4 * Math.cos(radians) + y4 * Math.sin(radians),
			y41 = -x4 * Math.sin(radians) + y4 * Math.cos(radians);

		var x_min = Math.min(x11,x21,x31,x41),
			x_max = Math.max(x11,x21,x31,x41);

		var y_min = Math.min(y11,y21,y31,y41);
			y_max = Math.max(y11,y21,y31,y41);

		return [x_max-x_min,y_max-y_min];
	}
	
	// Based on Simon's Fiddle:
	// http://jsfiddle.net/LBzUt/

	this.draw = function(canvas, ctx, amplitudeArray, vid, mey, delta) {
		
		var all = 0;
		for(var i=0; i<64; i++) {
			all += amplitudeArray[i];
		}
		all = all/1000;
		
		var thisDistortVal = Math.cos(distortVal); 
		
		newCtx2.clearRect(0,0,canvas.width, canvas.height);
		newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, newCanvas2.width, newCanvas2.height);
		ctx.save();
		
		if(this.distort) ctx.setTransform(1, thisDistortVal, 0, 1, canvas.width/2, canvas.height/2);
		else ctx.setTransform(1, 0, 0, 1, canvas.width/2, canvas.height/2);
		
		var scaleVal = 1+sine()/100;
		ctx.scale(scaleVal, scaleVal);
		if(this.srOnOff) {
			if(this.swing) ctx.rotate(Math.sin(delta/this.rotSpeed));
			else ctx.rotate(delta/this.rotSpeed);
		}
		ctx.translate(-canvas.width/2, -canvas.height/2);
		
		for(var i=0; i < this.tileWidth+10; i++) {
			for(var j=0; j < this.tileHeight+10; j++) {
				var newX = ((-(newCanvas2.width/this.tileWidth)*10)/2) + ((newCanvas2.width/this.tileWidth)*i);
				var newY = ((-(newCanvas2.height/this.tileHeight)*10)/2) + ((newCanvas2.height/this.tileHeight)*j);
				
				//if(heightSkewed == newY) continue;
				//else if(scaleVal == 1) continue;
				//else if(heightSkewed > newY && scaleVal > 1 && (newX < 0 || newX > 1)) continue;
							
				ctx.drawImage(newCanvas2,
					0,
					0,
					newCanvas2.width,
					newCanvas2.height,
					newX,
					newY,
					(newCanvas2.width/this.tileWidth),
					(newCanvas2.height/this.tileHeight)
				);
			}
		}
/*
		ctx.setTransform(1, 0, 0, 1, canvas.width/2, canvas.height/2);
		//ctx.rotate(-degree);
		ctx.scale(scaleVal, scaleVal);
		
		var heightSkewed = (Math.tan(thisDistortVal) * canvas.height) + canvas.height;

		var vals = boundingBox(newCanvas2.width, heightSkewed, degree);
		ctx.fillStyle = 'rgba(0,255,255,0.3)';
		ctx.fillRect(
			-vals[0]/2,
			-vals[1]/2,
			vals[0],
			vals[1]
		);
		ctx.strokeStyle = 'red';
		ctx.lineWidth = '3px';
		ctx.strokeRect(
			-vals[0]/2,
			-vals[1]/2,
			vals[0],
			vals[1]
		);
		ctx.scale(scaleVal, scaleVal);
		ctx.translate(-canvas.width/2, -canvas.height/2);
		
		ctx.font = '24px monospace';
		ctx.textAlign = 'left';
		ctx.fillStyle = 'red';
		ctx.fillText('Skew height: ' + Math.floor(heightSkewed) + 'px', 24, 24);
		ctx.fillText('Canvas Dimensions: ' + canvas.width + 'px ' + canvas.height + 'px', 24, 48);
		ctx.fillText('Scale: ' + parseFloat('' + scaleVal).toFixed(2), 24, 72);
		ctx.fillText('Bounding Box: ' + Math.floor(vals[0]) + 'px ' + Math.floor(vals[1]) + 'px', 24, 96);
		
		ctx.rotate(degree);
*/
		
		ctx.restore();
		if(sinVal >= 100) sinVal = 0;
		else sinVal += this.zoomSpeed;
		
		if(this.distort) {
			if(distortVal >= 100) distortVal = 0;
			else distortVal += this.distortSpeed;
		}
	};
};