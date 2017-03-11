const ControlError = require('./control-error');
const Control = require('./control');

module.exports = function(modV) {
	modV.prototype.SelectControl = class SelectControl extends Control {

		constructor(settings) {
			let SelectControlError = new ControlError('SelectControl');

			// Check for settings Object
			if(!settings) throw new SelectControlError('SelectControl had no settings');
			// Check for enum
			if(!('enum' in settings)) throw new SelectControlError('SelectControl had no enum in settings');

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

			let node = document.createElement('select');
			node.id = id;

			this.init(id, ModuleRef, node, isPreset, internalPresetValue);

			settings.enum.forEach(option => {
				let optionNode = document.createElement('option');
				optionNode.textContent = option.label;
				optionNode.value = option.value;

				if(isPreset) {
					if(option.value === Module[this.variable]) {
						optionNode.selected = true;
						this.value = option.value;
					}
				} else if('default' in option) {
					if(option.default) {
						optionNode.selected = true;
						this.value = option.value;
					}
				}

				node.appendChild(optionNode);
			});

			node.addEventListener('change', () => {
				this.value = node.options[node.selectedIndex].value;
			}, false);

			return node;
		}
	};
};