module.exports = function resize() {

	let largestWindow = this.getLargestWindow();

	if(!largestWindow) return;
	else largestWindow = largestWindow.window;

	if(window.devicePixelRatio > 1 && this.options.retina) {
		this.width = largestWindow.innerWidth * largestWindow.devicePixelRatio;
		this.height = largestWindow.innerHeight * largestWindow.devicePixelRatio;

	} else {
		this.width = largestWindow.innerWidth;
		this.height = largestWindow.innerHeight;
	}

	this.threeEnv.renderer.setSize(this.width, this.height);

	this.outputCanvas.width = this.width;
	this.outputCanvas.height = this.height;

	this.bufferCanvas.width = this.width;
	this.bufferCanvas.height = this.height;

	this.threeEnv.textureCanvas.width = this.width;
	this.threeEnv.textureCanvas.height =  this.height;

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
				Module.resize(layer.canvas, Module.getScene(), Module.getCamera(), this.threeEnv.material, this.threeEnv.texture);
			} else if(Module instanceof this.ModuleScript) {
				Module.resize(this.previewCanvas, this.previewContext);
			} else {
				Module.resize(layer.canvas, layer.context);
			}
		}
	});
};