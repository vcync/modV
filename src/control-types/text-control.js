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

		makeNode(modV, Module, id, isPreset, internalPresetValue) {
			let node = document.createElement('input');
			node.type = 'text';

			node.addEventListener('input', () => {
				this.value = node.value;
			}, false);

			this.init(id, Module, node, isPreset, internalPresetValue, modV);
			return node;
		}
	};
};