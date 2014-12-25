var ball = function() {
	this.info = {
		name: 'ball',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'range', variable: 'amount', label: 'Amount'},
			{type: 'range', variable: 'size', min: 1, max: 20, label: 'Base Size'},
			{type: 'range', variable: 'sensitivity', min: 0, max: 8, label: 'Audio Sensitivity'}
		]
	};

	this.amount = 10;
	this.baseSize = 2;
	this.size = 2;
	this.sensitivity = 8.4;
	var that = this;

	var balls = [];

	var ballObj = function() {
		this.bounds = {width: 0, height: 0};
		this.position = {x: 0, y: 0};
		var hue = Math.floor(Math.random()*(259-1+1)+1);
		this.speed = 0;
		this.velocity = {x: 5, y: 5};

		this.drawUpdate = function(canvas, ctx, amp) {
			ctx.beginPath();
			ctx.arc(this.position.x, this.position.y, (that.size * amp), 0, 2 * Math.PI, true);
			//ctx.fillText(amp + ',' + that.size, this.position.x, this.position.y);
			//ctx.fillRect(this.position.x, this.position.y, rad+this.speed*2, rad+this.speed*2)
			ctx.fillStyle = 'hsl(' + hue + ', 50%, 50%)';
			ctx.fill();
			ctx.closePath();

			if( this.position.x-that.baseSize < 1 || this.position.x+that.baseSize > this.bounds.width-1) this.velocity.x = -this.velocity.x;
			if( this.position.y-that.baseSize < 1 || this.position.y+that.baseSize > this.bounds.height-1) this.velocity.y = -this.velocity.y;

			this.position.x += this.velocity.x;
			this.position.y += this.velocity.y;

			if(this.velocity.y === 0) this.velocity.y = -this.velocity.y+1;

			if(hue == 360) hue = 0;
			else hue+=2 + this.speed/10;
		};
	};

	this.init = function(canvas) {
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

	this.draw = function(canvas, ctx, amplitudeArray) {
		
		var all = 0;
		for(var i=0; i<64; i++) {
			all += amplitudeArray[i];
		}
		all = all/1000;
		all = (all*this.sensitivity);
		
		for(var i=0; i < this.amount; i++) {
			var y = canvas.height - (canvas.height);
			balls[i].speed = Math.abs(y-200)/2;
			balls[i].drawUpdate(canvas, ctx, all);
		}
	};
};