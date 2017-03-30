const Module = require('./module');
const makeProgramInit = require('../shader-env/make-program-promise');
const twgl = require('twgl.js');

module.exports = function(modV) {
	modV.prototype.ModuleShader = class ModuleShader extends Module {

		constructor(settings) {
			super(settings);

			//if(!('shaderFile' in settings)) throw new this.ModuleError('Module had no path to shader in settings.shaderFile');
			this.programIndex = -1;
			this.uniformValues = new Map();
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

							if(fs.search('gl_FragColor') < 0) {
								fs = modV.shaderEnv.defaultShader.fWrap.replace(
									/(\%MAIN_IMAGE_INJECT\%)/,
									fs
								);

								vs = modV.shaderEnv.defaultShader.v300;
							}

							makeProgram(vs, fs).then(program => {
								gl.useProgram(program);
								this.programIndex = modV.shaderEnv.programs.push(program)-1;

								this.programInfo = twgl.createProgramInfoFromProgram(gl, program);

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

		_makeProgramInfoFromIndex(modV) {
			let program = modV.shaderEnv.programs[this.programIndex];
			let gl = modV.shaderEnv.gl;
			this.programInfo = twgl.createProgramInfoFromProgram(gl, program);
		}

		_setupUniforms(gl) {
			const settings = this.settings;
			let programInfo = this.programInfo;
			let twGLUniforms = programInfo.uniformSetters;

			forIn(settings.info.uniforms, (uniformKey, uniform) => {
				if(uniformKey in twGLUniforms) {
					let uniformSetter = twGLUniforms[uniformKey];
					Object.defineProperty(this, uniformKey, {
						set: (value) => {
							this.uniformValues.set(uniformKey, value);
						},
						get: () => {
							this.uniformValues.get(uniformKey);
						}
					});

					gl.useProgram(this.programInfo.program);
					uniformSetter(uniform.value);
					this.uniformValues.set(uniformKey, uniform.value);
				}
			});
		}
	};
};






















