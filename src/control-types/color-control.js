const ControlError = require('./control-error');
const Control = require('./control');

module.exports = function(modV) {
	modV.prototype.ColorControl = class ColorControl extends Control {

		constructor(settings) {
			let ColorControlError = new ControlError('ColorControl');

			// Check for settings Object
			if(!settings) throw new ColorControlError('ColorControl had no settings');

			// All checks pass, call super
			super(settings);
		}

		makeNode(ModuleRef, modV, isPreset, internalPresetValue) {
			let id;
			let Module;
			let variable = this.variable;
			let settings = this.settings;

			if(!settings.useInternalValue) {
				Module = ModuleRef;
				id = Module.info.safeName + '-' + variable;
			} else {
				id = ModuleRef;
			}

			let node = document.createElement('input');
			node.type = 'color';

			node.addEventListener('input', () => {
				this.value = node.value;
			}, false);

			this.init(id, ModuleRef, node, isPreset, internalPresetValue);
			return node;
		}
	};
};