var staticImage = function() {
	this.info = {
		name: 'staticImage',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'range', variable: 'k', label: 'Scale', min: 1, max: 100, step: 0.2},
			{type: 'image', variable: 'image', label: 'Drag and drop an image here'},
			{type: 'checkbox', variable: 'smoothing', label: 'Image Smoothing'},
			{type: 'checkbox', variable: 'stretch', label: 'Stretch/Scale'}
		]
	};
	
	this.smoothing = false;
	this.image = new Image();
	this.image.src = 'gameboy.gif';
	this.stretch = false;
	this.k = 1;

	this.draw = function(canvas, ctx, amplitudeArray) {
		if(!this.smoothing) ctx.webkitImageSmoothingEnabled = false;

		if(this.stretch) {
			ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
		} else {
			ctx.drawImage(this.image,
				canvas.width/2 - this.image.width * this.k/2,
				canvas.height/2 - this.image.height * this.k/2,
				this.image.width * this.k,
				this.image.height * this.k
			);
		}
	};
};