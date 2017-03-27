const Module = require('./module');
const makeProgramInit = require('../shader-env/make-program-promise');

module.exports = function(modV) {
	modV.prototype.ModuleShader = class ModuleShader extends Module {

		constructor(settings) {
			super(settings);

			//if(!('shaderFile' in settings)) throw new this.ModuleError('Module had no path to shader in settings.shaderFile');

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

		_makeProgram(gl, modV) {
			return new Promise((resolve, reject) => {
				const settings = this.settings;
				const makeProgram = makeProgramInit(gl);

				// Read shader documents
				let promises = [];

				if('vertexFile' in settings) {
					promises.push(fetch(modV.baseURL + '/modules/' + settings.vertexFile));
				} else {
					promises.push(modV.shaderEnv.defaultShader.v);
				}

				if('fragmentFile' in settings) {
					promises.push(fetch(modV.baseURL + '/modules/' + settings.fragmentFile));
				} else {
					promises.push(modV.shaderEnv.defaultShader.f);
				}

				Promise.all(promises).then(values => {
						let vs = values[0];
						let fs = values[1];

						let morePromises = [];

						if(typeof vs !== 'string') vs = vs.text();
						if(typeof fs !== 'string') fs = fs.text();


						morePromises.push(vs);
						morePromises.push(fs);

						Promise.all(morePromises).then(values => {
							let vs = values[0];
							let fs = values[1];

							makeProgram(vs, fs).then(program => {
								gl.useProgram(program);
								this.programIndex = modV.shaderEnv.programs.push(program)-1;

								// finish up
								resolve(this, 'shader');
							}).catch(error => {
								console.error('Registration of ModuleShader "' + name + '" unsuccessful.');
								reject(error);
							});
						}).catch(reason => {
							reject(reason);
						});

					}).catch(reason => {
						reject(reason);
					}
				);
			});
		}
	};
};