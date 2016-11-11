modV.prototype.loadPreset = function(id) {
	this.factoryReset();

	if(!('layers' in this.presets[id])) {
		console.warn('Converting old preset');

		this.presets[id].layers = [];
		this.presets[id].layers[0] = {
			moduleOrder: [],
			inherit: false
		};
		// emulate old solo function
		this.presets[id].layers[1] = {
			moduleOrder: [],
			clearing: true
		};

		this.presets[id].modOrder.forEach(name => {
			let moduleDetails = this.presets[id].moduleData[name];
			if(moduleDetails.solo === true) {
				this.presets[id].layers[1].moduleOrder.push(name);
			} else {
				this.presets[id].layers[0].moduleOrder.push(name);
			}
		});
	}

	this.presets[id].layers.forEach(layerDetails => {

		let layerIndex = this.addLayer();
		let Layer = this.layers[layerIndex];

		Layer.clearing 	= layerDetails.clearing || Layer.clearing;
		Layer.alpha 	= layerDetails.alpha 	|| Layer.alpha ;
		Layer.enabled 	= layerDetails.enabled 	|| Layer.enabled;
		Layer.inherit 	= layerDetails.inherit	|| Layer.inherit;
		Layer.pipeline 	= layerDetails.pipeline	|| Layer.pipeline;
		Layer.blending 	= layerDetails.blending	|| Layer.blending;
		Layer.name 		= layerDetails.name 	|| Layer.name;

		layerDetails.moduleOrder.forEach((name, idx) => {

			var presetModuleData = this.presets[id].moduleData[name];
			var Module;

			Module = new this.moduleStore[presetModuleData.originalModuleName]();

			var originalModule = this.registeredMods[presetModuleData.originalName];

			Module.info.originalModuleName = originalModule.info.originalModuleName;
			
			Module.info.name = presetModuleData.name;
			Module.info.originalName = presetModuleData.originalName;
			Module.info.safeName = presetModuleData.safeName;

			// init Module
			if(Module instanceof this.ModuleShader) {
				Module.programIndex = originalModule.programIndex;
				
				// Loop through Uniforms, expose this.uniforms and create local variables
				if('uniforms' in Module.settings.info) {

					forIn(Module.settings.info.uniforms, (uniformKey, uniform) => {
						switch(uniform.type) {
							case 'f':
								Module[uniformKey] = parseFloat(uniform.value);
								break;

							case 'i':
								Module[uniformKey] = parseInt(uniform.value);
								break;

							case 'b':
								Module[uniformKey] = uniform.value;
								break;

						}
					});
				}
			}

			// init Module
			if('init' in Module && Module instanceof this.Module2D) {
				Module.init(this.outputCanvas, this.outputContext);
			}

			if('init' in Module && Module instanceof this.Module3D) {
				Module.init(this.outputCanvas, Module.getScene(), Module.getCamera(), this.THREE.material, this.THREE.texture);
			}

			// Set Module values
			Module.info.disabled = presetModuleData.disabled;
			Module.info.blend = presetModuleData.blend;
			Module.info.solo = presetModuleData.solo;

			forIn(presetModuleData.values, value => {
				Module[value] = presetModuleData.values[value];
			});

			// Create UI controls
			this.createControls(Module, this);

			// Add to active modules
			this.activeModules[Module.info.name] = Module;

			// Set mod Order
			this.setModOrder(Module.info.name, idx);

			var activeItemNode = this.createActiveListItem(Module, node => {
				this.currentActiveDrag = node;
			}, () => {
				this.currentActiveDrag  = null;
			});

			// Add to active registry
			this.activeModules[Module.info.name] = Module;

			// Add to layer
			Layer.addModule(Module, idx);

			// Set Module's layer
			Module.setLayer(layerIndex);

			// move node to layer list node
			Layer.moduleListNode.appendChild(activeItemNode);
		});
	});
};