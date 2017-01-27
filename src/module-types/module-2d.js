const ModuleError = require('./module-error.js');

module.exports = function(modV) {
	modV.prototype.Module2D = class Module2D {

		constructor(settings) {
			// Set up error reporting
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
			if(!settings.info.controls) settings.info.controls = {};

			// Settings passed, expose this.info
			this.info = settings.info;

			// Always start on layer 0
			this.info.layer = 0;

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
				this.info.controls[item.variable] = item;
			}
		}

		getLayer() {
			return this.info.layer;
		}

		setLayer(layer) {
			this.info.layer = layer;
		}

		updateVariable(variable, value, modV) {
			this[variable] = value;

			modV.remote.update('moduleValueChange', {
				variable: variable,
				value: value,
				name: this.info.name
			});
		}
	};
};