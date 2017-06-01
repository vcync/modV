const {replaceAll} = require('./utils');


module.exports = function(modV) {

	modV.prototype.createModule = function(originalModule, canvas, context, galleryItem) {

		if(!canvas) canvas = this.layers[0].canvas;
		if(!context) context = this.layers[0].context;

		let originalModuleName = originalModule.info.originalModuleName;
		let Module = new this.moduleStore[originalModuleName]();
		let name = Module.info.name;

		let instances = this.detectInstancesOf(originalModuleName);

		if(instances.length > 0) {
			name = this.generateName(Module.info.name);
		}

		Module.info.galleryItem = galleryItem || false;

		if(Module instanceof this.ModuleShader) {
			Module.programIndex = originalModule.programIndex;
			Module._makeProgramInfoFromIndex(this);
			Module._setupUniforms(this.shaderEnv.gl);
		}

		if('init' in Module && Module instanceof this.Module2D) {
			Module.init(canvas, context);
		}

		if('init' in Module && Module instanceof this.ModuleScript) {
			//Module.init(canvas, context);
			Module.init(this.previewCanvas, this.previewContext);
		}

		if('init' in Module && Module instanceof this.Module3D) {
			Module.init(canvas, Module.getScene(), this.threeEnv.material, this.threeEnv.texture);
		}

		// new safe name
		let safeName = replaceAll(name, ' ', '-');

		// update name
		Module.info.name = name;
		Module.info.safeName = safeName;
		Module.info.originalName = originalModule.info.name;
		Module.info.originalModuleName = originalModule.info.originalModuleName;
		Module.info.disabled = false;
		Module.info.solo = false;
		Module.info.alpha = 1;

		return Module;
	};
};