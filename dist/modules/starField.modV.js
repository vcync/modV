var starField = function() {
	this.info = {
		name: 'starField',
		author: '2xAA',
		version: 0.1,
		controls: [
			 {type: 'range', variable: 'amount', min: 0, max: 512, label: 'Amount'},
			 {type: 'range', variable: 'size', min: 0, max: 512, label: 'Size'},
			 {type: 'range', variable: 'MAX_DEPTH', min: 0, max: 64, label: 'Start Depth'},
			 {type: 'range', variable: 'MIN_DEPTH', min: 0, max: -100, label: 'End Depth'},
			 {type: 'range', variable: 'sensitivity', min: 0, max: 8, label: 'Audio Sensitivity'},
			 {type: 'checkbox', variable: 'rotate', label: 'Rotate'},
			 {type: 'range', min: 0, max: 20, step: 0.01, variable: 'spread', label: 'Spread'},
			 {type: 'multiimage', variable: 'images', label: 'Drag and drop an image here'}
		]
	};

	function randomRange(minVal,maxVal) {
    		return Math.floor(Math.random() * (maxVal - minVal - 1)) + minVal;
    }

    this.amount = 512;
    this.size = 20;
    this.spread = 0;

	var stars = new Array(512);
	this.MAX_DEPTH = 32;
	this.MIN_DEPTH = 0;

	for( var i = 0; i < stars.length; i++ ) {
		stars[i] = {
			x: randomRange(-25,25),
			y: randomRange(-25,25),
			z: randomRange(1, this.MAX_DEPTH),
			image: 0
		};
	}

	this.image = new Image();
	this.image.src = 'gameboy.gif';

	this.images = [];
	this.images.push(this.image);

	this.sensitivity = 8.4;
	this.degrees = 0;
	this.rotate = false;

	this.init = function(canvas) {

	};

	var imageLoop = 0;

	this.draw = function(canvas, ctx, amplitudeArray) {

		var all = 0;
		for(var i=0; i<64; i++) {
			all += amplitudeArray[i];
		}
		all = all/1000;

		var halfWidth  = canvas.width / 2;
		var halfHeight = canvas.height / 2;
		
		
		if(this.rotate) {
			ctx.save();
			ctx.translate(halfWidth, halfHeight);
			ctx.rotate(this.degrees);
			ctx.translate(-halfWidth, -halfHeight);
		}

		
		for( var i = 0; i < this.amount; i++ ) {
			//if(all < this.sensitivity) continue;
			stars[i].z -= (all/70);

			if( stars[i].z <= this.MIN_DEPTH ) {
				stars[i].x = randomRange(-25,25);
				stars[i].y = randomRange(-25,25);
				stars[i].z = this.MAX_DEPTH;
				stars[i].image = randomRange(0, this.images.length+1);
			}
			
			// When changing images, array length can change, so we need to check for that
			if(stars[i].image > this.images.length-1) stars[i].image = randomRange(0, this.images.length+1);

			var k  = 128.0 / stars[i].z;
			var px = (stars[i].x * this.spread) * k + halfWidth;
			var py = (stars[i].y * this.spread) * k + halfHeight;

			if(px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
				var sizex = Math.floor((this.images[stars[i].image].width/10 - (stars[i].z / 32.0)) * (this.size)/5 +(all*this.sensitivity));
				//var sizey = Math.floor((this.images[stars[i].image].height/10 - (stars[i].z / 32.0)) * (this.size)/5 +(all*this.sensitivity));
				var w = this.images[stars[i].image].width;
				var h = this.images[stars[i].image].height;
				var ratio = w/h;
				
				var sizey = sizex / ratio;
				
				var shade = parseInt((1 - stars[i].z / 32.0) * 255);
				ctx.webkitImageSmoothingEnabled = false;
				ctx.drawImage(this.images[stars[i].image], px-sizex/2, py-sizey/2, sizex, sizey);
				//if(this.rotate) ctx.translate(-px-sizex/2, -py-sizey/2);
			}

			
		}
		if(this.rotate) {
			ctx.translate(-halfWidth, -halfHeight);
			ctx.restore();
			if(this.degrees == 360) this.degrees = 0;
			else this.degrees+=0.01;
		}
	};
};