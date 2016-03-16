var concentrics = function() {

	this.info = {
		name: 'concentrics',
		author: '2xAA',
		version: 0.1,
		meyda: ['zcr', 'rms'],
		controls: [
			{type: 'checkbox', variable: 'rms', label: 'Use RMS', checked: false},
			{type: 'range', variable: 'intensity', label: 'RMS/ZCR Intensity', min: 0, max: 30, varType: 'int', step: 1},
			{type: 'range', variable: 'spacing', label: 'Circle Spacing', min: 0, max: 100, varType: 'int', step: 1, value: 5},
			{type: 'range', variable: 'strokeWeight', label: 'Stroke Weight', min: 1, max: 20, value: 1, varType: 'int', step: 1}
		]
	};
	var that = this;

	this.rms = false;
	this.intensity = 1;
	this.spacing = 5;
	this.strokeWeight = 1;

	var Concentric = function(canvas) {
	    this.x = canvas.width / 2;
	    this.y = canvas.height /2;
	    this.hue = Math.round(Math.random() * 360);
	        
	    this.draw = function(ctx, zcr) {
	    	ctx.strokeStyle = 'hsl(' + this.hue + ', 50%, 50%)';
			ctx.lineWidth = that.strokeWeight;

	        for(var i=0; i < zcr; i++) {
	            ctx.beginPath();
	            ctx.arc(this.x, this.y, i*that.spacing, 0, 2*Math.PI);
	            ctx.closePath();
	            ctx.stroke();
	        }
	        
	        if(this.hue > 360) this.hue = 0;
	        else this.hue += 0.2;
	    };
	    
	};

	var circle1, circle2;

	this.init = function(canvas) {
		
		circle1 = new Concentric(canvas);
		circle2 = new Concentric(canvas);

	};

    this.draw = function(canvas, ctx, video, features, meyda, delta, bpm) {
		var zcr = features.zcr;
		if(this.rms) zcr = features.rms;

		zcr = this.intensity * zcr;
		if(this.rms) {
			zcr = zcr * 50;
		}

		circle1.x = canvas.width/2 + Math.sin(delta / 1000) * 40;
	    circle1.y = canvas.height/2 + Math.cos(delta / 1000) * 10;
	    circle1.draw(ctx, zcr);
	    
	    circle2.x = canvas.width/2 + -Math.sin(delta / 1000) * 40;
	    circle2.y = canvas.height/2 + -Math.cos(delta / 1000) * 30;
	    circle2.draw(ctx, zcr);
	};
};