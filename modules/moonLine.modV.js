var moonLine = function() {
	this.info = {
		name: 'moonLine',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'color', variable: 'colour', label: 'Colour', varType: 'string'},
			{type: 'checkbox', variable: 'xor', label: 'XOR', varType: 'boolean'}
		]
	};
	var that = this;

	this.colour = '#fff';
	this.xor = false;

	this.init = function(canvas) {
		
	};

	var originalComp = null;
	
	var lines = [];
	var Line = function(setup) {
		
		this.y = setup;
		
		this.draw = function(canvas, ctx) {
			originalComp = ctx.globalCompositeOperation;
			ctx.globalCompositeOperation = 'xor';
			ctx.fillRect(0, this.y, canvas.width, this.y/4);
			ctx.fillStyle = that.colour;
			ctx.fill();
			ctx.globalCompositeOperation = originalComp;
		};
		
		this.update = function(canvas) {
			if(this.y > canvas.height) this.y = 0;
			else this.y++;
		};
		
	};

	for(var i=0; i < 40; i++) {
	    var l = new Line(i * i);
	    lines.push(l);
	}

	var x = 0;
	var y = 0;

	this.draw = function(canvas, ctx, amplitudeArray, vid, mey, delta) {
		//ctx.clearRect(0, 0, canvas.width, canvas.height);
	    lines.forEach(function(line) {
	        line.draw(canvas, ctx);
	        line.update(canvas);
	    });
	    
	    originalComp = ctx.globalCompositeOperation;
	    if(this.xor) ctx.globalCompositeOperation = 'xor';
	    ctx.beginPath();
	    ctx.arc(canvas.width / 2 + x, canvas.height / 2 + y, canvas.width / 4, 0, 2*Math.PI);
	    ctx.closePath();
	    ctx.fillStyle = this.colour;
	    ctx.fill();
	    if(this.xor) ctx.globalCompositeOperation = originalComp;
	    
	    x = Math.sin(delta / 300) * 10;
	    y = -Math.cos(delta / 300) * 6;
	};
};