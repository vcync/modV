module.exports = function(modV) {
	modV.prototype.updateLayerSelectors = function() {
		this.layerSelectors.forEach(ls => {
			ls.update(this.layers);
		});
	};
};