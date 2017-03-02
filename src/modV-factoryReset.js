module.exports = function(modV) {
	
	modV.prototype.factoryReset = function(opts) {
		
		while(this.layers.length > 0) {
			this.removeLayer(this.layers[0]);
		}

		// Clear the screen
		if(opts.clear) this.outputContext.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
	};
};