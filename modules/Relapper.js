class Relapper extends modV.Module2D {

	constructor() {
		super({
			info: {
				name: 'Relapper',
				author: '2xAA',
				version: 1.0,
				previewWithOutput: true
			}
		});

		this.add(new modV.RangeControl({
			variable: 'overlaps',
			label: 'Overlaps',
			min: 1,
			max: 100,
			varType: 'int',
			step: 1,
			default: 50
		}));

		this.add(new modV.CheckboxControl({
			variable: 'direction',
			label: 'Direction',
			checked: false
		}));
	}

	init(canvas) {
		this.newCanvas2 = document.createElement('canvas');
		this.newCtx2 = this.newCanvas2.getContext('2d');
		
		this.direction = false;
		this.overlaps = 50;

		this.newCanvas2.width = canvas.width;
		this.newCanvas2.height = canvas.height;
	}

	resize(canvas) {
		this.newCanvas2.width = canvas.width;
		this.newCanvas2.height = canvas.height;
	}

	draw(canvas, ctx) {

		this.newCtx2.clearRect(0, 0, canvas.width, canvas.height);
		this.newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, this.newCanvas2.width, this.newCanvas2.height);
		
		if(this.direction) {

			for(let i=0; i < canvas.width; i+= Math.floor(canvas.width/this.overlaps)) {
				ctx.drawImage(this.newCanvas2, i, 0, this.overlaps, canvas.height, i, 0, canvas.width, canvas.height);
			}

		} else {

			for(let i=0; i < canvas.height; i+= Math.floor(canvas.height/this.overlaps)) {
				ctx.drawImage(this.newCanvas2, 0, i, canvas.width, this.overlaps, 0, i, canvas.width, canvas.height);
			}

		}
	}
}

modV.register(Relapper);