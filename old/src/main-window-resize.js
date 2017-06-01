module.exports = function(modV) {
	modV.prototype.mainWindowResize = function() {
		let boundingRect = this.previewCanvas.getBoundingClientRect();
		this.previewCanvas.width = boundingRect.width;
		this.previewCanvas.height = boundingRect.height;

		this.calculatePreviewCanvasValues();
	};
};