module.exports = function(modV) {
	modV.prototype.CompositeOperationControl = function(settings) {
		let self = this;
		let id;
		let Module;
		
		self.getSettings = function() {
			return settings;
		};

		self.getID = function() {
			return id;
		};

		self.writeValue = function(value) {

			let selectValue = this.node.options[value].value;

			this.node.selectedIndex = value;
			Module[self.variable] = selectValue;
		};
		
		//TODO: error stuff
/*		// RangeControl error handle
		function ControlError(message) {
			// Grab the stack
			this.stack = (new Error()).stack;

			// Parse the stack for some helpful debug info
			var reg = /\((.*?)\)/;    
			var stackInfo = this.stack.split('\n').pop().trim();
			stackInfo = reg.exec(stackInfo)[0];

			// Expose name and message
			this.name = 'modV.RangeControl Error';
			this.message = message + ' ' + stackInfo || 'Error';  
		}
		// Inherit from Error
		ModuleError.prototype = Object.create(Error.prototype);
		ModuleError.prototype.constructor = ModuleError;

		// Check for settings Object
		if(!settings) throw new ModuleError('RangeControl had no settings');
		// Check for info Object
		if(!('info' in settings)) throw new ModuleError('RangeControl had no info in settings');
		// Check for info.name
		if(!('name' in settings.info)) throw new ModuleError('RangeControl had no name in settings.info');
		// Check for info.author
		if(!('author' in settings.info)) throw new ModuleError('RangeControl had no author in settings.info');
		// Check for info.version
		if(!('version' in settings.info)) throw new ModuleError('RangeControl had no version in settings.info');*/

		// Copy settings values to local scope
		for(var key in settings) {
			if(settings.hasOwnProperty(key)) {
				self[key] = settings[key];
			}
		}

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

		self.makeNode = function(ModuleRef, modV, isPreset, internalPresetValue) {
			if(!settings.useInternalValue) {
				Module = ModuleRef;
				id = Module.info.safeName + '-' + self.variable;
			} else {
				id = ModuleRef;
			}

			let inputNode = document.createElement('select');
			inputNode.id = id;
			inputNode.multiple = true;
			inputNode.classList.add('composite-operations');
			
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

			inputNode.appendChild(blendOptionGroupNode);
			inputNode.appendChild(compositeOptionGroupNode);

			inputNode.addEventListener('change', function() {
				let value = inputNode.options[inputNode.selectedIndex].value;

				if(!settings.useInternalValue) Module.updateVariable(self.variable, value, modV);
				else {
					settings.oninput(value);
				}
			}, false);

			this.node = inputNode;

			return inputNode;
		};
	};
};