var ball = function() {
	this.info = {
		name: 'ball',
		author: '2xAA',
		version: 0.2,
		meyda: ['rms', 'zcr'],
		controls: [
			{type: 'range', variable: 'amount', label: 'Amount', varType: 'int', min: 1, max: 50},
			{type: 'range', variable: 'size', varType: 'float', min: 1, max: 20, label: 'Base Size'},
			{type: 'range', variable: 'intensity', label: 'RMS/ZCR Intensity', min: 0, max: 30, varType: 'int', step: 1},
			{type: 'checkbox', variable: 'soundType', label: 'RMS (unchecked) / ZCR (checked)'},
			{type: 'palette', variable: 'colour', colours: [
                [255,102,152],
                [255,179,102],
                [255,255,102],
                [152,255,102],
                [102,152,255]
            ], timePeriod: 500}
		]
	};

	this.soundType = false; // false RMS, true ZCR
	this.intensity = 15; // Half max

	this.amount = 10;
	this.baseSize = 2;
	this.size = 2;
	this.colour = 'pink';
	var that = this;

	var balls = [];

	var cvHeight = 0;

	var ballObj = function() {
		this.bounds = {width: 0, height: 0};
		this.position = {x: 0, y: 0};
		var hue = Math.floor(Math.random()*(259-1+1)+1);
		this.speed = 0;
		this.velocity = {x: 5, y: 5};

		this.drawUpdate = function(canvas, ctx, amp) {
			ctx.beginPath();
			ctx.arc(this.position.x, this.position.y, that.baseSize + (that.size * amp), 0, 2 * Math.PI, true);
			ctx.fillStyle = that.colour;
			ctx.fill();
			ctx.closePath();

			if( this.position.x-that.baseSize < 1 || this.position.x+that.baseSize > this.bounds.width-1) this.velocity.x = -this.velocity.x;
			if( this.position.y-that.baseSize < 1 || this.position.y+that.baseSize > this.bounds.height-1) this.velocity.y = -this.velocity.y;

			this.position.x += this.velocity.x;
			this.position.y += this.velocity.y;

			if(this.velocity.y === 0) this.velocity.y = -this.velocity.y+1;

			//if(hue == 360) hue = 0;
			//else hue+=2 + this.speed/10;
		};
	};

	this.init = function(canvas) {
		cvHeight = canvas.height;

		balls = [];

		for(var i=0; i < 1000; i++) {
			var newBall = new ballObj();
			newBall.bounds.width = canvas.width;
			newBall.bounds.height = canvas.height;
			newBall.position.x = Math.floor(Math.random()*(newBall.bounds.width-1+1)+1);
			newBall.position.y = Math.floor(Math.random()*(newBall.bounds.height-1+1)+1);
			newBall.velocity.x = Math.floor(Math.random()*(10-1+1)+1);
			newBall.velocity.y = Math.floor(Math.random()*(10-1+1)+1);
			balls.push(newBall);
		}
	};

	this.draw = function(canvas, ctx, amp, vid, meyda) {
		
		if(this.soundType) {
			analysed = meyda.zcr/10 * this.intensity;
		} else {
			analysed = (meyda.rms * 10) * this.intensity;
		}
		
		for(var i=0; i < this.amount; i++) {
			var y = cvHeight - (cvHeight);
			balls[i].speed = Math.abs(y-200)/2;
			balls[i].drawUpdate(canvas, ctx, analysed);
		}
	};
};