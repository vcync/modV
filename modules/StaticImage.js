var StaticImage = new modVC.Module2D({
	info: {
		name: 'Static Image',
		author: '2xAA',
		version: 0.1,
		previewWithOutput: false
	},
	init: function(canvas) {
 		
		this.smoothing = true;
		this.image = new Image();
		this.image.src = '';
		this.stretch = false;
		this.k = 1;
		
	},
	draw: function(canvas, ctx, vid, features, meyda, delta, bpm) {

		if(!this.smoothing) ctx.webkitImageSmoothingEnabled = false;

		if(this.stretch) {
			ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
		} else {
			ctx.drawImage(this.image,
				canvas.width/2 - this.image.width * this.k/2,
				canvas.height/2 - this.image.height * this.k/2,
				this.image.width * this.k,
				this.image.height * this.k
			);
		}

	}
});

StaticImage.add(new modVC.RangeControl({
	variable: 'k',
	label: 'Scale',
	min: -20,
	max: 20,
	varType: 'float',
	default: 1,
	step: 0.1
}));

StaticImage.add(new modVC.CheckboxControl({
	variable: 'stretch',
	label: 'Stretch',
	checked: false
}));

StaticImage.add(new modVC.ImageControl({
	variable: 'image',
	label: 'Image'
}));

StaticImage.add(new modVC.CheckboxControl({
	variable: 'smoothing',
	label: 'Smoothing',
	checked: true
}));


modVC.register(StaticImage);