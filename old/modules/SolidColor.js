class SolidColor extends modV.Module2D {
	constructor() {
		super({
			info: {
				name: 'Solid Colour',
				author: '2xAA',
				version: 0.1
			}
		});


		this.add(new modV.ColorControl({
			variable: 'color',
			label: 'Color' 
		}));
	}

	init() {
		this.color = '#e9967a'; //dark salmon
	}

	draw(canvas, ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(0,0,canvas.width,canvas.height);
	}
}

modV.register(SolidColor);