(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.ModuleShader = function(settings) {
		var self = this;

		// Experimental (better) function clone
		self.clone = function() {
			return jQuery.extend(true, this.constructor(settings), this);
		};

		// Module error handle
		function ModuleError(message) {
			// Grab the stack
			this.stack = (new Error()).stack;

			// Parse the stack for some helpful debug info
			var reg = /\((.*?)\)/;    
			var stackInfo = this.stack.split('\n').pop().trim();
			stackInfo = reg.exec(stackInfo)[0];

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
		// Check for shaderFile
		if(!('shaderFile' in settings)) throw new ModuleError('Module had no path to shader in settings.shaderFile');

		// Settings passed, expose self.info
		self.info = settings.info;

		// Settings passed, expose self.shaderFile
		self.shaderFile = settings.shaderFile;

		// Loop through Uniforms, expose self.uniforms and create local variables
		if('uniforms' in settings.info) {

			for(var uniformKey in settings.info.uniforms) {
				var uniform = settings.info.uniforms[uniformKey];

				switch(uniform.type) {
					case 'f':
						self[uniformKey] = parseFloat(uniform.value);
						break;

					case 'i':
						self[uniformKey] = parseInt(uniform.value);
						break;

				}
			}
		}
	};

})(module);