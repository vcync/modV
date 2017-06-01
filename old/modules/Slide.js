class Slide extends modV.Module2D {

	constructor() {
		super({
			info: {
				name: 'Slide',
				author: '2xAA',
				version: 0.1,
				previewWithOutput: true,
				previewValues: {
					speed: 3
				}
			}
		});

		var controls = [];

		controls.push(new modV.RangeControl({
			variable: 'speed',
			label: 'Speed',
			varType: 'int',
			min: 0,
			max: 100,
			step: 1,
			default: 0
		}));

		controls.push(new modV.CheckboxControl({
			variable: 'clearing',
			label: 'Clearing',
			checked: false
		}));

		this.add(controls);
	}

	init(canvas) {
 		
		this.speed = 0;
		this.offset = 0;
		this.base = 0;
		this.clearing = false;

		this.newCanvas2 = document.createElement('canvas');
		this.newCtx2 = this.newCanvas2.getContext("2d");

		this.newCanvas2.width = canvas.width;
		this.newCanvas2.height = canvas.height;
		
	}

	resize(canvas) {
		this.newCanvas2.width = canvas.width;
		this.newCanvas2.height = canvas.height;
	}

	draw(canvas, ctx) {

		if(this.offset >= canvas.height) {
			this.offset = (this.offset-canvas.height)+this.speed;
		} else {
			this.offset += this.speed;
		}

		
		this.newCtx2.clearRect(0, 0, this.newCanvas2.width, this.newCanvas2.height);
		this.newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
		if(this.clearing) ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		ctx.save();

		ctx.drawImage(this.newCanvas2, 0, this.offset);
		ctx.drawImage(this.newCanvas2, 0, (-canvas.height + this.offset));
		
		
		ctx.restore();	

	}
}

modV.register(Slide);