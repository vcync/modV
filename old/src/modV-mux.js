module.exports = function(modV) {

	modV.prototype.mux = function() {
		this.outputContext.clearRect(0, 0, this.width, this.height);

		this.layers.forEach(Layer => {
			if(!Layer.enabled || Layer.alpha === 0 || !Layer.drawToOutput) return;
			let canvas = Layer.canvas;
			this.outputContext.drawImage(canvas, 0, 0, this.width, this.height);
		});

		this.outputWindows.forEach(oWindow => {
			let canvas = oWindow.canvas;
			let ctx = oWindow.context;
			
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(this.outputCanvas, 0, 0, canvas.width, canvas.height);
		});
	};
};