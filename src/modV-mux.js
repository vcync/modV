modV.prototype.mux = function() {
	this.outputContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

	this.layers.forEach(canvas => {
		this.outputContext.drawImage(canvas, 0, 0, this.canvas.width, this.canvas.height);
	});
};