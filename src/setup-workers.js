module.exports = function(modV) {
	modV.prototype.setupWorkers = function() {

		let paletteWorker = new Worker('palette-worker.js');
		this.workers.palette = paletteWorker;

		paletteWorker.onmessage = e => {
			if(!('message' in e.data)) return;

			if(e.data.message === 'palette-created' ) {
				this.addPalette({
					id: e.data.paletteId
				});
			}

			if(e.data.message === 'palette-update') {
				this.updatePalette(e.data.paletteId, e.data.currentColor, e.data.currentStep);
			}
		};
	};
};