var gridStretch = function() {

	this.info = {
		name: 'gridStretch',
		author: '2xAA',
		version: 0.1,
		meyda: ['zcr', 'rms'],
		controls: [
			// {type: 'range', variable: 'size', label: 'Cell Size', min: 1, max: 20, varType: 'int', step: 1},
			{type: 'range', variable: 'countX', label: 'Grid Size X', min: 1, max: 20, varType: 'int', step: 1, altMod: function(val, e) {

			}},
			{type: 'range', variable: 'countY', label: 'Grid Size Y', min: 1, max: 20, varType: 'int', step: 1},
			{type: 'range', variable: 'intensity', label: 'RMS/ZCR Intensity', min: 0, max: 30, varType: 'int', step: 1},
			{type: 'checkbox', variable: 'zcr', label: 'RMS (unchecked) / ZCR (checked)'}
		]
	};
	
	var newCanvas2 = document.createElement('canvas');
	var newCtx2 = newCanvas2.getContext('2d');
	var analysed = 0;
	var randomMovement = 0;

	// this.size = this.info.controls[0].max/2;
	this.countX = this.info.controls[0].max/2;
	this.countY = this.info.controls[1].max/2;
	this.intensity = this.info.controls[2].max/2;
	this.zcr = false;

	this.init = function(canvas) {
		newCanvas2.width = canvas.width;
		newCanvas2.height = canvas.height;
	};

	this.draw = function(canvas, ctx, audio, video, meyda) {

		var sliceWidth = canvas.width/this.countX,
			sliceHeight = canvas.height/this.countY;

		newCtx2.clearRect(0, 0, canvas.width, canvas.height);

		for(var i=this.countX; i >= 0; i--) {
			for(var j=this.countY; j >= 0; j--) {

				if(this.zcr) {
					analysed = meyda.zcr/10 * this.intensity;
					randomMovement = Math.random() * meyda.zcr/20;
				} else {
					analysed = meyda.rms * this.intensity;
					randomMovement = Math.random() * meyda.rms*20;
				}

				newCtx2.drawImage(canvas,
					i*sliceWidth,
					j*sliceHeight,
					sliceWidth,
					sliceHeight,

					i*sliceWidth - ((analysed + randomMovement) /2),
					j*sliceHeight - ((analysed + randomMovement) /2),
					sliceWidth + analysed + randomMovement,
					sliceHeight + analysed + randomMovement
				);

			}
		}

		ctx.drawImage(newCanvas2, 0, 0, canvas.width, canvas.height);
	};
};