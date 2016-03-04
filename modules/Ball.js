var Ball = new modVC.Module2D({
	info: {
		name: 'Ball',
		author: '2xAA',
		version: 0.2,
		controls: []
	},
	init: function(canvas) {
		
		this.soundType = false; // false RMS, true ZCR
		this.intensity = 15; // Half max

		this.amount = 10;
		this.baseSize = 2;
		this.size = 2;
		this.colour = 'pink';
		this.speed = 5;
		this.balls = [];
		this.wrap = false;

		this.setupBalls = function() {
			this.balls = [];
			for(var i=0; i < 50; i++) {
				var newBall = new this.ballObj();
				newBall.bounds.width = canvas.width;
				newBall.bounds.height = canvas.height;
				newBall.position.x = Math.floor(Math.random()*(newBall.bounds.width-1+1)+1);
				newBall.position.y = Math.floor(Math.random()*(newBall.bounds.height-1+1)+1);
				newBall.velocity.x = Math.floor(Math.random()*(10-1+1)+1);
				newBall.velocity.y = Math.floor(Math.random()*(10-1+1)+1);
				this.balls.push(newBall);
			}
		};
		this.setupBalls();
		
	},
	resize: function(canvas) {
		this.setupBalls();
	},
	draw: function(canvas, ctx, vid, features, meyda, delta, bpm) {

		if(this.soundType) {
			analysed = features.zcr/10 * this.intensity;
		} else {
			analysed = (features.rms * 10) * this.intensity;
		}
		
		for(var i=0; i < this.amount; i++) {
			this.balls[i].speed = this.speed;
			this.balls[i].wrap = this.wrap;
			this.balls[i].drawUpdate(canvas, ctx, analysed);
		}

	}
});

Ball.ballObj = function() {
		this.bounds = {width: 0, height: 0};
		this.position = {x: 0, y: 0};
		this.speed = Ball.speed;
		this.velocity = {x: 5, y: 5};
		this.wrap = false;

		this.xReverse = false;
		this.yReverse = false;

		this.drawUpdate = function(canvas, ctx, amp) {
			ctx.beginPath();
			ctx.arc(this.position.x, this.position.y, Ball.baseSize + (Ball.size * amp), 0, 2 * Math.PI, true);
			ctx.fillStyle = Ball.colour;
			ctx.fill();
			ctx.closePath();

			if(this.wrap) {
				if( this.position.x-Ball.baseSize < 1 ) this.position.x = (this.bounds.width-1) - Ball.baseSize;
				if( this.position.y-Ball.baseSize < 1 ) this.position.y = (this.bounds.height-1) - Ball.baseSize;

				if( this.position.x+Ball.baseSize > this.bounds.width-1 ) this.position.x = Ball.baseSize + 1;
				if( this.position.y+Ball.baseSize > this.bounds.height-1 ) this.position.y = Ball.baseSize + 1;

			} else {
				if( this.position.x-Ball.baseSize < 1 || this.position.x+Ball.baseSize > this.bounds.width-1 ) this.xReverse = !this.xReverse;
				if( this.position.y-Ball.baseSize < 1 || this.position.y+Ball.baseSize > this.bounds.height-1 ) this.yReverse= !this.yReverse;
			}

			if(this.xReverse) this.velocity.x = -this.speed;
			else this.velocity.x = this.speed;

			if(this.yReverse) this.velocity.y = -this.speed;
			else this.velocity.y = this.speed;

			this.position.x += this.velocity.x;
			this.position.y += this.velocity.y;

			if(this.velocity.y === 0) this.velocity.y = -this.velocity.y+1;
		};
	};

var controls = [];

controls.push(new modVC.CheckboxControl({
    variable: 'wrap',
    label: 'Wrap',
    checked: false
}));

controls.push(new modVC.RangeControl({
    variable: 'amount',
    label: 'Amount',
    varType: 'int',
    min: 0,
    max: 50,
    step: 1,
    default: 15
}));

controls.push(new modVC.RangeControl({
    variable: 'speed',
    label: 'Speed',
    varType: 'int',
    min: 1,
    max: 50,
    step: 1,
    default: 5
}));

controls.push(new modVC.RangeControl({
    variable: 'size',
    label: 'Size',
    varType: 'int',
    min: 1,
    max: 50,
    step: 1,
    default: 2
}));

controls.push(new modVC.RangeControl({
    variable: 'intensity',
    label: 'RMS/ZCR Intensity',
    varType: 'int',
    min: 0,
    max: 30,
    step: 1,
    default: 15
}));

controls.push(new modVC.CheckboxControl({
    variable: 'soundType',
    label: 'RMS (unchecked) / ZCR (checked)',
    checked: false
}));

controls.push(new modVC.PaletteControl({
	variable: 'colour',
	colours: [
		[199,64,163],
		[97,214,199],
		[222,60,75],
		[101,151,220],
		[213,158,151],
		[100,132,129],
		[154,94,218],
		[194,211,205],
		[201,107,152],
		[119,98,169],
		[214,175,208],
		[218,57,123],
		[196,96,98],
		[218,74,219],
		[138,100,121],
		[96,118,225],
		[132,195,223],
		[82,127,162],
		[209,121,211],
		[181,152,220]
	], // generated here: http://tools.medialab.sciences-po.fr/iwanthue/
	timePeriod: 500
}));

Ball.add(controls);

modVC.register(Ball);