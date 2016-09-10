(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.ModuleError = function(message) {
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
		this.message = message + ' ' + (stackInfo || '');
	};

	modV.prototype.Module2D = class Module2D {

		constructor(settings) {
		this.settings = settings;

		// Set up error reporting
		var ModuleError = modV.ModuleError;
		ModuleError.prototype = Object.create(Error.prototype);
		ModuleError.prototype.constructor = ModuleError;

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

		// Create control Array
		if(!settings.info.controls) settings.info.controls = [];

		// Settings passed, expose this.info
		this.info = settings.info;

		// Expose preview option
		if('previewWithOutput' in settings) {
			this.previewWithOutput = settings.previewWithOutput;
		} else {
			this.previewWithOutput = false;
		}

	}

	add(item) {
		if(item instanceof Array) {
			item.forEach(thing => {
				this.add(thing);
			});
		} else {
			this.settings.info.controls.push(item);
		}
	}
};

})(module);