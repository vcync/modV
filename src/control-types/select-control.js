module.exports = function(modV) {
	modV.prototype.SelectControl = function(settings) {
		var self = this;
		var id;
		var Module;
		
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

		self.makeNode = function(ModuleRef, modV, isPreset) {
			Module = ModuleRef;
			id = Module.info.safeName + '-' + self.variable;

			var inputNode = document.createElement('select');
			inputNode.id = id;
			
			if('enum' in settings) {
				settings.enum.forEach(option => {
					var optionNode = document.createElement('option');
					optionNode.textContent = option.label;
					optionNode.value = option.value;
					
					if(isPreset) {
						if(option.value === Module[self.variable]) {
							optionNode.selected = true;
							Module.updateVariable(self.variable, option.value, modV);
						}
					} else if('default' in option) {
						if(option.default) {
							optionNode.selected = true;
							Module.updateVariable(self.variable, option.value, modV);
						}
					}

					inputNode.appendChild(optionNode);
				});
			}

			inputNode.addEventListener('change', function() {
				Module.updateVariable(self.variable, inputNode.options[inputNode.selectedIndex].value, modV);
			}, false);

			this.node = inputNode;

			return inputNode;
		};
	};

};