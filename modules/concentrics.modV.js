var concentrics = function() {

	this.info = {
		name: 'concentrics',
		author: '2xAA',
		version: 0.1,
		meyda: ['zcr']
	};

	this.intensity = 1;

	var Concentric = function(canvas) {
	    this.x = canvas.width / 2;
	    this.y = canvas.height /2;
	    this.hue = Math.round(Math.random() * 360);
	        
	    this.draw = function(ctx, zcr) {
	    	ctx.strokeStyle = 'hsl(' + this.hue + ', 50%, 50%)';

	        for(var i=0; i < zcr; i++) {
	            ctx.beginPath();
	            ctx.arc(this.x, this.y, 5*i, 0, 2*Math.PI);
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

	this.draw = function(canvas, ctx, audio, video, meyda, delta) {

		circle1.x = canvas.width/2 + Math.sin(delta / 1000) * 40;
	    circle1.y = canvas.height/2 + Math.cos(delta / 1000) * 10;
	    circle1.draw(ctx, meyda['zcr']);
	    
	    circle2.x = canvas.width/2 + -Math.sin(delta / 1000) * 40;
	    circle2.y = canvas.height/2 + -Math.cos(delta / 1000) * 30;
	    circle2.draw(ctx, meyda['zcr']);
	};
};