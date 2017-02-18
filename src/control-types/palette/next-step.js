const colorToRGBString = require('../../fragments/color-to-rgb-string');
const calculateStep = require('./calculate-step');

module.exports = function(Palette) {

	Palette.prototype.nextStep = function() {
	
		if(this.useBPM) {
			this.timePeriod = Math.round(this.callbacks.getBPM() / this.bpmDivison);
		}

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

		if('next' in this.callbacks) this.callbacks.next(returned);
		
		return returned;
	};
};