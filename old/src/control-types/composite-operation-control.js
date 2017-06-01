const ControlError = require('./control-error');
const Control = require('./control');
const {forIn} = require('../utils');

module.exports = function(modV) {
	modV.prototype.CompositeOperationControl = class CompositeOperationControl extends Control {

		constructor(settings) {
			let CompositeOperationControlError = new ControlError('CompositeOperationControl');

			// Check for settings Object
			if(!settings) throw new CompositeOperationControlError('CompositeOperationControl had no settings');

			// All checks pass, call super
			super(settings);
		}

		makeNode(modV, Module, id, isPreset, internalPresetValue) {
			let settings = this.settings;

			let CompositeOperations = {
				blendModes: {
					'Normal': 'normal',
					'Multiply': 'multiply',
					'Overlay': 'overlay',
					'Darken': 'darken',
					'Lighten': 'lighten',
					'Color Dodge': 'color-dodge',
					'Color Burn': 'color-burn',
					'Hard Light': 'hard-light',
					'Soft Light': 'soft-light',
					'Difference': 'difference',
					'Exclusion': 'exclusion',
					'Hue': 'hue',
					'Saturation': 'saturation',
					'Color': 'color',
					'Luminosity': 'luminosity'
				},
				compositeModes: {
					'Clear': 'clear',
					'Copy': 'copy',
					'Destination': 'destination',
					'Source Over': 'source-over',
					'Destination Over': 'destination-over',
					'Source In': 'source-in',
					'Destination In': 'destination-in',
					'Source Out': 'source-out',
					'Destination Out': 'destination-out',
					'Source Atop': 'source-atop',
					'Destination Atop': 'destination-atop',
					'Xor': 'xor',
					'Lighter': 'lighter'
				}
			};

			let node = document.createElement('select');
			node.id = id;
			node.multiple = true;
			node.classList.add('composite-operations');
			node.classList.add('modv-composite-operation-control');

			let blendOptionGroupNode = document.createElement('optgroup');
			blendOptionGroupNode.label = 'Blend Modes';
			let compositeOptionGroupNode = document.createElement('optgroup');
			compositeOptionGroupNode.label = 'Composite Modes';

			forIn(CompositeOperations.blendModes, (key, value) => {
				let optionNode = document.createElement('option');
				optionNode.textContent = key;
				optionNode.value = value;

				if(isPreset) {
					if(settings.useInternalValue) {
						if(value === internalPresetValue) {
							optionNode.selected = true;
						}
					}
				}

				blendOptionGroupNode.appendChild(optionNode);
			});

			forIn(CompositeOperations.compositeModes, (key, value) => {
				let optionNode = document.createElement('option');
				optionNode.textContent = key;
				optionNode.value = value;

				if(isPreset) {
					if(settings.useInternalValue) {
						if(value === internalPresetValue) {
							optionNode.selected = true;
						}
					}
				}

				compositeOptionGroupNode.appendChild(optionNode);
			});

			node.appendChild(blendOptionGroupNode);
			node.appendChild(compositeOptionGroupNode);

			node.addEventListener('change', () => {
				this.value = node.options[node.selectedIndex].value;
			}, false);

			this.init(id, Module, node, isPreset, internalPresetValue, modV);
			return node;
		}
	};
};