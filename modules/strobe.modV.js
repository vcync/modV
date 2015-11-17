var strobe = function() {
	this.info = {
		name: 'strobe',
		author: '2xAA',
		version: 0.1,
		controls: [
			 {type: 'range', variable: 'speed', min: 2, max: 10, value: 2, label: 'Speed', varType: 'int'},
			 {type: 'checkbox', variable: 'useBPM', label: 'Use detected BPM'},
			 {type: 'range', variable: 'bpmDiv', label: 'BPM division', value: 0, min: 0, max: 64, step: 4}
		]
	};

	var canvas2 = document.createElement('canvas');
	var ctx2 = canvas2.getContext('2d');

	this.speed = 0;
	this.useBPM = false;
	this.bpmDiv = 0;

	var interval;
	var grab = false;
	var division = 1;
	var strobeSpeed = 100;

	this.init = function(canvas, ctx) {
		canvas2.width = canvas.width;
		canvas2.height = canvas.height;

		interval = setTimeout(intervalFnc, strobeSpeed, canvas, ctx);
	};

	function intervalFnc(canvas, ctx) {
		//grab = !grab;
		interval = setTimeout(intervalFnc, strobeSpeed, canvas, ctx);
	}

	this.draw = function(canvas, ctx, a, b, c, delta, bpm) {
		
		if(this.useBPM) {
			
			if(this.bpmDiv === 0) division = 1;
			else division = this.bpmDiv;

			strobeSpeed = bpm / division;
		} else {
			strobeSpeed = this.speed;
		}

		if(Math.round(delta) % strobeSpeed === 0) {
			ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
			ctx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
			grab = !grab;
		}

		if(grab) {
			ctx.drawImage(canvas2, 0, 0);
		}
	};
};