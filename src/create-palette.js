module.exports = function(modV) {
	modV.prototype.createPalette = function(id, colors, duration) {
		this.workers.palette.postMessage({
			'message': 'create-palette',
			'paletteId': id,
			'colors': colors,
			'duration': duration
		});
	};
};