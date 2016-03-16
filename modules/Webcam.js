var Webcam = new modVC.Module2D({
	info: {
		name: 'Webcam',
		author: '2xAA',
		version: 0.1
	},
	init: function(canvas) {
		
	}, draw: function(canvas, ctx, vid, features, meyda, delta, bpm) {

		ctx.drawImage(vid, 0, 0, canvas.width, canvas.height); 

	}
});

modVC.register(Webcam);