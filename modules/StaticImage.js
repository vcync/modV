class StaticImage extends modV.Module2D {
	constructor() {
		super({
			info: {
				name: 'Static Image',
				author: '2xAA',
				version: 0.1,
				previewWithOutput: false
			}
		});

		this.add(new modV.RangeControl({
			variable: 'k',
			label: 'Scale',
			min: -20,
			max: 20,
			varType: 'float',
			default: 1,
			step: 0.1
		}));

		this.add(new modV.CheckboxControl({
			variable: 'stretch',
			label: 'Stretch',
			checked: false
		}));

		this.add(new modV.ImageControl({
			variable: 'image',
			label: 'Image'
		}));

		this.add(new modV.CheckboxControl({
			variable: 'smoothing',
			label: 'Smoothing',
			checked: true
		}));
	}
	
	init() {
		this.smoothing = true;
		this.image = new Image();
		this.image.src = '';
		this.stretch = false;
		this.k = 1;
	}

	draw(canvas, ctx) {
		if(!this.smoothing) ctx.imageSmoothingEnabled = false;

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
}

modV.register(StaticImage);