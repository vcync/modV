module.exports = function(modV) {
	modV.prototype.setPalette = function(id, options) {
		this.workers.palette.postMessage({
			'message': 'set-palette',
			'paletteId': id,
			'options': options
		});
	};
};