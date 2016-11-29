(function() {
	'use strict';

	modV.prototype.factoryReset = function() {
		
		while(this.layers.length > 0) {
			this.removeLayer(this.layers[0]);
		}

		// Clear the screen
		this.outputContext.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
	};

})();