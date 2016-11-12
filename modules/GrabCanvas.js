class GrabCanvas extends modV.Module2D {
	constructor() {
		super({
			info: {
				name: 'Grab Canvas',
				author: 'Tim Pietrusky & Sam Wray',
				version: 0.1,
				previewWithOutput: false
			}
		});

		this.divsor = 3;
	}

	createControls(Module) {

		//return div;

	}
	
	init(canvas) {
		
		if(this.info.galleryItem) return;

		this.worker = new Worker('./modules/GrabCanvas/worker.js');

		this.canvas2 = document.createElement('canvas');
		this.ctx2 = this.canvas2.getContext("2d");
		this.ctx2.imageSmoothingEnabled = false;

		this.canvas2.width = Math.round(canvas.width / this.divsor);
		this.canvas2.height = Math.round(canvas.height / this.divsor);

	}

	resize(canvas) {
		this.canvas2.width = Math.round(canvas.width / this.divsor);
		this.canvas2.height = Math.round(canvas.height / this.divsor);
	}

	draw(canvas, ctx, a, b, c, delta) {
		if(this.info.galleryItem) return;

		this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
		this.ctx2.drawImage(canvas, 0, 0, this.canvas2.width, this.canvas2.height);

		this.worker.postMessage(this.ctx2.getImageData(0, 0, this.canvas2.width, this.canvas2.height));
	}
}

modV.register(GrabCanvas);