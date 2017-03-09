const Module = require('./module');

module.exports = function(modV) {
	modV.prototype.ModuleShader = class ModuleShader extends Module {

		constructor(settings) {
			super(settings);

			if(!('shaderFile' in settings)) throw new this.ModuleError('Module had no path to shader in settings.shaderFile');

			// Settings passed, expose shaderFile
			this.shaderFile = settings.shaderFile;

			// Loop through Uniforms, expose uniforms and create local variables
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
	};
};