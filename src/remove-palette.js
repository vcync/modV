module.exports = function(modV) {
	modV.prototype.removePalette = function(id) {
		this.palettes.delete(id);
		this.workers.palette.postMessage({
			'message': 'remove-palette',
			'paletteId': id
		});
	};
};