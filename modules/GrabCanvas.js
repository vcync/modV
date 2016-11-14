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

		this.divsor = 4;
	}

	createControls(Module) {

		//return div;

	}
	
	init(canvas) {
		if(this.info.galleryItem) return;

		this.worker = new Worker('./modules/GrabCanvas/worker.js');
		this.worker.postMessage({type: 'setup', payload: {
			width: canvas.width,
			height: canvas.height,
			devicePixelRatio: window.devicePixelRatio
		}});

	}

	resize(canvas) {
		this.worker.postMessage({type: 'setup', payload: {
			width: canvas.width,
			height: canvas.height,
			devicePixelRatio: window.devicePixelRatio
		}});
	}

	draw(canvas, ctx, video, meyda, meydaFeatures, delta, bpm, kick, _gl) {

		var pixels = new Uint8Array(_gl.drawingBufferWidth * _gl.drawingBufferHeight * 4);
		_gl.readPixels(0, 0, _gl.drawingBufferWidth, _gl.drawingBufferHeight, _gl.RGBA, _gl.UNSIGNED_BYTE, pixels);
		//console.log(pixels); // Uint8Array

		this.worker.postMessage({type: 'data', payload: pixels});
	}
}

modV.register(GrabCanvas);