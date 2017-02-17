const colorToRGBString = require('../../fragments/color-to-rgb-string');

module.exports = function(Palette) {
	Palette.prototype.makeColorSwatch = function(color) {
		let swatch = document.createElement('div');
		swatch.classList.add('swatch');
		swatch.style.backgroundColor = colorToRGBString(color);
		swatch.addEventListener('click', () => {

			let nodeList = Array.prototype.slice.call(swatch.parentNode.children);
			let idx = nodeList.indexOf(swatch);

			this.removeAtIndex(idx);
			swatch.remove();
		});
		return swatch;
	};
};