const ModuleError = require('./modV.ModuleError.js');

module.exports = function(modV) {
	modV.prototype.ModuleShader = class ModuleShader {

		constructor(settings) {
			this.settings = settings;

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
			// Check for shaderFile
			if(!('shaderFile' in settings)) throw new ModuleError('Module had no path to shader in settings.shaderFile');

			// Create control Array
			if(!settings.info.controls) settings.info.controls = {};

			// Settings passed, expose this.info
			this.info = settings.info;

			// Expose preview option
			if('previewWithOutput' in settings) {
				this.previewWithOutput = settings.previewWithOutput;
			} else {
				this.previewWithOutput = false;
			}

			// Settings passed, expose self.shaderFile
			this.shaderFile = settings.shaderFile;

			// Always start on layer 0
			this.settings.info.layer = 0;

			// Loop through Uniforms, expose self.uniforms and create local variables
			if('uniforms' in settings.info) {

				forIn(settings.info.uniforms, (uniformKey, uniform) => {
					switch(uniform.type) {
						case 'f':
							this[uniformKey] = parseFloat(uniform.value);
							break;

						case 'i':
							this[uniformKey] = parseInt(uniform.value);
							break;

						case 'b':
							this[uniformKey] = uniform.value;
							break;

					}
				});
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
			return this.settings.info.layer;
		}

		setLayer(layer) {
			this.settings.info.layer = layer;
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