(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.RangeControl = function(settings) {
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

			this.node.value = value;

			if(settings.varType === 'int') value = parseInt(value);
			else if(settings.varType === 'float') value = parseFloat(value);
			else value = this.value;

			if('append' in settings) value += settings.append;
	
			Module[self.variable] = value;
		};

		//TODO: error stuff
		// RangeControl error handle
		function ControlError(message) {
			// Grab the stack
			this.stack = (new Error()).stack;

			// Parse the stack for some helpful debug info
			var reg = /\((.*?)\)/;    
			var stackInfo = this.stack.split('\n').pop().trim();
			try {
				stackInfo = reg.exec(stackInfo)[0];
			} catch(e) {
				
			}

			// Expose name and message
			this.name = 'modV.RangeControl Error';
			this.message = message + ' ' + stackInfo || 'Error';  
		}
		// Inherit from Error
		ControlError.prototype = Object.create(Error.prototype);
		ControlError.prototype.constructor = ControlError;

		// Check for settings Object
		if(!settings) throw new ControlError('RangeControl had no settings');
		// Check for info Object
		if(!('min' in settings)) throw new ControlError('RangeControl had no "min" in settings');
		// Check for info.name
		if(!('max' in settings)) throw new ControlError('RangeControl had no "max" in settings');
		// Check for info.author
		if(!('varType' in settings)) throw new ControlError('RangeControl had no "varType" in settings');
		

		// Copy settings values to local scope
		for(var key in settings) {
			if(settings.hasOwnProperty(key)) {
				self[key] = settings[key];
			}
		}

		self.makeNode = function(ModuleRef, modV) {
			if(!settings.useInternalValue) {
				Module = ModuleRef;
				id = Module.info.safeName + '-' + self.variable;
			} else {
				id = ModuleRef;
			}
			

			var node = document.createElement('input');
			node.type = 'range';
			if('min' in settings) node.min = settings.min;
			if('max' in settings) node.max = settings.max;
			if('step' in settings) node.step = settings.step;

			if(!settings.useInternalValue) {
				if(Module[self.variable] !== undefined) node.value = Module[self.variable];
				else if('default' in settings) node.value = settings.default;
			} else {
				if('default' in settings) node.value = settings.default;
			}

			rangeRanger(node, {
				alt: {
					use: true,
					useCombo: true,
					modifier: 4,
					priority: 2
				},
				shift: {
					use: true,
					useCombo: true,
					modifier: 8,
					priority: 1
				},
				ctrl: {
					use: false,
					useCombo: false
				},
				meta: {
					use: false,
					useCombo: false
				},
				combo: {
					use: true,
					modifier: 16
				}
			});

			var modKey;

			if((navigator.appVersion.indexOf("Mac") !== -1)) {
				modKey = 'metaKey';
			} else {
				modKey = 'ctrlKey';
			}

			if(!settings.useInternalValue) {
				node.addEventListener('mousedown', function(e) {
					if(e[modKey]) {
						e.preventDefault();
						node.value = 0;
						Module[self.variable] = settings.default || 0;
					}
				});
			}

			node.addEventListener('input', function() {
				var value;

				if(settings.varType === 'int') value = parseInt(this.value);
				else if(settings.varType === 'float') value = parseFloat(this.value);
				else value = this.value;

				if('append' in settings) value += settings.append;

				if(!settings.useInternalValue) Module.updateVariable(self.variable, value, modV);
				else {
					settings.oninput(value);
				}
			}, false);
			
			node.id = id;
			
			this.node = node;

			return node;
		};
	};

})(module);