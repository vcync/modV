class Pixelate extends modV.Module2D {

	constructor() {
		super({
			info: {
				name: 'Pixelate',
				author: '2xAA',
				version: 0.1,
				previewWithOutput: true,
				meyda: ['rms', 'zcr']
			}
		});

		var controls = [];

		controls.push(new modV.RangeControl({
			variable: 'pixelAmount',
			label: 'Amount',
			varType: 'int',
			min: 2,
			max: 30,
			step: 1,
			default: 5
		}));

		controls.push(new modV.CheckboxControl({
			variable: 'soundReactive',
			label: 'Sound Reactive',
			checked: false
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
			variable: 'soundType',
			label: 'RMS (unchecked) / ZCR (checked)',
			checked: false
		}));

		this.add(controls);
	}
	
	init(canvas) {

		this.soundReactive = false;
		this.soundType = false; // false RMS, true ZCR
		this.intensity = 15; // Half max
		this.pixelAmount = 5;

		this.newCanvas2 = document.createElement('canvas');
		this.newCtx2 = this.newCanvas2.getContext("2d");
		this.newCtx2.imageSmoothingEnabled = false;

		this.newCanvas2.width = canvas.width;
		this.newCanvas2.height = canvas.height;
		
	}

	resize(canvas) {
		this.newCanvas2.width = canvas.width;
		this.newCanvas2.height = canvas.height;
	}

	draw(canvas, ctx, vid, features) {

		var w, h, analysed;

		if(this.soundReactive) {
			if(this.soundType) {
				analysed = features.zcr/10 * this.intensity;
			} else {
				analysed = (features.rms * 10) * this.intensity;
			}

			w = canvas.width / analysed;
			h = canvas.height / analysed;

		} else {
			w = canvas.width / this.pixelAmount;
			h = canvas.height / this.pixelAmount;
		}

		ctx.save();
		this.newCtx2.clearRect(0, 0, this.newCanvas2.width, this.newCanvas2.height);
		ctx.imageSmoothingEnabled = false;
		this.newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, w, h);
		ctx.drawImage(this.newCanvas2, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
		ctx.restore();		

	}
}

modV.register(Pixelate);