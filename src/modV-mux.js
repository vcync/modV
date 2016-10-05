modV.prototype.mux = function() {
	this.outputContext.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);

	this.layers.forEach(Layer => {
		if(!Layer.enabled || Layer.alpha === 0) return;
		let canvas = Layer.canvas;
		this.outputContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);
	});
};