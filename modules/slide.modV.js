var slide = function() {
	this.info = {
		name: 'slide',
		author: '2xAA',
		version: 0.1,
		controls: [
			 {type: 'range', variable: 'speedX', min: 0, max: 100, label: 'Speed X', varType: 'int'}
			 {type: 'range', variable: 'speedY', min: 0, max: 100, label: 'Speed Y', varType: 'int'}
		]
	};

	this.init = function(canvas) {
		newCanvas2.width = canvas.width;
		newCanvas2.height = canvas.height;
	};

	this.speedY = 0;
	var offsetX = 0;
	this.speedY = 0;
	var offsetY = 0;
	var base = 0;

	var newCanvas2 = document.createElement('canvas');
	var newCtx2 = newCanvas2.getContext("2d");

	this.draw = function(canvas, ctx, amplitudeArray) {
		if(offsetY >= canvas.height) {
			offsetY = (offsetX-canvas.height)+this.speedY;
		} else {
			offsetY += this.speedY;
		}
		
		if(offsetX >= canvas.width) {
			offsetX = (offsetY-canvas.width)+this.speedX;
		} else {
			offsetX += this.speedX;
		}

		ctx.save();
		newCtx2.clearRect(0, 0, newCanvas2.width, newCanvas2.height);
		newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
		
		ctx.drawImage(newCanvas2, offsetX, offsetY);
		ctx.drawImage(newCanvas2, (-canvas.width + offsetX), (-canvas.height + offsetY));
		
		
		ctx.restore();
	};
};
slide = new slide(); 