const ControlError = require('./control-error');
const Control = require('./control');

module.exports = function(modV) {
	modV.prototype.ButtonControl = class ButtonControl extends Control {

		constructor(settings) {
			let ButtonControlError = new ControlError('ButtonControl');

			// Check for settings Object
			if(!settings) throw new ButtonControlError('ButtonControl had no settings');

			// All checks pass, call super
			super(settings);
		}

		makeNode(modV, Module, id, isPreset, internalPresetValue) {
			let settings = this.settings;

			let node = document.createElement('input');
			node.type = 'button';
			node.classList.add('modv-button-control');

			node.addEventListener('mousedown', (e) => {
				if(typeof settings.onpress === 'function') settings.onpress(e);
			}, false);

			node.addEventListener('mouseup', (e) => {
				if(typeof settings.onrelease === 'function') settings.onrelease(e);
			}, false);

			this.init(id, Module, node, isPreset, internalPresetValue, modV);
			return node;
		}

		push() {
			if(typeof this.settings.onpress === 'function') this.settings.onpress();
		}

		release() {
			if(typeof this.settings.onrelease === 'function') this.settings.onrelease();
		}
	};
};