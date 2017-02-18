module.exports = function(Palette) {
	Palette.prototype.makePalette = function(colors) {
		var swatches = [];
		colors.forEach((color) => {
			var swatch = this.makeColorSwatch(color);
			swatches.push(swatch);
		});

		return swatches;
	};
};