/* globals Perlin */
class Perl extends modV.Module2D {
	constructor() {
		super({
			info: {
				name: 'perl',
				author: '2xAA',
				version: 1.0,
				meyda: ['zcr', 'rms'],
				scripts: [
					'Perl/perlin.js'
				]
			}
		});

		this.add(new modV.RangeControl({
			variable: 'numActiveParticles',
			min: 0,
			max: 1000,
			varType: 'int',
			label: 'Number of Particles',
			default: 50
		}));

		this.add(new modV.RangeControl({
			variable: 'yInt',
			min: 1,
			max: 1500,
			varType: 'int',
			label: 'X',
			default: 1
		}));

		this.add(new modV.RangeControl({
			variable: 'xInt',
			min: 1,
			max: 1500,
			varType: 'int',
			label: 'Y',
			default: 1
		}));

		this.add(new modV.RangeControl({
			variable: 'featureIntensity',
			label: 'RMS/ZCR Intensity',
			min: 0,
			max: 2,
			varType: 'float',
			step: 0.01,
			default: 0
		}));

		this.add(new modV.RangeControl({
			variable: 'size',
			min: 1,
			max: 50,
			varType: 'int',
			label: 'Size',
			default: 10
		}));

		this.add(new modV.RangeControl({
			variable: 'speed',
			min: 0,
			max: 5,
			varType: 'float',
			label: 'Speed',
			default: 1,
			step: 0.1
		}));

		this.add(new modV.RangeControl({
			variable: 'smoothness',
			min: 1,
			max: 4000,
			varType: 'int',
			label: 'Smoothness',
			default: 4000
		}));

		this.add(new modV.CheckboxControl({
			variable: 'rms',
			label: 'Use RMS (checked) / Use ZCR (unchecked)',
			checked: true
		}));

		this.add(new modV.CheckboxControl({
			variable: 'affectSize',
			label: 'Use RMS/ZCR to affect size',
			checked: false
		}));

		this.add(new modV.CheckboxControl({
			variable: 'affectSpeed',
			label: 'Use RMS/ZCR to affect speed',
			checked: true
		}));

		this.add(new modV.CheckboxControl({
			variable: 'affectDirection',
			label: 'Use RMS/ZCR to affect direction',
			checked: false
		}));

		this.add(new modV.PaletteControl({
			variable: 'color',
			colors: [
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
			timePeriod: 16
		}));
	}

	random(min, max) {
		if(min % 1 === 0 || max % 1 === 0) return Math.floor(Math.random()*(max-min+1)+min);
		else return Math.random()*(max-min+1)+min;
	}

	radians(degrees) {
		return	degrees * (Math.PI/180);
	}

	randomize() {
		for(var i=0; i < this.numParticles; i++){
			this.particles[i] = this.makeParticle(i);
		}
	}

	init(canvas) {
		this.smoothness = 4000;

		this.pn = new Perlin(Math.random());

		this.setFieldSize(canvas);
		this.size = 10;
		this.color = 'blue';
		this.numParticles = 1000;
		this.numActiveParticles = 50;
		
		this.affectSize = false;
		this.affectSpeed = true;
		this.affectDirection = false;

		this.featureIntensity = 0;
		this.rms = true;

		this.particles = [];
		this.xInt = 0;
		this.yInt = 0;
		this.speed = 1;
		this.noise = 0;
		this.randomize();
	}

	resize(canvas) {
		this.setFieldSize(canvas);
	}

	draw(canvas, ctx, cam, meyda, meydaInstance, delta) {

		let feature = meyda.zcr;
		if(this.rms) feature = meyda.rms;

		feature = this.featureIntensity * feature;

		if(this.rms) {
			feature = feature * 50;
		}

		let noise;

		if(this.affectDirection) {
			noise = this.pn.noise(
				(delta + (feature/10 * this.featureIntensity)),
				(delta + (feature/10 * this.featureIntensity)),
				0
			);
		} else {
			noise = this.pn.noise(
				(delta / this.smoothness),
				(delta / this.smoothness),
				0
			);
		}

		for(var i = 0; i < this.numActiveParticles; i++) {
			this.particles[i].draw(
				ctx,
				feature,
				noise
			);
		}
	}

	makeParticle(id) {
		return new (this.Particle())(id);
	}

	setFieldSize(sizes) {
		this.width = sizes.width;
		this.height = sizes.height;
	}

	Particle(id) {
		let that = this;

		return function() {
			let len;
			let maxLen;
			let speedX;
			let speedY;

			this.init = function() {
				len = 0;
				maxLen = that.random(30, 300);
				speedX = that.random(-5, 5);
				speedY = that.random(-5, 5);
				this.x = that.random(0, that.width);
				this.y = that.random(0, that.height);
			};

			this.x = 0;
			this.y = 0;

			this.getId = () => {
				return id;
			};

			this.update = (feature, noise) => {
				let x = Math.cos(that.radians(noise * that.xInt));
				let y = Math.sin(that.radians(noise * that.yInt));

				if(that.affectSpeed) {
					x = x * (feature/10 * that.featureIntensity);
					y = y * (feature/10 * that.featureIntensity);
				}

				this.x += x + (that.speed*speedX);
				this.y += y + (that.speed*speedY);

				len++;
				if(len > maxLen) this.init();
			};

			this.draw = (ctx, feature, noise) => {
				this.update(feature, noise);
				ctx.fillStyle = that.color;
				
				ctx.beginPath();

				if(that.affectSize) {
					ctx.arc(this.x, this.y, that.size * (feature/10 * that.featureIntensity), 0, 2*Math.PI);
				} else ctx.arc(this.x, this.y, that.size, 0, 2*Math.PI);

				ctx.fill();
				ctx.closePath();

			};

			this.init();
		};
	}
}

modV.register(Perl);