var pixelate = function() {
	this.info = {
		name: 'pixelate',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'range', variable: 'pixelAmount', min: 2, max: 10, label: 'Amount'}
		]
	};

	var newCanvas2 = document.createElement('canvas');
	var newCtx2 = newCanvas2.getContext("2d");
	newCtx2.webkitImageSmoothingEnabled = false;
	newCtx2.mozImageSmoothingEnabled = false;
	newCtx2.imageSmoothingEnabled = false;

	this.init = function(canvas) {
		newCanvas2.width = canvas.width;
		newCanvas2.height = canvas.height;
	}

	this.pixelAmount = 5;

	this.draw = function(canvas, ctx) {
		var w = canvas.width / this.pixelAmount,
			h = canvas.height / this.pixelAmount;

		ctx.save();
		newCtx2.clearRect(0, 0, newCanvas2.width, newCanvas2.height);
		ctx.webkitImageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;
		ctx.imageSmoothingEnabled = false;
		newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, w, h);
		ctx.drawImage(newCanvas2, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
		ctx.restore();
	};
};
pixelate = new pixelate();