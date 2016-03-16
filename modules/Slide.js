var Slide = new modVC.Module2D({
	info: {
		name: 'Slide',
		author: '2xAA',
		version: 0.1,
		previewWithOutput: true
	},
	init: function(canvas) {
 		
		this.speed = 0;
		this.offset = 0;
		this.base = 0;

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

		if(this.offset >= canvas.height) {
			this.offset = (this.offset-canvas.height)+this.speed;
		} else {
			this.offset += this.speed;
		}

		ctx.save();
		this.newCtx2.clearRect(0, 0, this.newCanvas2.width, this.newCanvas2.height);
		this.newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
		
		ctx.drawImage(this.newCanvas2, 0, this.offset);
		ctx.drawImage(this.newCanvas2, 0, (-canvas.height + this.offset));
		
		
		ctx.restore();	

	}
});

var controls = [];

controls.push(new modVC.RangeControl({
    variable: 'speed',
    label: 'Speed',
    varType: 'int',
    min: 0,
    max: 100,
    step: 1,
    default: 0
}));

Slide.add(controls);

modVC.register(Slide);