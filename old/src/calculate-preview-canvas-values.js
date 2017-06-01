module.exports = function(modV) {
	modV.prototype.calculatePreviewCanvasValues = function() {
		// thanks to http://ninolopezweb.com/2016/05/18/how-to-preserve-html5-canvas-aspect-ratio/
		// for great aspect ratio advice!
		let widthToHeight = this.width / this.height;
		let newWidth = this.previewCanvas.width,
			newHeight = this.previewCanvas.height;

		let newWidthToHeight = newWidth / newHeight;
	
		if (newWidthToHeight > widthToHeight) {
			newWidth = Math.round(newHeight * widthToHeight);
		} else {
			newHeight = Math.round(newWidth / widthToHeight);
		}

		this.previewCanvasImageValues.x = Math.round((this.previewCanvas.width/2) - (newWidth/2));
		this.previewCanvasImageValues.y = Math.round((this.previewCanvas.height/2) - (newHeight/2));
		this.previewCanvasImageValues.width = newWidth;
		this.previewCanvasImageValues.height = newHeight;
	};
};