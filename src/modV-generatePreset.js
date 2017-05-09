const {forIn} = require('./utils');
const Ajv = require('ajv');
const makeSchema = function(props) {
	return {
		"$schema": "http://json-schema.org/draft-04/schema#",
		"type": "object",
		"properties": props
	};
};

module.exports = function(modV) {
	const ajv = new Ajv({
		removeAdditional: 'all'
	});

	modV.prototype.generatePreset = function(name) {

		let self = this;
		let preset = {
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
					colors: Control.colors,
					timePeriod: Control.timePeriod
				};

			} else if(Control instanceof self.VideoControl) {

				preset.moduleData[key].values[Control.variable] = {
					type: 'VideoControl',
					variable: Control.variable,
					src: Module[Control.variable].src
				};

			} else if(Control instanceof self.ImageControl) {

				preset.moduleData[key].values[Control.variable] = {
					type: 'ImageControl',
					variable: Control.variable,
					src: Module[Control.variable].src
				};

			} else if(Control instanceof self.SelectControl) {
				preset.moduleData[key].values[Control.variable] = Control.enumValue;
			} else {
				preset.moduleData[key].values[Control.variable] = Control.value;
			}
		}

		let MIDIAssignmentsObject = [];

		this.MIDIInstance.assignments.forEach((value, key) => {
			MIDIAssignmentsObject.push([key, value]);
		});

		preset.MIDIAssignments = MIDIAssignmentsObject;

		this.layers.forEach(Layer => {

			//TODO: create per-type copy methods, stringify/parse is probably slow. RESEARCH.

			let layerDetails = {
				clearing: 		JSON.parse(JSON.stringify(Layer.clearing)),
				alpha: 			JSON.parse(JSON.stringify(Layer.alpha)),
				enabled: 		JSON.parse(JSON.stringify(Layer.enabled)),
				inherit: 		JSON.parse(JSON.stringify(Layer.inherit)),
				pipeline: 		JSON.parse(JSON.stringify(Layer.pipeline)),
				drawToOutput: 	JSON.parse(JSON.stringify(Layer.drawToOutput)),
				locked: 		JSON.parse(JSON.stringify(Layer.locked)),
				blending: 		JSON.parse(JSON.stringify(Layer.blending)),
				name: 			JSON.parse(JSON.stringify(Layer.name)),
				moduleOrder: 	JSON.parse(JSON.stringify(Layer.moduleOrder))
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
			preset.moduleData[key].version = 			Module.info.version;
			preset.moduleData[key].author = 			Module.info.author;
			preset.moduleData[key].values =				{};

			if('originalName' in Module.info) {
				preset.moduleData[key].clone = true;
			}

			if(!('saveData' in Module.info)) {
				console.warn(
					`generatePreset: Module ${Module.info.name} has no saveData schema, falling back to skimming Controls for data`
				);
			}

			let schema = makeSchema(Module.info.saveData);
			let validate = ajv.compile(schema);

			// Ugh - TODO: figure out a better clone than JSONparse(JSONstringify())
			let copiedModule = JSON.parse(JSON.stringify(Module));
			let validated = validate(copiedModule);
			if(!validated) {
				console.error(
					`generatePreset: Module ${Module.info.name} failed saveData validation, skipping`,
					validate.errors
				);
				return;
			}

			preset.moduleData[key].values = copiedModule;

			// Look for Controls which need to save special datasets (e.g. PaletteControl)
			forIn(Module.info.controls, (k, Control) => {
				extractValues(Control, Module, key);
			});
		});

		return preset;
	};
};