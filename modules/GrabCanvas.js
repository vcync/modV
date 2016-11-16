class GrabCanvas extends modV.Module2D {
	constructor() {
		super({
			info: {
				name: 'Grab Canvas',
				author: 'Tim Pietrusky & Sam Wray',
				version: 0.1,
				previewWithOutput: false,
				scripts: [
					'GrabCanvas/SweetCandy.js'
				]
			}
		});

		this.divsor = 4;
	}

	init(canvas) {
		if(this.info.galleryItem) return;

		//this.worker = new Worker('./modules/GrabCanvas/worker.js');
		// this.worker.postMessage({type: 'setup', payload: {
		// 	width: canvas.width,
		// 	height: canvas.height,
		// 	devicePixelRatio: window.devicePixelRatio
		// }});

		this.Candy = new SweetCandy('ws://192.168.0.9:7890');

		let width = canvas.width;
		let height = canvas.height;
		let halfWidth = Math.floor(width/2);
		let halfHeight = Math.floor(height/2);

        this.Candy.devicePixelRatio = window.devicePixelRatio;
        this.Candy.reset();
        this.Candy.setDimensions(width, height);
		
		for (var y = 0; y < 8; y++) {
			for (var x = 0; x < 8; x++) {
				var spacing = height / 12;
				var pointX = halfWidth + (spacing * (x - 3.5));
				var pointY = halfHeight + (spacing * (y - 3.5));

				this.Candy.addLED(new LED(pointX, pointY)); //jshint ignore:line
			}
		}
	}

	resize(canvas) {
		// this.worker.postMessage({type: 'setup', payload: {
		// 	width: canvas.width,
		// 	height: canvas.height,
		// 	devicePixelRatio: window.devicePixelRatio
		// }});

		this.Candy.setDimensions(canvas.width, canvas.height);

		let width = canvas.width;
		let height = canvas.height;
		let halfWidth = Math.floor(width/2);
		let halfHeight = Math.floor(height/2);

		this.Candy.reset();
		
		for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {
				var spacing = height / 12;
				var pointX = halfWidth + (spacing * (x - 3.5));
				var pointY = halfHeight + (spacing * (y - 3.5));

				this.Candy.addLED(new LED(pointX, pointY)); //jshint ignore:line
			}
		}
	}

	draw(canvas, ctx, video, meyda, meydaFeatures, delta, bpm, kick, _gl) {
		
		var pixels = new Uint8Array(_gl.drawingBufferWidth * _gl.drawingBufferHeight * 4);
		_gl.readPixels(0, 0, _gl.drawingBufferWidth, _gl.drawingBufferHeight, _gl.RGBA, _gl.UNSIGNED_BYTE, pixels);
		//console.log(pixels); // Uint8Array

		this.Candy.drawFrame(null, null, pixels);

		// for(let i = 0; i < this.Candy.LEDs.length; i++) {
		// 	let led = this.Candy.LEDs[i];
		// 	ctx.save();
		// 	ctx.strokeStyle = 'white';
		// 	ctx.lineWidth = 1;

		// 	ctx.beginPath();
		// 	ctx.arc(led.x, led.y, 10, 0, 2*Math.PI);
		// 	ctx.closePath();
		// 	ctx.stroke();
		// 	ctx.restore();
		// }

		//this.worker.postMessage({type: 'data', payload: pixels});
	}
}

modV.register(GrabCanvas);