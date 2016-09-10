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

		this.add(new modV.PaletteControl({
			variable: 'colour',
			colours: [
				[199,64,163],
				[97,214,199],
				[222,60,75],
				[101,151,220],
				[213,158,151],
				[100,132,129],
				[154,94,218],
				[194,211,205],
				[201,107,152],
				[119,98,169],
				[214,175,208],
				[218,57,123],
				[196,96,98],
				[218,74,219],
				[138,100,121],
				[96,118,225],
				[132,195,223],
				[82,127,162],
				[209,121,211],
				[181,152,220]
			], // generated here: http://tools.medialab.sciences-po.fr/iwanthue/
			timePeriod: 500
		}));
	}

	init() {
		this.colour = 'red';
		this.strokeWeight = 1;
	}

	draw(can, ctx, vid, features, meyda) {
		var ampArr = features.buffer;
		ampArr = meyda.windowing(ampArr, 'hanning');

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