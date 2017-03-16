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

			let setValue = function(valueIn) {
				valueIn = settings.enum[valueIn].value;

				if(settings.varType === 'int') valueIn = parseInt(valueIn);
				else if(settings.varType === 'float') valueIn = parseFloat(valueIn);

				if('prepend' in settings) valueIn = settings.prepend + valueIn;
				if('append' in settings) valueIn += settings.append;

				return valueIn;
			};

			// All checks pass, call super
			super(settings, setValue);
		}

		makeNode(modV, Module, id, isPreset, internalPresetValue) {
			let settings = this.settings;

			let node = document.createElement('select');
			node.id = id;

			this.init(id, Module, node, isPreset, internalPresetValue, modV);

			settings.enum.forEach((option, idx) => {
				let optionNode = document.createElement('option');
				optionNode.textContent = option.label;
				optionNode.value = option.value;

				if(isPreset) {
					if(option.value === Module[this.variable]) {
						optionNode.selected = true;
						this.value = idx;
					}
				} else if('default' in option) {
					if(option.default) {
						optionNode.selected = true;
						this.value = idx;
					}
				}

				node.appendChild(optionNode);
			});

			node.addEventListener('change', () => {
				this.value = node.selectedIndex;
			}, false);

			return node;
		}
	};
};