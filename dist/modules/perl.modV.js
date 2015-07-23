var perl = function() {
	this.info = {
		name: 'perl',
		author: '2xAA',
		version: 0.1,
		meyda: ['zcr', 'rms'],
		controls: [
			{type: 'range', variable: 'mouseX', min: 1, max: 1500, varType: 'int', label: 'X'},
			{type: 'range', variable: 'mouseY', min: 1, max: 1500, varType: 'int', label: 'Y'},
			{type: 'range', variable: 'intensity', label: 'RMS/ZCR Intensity', min: 0, max: 30, varType: 'int', step: 1},
			{type: 'range', variable: 'size', min: 1, max: 500, varType: 'int', label: 'Size'},
			{type: 'checkbox', variable: 'rms', label: 'Use RMS', checked: false}
		]
	};

	var that = this;

	var particles = [];
	var numParticles, fadeAmount, maxLen, strokeAmount;
	var FIELDWIDTH = 0;
	var FIELDHEIGHT = 0;
	this.mouseX = 1;
	this.mouseY = 1;
	this.intensity = 0;
	this.rms = false;

	function randomize() {
		numParticles = random(50, 100);
		fadeAmount = random(0.5, 20);
		maxLen = random(30, 200);
		strokeAmount = random(0.02, 0.1);
		
		for(var i=0; i < numParticles; i++){
			particles[i] = new Particle(i/5000.0);
		}
	}

	

	this.init = function(canvas) {
		FIELDWIDTH = canvas.width;
		FIELDHEIGHT = canvas.height;
		randomize();
	};

	randomize();


	function random(min, max) {
		if(min % 1 === 0 || max % 1 === 0) return Math.floor(Math.random()*(max-min+1)+min);
		else return Math.random()*(max-min+1)+min;
	}

	function map(value, istart, istop, ostart, ostop) {
		return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	}

	function radians(degrees) {
		return	degrees * (Math.PI/180);
	}

	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: parseInt(evt.clientX - rect.left),
			y: parseInt(evt.clientY - rect.top)
		};
	}

	///////////////////

	 Alea.importState = function(i){
		var random = new Alea();
		random.importState(i);
		return random;
		};


		function Alea() {
		return (function(args) {
			// Johannes Baagøe <baagoe@baagoe.com>, 2010
			var s0 = 0;
			var s1 = 0;
			var s2 = 0;
			var c = 1;

			if (args.length === 0) {
				args = [+new Date()];
			}
			var mash = Mash();
			s0 = mash(' ');
			s1 = mash(' ');
			s2 = mash(' ');

			for (var i = 0; i < args.length; i++) {
				s0 -= mash(args[i]);
				if (s0 < 0) {
					s0 += 1;
				}
				s1 -= mash(args[i]);
				if (s1 < 0) {
					s1 += 1;
				}
				s2 -= mash(args[i]);
				if (s2 < 0) {
					s2 += 1;
				}
			}
			mash = null;

			var random = function() {
				var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
				s0 = s1;
				s1 = s2;
				return s2 = t - (c = t | 0);
			};

			random.uint32 = function() {
				return random() * 0x100000000; // 2^32
			};

			random.fract53 = function() {
				return random() + 
					(random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
				};
				random.version = 'Alea 0.9';
				random.args = args;

				// my own additions to sync state between two generators
				random.exportState = function(){
				return [s0, s1, s2, c];
			};
			random.importState = function(i){
			s0 = +i[0] || 0;
			s1 = +i[1] || 0;
			s2 = +i[2] || 0;
			c = +i[3] || 0;
			};
	 
			return random;

		} (Array.prototype.slice.call(arguments)));
		}

		function Mash() {
		var n = 0xefc8249d;

		var mash = function(data) {
			data = data.toString();
			for (var i = 0; i < data.length; i++) {
			n += data.charCodeAt(i);
			var h = 0.02519603282416938 * n;
			n = h >>> 0;
			h -= n;
			h *= n;
			n = h >>> 0;
			h -= n;
			n += h * 0x100000000; // 2^32
			}
			return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
		};

		mash.version = 'Mash 0.9';
		return mash;
		}

	///////////////////
	var PerlinGenerator = function(seed) {
		if (seed != undefined) {
			this.alea_rand = new Alea(seed); // use provided seed
		} else {
			this.alea_rand = new Alea(); // use random seed
		}
		this.PERLIN_YWRAPB = 4;
		this.PERLIN_YWRAP = 1 << this.PERLIN_YWRAPB;
		this.PERLIN_ZWRAPB = 8;
		this.PERLIN_ZWRAP = 1 << this.PERLIN_ZWRAPB;
		this.PERLIN_SIZE = 4095;
		this.perlin_octaves = 4; // default to medium smooth
		this.perlin_amp_falloff = 0.5; // 50% reduction/octave
		this.perlin_array = new Array();
		// generate cos lookup table
		var DEG_TO_RAD = 0.0174532925;
		var SINCOS_PRECISION = 0.5;
		var SINCOS_LENGTH = Math.floor(360/SINCOS_PRECISION);
		this.cosLUT = new Array();
		for (var i = 0; i < SINCOS_LENGTH; i++) {
			this.cosLUT[i] = Math.cos(i * DEG_TO_RAD * SINCOS_PRECISION);
		}
		this.perlin_TWOPI = SINCOS_LENGTH;
		this.perlin_PI = SINCOS_LENGTH;
		this.perlin_PI >>= 1;
	};

	PerlinGenerator.prototype.noiseReseed = function() {
		this.alea_rand = new Alea(); // new random seed
		this.perlin_array = new Array(); // start the perlin array fresh
	};

	PerlinGenerator.prototype.noiseSeed = function(seed) {
		this.alea_rand = new Alea(seed); // use provided seed
		this.perlin_array = new Array(); // start the perlin array fresh
	};


	PerlinGenerator.prototype.noiseDetail = function(lod, falloff) {
		if (Math.floor(lod) > 0) this.perlin_octaves = Math.floor(lod);
		if (falloff !== undefined && falloff > 0) this.perlin_amp_falloff = falloff;
	};

	PerlinGenerator.prototype.noise_fsc = function(i) {
		return 0.5 * (1.0 - this.cosLUT[Math.floor(i * this.perlin_PI) % this.perlin_TWOPI]);
	};

	PerlinGenerator.prototype.noise = function(x, y, z) {
		if (x === undefined) {
			return false; // we need at least one param
		}
		if (y === undefined) {
			y = 0; // use 0 if not provided
		}
		if (z === undefined) {
			z = 0; // use 0 if not provided
		}
		
		// build the first perlin array if there isn't one
		if (this.perlin_array.length === 0) {
			this.perlin_array = new Array();
			for (var i = 0; i < this.PERLIN_SIZE + 1; i++) {
				this.perlin_array[i] = this.alea_rand();
			}
		}

		var xi = Math.floor(x);
		var yi = Math.floor(y);
		var zi = Math.floor(z);
		var xf = x - xi;
		var yf = y - yi;
		var zf = z - zi;
		var r = 0;
		var ampl = 0.5;
		var rxf, ryf, n1, n2, n3;
		
		for (var i = 0; i < this.perlin_octaves; i++) {
			// look at all this math stuff
			var of = xi + (yi << this.PERLIN_YWRAPB) + (zi << this.PERLIN_ZWRAPB);
			rxf = this.noise_fsc(xf);
			ryf = this.noise_fsc(yf);
			n1	= this.perlin_array[of & this.PERLIN_SIZE];
			n1 += rxf * (this.perlin_array[(of + 1) & this.PERLIN_SIZE] - n1);
			n2	= this.perlin_array[(of + this.PERLIN_YWRAP) & this.PERLIN_SIZE];
			n2 += rxf * (this.perlin_array[(of + this.PERLIN_YWRAP + 1) & this.PERLIN_SIZE] - n2);
			n1 += ryf * (n2-n1);
			of += this.PERLIN_ZWRAP;
			n2	= this.perlin_array[of & this.PERLIN_SIZE];
			n2 += rxf * (this.perlin_array[(of + 1) & this.PERLIN_SIZE] - n2);
			n3	= this.perlin_array[(of + this.PERLIN_YWRAP) & this.PERLIN_SIZE];
			n3 += rxf * (this.perlin_array[(of + this.PERLIN_YWRAP + 1) & this.PERLIN_SIZE] - n3);
			n2 += ryf * (n3 - n2);
			n1 += this.noise_fsc(zf) * (n2 - n1);
			r += n1 * ampl;
			ampl *= this.perlin_amp_falloff;
			xi <<= 1;
			xf *= 2;
			yi <<= 1;
			yf *= 2;
			zi <<= 1; 
			zf *= 2;
			if (xf >= 1) { xi++; xf--; }
			if (yf >= 1) { yi++; yf--; }
			if (zf >= 1) { zi++; zf--; }
		}
		return r;
	}

	var noise = new PerlinGenerator();

	this.size = 10;


	function Particle(id) {
		var x, y, xp, yp, s, d, sColor, len, z, zp;

		function init() {
			x=xp=random(0,FIELDWIDTH);
			y=yp=/*FIELDHEIGHT/2;*/ random(0,FIELDHEIGHT);
			z=zp=0;
			s=random(2,7);
			sColor = map(random(0,FIELDWIDTH),0,FIELDWIDTH,0,360);
			len = random(1,maxLen-1);
		}
	 
		this.update = function(ctx, meyda) {
			var zcr = meyda.zcr;
			if(that.rms) zcr = meyda.rms;

			zcr = that.intensity * zcr;
			if(that.rms) {
				zcr = zcr * 50;
			}


			id+=0.01;

			if (that.mouseY === 0 || that.mouseX === 0){ 
				that.mouseY = 1;
				that.mouseX = 1;
			}

			d = (noise.noise(id, x/(that.mouseY + (zcr/10 * that.intensity)), y/(that.mouseY + (zcr/10 * that.intensity)))	-0.5) * that.mouseX;
			

			x+= Math.cos(radians(d))*s;
			y+= Math.sin(radians(d))*s;
			

			ctx.lineWidth = (maxLen - len) * strokeAmount;
			ctx.fillStyle = ctx.strokeStyle = 'hsl('+sColor+', 80%, 80%)';

			
			ctx.beginPath();
			ctx.arc(x,y,that.size,0,2*Math.PI);
			ctx.fill();
			ctx.closePath();
			
			xp=x;
			yp=y;
			len++;
			if (len >= maxLen) init();
			
			if(sColor >= 360) sColor = 0;
			else sColor+=1;
		};
		
		init();
	}


	this.draw = function(canvas, ctx, amp, cam, meyda) {

		for(var i = 0; i < numParticles; i++) {
			particles[i].update(ctx, meyda);
		} 
	};
};