const hexToRgb = require('../../fragments/hex-to-rgb');

module.exports = function(Palette) {
	Palette.prototype.addColor = function(color) {
		let rgbFromHex;
		if(typeof color === 'string') {

			rgbFromHex = hexToRgb(color);
			this.colors.push(rgbFromHex);

		} else if(color.constructor === Array) {

			this.colors.push(rgbFromHex);

		} else return;

		if('add' in this.callbacks) this.callbacks.add(this.colors);
		return this.colors.length;
	};
};