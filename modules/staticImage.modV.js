var staticImage = function() {
	this.info = {
		name: 'staticImage',
		author: '2xAA',
		version: 0.1,
		controls: [
			 {type: 'image', variable: 'image', label: 'Drag and drop an image here'},
			 {type: 'checkbox', variable: 'smoothing', label: 'Image Smoothing'},
			 {type: 'checkbox', variable: 'keepAspectRatio', label: 'Keep aspect ratio'}
		]
	};

	this.smoothing = false;
	this.keepAspectRatio = false;
	this.image = new Image();
	this.image.src = 'gameboy.gif';

	this.draw = function(canvas, ctx, amplitudeArray) {
		var width;
		var height;
		var xOffset = 0;
		var yOffset = 0;

		if(!this.smoothing) ctx.webkitImageSmoothingEnabled = false;

		if (this.keepAspectRatio) {
			if ((this.image.width/this.image.height) <= (canvas.width/canvas.height)) {
				width = (canvas.height/this.image.height)*this.image.width;
				height = canvas.height;
				xOffset = (canvas.width - width)/2;
			} else {
				height = (canvas.width/this.image.width)*this.image.height;
				width = canvas.width;
				yOffset = (canvas.height - height)/2;
			}
		} else {
			width = canvas.width;
			height = canvas.height;
		}

		ctx.drawImage(this.image, xOffset, yOffset, width, height);
	};
};
