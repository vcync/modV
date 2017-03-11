module.exports = function(modV) {

	modV.prototype.loadPreset = function(id, clearScreen, keepLocked) {
		console.log('clear', clearScreen);
		this.factoryReset({
			clear: clearScreen,
			keepLockedLayers: keepLocked
		});

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

			Layer.clearing 		= ((typeof layerDetails.clearing	!== "undefined") ? layerDetails.clearing	: Layer.clearing);
			Layer.alpha 		= ((typeof layerDetails.alpha 		!== "undefined") ? layerDetails.alpha 		: Layer.alpha 	);
			Layer.enabled 		= ((typeof layerDetails.enabled 	!== "undefined") ? layerDetails.enabled		: Layer.enabled	);
			Layer.inherit 		= ((typeof layerDetails.inherit		!== "undefined") ? layerDetails.inherit		: Layer.inherit	);
			Layer.pipeline 		= ((typeof layerDetails.pipeline	!== "undefined") ? layerDetails.pipeline	: Layer.pipeline);
			Layer.locked 		= ((typeof layerDetails.locked		!== "undefined") ? layerDetails.locked		: Layer.locked);
			Layer.blending 		= ((typeof layerDetails.blending	!== "undefined") ? layerDetails.blending	: Layer.blending);
			Layer.drawToOutput	= ((typeof layerDetails.drawToOutput!== "undefined") ? layerDetails.drawToOutput: Layer.drawToOutput);

			Layer.setName((typeof layerDetails.name !== "undefined") ? layerDetails.name : Layer.name);

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
				}

				// init Module
				if('init' in Module &&
					(Module instanceof this.Module2D || Module instanceof this.ModuleScript)) {

					Module.init(this.layers[0].canvas, this.layers[0].context);
				}

				if('init' in Module && Module instanceof this.Module3D) {
					Module.init(this.layers[0].canvas, Module.getScene(), this.threeEnv.material, this.threeEnv.texture);
				}

				// Set Module values
				Module.info.disabled = presetModuleData.disabled;
				Module.info.blend = presetModuleData.blend;
				Module.info.solo = presetModuleData.solo;
				Module.info.alpha = presetModuleData.alpha;

				forIn(presetModuleData.values, (key, value) => {
					if(typeof value !== 'object') {

						let ModuleSettings = {};
						if(key in Module.info.controls) ModuleSettings = Module.info.controls[key].settings;

						Module[key] = value;

					} else {
						if(value.type === 'PaletteControl') {
							Module[value.variable] = value.color;
							Module.info.controls[value.variable].color = value.color;
							Module.info.controls[value.variable].colours = value.colours;
							Module.info.controls[value.variable].timePeriod = value.timePeriod;
						}

						if(value.type === 'VideoControl' || value.type === 'ImageControl') {
							Module[value.variable].src = value.src;
						}
					}
				});

				// Create UI controls
				this.createControls(Module, true);

				// Add to active modules
				this.activeModules[Module.info.name] = Module;

				// Set mod Order
				this.setModOrder(Module.info.name, idx);

				let activeItemElements = this.createActiveListItem(Module, node => {
					this.currentActiveDrag = node;
				}, () => {
					this.currentActiveDrag  = null;
				}, true);

				let activeItemNode = activeItemElements.node;

				// Add internal Controls
				Module.info.internalControls = {};
				Module.info.internalControls.alpha = activeItemElements.controls.alpha;
				Module.info.internalControls.disabled = activeItemElements.controls.disabled;
				Module.info.internalControls.blend = activeItemElements.controls.blend;

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

		let assignments = new Map(this.presets[id].MIDIAssignments);

		this.MIDIInstance.importAssignments(assignments);
	};
};