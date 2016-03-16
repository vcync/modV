var SlipNSlide = new modVC.Module2D({
	info: {
		name: 'Slip \'n\' Slide',
		author: '2xAA',
		version: 0.1,
		previewWithOutput: true
	},
	init: function(canvas) {
 		
		this.sections = 50;
		this.t = 0;

		this.newCanvas2 = document.createElement('canvas');
		this.newCtx2 = this.newCanvas2.getContext("2d");

		this.newCanvas2.width = canvas.width;
		this.newCanvas2.height = canvas.height;
		
	},
	resize: function(canvas, ctx) {
		this.newCanvas2.width = canvas.width;
		this.newCanvas2.height = canvas.height;
	},
	draw: function(canvas, ctx, vid, features, meyda, delta, bpm) {

		this.newCtx2.clearRect(0, 0, canvas.width, canvas.height);
		this.newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, this.newCanvas2.width, this.newCanvas2.height);
		
		for(var i=0; i < canvas.height; i+= Math.floor(canvas.height/this.sections)) {
			ctx.drawImage(this.newCanvas2, Math.sin(this.t+i)*i, i, canvas.width, this.sections, 0, i, canvas.width, canvas.height);
		}
		
		if(this.t < 360) this.t+=0.01;
		else this.t = 0;

	}
});

SlipNSlide.add(new modVC.RangeControl({
	variable: 'sections',
	label: 'Sections',
	min: 0,
	max: 100,
	varType: 'int',
	step: 1
}));

modVC.register(SlipNSlide);