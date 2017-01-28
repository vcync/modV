module.exports = function resize() {

	this.THREE.renderer.setSize(this.outputCanvas.width, this.outputCanvas.height);

	if(window.devicePixelRatio > 1 && this.options.retina) {
		this.width = this.previewWindow.innerWidth * this.previewWindow.devicePixelRatio;
		this.height = this.previewWindow.innerHeight * this.previewWindow.devicePixelRatio;

	} else {
		this.width = this.previewWindow.innerWidth;
		this.height = this.previewWindow.innerHeight;
	}

	this.outputCanvas.width = this.width;
	this.outputCanvas.height = this.height;

	this.bufferCanvas.width = this.width;
	this.bufferCanvas.height = this.height;

	this.THREE.textureCanvas.width = this.width;
	this.THREE.textureCanvas.height =  this.height;

	this.shaderEnv.resize(this.width, this.height);

	this.calculatePreviewCanvasValues();

	this.layers.forEach(layer => {
		let canvas = layer.canvas;
		canvas.width = this.width;
		canvas.height = this.height;
	});

	forIn(this.activeModules, (mod, Module) => {
		if('resize' in Module) {
			let layer = this.layers[Module.getLayer()];

			if(Module instanceof this.Module3D) {
				Module.resize(layer.canvas, Module.getScene(), Module.getCamera(), this.THREE.material, this.THREE.texture);
			} else if(Module instanceof this.ModuleScript) {
				Module.resize(this.previewCanvas, this.previewContext);
			} else {
				Module.resize(layer.canvas, layer.context);
			}
		}
	});
};