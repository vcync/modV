var staticImage = function() {
	this.info = {
		name: 'staticImage',
		author: '2xAA',
		version: 0.1,
		controls: [
			 {type: 'image', variable: 'image', label: 'Drag and drop an image here'},
			 {type: 'checkbox', variable: 'smoothing', label: 'Image Smoothing'}
		]
	};
	
	this.smoothing = false;
	this.image = new Image();
	this.image.src = 'gameboy.gif';

	this.draw = function(canvas, ctx, amplitudeArray) {
		if(!this.smoothing) ctx.webkitImageSmoothingEnabled = false;
		ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
	};
};
staticImage = new staticImage();