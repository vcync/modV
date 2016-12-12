/* globals getDocument */
(function() {
	'use strict';
	/*jslint browser: true */
	
	function replaceAll(string, operator, replacement) {
		return string.split(operator).join(replacement);
	}

	var loadJS = function(url, location, Module){
		//url is URL of external file, implementationCode is the code
		//to be called from the file, location is the location to 
		//insert the <script> element

		var loaderPromise = new Promise(resolve => {
			var scriptTag = document.createElement('script');
			scriptTag.onload = function() {
				resolve(Module);
			};
			scriptTag.onreadystatechange = function() {
				resolve(Module);
			};

			scriptTag.src = url;

			location.appendChild(scriptTag);
		});

		return loaderPromise;
	};


	modV.prototype.register = function(Module, instantiated) {

		function finish(Module, type) {
			// Add to Registry
			self.registeredMods[Module.info.name] = Module;

			// List controls/variables for remote
			let controls = [];

			forIn(Module.info.controls, (key, Control) => {
				let type = 'unknown';

				if(Control instanceof self.RangeControl) 	type = 'range';
				if(Control instanceof self.CheckboxControl) type = 'checkbox';
				if(Control instanceof self.SelectControl) 	type = 'select';
				if(Control instanceof self.TextControl) 	type = 'text';
				if(Control instanceof self.ColorControl) 	type = 'color';
				if(Control instanceof self.PaletteControl) 	type = 'palette';
				if(Control instanceof self.ImageControl) 	type = 'image';
				if(Control instanceof self.VideoControl) 	type = 'video';
				if(Control instanceof self.CustomControl) 	type = 'custom';

				controls.push({
					type: type,
					settings: Control.getSettings()
				});
			});

			// Send to remote
			self.remote.update('addRegistered', {
				name: name,
				type: type,
				controls: controls
			});

			// Create Gallery item
			self.createGalleryItem(Module);
		}

		var self = this;
		var originalModule = Module;

		if(originalModule.name in self.moduleStore) {
			throw new STError("Already registered a Module with the name " + originalModule.name + ". Could not register duplicately named module");
		}

		// check if already instantiated for the script loader
		if(!instantiated) {
			self.moduleStore[originalModule.name] = originalModule;
			Module = new Module();
			Module.info.originalModuleName = originalModule.name;
		}
		
		// Shared Module variables
		var name;
		let type = 'unknown';


		// Set meta
		Module.info.alpha = 1;
		Module.info.disabled = true;
		Module.info.solo = false;

		// Get name
		name = Module.info.name;
		Module.info.safeName = replaceAll(name, ' ', '-');

		// Super hacky way of loading scripts
		if('scripts' in Module.info) {
			if(!('loadedScripts' in Module.info)) {
				Module.info.loadedScripts = [];
			}

			if(Module.info.loadedScripts.length !== Module.info.scripts.length) {
				Module.info.scripts.forEach(function(script) {
					loadJS('/modules/' + script, document.body, Module).then(function(Module) {
						Module.info.loadedScripts.push(true);

						if(Module.info.loadedScripts.length === Module.info.scripts.length) {
							self.register(Module, true);
						}

					});
				});
				return;
			}
		}

		// Handle Module2D
		if(Module instanceof self.Module2D) {
			type = 'Module2D';
			console.info('Register: Module2D', Module.info.originalModuleName, '(' + name + ')');

			// Parse Meyda
			if(Module.info.meyda) {
				Module.info.meyda.forEach(self.addMeydaFeature);
			}

			// Initialise Module
			Module.init(self.layers[0].canvas, self.layers[0].context);

			// finish up
			finish(Module, type);
		}

		// Handle ModuleShader
		if(Module instanceof self.ModuleShader) {
			type = 'ModuleShader';
			console.info('Register: ModuleShader', Module.info.originalModuleName, '(' + name + ')');

			Module.info.uniforms.modVcanvas = {
				type: "t",
				value: self.shaderEnv.texture
			};

			// Read shader document
			getDocument(self.baseURL + '/modules/' + Module.shaderFile, function(xhrDocument) {
				
				var vert = xhrDocument.querySelector('script[type="x-shader/x-vertex"]').textContent;
				var frag = xhrDocument.querySelector('script[type="x-shader/x-fragment"]').textContent;

				var gl = self.shaderEnv.gl; // set reference to self.shaderEnv.gl

				console.info('Attempting to compile', Module.info.name);
						
				// Compile shaders and create program
				var vertexShader;
				var fragmentShader;

				vertexShader = gl.createShader(gl.VERTEX_SHADER);
				gl.shaderSource(vertexShader, vert);
				gl.compileShader(vertexShader);

				var compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
				var compilationLog;

				if(!compiled) {
					console.error(Module.info.name + "'s", 'Vertex Shader did not compile.');
					compilationLog = gl.getShaderInfoLog(vertexShader);
					console.info(Module.info.name + "'s", 'Vertex Shader compiler log: ' + compilationLog);
				}
	 
	  			fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
				gl.shaderSource(fragmentShader, frag);
				gl.compileShader(fragmentShader);

				compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);

				if(!compiled) {
					console.error(Module.info.name + "'s", 'Fragment Shader did not compile.');
					compilationLog = gl.getShaderInfoLog(fragmentShader);
					console.info(Module.info.name + "'s", 'Fragment Shader compiler log: ' + compilationLog);
				}

				Module.program = gl.createProgram();
				var program = Module.program;

				gl.attachShader(program, vertexShader);
				gl.attachShader(program, fragmentShader);
				gl.linkProgram(program);	
				gl.useProgram(program);

				Module.programIndex = self.shaderEnv.programs.push(program)-1;

				// finish up
				finish(Module, type);
			});

		}

		// Handle Module3D
		if(Module instanceof self.Module3D) {
			type = 'Module3D';
			console.info('Register: Module3D', Module.info.originalModuleName, '(' + name + ')');

			// Parse Meyda
			if(Module.info.meyda) {
				Module.info.meyda.forEach(self.addMeydaFeature);
			}

			// Initialise Module
			Module.init(self.layers[0].canvas, Module.getScene(), self.THREE.material, self.THREE.texture);

			// finish up
			finish(Module, type);
		}

		// Handle ModuleScript
		if(Module instanceof self.ModuleScript) {
			type = 'ModuleScript';
			console.info('Register: ModuleScript', Module.info.originalModuleName, '(' + name + ')');

			// Parse Meyda
			if(Module.info.meyda) {
				Module.info.meyda.forEach(self.addMeydaFeature);
			}

			// Initialise Module
			Module.init(/*self.layers[0].canvas*/self.previewCanvas, /*self.layers[0].context*/self.previewContext);

			// finish up
			finish(Module, type);
		}
	};

})(module);