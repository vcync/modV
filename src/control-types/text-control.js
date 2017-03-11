const ControlError = require('./control-error');
const Control = require('./control');

module.exports = function(modV) {
	modV.prototype.TextControl = class TextControl extends Control {

		constructor(settings) {
			let TextControlError = new ControlError('TextControl');

			// Check for settings Object
			if(!settings) throw new TextControlError('TextControl had no settings');

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

			var node = document.createElement('input');
			node.type = 'text';

			node.addEventListener('input', () => {
				this.value = node.value;
			}, false);

			this.init(id, ModuleRef, node, isPreset, internalPresetValue);
			return node;
		}
	};
};