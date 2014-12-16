var rotate = function() {
	this.info = {
		name: 'rotate',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'range', variable: 'speed', min: 0.001, max: 0.1, step: 0.001, varType: 'float', label: 'Speed'}
		]
	};

	this.speed = 0.01;
	var degree = 0;

	this.draw = function(canvas, ctx) {
		ctx.save();
		ctx.translate(canvas.width/2, canvas.height/2);
		ctx.rotate(degree);
		ctx.translate(-canvas.width/2, -canvas.height/2);
		ctx.drawImage(canvas, 0, 0);
		ctx.restore();

		if(degree == 360) degree = 0;
		else degree += this.speed;
	};
};
rotate = new rotate();