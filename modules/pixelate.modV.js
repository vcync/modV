var pixelate = function() {
	this.info = {
		name: 'pixelate',
		author: '2xAA',
		version: 0.2,
		meyda: ['rms', 'zcr'],
		controls: [
			{type: 'range', variable: 'pixelAmount', min: 2, max: 30, label: 'Amount', varType: 'int'},
			{type: 'checkbox', variable: 'soundReactive', label: 'Sound Reactive'},
			{type: 'range', variable: 'intensity', label: 'RMS/ZCR Intensity', min: 0, max: 30, varType: 'int', step: 1},
			{type: 'checkbox', variable: 'soundType', label: 'RMS (unchecked) / ZCR (checked)'}
		]
	};

	this.soundReactive = false;
	this.soundType = false; // false RMS, true ZCR
	this.intensity = 15; // Half max

	var newCanvas2 = document.createElement('canvas');
	var newCtx2 = newCanvas2.getContext("2d");
	newCtx2.imageSmoothingEnabled = false;

	this.init = function(canvas) {
		newCanvas2.width = canvas.width;
		newCanvas2.height = canvas.height;
	};

	this.pixelAmount = 5;

	this.draw = function(canvas, ctx, audio, vid, meyda) {

		var w, h, analysed;

		if(this.soundReactive) {
			if(this.soundType) {
				analysed = meyda.zcr/10 * this.intensity;
			} else {
				analysed = (meyda.rms * 10) * this.intensity;
			}

			w = canvas.width / analysed;
			h = canvas.height / analysed;

		} else {
			w = canvas.width / this.pixelAmount;
			h = canvas.height / this.pixelAmount;
		}

		ctx.save();
		newCtx2.clearRect(0, 0, newCanvas2.width, newCanvas2.height);
		ctx.imageSmoothingEnabled = false;
		newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, w, h);
		ctx.drawImage(newCanvas2, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
		ctx.restore();
	};
};