var badHold = function() {
	this.info = {
		name: 'badHold',
		author: '2xAA',
		version: 0.1,
		controls: [
			 //{type: 'range', variable: 'amount', min: 0, max: 512, label: 'Amount'},
			 {type: 'range', variable: 'speed', min: 0, max: 512, label: 'Speed', varType: 'float'}
		]
	};

	this.init = function(canvas) {
		newCanvas2.width = canvas.width;
		newCanvas2.height = canvas.height;
	};

	this.size = 60;
	this.speed = 0.5;
	var offset = 0;
	var drift = 0;

	var newCanvas2 = document.createElement('canvas');
	var newCtx2 = newCanvas2.getContext("2d");

	this.draw = function(canvas, ctx, amplitudeArray) {

		ctx.save();
		newCtx2.clearRect(0, 0, newCanvas2.width, newCanvas2.height);
		newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
		ctx.translate(0, this.size+offset + drift - (canvas.height));
		ctx.beginPath();
		ctx.drawImage(newCanvas2, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
		ctx.fillRect(0,0,canvas.width, this.size);
		ctx.fillStyle = '#000';
		ctx.fill();
		ctx.translate(0, (canvas.height) - this.size+offset + drift);
		ctx.drawImage(newCanvas2, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
		ctx.restore();

		if(offset >= canvas.height) offset = 0;
		else offset+=this.speed;

		if(drift < canvas.height) drift += 0.0001;
		else drift = 0;
	};
};