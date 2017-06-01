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

		makeNode(modV, Module, id, isPreset, internalPresetValue) {
			let node = document.createElement('input');
			node.type = 'color';
			node.classList.add('modv-color-control');

			node.addEventListener('input', () => {
				this.value = node.value;
			}, false);

			this.init(id, Module, node, isPreset, internalPresetValue, modV);
			return node;
		}
	};
};