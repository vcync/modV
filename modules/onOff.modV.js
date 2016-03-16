var onOff = function() {
	this.info = {
		name: 'onOff',
		author: '2xAA',
		version: 0.1
	};

	var colours = [
		'#FF0000',
		'#00FFFF',
		'#00FF00',
		'#FFFF00',
		'#FF00FF'
	];

	var w, h, colourPos = 0;

	var posW = 0, posH = 0;

	this.sensitivity = 8.4;

	this.init = function(canvas) {
		w = canvas.width / 2;
		h = canvas.height / 2;
	}

	this.draw = function(canvas, ctx, amplitudeArray) {

		var all = 0;
		for(var i = 0; i < 64; i++) {
			all += amplitudeArray[i];
		}

		all = all/1000;

		ctx.save();
		
		ctx.fillStyle = colours[colourPos];
		ctx.fillRect(w*posW, h*posH, w, h);

		if(all > this.sensitivity) {
			if(posW == 1) {
				if(posH == 0) {
					posH = 1;
				} else if(posW == 1 && posH == 1) {
					posW = 0;
				}
			} else if(posW == 0) {
				if(posH == 1) {
					posH = 0;
				} else if(posW == 0 && posH == 0) {
					if(colourPos == colours.length-1) colourPos = 0;
					else colourPos++;
					posW = 1;
				}
			}
		}

		ctx.restore();
	};
};