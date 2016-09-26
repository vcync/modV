class Xorcles extends modV.Module2D {
	constructor() {
		super({
			info: {
				name: 'Xorcles',
				author: '2xAA',
				version: 0.1,
				meyda: ['rms']
			}
		});

		var controls = [];

		controls.push(new modV.RangeControl({
			variable: 'circles',
			min: 1,
			max: 100,
			step: 1,
			varType: 'int',
			label: 'Circles'
		}));

		controls.push(new modV.RangeControl({
			variable: 'size',
			min: 1,
			max: 500,
			step: 1,
			varType: 'int',
			label: 'Size'
		}));

		controls.push(new modV.RangeControl({
			variable: 'spread',
			min: 1,
			max: 2000,
			step: 1,
			varType: 'int',
			label: 'Spread'
		}));

		controls.push(new modV.RangeControl({
			variable: 'rmsIntensity',
			min: 1,
			max: 2000,
			varType: 'int',
			label: 'RMS intensity'
		}));

		controls.push(new modV.PaletteControl({
			variable: 'colour',
			colours: [
				[122,121,120],
				[135,203,172],
				[144,255,220],
				[141,228,255],
				[138,196,255]
			],
			timePeriod: 500
		}));

		this.add(controls);
	}

	init(canvas) {
		this.mCanvas = document.createElement('canvas');
		this.mCtx = this.mCanvas.getContext('2d');

		this.circles = 20;
		this.size = 50;
		this.colour = '#fff';
		this.spread = 50;
		this.rmsIntensity = 300;

		this.mCanvas.width = canvas.width;
		this.mCanvas.height = canvas.height;
	}

	resize(canvas) {
		this.mCanvas.width = canvas.width;
		this.mCanvas.height = canvas.height;
	}
	
	draw(canvas, ctx, video, features, meyda, delta) {
		
		this.mCtx.fillStyle = this.colour;

		this.mCtx.globalCompositeOperation = 'xor';

		for(var i=0; i < this.circles; i++) {
			
			this.mCtx.beginPath();
			this.mCtx.arc(canvas.width/2 - this.spread/2 * Math.sin(((i / this.circles) * 360) * Math.PI / 180)/* + (Math.sin(delta/200+i) * 80)*/,
					canvas.height/2 - this.spread/2 * Math.cos(((i / this.circles) * 360) * Math.PI / 180)/* + (Math.cos(delta/500+i) * 80)*/,
					Math.abs(this.size + (Math.sin(delta/700) * features.rms* this.rmsIntensity)),
					0,
					2*Math.PI);
			
			this.mCtx.fill();
		}

		ctx.drawImage(this.mCanvas, 0, 0);
		this.mCtx.clearRect(0, 0, this.mCanvas.width, this.mCanvas.height);
	}
}

modV.register(Xorcles); 