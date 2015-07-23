var cacomixle = function() {
	this.info = {
		name: "cacomixle",
		author: "",
		version: 0.1,
		controls: []
	};

	var w,
		h,
		lineW = 2,
		distortion = 1.05,
		loopIndex = 30,
		cx,
		cy,
		cx2,
		cy2;

	this.init = function(canvas) {
		w = canvas.width;
		h = canvas.height;
		cx = w;
		cy = h / 2;
		cx2 = w * 2;
		cy2 = canvas.height;
	};

	this.draw = function(canvas, ctx, amplitudeArray) {
		if (loopIndex >= 30) {
			cx = w;
			cy = h / 2;
			cx2 = w * 2;
			cy2 = canvas.height;

			loopIndex = 1;
		} else {
			loopIndex++;
		}

		var lineX = 1;

		for (var i = 0; i <= 22; i++) {
			ctx.beginPath();
			ctx.moveTo(0, lineX);
			ctx.lineTo(w, lineX);
			ctx.lineWidth = lineW;
			ctx.strokeStyle = 'pink';
			ctx.stroke();
			ctx.shadowBlur = 10;
			ctx.shadowColor = "deeppink";
			lineX = h / 2 - (lineX * distortion);
		}

		for (var i = 0; i <= 80; i++) {
			ctx.beginPath();
			ctx.moveTo(cx - i * 30, cy);
			ctx.lineTo(cx2 - i * 90, cy2);
			ctx.lineWidth = lineW;
			ctx.strokeStyle = 'pink';
			ctx.stroke();
			ctx.shadowBlur = 10;
			ctx.shadowColor = "deeppink";
		}

		cx--;
		cx2 -= 3;
	};
};