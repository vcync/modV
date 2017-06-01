var rotate = function() {
	this.info = {
		name: 'rotate',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'range', variable: 'rotation', min: -90, max: 90, step: 1, varType: 'float', label: 'Rotate by'},
			{type: 'checkbox', variable: 'soundReactive', label: 'Sound Reactive'},
			{type: 'range', variable: 'speed', min: -2, max: 2, step: 0.001, varType: 'float', label: 'RMS intensity'}
		],
		meyda: ['rms']
	};
	this.rotation = 0;
	this.soundReactive = false;
	this.speed = 0.01;
	var degree = 0;
	
	var newCanvas2 = document.createElement('canvas');
	var newCtx2 = newCanvas2.getContext("2d");

	function toRad(degrees) {
		return degrees * (Math.PI/180);
	}

	this.init = function(canvas) {
		newCanvas2.width = canvas.width;
		newCanvas2.height = canvas.height;
	};

	this.draw = function(canvas, ctx, audio, video, meyda) {
		
		newCtx2.clearRect(0, 0, canvas.width, canvas.height);
		newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, newCanvas2.width, newCanvas2.height);
		
		ctx.save();

		if(this.soundReactive) {
			ctx.translate(canvas.width/2, canvas.height/2);
			ctx.rotate(meyda['rms'] * this.speed);
			ctx.translate(-canvas.width/2, -canvas.height/2);
		} else {
			ctx.translate(canvas.width/2, canvas.height/2);
			ctx.rotate(toRad(this.rotation));
			ctx.translate(-canvas.width/2, -canvas.height/2);
		}
		
		ctx.drawImage(newCanvas2, 0, 0);
		
		ctx.drawImage(newCanvas2, -canvas.width, 0);
		ctx.drawImage(newCanvas2, canvas.width, 0);
		
		ctx.drawImage(newCanvas2, canvas.width, canvas.height);
		ctx.drawImage(newCanvas2, canvas.width, -canvas.height);
		
		ctx.drawImage(newCanvas2, 0, canvas.height);
		ctx.drawImage(newCanvas2, 0, -canvas.height);
		
		if(this.soundReactive) {
			ctx.translate(canvas.width/2, canvas.height/2);
			ctx.rotate(-meyda['rms'] * this.speed);
			ctx.translate(-canvas.width/2, -canvas.height/2);
		} else {
			ctx.translate(canvas.width/2, canvas.height/2);
			ctx.rotate(toRad(-this.rotation));
			ctx.translate(-canvas.width/2, -canvas.height/2);
		}
	
		ctx.restore();
	};
};