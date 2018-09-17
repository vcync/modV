//jshint ignore:start
//lfo.js
//Created by Guillaume Bauer
//GitHub repo : http://github.com/TheTeapot418/LFO.js
//GitHub page : http://theteapot418.github.io

function LFO (param) {
	this.startTime = new Date().getTime();
	
	var param = param || {};
	
	this.freq = 1;
	this.amplitude = 2;
	
	this.set = function (param) {
		
		var param = param || {};
		
		this.freq = param.freq || this.freq;
		this.amplitude = param.amplitude || this.amplitude;
		
		switch (param.waveform) {
		case "sine":
			this.waveform = Math.sin;
			break;
			
		case "triangle":
			this.waveform = function(x) {
				if (x <= Math.PI) {
					return x / (Math.PI / 2) - 1;
				} else {
					return (x - (Math.PI)) / (-Math.PI / 2) + 1;
				}

			}
			break;
			
		case "square":
			this.waveform = function(x) {
				if (x <= Math.PI) {
					return -1;
				} else {
					return 1;
				}
			}
			break;
			
		case "sawtooth":
			this.waveform = function(x) {
				return x / Math.PI - 1;
			}
			break;
			
		case "noise":
			this.waveform = function(x) {
				return Math.random() * 2 - 1;
			}
			break;
			
		default:
			this.waveform = param.waveform || this.waveform;
		}
	}
	
	this.set(param);
	
	this.value = function() {
		var T = 1 / this.freq;
		var d = new Date().getTime();
		var a = (d - this.startTime) / 1000;
		var x = this.freq * a;
		x = x - Math.floor(x);
		
		return (this.amplitude / 2) * this.waveform(x * 2 * Math.PI);
	}
	
	this.reset = function() {
		this.startTime = new Date().getTime();
	}
}