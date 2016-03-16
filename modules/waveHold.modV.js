var waveHold = function() {
	this.info = {
		name: 'waveHold',
		author: '2xAA',
		version: 0.1,
		controls: [
			 {type: 'range', variable: 'speed', min: -100, max: 100, label: 'Speed', varType: 'int'},
			 {type: 'range', variable: 'wave', min: 0, max: 100, label: 'Wave', varType: 'int'}
		]
	};

	this.init = function(canvas) {
		newCanvas2.width = canvas.width;
		newCanvas2.height = canvas.height;
	};

	this.speed = 0;
	this.wave = 10;

	var offset = 0;
	var base = 0;
	var ticks = 0;

	var newCanvas2 = document.createElement('canvas');
	var newCtx2 = newCanvas2.getContext("2d");

	this.draw = function(canvas, ctx, amplitudeArray) {
		if(offset >= canvas.height) {
			offset = (offset-canvas.height)+this.speed;
		} else {
			offset += this.speed;
		}

		ctx.save();
		newCtx2.clearRect(0, 0, newCanvas2.width, newCanvas2.height);
		newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
		
		ctx.drawImage(newCanvas2, 0, offset, canvas.width, canvas.height - Math.sin(ticks * this.wave));
		ctx.drawImage(newCanvas2, 0, (-canvas.height + offset), canvas.width, canvas.height - Math.sin(ticks * this.wave));
		
		if(ticks >= 100) ticks = 0;
		else ticks +=  0.0001;
		ctx.restore();
	};
};