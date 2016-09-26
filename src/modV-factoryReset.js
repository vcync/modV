(function() {
	'use strict';

	modV.prototype.factoryReset = function() {

		forIn(this.activeModules, (key, Module) => {
			this.deleteActiveModule(Module);
		});

		// Clear the screen
		this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
	};

})();