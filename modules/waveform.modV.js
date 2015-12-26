var waveform = function() {
	this.info = {
		name: 'waveform',
		author: '2xAA',
		version: 0.1,
		controls: [
			// {type: 'checkbox', variable: 'fill', label: 'Fill (unchecked) / Line (checked)'},
			{type: 'checkbox', variable: 'rainbow', label: 'Colour: Random (unchecked) / Rainbow (checked)'}
		],
		meyda: ['buffer']
	};

	// map() from Processing
	Math.map = function(value, low1, high1, low2, high2) {
		return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
	};
	
	this.hue = 40;
	this.fill = false;
	this.rainbow = false;

	this.draw = function(canvas, ctx, vid, features, meyda, delta, bpm) {

		var ampArr = features.buffer;
		ampArr = meyda.windowing(ampArr, 'hanning');

		ctx.strokeStyle = 'hsl(' + this.hue + ', 100%, 50%)';
		ctx.beginPath();
		for (var i = 0; i < ampArr.length-1; i++) {
			var width = Math.round(Math.map(i, 0, ampArr.length-1, 0, canvas.width));
			var newWidth = Math.round(Math.map(i+1, 0, ampArr.length-1, 0, canvas.width));
			var y = canvas.height/2 - (canvas.height * ampArr[i]) / (2);
			y = Math.round(y);
			var yNext = canvas.height/2 - (canvas.height * ampArr[i+1]) / (2);
			yNext = Math.round(yNext);

			ctx.moveTo(width, y);
			ctx.lineTo(newWidth, yNext);
		}
		ctx.closePath();
		ctx.stroke();

		if(this.rainbow) {
			if(this.hue == 360) this.hue = 0;
			else this.hue+=4;
		} else this.hue = Math.floor(Math.random()*(360-1+1)+1);
	};
};