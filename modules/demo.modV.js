var demo = function() {
	this.info = {
		name: 'demo',
		author: '2xAA',
		version: 0.1,
		meyda: ['rms', 'zcr'],
		controls: [
			{type: 'checkbox', variable: 'soundType', label: 'RMS (unchecked) / ZCR (checked)'},
			{type: 'range', variable: 'intensity', label: 'RMS/ZCR Intensity', min: 0, max: 30, value: 15, varType: 'int', step: 1},
			{type: 'range', variable: 'shapeSize', label: 'Shape Size', min: 0, max: 300, value: 60, varType: 'int', step: 1},
			{type: 'range', variable: 'strokeWeight', label: 'Stroke Weight', min: 1, max: 20, value: 1, varType: 'int', step: 1},
			{type: 'checkbox', variable: 'rotateToggle', label: 'Rotate'},
			{type: 'range', variable: 'rotateSpeed', label: 'Rotate Speed', min: 0.1, max: 10, varType: 'float', step: 0.1},
		]
	};

	this.init = function(canvas, ctx) {
		
	};

	this.rotateToggle = false;
	this.rotateSpeed = 0.1;
	this.strokeWeight = 1;
	this.soundType = false;
	this.intensity = 15;
	this.shapeSize = 10;

	var hue = 0;

	var boxPosX = 0;
	var boxPosY = 0;

	function polygon(ctx, x, y, radius, sides, startAngle, anticlockwise) {
		if (sides < 3) return;

		var a = (Math.PI * 2) / sides;
		a = anticlockwise ? - a : a;

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(startAngle);
		ctx.moveTo(radius, 0);

		for (var i=1; i < sides; i++) {
			ctx.lineTo(radius * Math.cos(a * i),radius * Math.sin(a * i));
		}

		ctx.closePath();
		ctx.restore();
	}

	this.draw = function(canvas, ctx, video, features, meyda, delta, bpm) {
		
		var analysed;
		var rotate = 0;

		if(this.rotateToggle) rotate = ((delta/1000) * this.rotateSpeed);

		if(this.soundType) {
			analysed = features.zcr/10 * this.intensity;
		} else {
			analysed = (features.rms * 10) * this.intensity;
		}

		ctx.strokeStyle = ctx.fillStyle = 'hsl(' + hue + ', 80%, 80%)';
		ctx.lineWidth = this.strokeWeight;

		ctx.beginPath();
		polygon(
			ctx,
			Math.round((canvas.width/2)),
			Math.round((canvas.height/2)),
			analysed + this.shapeSize,
			3 + Math.round(analysed / 10),
			-Math.PI/2 + rotate
		);
		ctx.stroke();

		if(hue === 360) hue = 0;
		else hue++;
	};
};