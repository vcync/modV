(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.CheckboxControl = function(settings) {
		let self = this;
		let Module;
		let id;
		
		self.getSettings = function() {
			return settings;
		};

		self.getID = function() {
			return id;
		};

		self.writeValue = function(value) {
			this.node.checked = value;
			Module[self.variable] = value;
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
		for(let key in settings) {
			if(settings.hasOwnProperty(key)) {
				self[key] = settings[key];
			}
		}

		self.makeNode = function(ModuleRef, modV, isPreset) {
			if(!settings.useInternalValue) {
				Module = ModuleRef;
				id = Module.info.safeName + '-' + self.variable;
			} else {
				id = ModuleRef;
			}

			let inputNode = document.createElement('input');
			inputNode.type = 'checkbox';
			inputNode.id = id;
			if('checked' in settings) inputNode.checked = settings.checked;
			else inputNode.checked = false;

			inputNode.addEventListener('change', function() {
				if(!settings.useInternalValue) Module.updateVariable(self.variable, this.checked, modV);
				else {
					settings.oninput(this.checked);
				}
			}, false);

			if(isPreset) {
				inputNode.checked = Module[self.variable];
			}

			let labelNode = document.createElement('label');
			labelNode.setAttribute('for', id);

			let div = document.createElement('div');
			div.classList.add('customCheckbox');
			div.appendChild(inputNode);
			div.appendChild(labelNode);

			this.node = inputNode;

			return div;
		};
	};

})();