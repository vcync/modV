(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.RangeControl = function(settings) {
		var self = this;
		var id;
		
		self.getSettings = function() {
			return settings;
		};

		self.getID = function() {
			return id;
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

		self.makeNode = function(ModuleRef) {
			id = ModuleRef.safeName + '-' + self.variable;
			

			var node = document.createElement('input');
			node.type = 'range';
			if('min' in settings) node.min = settings.min;
			if('max' in settings) node.max = settings.max;
			if('step' in settings) node.step = settings.step;
			if('default' in settings) node.value = settings.default;

			node.addEventListener('input', function() {
				var value;

				if(settings.varType === 'int') value = parseInt(this.value);
				else if(settings.varType === 'float') value = parseFloat(this.value);
				else value = this.value;

				if('append' in settings) value += settings.append;

				ModuleRef.controlVariables[self.variable].value = value;
			}, false);
			
			node.id = id;

			return node;
		};
	};

})(module);