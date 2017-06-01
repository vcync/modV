class GridStretch extends modV.Module2D {
	constructor() {
		super({
			info: {
				name: 'Grid Stretch',
				author: '2xAA',
				version: 0.1,
				meyda: ['zcr', 'rms'],
				previewWithOutput: true
			}
		});

		var controls = [];

		controls.push(new modV.RangeControl({
			variable: 'countX',
			label: 'Grid Size X',
			varType: 'int',
			min: 1,
			max: 20,
			step: 1,
			default: 10
		}));

		controls.push(new modV.RangeControl({
			variable: 'countY',
			label: 'Grid Size Y',
			varType: 'int',
			min: 1,
			max: 20,
			step: 1,
			default: 10
		}));

		controls.push(new modV.RangeControl({
			variable: 'intensity',
			label: 'RMS/ZCR Intensity',
			varType: 'int',
			min: 0,
			max: 30,
			step: 1,
			default: 15
		}));

		controls.push(new modV.CheckboxControl({
			variable: 'zcr',
			label: 'RMS (unchecked) / ZCR (checked)',
			checked: false
		}));

		this.add(controls);
	}
	
	init(canvas) {

		this.newCanvas2 = document.createElement('canvas');
		this.newCtx2 = this.newCanvas2.getContext('2d');
		this.analysed = 0;

		this.newCanvas2.width = canvas.width;
		this.newCanvas2.height = canvas.height;

		this.countX = 10;
		this.countY = 10;
		this.intensity = 15;
		this.zcr = false;
		
	}

	resize(canvas) {
		this.newCanvas2.width = canvas.width;
		this.newCanvas2.height = canvas.height;
	}

	draw(canvas, ctx, vid, features) {

		var sliceWidth = canvas.width/this.countX,
			sliceHeight = canvas.height/this.countY;

		this.newCtx2.clearRect(0, 0, canvas.width, canvas.height);

		for(var i=this.countX; i >= 0; i--) {
		  for(var j=this.countY; j >= 0; j--) {

				if(this.zcr) {
					this.analysed = features.zcr/10 * this.intensity;
				} else {
					this.analysed = (features.rms * 10) * this.intensity;
				}

				this.newCtx2.drawImage(canvas,
					i*sliceWidth,
					j*sliceHeight,
					sliceWidth,
					sliceHeight,

					(i*sliceWidth) - this.analysed,
					(j*sliceHeight) - this.analysed,
					sliceWidth + ((this.analysed) * 2),
					sliceHeight + ((this.analysed) * 2)
				);

			}
		}
		ctx.drawImage(this.newCanvas2, 0, 0, canvas.width, canvas.height);
	}
}

modV.register(GridStretch);