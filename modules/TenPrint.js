class TenPrint extends modV.Module2D {
	constructor() {
		super({
			info: {
				name: 'tenPrint',
				author: 'Lazer Sausage',
				version: 0.2,
				meyda: ['amplitudeSpectrum', 'rms']
			}
		});

		var controls = [];

			controls.push(new modV.RangeControl({
			variable: 'side',
			min: 1,
			max: 40,
			label: 'grid size',
			varType: 'int'
		}));

		controls.push(new modV.RangeControl({
			variable: 'lineWidth',
			min: 1,
			max: 20,
			label: 'line width',
			varType: 'int'
		}));

		controls.push(new modV.RangeControl({
			variable: 'threshold',
			min: 0,
			max: 1,
			label: 'random threshold',
			varType: 'float',
			step: 0.01
		}));

		controls.push(new modV.ColorControl({
			variable: 'colour1',
			label: 'Colour On',
			varType: 'string',
			step: 0.01
		}));

		controls.push(new modV.ColorControl({
			variable: 'colour2',
			label: 'Colour Off',
			varType: 'string',
			step: 0.01
		}));

		this.add(controls);
	}

	
	init() {
		this.side = 16;
		this.lineWidth = 10;
		this.threshold = 0.5;
		this.colour1 = 'black';
		this.colour2 = 'red';
	}
	
	draw(canvas, ctx, vid, features) {
		var w, h, cw, ch, index, lineWidth, side;
		var factor = 1.39;

		var ampArr = features.amplitudeSpectrum;

		var sum = 0;
		var maxPower = Number.NEGATIVE_INFINITY;
		for(var i=0; i<64; i++) {
			if(ampArr[i] > maxPower) maxPower = ampArr[i];
			sum += ampArr[i];
		}
		//var avgPower = sum/64;
		
		//var powRatio = avgPower/maxPower;
		var powRatio = features.rms;
		
		lineWidth = this.lineWidth;
		side = this.side;
		cw = canvas.width;
		ch = canvas.height;
		
		w = cw/side;
		h = ch/side;
		
		h = Math.max(w, h);
		w = Math.max(w, h);
		
		ctx.save();
		
		ctx.lineWidth = this.lineWidth;
		index = 0;
		
		var x, y;
		
		while (index < (side*side)) {

			x = (index % side);
			y = (index / side) | 0; //jshint ignore:line
		
			var x1 = Math.round((side + x * w) - lineWidth/factor);
			var x2 = Math.round((x1 + w) + lineWidth/factor);
			var y1 = Math.round((side + y * h) - lineWidth/factor);
			var y2 = Math.round((y1 + h) + lineWidth/factor);
			ctx.save();
			ctx.beginPath();
			
			// xxx make this a var
			if (Math.random() < powRatio) {
		//       ctx.arc(x1, y2, w, 0, coolAngle, true);
		  		ctx.moveTo(x1-side, y1-side);
		  		ctx.lineTo(x2-side, y2-side);
		  		//ctx.fillStyle = "rgba(0,0,20,1)";  
		  		ctx.strokeStyle = this.colour2;
		  	} else {
		  		ctx.moveTo(x2-side, y1-side);
		  		ctx.lineTo(x1-side, y2-side);
		//       ctx.arc(x2, y1, w, coolAngle, uncoolAngle, true);
				//ctx.fillStyle = "rgba(0,0,20,1)";  
				ctx.strokeStyle = this.colour1;
			}
		
			ctx.closePath();
			//ctx.fill();
			ctx.stroke(); 
			ctx.restore();
			index++;
		}

		ctx.restore();

	}
}

modV.register(TenPrint);