var waveform = function() {
	this.info = {
		name: 'waveform',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'checkbox', variable: 'fill', label: 'Fill (unchecked) / Line (checked)'},
			{type: 'checkbox', variable: 'rainbow', label: 'Colour: Random (unchecked) / Rainbow (checked)'}
		]
	};

	// map() from Processing
	Math.map = function(value, low1, high1, low2, high2) {
		return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
	};
	
	var hue = 40;
	this.fill = false;
	this.rainbow = false;

	this.draw = function(canvas, ctx, amplitudeArray) {
		//if(!ready) return;
		if(this.fill) {
			ctx.beginPath();
			ctx.moveTo(0, canvas.height/2);
			for (var i = 0; i < amplitudeArray.length-1; i++) {
				var value = amplitudeArray[i] / 256;
				var y = canvas.height - (canvas.height * Math.abs(value));

				ctx.lineTo(i/amplitudeArray.length*canvas.width, y);
			}
			ctx.lineTo(canvas.width, canvas.height/2);
			ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
			ctx.fill();
		} else {
			for (var i = 0; i < amplitudeArray.length-1; i++) {
				var newWidth = Math.round(Math.map(i, 0, amplitudeArray.length, 0, canvas.width));
				var value = amplitudeArray[i] / 256;
				var y = canvas.height - (canvas.height * Math.abs(value));
				var valueNext = amplitudeArray[i+1] / 256;
				var yNext = canvas.height - (canvas.height * Math.abs(valueNext));

				ctx.beginPath();
				ctx.moveTo(newWidth, canvas.height - y);
				ctx.lineTo(newWidth + 1, canvas.height - yNext);
				ctx.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
				ctx.stroke();
				ctx.closePath();
			}
		}
		if(this.rainbow) {
			if(hue == 360) hue = 0;
			else hue+=4;
		} else hue = Math.floor(Math.random()*(360-1+1)+1);
	};
};