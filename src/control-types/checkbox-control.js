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

			let inputNode = document.createElement('input');
			inputNode.type = 'checkbox';
			inputNode.id = id;
			if('checked' in settings) inputNode.checked = settings.checked;
			else inputNode.checked = false;

			inputNode.addEventListener('change', () => {
				this.value = inputNode.checked;
			}, false);

			if(isPreset) {
				inputNode.checked = Module[variable];
			}

			let labelNode = document.createElement('label');
			labelNode.setAttribute('for', id);

			let div = document.createElement('div');
			div.classList.add('customCheckbox');
			div.appendChild(inputNode);
			div.appendChild(labelNode);

			this.init(id, ModuleRef, inputNode, isPreset, internalPresetValue);
			return div;
		}
	};
};