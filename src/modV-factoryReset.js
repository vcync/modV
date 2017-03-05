module.exports = function(modV) {
	
	modV.prototype.factoryReset = function(opts) {
		
		// while(this.layers.length > 0) {
		// 	this.removeLayer(this.layers[0]);
		// }

		for(var i = this.layers.length - 1; i >= 0; i--) {
			if(this.layers[i].locked && opts.keepLockedLayers) continue;
			this.removeLayer(this.layers[i]);
		}

		// Clear the screen
		if(opts.clear) this.outputContext.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
	};
};