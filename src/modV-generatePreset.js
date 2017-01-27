module.exports = function(modV) {
	
	modV.prototype.generatePreset = function(name) {
		let self = this;
		var preset = {
			layers: [],
			moduleData: {},
			MIDIAssignments: [],
			presetInfo: {
				name: name,
				datetime: Date.now(),
				modVVersion: this.version,
				author: this.options.user
			}
		};
		
		function extractValues(Control, Module, key) {
			if(Control instanceof self.PaletteControl) {

				preset.moduleData[key].values[Control.variable] = {
					type: 'PaletteControl',
					variable: Control.variable,
					color: Module[Control.variable],
					colours: Control.colours,
					timePeriod: Control.timePeriod
				};

			} else {

				if('append' in Control.getSettings()) {
					preset.moduleData[key].values[Control.variable] = Control.node.value;
				} else {
					preset.moduleData[key].values[Control.variable] = Module[Control.variable];
				}
			}
		}

		let MIDIAssignmentsObject = [];

		this.MIDIInstance.assignments.forEach((value, key) => {
			MIDIAssignmentsObject.push([key, value]);
		});

		preset.MIDIAssignments = MIDIAssignmentsObject;

		this.layers.forEach(Layer => {
			let layerDetails = {
				clearing: Layer.clearing,
				alpha: Layer.alpha,
				enabled: Layer.enabled,
				inherit: Layer.inherit,
				pipeline: Layer.pipeline,
				blending: Layer.blending,
				name: Layer.name,
				moduleOrder: Layer.moduleOrder
			};

			preset.layers.push(layerDetails);
		});

		forIn(this.activeModules, (key, Module) => {
			
			preset.moduleData[key] = {};
			preset.moduleData[key].disabled = 			Module.info.disabled;
			preset.moduleData[key].blend = 				Module.info.blend || 'normal';
			preset.moduleData[key].name = 				Module.info.name;
			preset.moduleData[key].clone = 				false;
			preset.moduleData[key].originalName = 		Module.info.originalName;
			preset.moduleData[key].safeName = 			Module.info.safeName;
			preset.moduleData[key].originalModuleName = Module.info.originalModuleName;
			preset.moduleData[key].solo = 				Module.info.solo;
			preset.moduleData[key].alpha = 				Module.info.alpha;

			if('originalName' in Module.info) {
				preset.moduleData[key].clone = true;
			}

			preset.moduleData[key].values = {};
			forIn(Module.info.controls, (k, Control) => {
				extractValues(Control, Module, key);
			});
		});

		return preset;
	};
};