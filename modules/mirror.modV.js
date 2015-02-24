var mirror = function() {
	this.info = {
		name: 'mirror',
		author: '2xAA',
		version: 0.1
	};

	var newCanvas2 = document.createElement('canvas');
	var newCtx2 = newCanvas2.getContext('2d');

	this.init = function(canvas) {
		newCanvas2.width = canvas.width;
		newCanvas2.height = canvas.height;
	};
		
	this.draw = function(canvas, ctx, audio, video) {
		ctx.clearRect(canvas.width/2, 0, canvas.width/2, canvas.height);
		newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height);
		newCtx2.scale(-1, 1);
		newCtx2.translate(-canvas.width, 0);
		//newCtx2.clearRect(0, 0, canvas.width/2, canvas.height);

		ctx.drawImage(newCanvas2, 0, 0);
	};
};