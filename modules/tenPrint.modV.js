var tenPrint = function() {
	this.info = {
		name: 'tenPrint',
		author: 'Dario',
		version: 0.1,
		controls: [
			{type: 'range', variable: 'side', min: 1, max: 40, label: 'grid size', varType: 'int'},
			{type: 'range', variable: 'lineWidth', min: 1, max: 20, label: 'line width', varType: 'int'},
			{type: 'range', variable: 'threshold', min: 0, max: 1, step: 0.01, label: 'random threshold', varType: 'float'}
		]
	};
	
	this.side = 16;
	this.lineWidth = 10;
	this.threshold = 0.5;
	var w, h, cw, ch, index, lineWidth, side;
	
	var factor = 1.39;

	this.draw = function(canvas, ctx, amplitudeArray) {
		
		var sum = 0;
		var maxPower = Number.NEGATIVE_INFINITY;
		for(var i=0; i<64; i++) {
			if(amplitudeArray[i] > maxPower) maxPower = amplitudeArray[i];
			sum += amplitudeArray[i];
		}
		var avgPower = sum/64;
		
		var powRatio = avgPower/maxPower;
		//console.log(powRatio);
		
		lineWidth = this.lineWidth;
		side = this.side;
		cw = canvas.width;
		ch = canvas.height;
		
		w = cw/side;
		h = ch/side;
		
		h = Math.max(w, h);
		w = Math.max(w, h);
		
		ctx.save();
		/*
ctx.fillStyle="white";
		ctx.fillRect(0, 0, cw, ch);
		ctx.fill();
*/
		
		ctx.lineWidth = this.lineWidth;
		index = 0;
		
		var x, y;
		
		while (index < (side*side)) {

			x = (index % side);
			y = (index / side) | 0;
		
			var x1 = (side + x * w) - lineWidth/factor;
			var x2 = (x1 + w) + lineWidth/factor;
			var y1 = (side + y * h) - lineWidth/factor;
			var y2 = (y1 + h) + lineWidth/factor;
			ctx.save();
			ctx.beginPath();
			
			// xxx make this a var
			if (Math.random() < powRatio) {
		//       ctx.arc(x1, y2, w, 0, coolAngle, true);
		  		ctx.moveTo(x1-side, y1-side);
		  		ctx.lineTo(x2-side, y2-side);
		  		ctx.fillStyle = "rgba(0,0,20,1)";  
		  		ctx.strokeStyle = "rgba(0,0,20,1)";
		  	} else {
		  		ctx.moveTo(x2-side, y1-side);
		  		ctx.lineTo(x1-side, y2-side);
		//       ctx.arc(x2, y1, w, coolAngle, uncoolAngle, true);
				ctx.fillStyle = "rgba(0,0,20,1)";  
				ctx.strokeStyle = "rgba(255,0,0,15)";
			}
		
			ctx.closePath();
			ctx.fill();
			ctx.stroke(); 
			ctx.restore();
			index++;
		}

		ctx.restore();
	};
};
tenPrint = new tenPrint();