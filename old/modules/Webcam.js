class Webcam extends modV.Module2D {
	constructor() {
		super({
			info: {
				name: 'Webcam',
				author: '2xAA',
				version: 0.1
			}
		});
	}
	
	init() {
		
	}

	draw(canvas, ctx, vid) {
		ctx.drawImage(vid, 0, 0, canvas.width, canvas.height); 
	}
}

modV.register(Webcam);