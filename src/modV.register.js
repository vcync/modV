(function(bModule) {
	'use strict';
	/*jslint browser: true */

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

			// Parse Meyda
			if(Module.info.meyda) {
				Module.info.meyda.forEach(self.addMeydaFeature);
			}

			// Initialise Module
			Module.init();

			// Parse Controls
			// Not necessary any more.
			// New UI will parse controls on layer creation.

			// Add to registry
			// TODO: rename to 'registry'
			// TODO: make registry an object containing Module2D,
			// 		 Module3D and ModuleShader object stores
			self.registeredMods[name] = Module;

			// TODO: remove setModOrder and modOrder
			self.setModOrder(name, Object.size(self.registeredMods));

			// TEST
			self.registeredMods[name].info.disabled = false;
		}

		// Handle ModuleShader
		if(Module instanceof self.ModuleShader) {

			// TODO: rewrite almost all of this registration process.
			// TODO: figure out best way to switch shaders
			//		 gl.useProgram() probably

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

				// Create material, geometry and mesh

				// Calculate width
				var masterWidth = self.canvas.width;
				var masterHeight = self.canvas.height;
				var masterRatio = masterWidth/masterHeight;

				console.log(10 * masterRatio);

				var geometry = new THREE.PlaneBufferGeometry( masterRatio * 10, 10, 32 );

				// Module.material = new THREE.ShaderMaterial({
				// 	uniforms: Module.info.uniforms,
				// 	vertexShader: vert,
				// 	fragmentShader: frag,
				// 	//side: THREE.DoubleSide // Probably not needed
				// });

				Module.material = new THREE.MeshPhongMaterial({
					color: 0x156289,
					emissive: 0x072534,
					side: THREE.DoubleSide,
					shading: THREE.FlatShading,
					map: self.shaderEnv.texture,
				});

				self.shaderEnv.texture.wrapS = self.shaderEnv.texture.wrapT = THREE.ClampToEdgeWrapping;
            	self.shaderEnv.texture.repeat.set(1,1);

				//Module.material = new THREE.MeshBasicMaterial( { map: self.shaderEnv.texture } );

				// Create mesh
				Module.mesh = new THREE.Mesh(geometry, Module.material);

				// Add mesh to scene
				self.shaderEnv.scene.add(Module.mesh);

				// Add to registry
				// TODO: rename to 'registry'
				// TODO: make registry an object containing Module2D,
				// 		 Module3D and ModuleShader object stores
				self.registeredMods[name] = Module;

				// TODO: remove setModOrder and modOrder
				self.setModOrder(name, Object.size(self.registeredMods));

				console.log(Module);

			});

		}
	};

})(module);