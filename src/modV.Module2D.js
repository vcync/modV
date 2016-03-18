(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.Module2D = function(settings) {
		var self = this;
		
		// Module error handle
		function ModuleError(message) {
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
			this.name = 'modV.Module Error';
			this.message = message + ' ' + stackInfo || 'Error';  
		}
		// Inherit from Error
		ModuleError.prototype = Object.create(Error.prototype);
		ModuleError.prototype.constructor = ModuleError;

		self.getSettings = function() {
			return settings;
		};

		function add(thing) {
			if(thing instanceof Array) {
				for(var i=0; i < thing.length; i++) {
					add(thing[i]);
				}
			} else {
				if(!settings.info.controls) settings.info.controls = [];
				settings.info.controls.push(thing);
			}

		}

		self.add = function(thing) {

			add(thing);

		};

		// Check for settings Object
		if(!settings) throw new ModuleError('Module had no settings');
		// Check for info Object
		if(!('info' in settings)) throw new ModuleError('Module had no info in settings');
		// Check for info.name
		if(!('name' in settings.info)) throw new ModuleError('Module had no name in settings.info');
		// Check for info.author
		if(!('author' in settings.info)) throw new ModuleError('Module had no author in settings.info');
		// Check for info.version
		if(!('version' in settings.info)) throw new ModuleError('Module had no version in settings.info');

		// Settings passed, expose self.info
		self.info = settings.info;

		// Expose self.draw
		if('draw' in settings) {
			self.draw = settings.draw;
		}

		// Expose self.init
		if('init' in settings) {
			self.init = settings.init;
		}

		// Expose self.resize
		if('resize' in settings) {
			self.resize = settings.resize;
		}

		// Expose preview option
		if('previewWithOutput' in settings) {
			self.previewWithOutput = settings.previewWithOutput;
		} else {
			self.previewWithOutput = false;
		}
	};

})(module);