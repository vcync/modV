class GrabCanvas extends modV.ModuleScript {
	constructor() {
		super({
			info: {
				name: 'Grab Canvas',
				author: 'Tim Pietrusky & Sam Wray',
				version: 0.1,
				previewWithOutput: false,
				// scripts: [
				// 	'GrabCanvas/nerdV.js'
				// ]
			}
		});

		this.add(new modV.ButtonControl({
			label: 'Fog',
			onpress: () => {
				this.setFog(true);
			},
			onrelease: () => {
				this.setFog(false);
			}
		}));

		this.divsor = 4;
	}

	init(canvas) {
		if(this.info.galleryItem) {
			console.log('in gallery');
			return;
		}

		this.worker = new Worker('./modules/GrabCanvas/worker.js');

		// this.nerdV = new nerdV(
		// 	'ws://192.168.0.102:1337', // LED
		// 	'ws://localhost:1337' // DMX
		// );

		//this.internalCanvas = document.createElement('canvas');
		//this.internalContext = this.internalCanvas.getContext('2d');

		this.resize(canvas);
	}

	resize(canvas) {
		this.worker.postMessage({type: 'setup', payload: {
			width: canvas.width,
			height: canvas.height,
			devicePixelRatio: window.devicePixelRatio
		}});

		// let width = canvas.width;
		// let height = canvas.height;

		// this.internalCanvas.width = width;
		// this.internalCanvas.height = height;

		// this.nerdV.devicePixelRatio = window.devicePixelRatio;

		// this.nerdV.reset();
		// this.nerdV.setDimensions(width, height);

		// for (var x = 0; x < 8; x++) {
		// 	for (var y = 30; y > 0; y--) {
		// 		var pointX = (x * Math.floor(width/8)) + Math.floor((width/8) / 2);
		// 		var pointY = (y * Math.floor(height/30));

		// 		this.nerdV.addLED(new LED(pointX, pointY)); //jshint ignore:line
		// 	}
		// }
	}

	loop(canvas, ctx, video, meyda, meydaFeatures, delta, bpm, kick, _gl) {

		//var pixels = new Uint8Array(_gl.drawingBufferWidth * _gl.drawingBufferHeight * 4);
		//_gl.readPixels(0, 0, _gl.drawingBufferWidth, _gl.drawingBufferHeight, _gl.RGBA, _gl.UNSIGNED_BYTE, pixels);
		
		//var pixels = new Uint8Array(canvas.width * canvas.height * 4);

		//this.internalContext.drawImage(canvas, 0, 0);
		let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

		//this.nerdV.drawFrame(null, null, pixels);

		// for(let i = 0; i < this.nerdV.LEDs.length; i++) {
		// 	let led = this.nerdV.LEDs[i];
		// 	ctx.save();
		// 	ctx.strokeStyle = 'white';
		// 	ctx.lineWidth = 1;

		// 	ctx.beginPath();
		// 	ctx.arc(led.x, led.y, 10, 0, 2*Math.PI);
		// 	ctx.closePath();
		// 	ctx.stroke();
		// 	ctx.restore();
		// }

		this.worker.postMessage({type: 'data', payload: pixels});
	}

	setFog(value) {
		this.worker.postMessage({type: 'fog', payload: value});
	}
}

modV.register(GrabCanvas);