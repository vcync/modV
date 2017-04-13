const ControlError = require('./control-error');
const Control = require('./control');

module.exports = function(modV) {
	modV.prototype.CheckboxControl = class CheckboxControl extends Control {

		constructor(settings) {
			let CheckboxControlError = new ControlError('CheckboxControl');

			// Check for settings Object
			if(!settings) throw new CheckboxControlError('CheckboxControl had no settings');

			// All checks pass, call super
			super(settings);
		}

		makeNode(modV, Module, id, isPreset, internalPresetValue) {
			let variable = this.variable;
			let settings = this.settings;

			let inputNode = document.createElement('input');
			inputNode.type = 'checkbox';
			inputNode.id = id;
			inputNode.classList.add('modv-checkbox-control');


			inputNode.addEventListener('change', () => {
				this.value = inputNode.checked;
			}, false);

			this.init(id, Module, inputNode, isPreset, internalPresetValue, modV);

			// TODO clear up logic
			if(settings.useInternalValue) {
				if(isPreset) inputNode.checked = internalPresetValue;
				else if('checked' in settings) inputNode.checked = settings.checked;
			} else {
				if('checked' in settings) {
					if(!isPreset) this.value = settings.checked;
					inputNode.checked = settings.checked;

				} else if(Module[variable] !== undefined) {
					inputNode.checked = Module[variable];
				}
			}

			let labelNode = document.createElement('label');
			labelNode.setAttribute('for', id);

			let div = document.createElement('div');
			div.classList.add('customCheckbox');
			div.appendChild(inputNode);
			div.appendChild(labelNode);

			return div;
		}
	};
};