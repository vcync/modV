(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.CustomControl = function(settings) {
		var self = this;
		var id;
		
		self.getSettings = function() {
			return settings;
		};

		self.getID = function() {
			return id;
		};

		/*//TODO: error stuff
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
		*/

		// Copy settings values to local scope
		for(var key in settings) {
			if(settings.hasOwnProperty(key)) {
				self[key] = settings[key];
			}
		}

		var modV;
		var Module;

		self.setVariable = function(variable, value) {
			Module.updateVariable(variable, value, modV);
		};

		self.makeNode = function(argModule, argModV) {
			modV = argModV;
			Module = argModule;
			id = Module.info.safeName + '-' + Date.now();
			
			var node = settings(Module);
			node.id = id;

			return node;
		};
	};

})();