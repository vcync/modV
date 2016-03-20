var KickDemo = new modVC.Module2D({
	info: {
		name: 'Kick Demo',
		author: '2xAA',
		version: 0.1,
		controls: []
	},
	init: function() {
		this.size = 50;
		this.colour = rgbToString([199,64,163]);
	},
	draw: function(canvas, ctx, vid, features, meyda, delta, bpm, kick) {

		if(kick) {
			ctx.beginPath();
			ctx.fillStyle = this.colour;
			//ctx.arc(canvas.width/2, canvas.height/2, this.size, 0, 2 * Math.PI, true);
			//ctx.fill();
			ctx.fillRect(0,0,canvas.width,canvas.height);
			ctx.closePath();
		}

	}
});

KickDemo.add(new modVC.RangeControl({
    variable: 'size',
    label: 'Size',
    varType: 'int',
    min: 1,
    max: 500,
    step: 1,
    default: 50
}));

KickDemo.add(new modVC.PaletteControl({
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

modVC.register(KickDemo);