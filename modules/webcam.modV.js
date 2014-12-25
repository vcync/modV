var webcam = function() {
	this.info = {
		name: 'webcam',
		author: '2xAA',
		version: 0.1
	};

	this.init = function() {
		
	};

	this.draw = function(canvas, ctx, audio, video) {
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height); 
	};
};