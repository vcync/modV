class Waveform extends modV.Module2D {

	constructor() {
		super({
			info: {
				name: 'Waveform',
				author: '2xAA',
				version: 0.1,
				meyda: ['buffer']
			}
		});

		this.add(new modV.RangeControl({
			variable: 'strokeWeight',
			label: 'Stroke',
			varType: 'int',
			min: 1,
			max: 30,
			default: 1
		}));

		this.add(new modV.SelectControl({
			variable: 'windowing',
			label: 'Windowing',
			enum: [
				{label: 'Rectangular (no window)', value: 'rect'},
				{label: 'Hanning', value: 'hanning', default: true},
				{label: 'Hamming', value: 'hamming'},
				{label: 'Blackman', value: 'blackman'},
				{label: 'Sine', value: 'sine'}
			]
		}));

		this.add(new modV.PaletteControl({
			variable: 'colour',
			colours: [
				[227,210,131],
				[62,169,158],
				[190,132,80],
				[94,226,204],
				[230,173,120],
				[137,218,202],
				[167,149,71],
				[195,232,214],
				[176,137,101],
				[158,225,161],
				[230,188,153],
				[87,171,120],
				[213,211,191],
				[126,159,95],
				[147,159,144],
				[182,211,127],
				[111,165,141],
				[212,201,154],
				[159,152,107],
				[209,229,175]
			], // generated here: http://tools.medialab.sciences-po.fr/iwanthue/
			timePeriod: 500
		}));
	}

	init() {
		this.colour = 'red';
		this.strokeWeight = 1;
		this.windowing = 'hanning';
	}

	draw(can, ctx, vid, features) {
		var ampArr = features.buffer;
		ampArr = Meyda.windowing(ampArr, this.windowing);

		ctx.strokeStyle = this.colour;
		ctx.lineWidth = this.strokeWeight;
		ctx.beginPath();
		for (var i = 0; i < ampArr.length-1; i+=this.strokeWeight) {
			var width = Math.round(Math.map(i, 0, ampArr.length-1, 0, can.width));
			var newWidth = Math.round(Math.map(i+this.strokeWeight, 0, ampArr.length-1, 0, can.width));
			var y = can.height/2 - (can.height * ampArr[i]) / (2);
			y = Math.round(y);
			var yNext = can.height/2 - (can.height * ampArr[i+this.strokeWeight]) / (2);
			yNext = Math.round(yNext);

			ctx.moveTo(width, y);
			ctx.lineTo(newWidth, yNext);
		}
		ctx.closePath();
		ctx.stroke();
	}
}

modV.register(Waveform);