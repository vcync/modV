(function(bModule) {
	'use strict';
	/*jslint browser: true */
	
	function replaceAll(string, operator, replacement) {
		return string.split(operator).join(replacement);
	}

	modV.prototype.register = function(Module) {
		var self = this;
		
		// Shared Module variables
		var name;

		// Handle Module2D
		if(Module instanceof self.Module2D) {
			console.info('Register: Module2D');

			// Set meta
			Module.info.alpha = 1;
			Module.info.disabled = true;

			// Get name
			name = Module.info.name;
			Module.info.safeName = replaceAll(name, ' ', '-');

			// Parse Meyda
			if(Module.info.meyda) {
				Module.info.meyda.forEach(self.addMeydaFeature);
			}

			// Initialise Module
			Module.init(self.canvas, self.context);

			// Parse Controls
			// Not necessary any more.
			// New UI will parse controls on layer creation.

			// Add to registry
			// TODO: rename to 'registry'
			// TODO: make registry an object containing Module2D,
			// 		 Module3D and ModuleShader object stores
			self.registeredMods[name] = Module;

			// TODO: remove setModOrder and modOrder
			// self.setModOrder(name, Object.size(self.registeredMods));

			// TEST
			//self.registeredMods[name].info.disabled = false;
			self.createGalleryItem(Module);
		}

		// Handle ModuleShader
		if(Module instanceof self.ModuleShader) {

			console.info('Register: ModuleShader');

			// Set meta
			Module.info.alpha = 1;
			Module.info.disabled = true;

			// Get name
			name = Module.info.name;

			Module.info.uniforms.modVcanvas = {
				type: "t",
				value: self.shaderEnv.texture
			};

			// Create uniforms
			for(var key in Module.info.uniforms) {
				
				// Create local variables

			}

			// Read shader document
			getDocument('/modules/' + Module.shaderFile, function(xhrDocument) {
				
				var vert = xhrDocument.querySelector('script[type="x-shader/x-vertex"]').textContent;
				var frag = xhrDocument.querySelector('script[type="x-shader/x-fragment"]').textContent;

				var gl = self.shaderEnv.gl; // set reference to self.shaderEnv.gl
						
				// Compile shaders and create program
				var vertexShader;
				var fragmentShader;

				vertexShader = gl.createShader(gl.VERTEX_SHADER);
				gl.shaderSource(vertexShader, vert);
				gl.compileShader(vertexShader);

				var compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
				console.log('Vertex Shader compiled successfully: ' + compiled);
				var compilationLog = gl.getShaderInfoLog(vertexShader);
				console.log('Vertex Shader compiler log: ' + compilationLog);
	 
	  			fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
				gl.shaderSource(fragmentShader, frag);
				gl.compileShader(fragmentShader);

				compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
				console.log('Fragment Shader compiled successfully: ' + compiled);
				compilationLog = gl.getShaderInfoLog(fragmentShader);
				console.log('Fragment Shader compiler log: ' + compilationLog);

				Module.program = gl.createProgram();
				var program = Module.program;

				gl.attachShader(program, vertexShader);
				gl.attachShader(program, fragmentShader);
				gl.linkProgram(program);	
				gl.useProgram(program);

				Module.programIndex = self.shaderEnv.programs.push(program)-1;

				// TEST IMPLEMENT
				self.shaderEnv.resize(Module.programIndex);

				// Add to registry
				// TODO: rename to 'registry'
				// TODO: make registry an object containing Module2D,
				// 		 Module3D and ModuleShader object stores
				self.registeredMods[name] = Module;

				// TODO: remove setModOrder and modOrder
				//self.setModOrder(name, Object.size(self.registeredMods));

				// TEST
				//self.registeredMods[name].info.disabled = false;
			});

		}
	};

})(module);