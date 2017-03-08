function colorToRGBString(colour) {
	try {
		return 'rgb(' +
			colour[0] +
			', ' +
			colour[1] +
			', ' +
			colour[2] +
			')';
	} catch(e) {
		return 'rgb(0,0,0)';
	}
}

function calculateStep(colors, currentColor, currentTime, timePeriod) {
	var r1, g1, b1;
	try {	
		r1 = colors[currentColor][0];
		g1 = colors[currentColor][1];
		b1 = colors[currentColor][2];
	} catch(e) {
		// try catch because the user may delete the current colour which throws the array and nextIndex out of sync
		// TODO: fix case where user deletes current colour
		return;
	}
	
	var nextColor = currentColor + 1;
	
	if(nextColor > colors.length-1) {
		nextColor = 0;
	}
	
	var r2 = colors[nextColor][0];
	var g2 = colors[nextColor][1];
	var b2 = colors[nextColor][2];
	
	var p = currentTime / (timePeriod - 1);
	var r = Math.round((1.0-p) * r1 + p * r2 + 0.5);
	var g = Math.round((1.0-p) * g1 + p * g2 + 0.5);
	var b = Math.round((1.0-p) * b1 + p * b2 + 0.5);
	
	return [r, g, b];
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16)
	] : null;
}

function Palette(colors, timePeriod, id) {
	this.useBPM = false;
	this.bpmDivison = 1;
	this.creationTime = Date.now();

	let stringed = JSON.stringify(colors);

	colors = JSON.parse(stringed) || [];

	this.colors = colors;
	this.timePeriod = timePeriod || 100;

	this.profilesList = [];

	this.currentColor = 0; //jshint ignore:line
	this.currentTime = 0; //jshint ignore:line
	//this.timePeriod = Math.round((this.timePeriod/1000) * 60);

	this.getId = function() {
		return id;
	};
}

Palette.prototype.addColor = function(color) {
	let rgbFromHex;
	if(typeof color === 'string') {

		rgbFromHex = hexToRgb(color);
		this.colors.push(rgbFromHex);

	} else if(Array.isArray(color.constructor)) {

		this.colors.push(rgbFromHex);

	} else return;

	return this.colors.length;
};

Palette.prototype.getColors = function() {
	return colors;
};

Palette.prototype.removeAtIndex = function(index) {
	var returnVal = this.colors.splice(index, 1);
	return returnVal;
};

Palette.prototype.nextStep = function(cb) {

	// if(this.useBPM) {
	// 	this.timePeriod = Math.round(this.callbacks.getBPM() / this.bpmDivison);
	// }

	if(this.colors.length < 1) {
		// If there are no colours, return false
		return false;
	} else if(this.colors.length < 2) {
		// If there are less than two colours, just return the only colour
		return colorToRGBString(this.colors[0]);
	}
	
	this.currentTime++;
	if(this.currentTime >= this.timePeriod) {
		if(this.currentColor > this.colors.length-2) {
			this.currentColor = 0;
		} else {
			this.currentColor++;
		}
		this.currentTime = 0;
	}
	
	var returned = calculateStep(this.colors, this.currentColor, this.currentTime, this.timePeriod);
	returned = colorToRGBString(returned);

	cb(returned);
	return returned;
};

Palette.prototype.update = function() {
	return new Promise((resolve) => {
		this.nextStep(resolve);
	});
};

Palette.prototype.setTimePeriod = function() {
	// TODO: sets time period and updates current time period if old is greater than new
};

module.exports = Palette;