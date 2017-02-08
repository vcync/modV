module.exports = function(modV) {

	modV.prototype.drawFrame = function(meydaOutput, delta) {
		var self = this;

		if(!self.ready) return;

		for(var layerIndex=0; layerIndex < self.layers.length; layerIndex++) {

			var _gl = self.shaderEnv.gl;

			var layer = self.layers[layerIndex];
			var canvas = layer.canvas;
			var context = layer.context;
			var clearing = layer.clearing;
			var alpha = layer.alpha;
			var enabled = layer.enabled;
			var inherit = layer.inherit;

			var bufferCan = this.bufferCanvas;
			var bufferCtx = this.bufferContext;

			var pipeline = layer.pipeline;
			if(pipeline) {
				bufferCtx.clearRect(0,0,canvas.width,canvas.height);
			}

			if(clearing) {
				context.clearRect(0, 0, canvas.width, canvas.height);
			}

			if(inherit) {
				var lastCanvas;
				if(layerIndex-1 > -1) {
					lastCanvas = self.layers[layerIndex-1].canvas;
				} else {
					lastCanvas = self.outputCanvas;
				}

				context.drawImage(lastCanvas, 0, 0, lastCanvas.width, lastCanvas.height);

				if(pipeline) bufferCtx.drawImage(lastCanvas, 0, 0, lastCanvas.width, lastCanvas.height);
			}

			if(!enabled || alpha === 0) continue;

			for(var i=0; i < layer.moduleOrder.length; i++) {

				var Module = layer.modules[layer.moduleOrder[i]];

				if(Module.info.disabled || Module.info.alpha === 0) continue;

				context.save();
				context.globalAlpha = Module.info.alpha || 1;

				// for inheritance
				if(pipeline && i !== 0) canvas = bufferCan;
				else if(pipeline) canvas = layer.canvas;

				if(Module instanceof self.ModuleScript) {

					// Update GL texture

					// Switch program to default passthrough
					if(self.shaderEnv.activeProgram !== 1) {
						self.shaderEnv.activeProgram = 1;
						_gl.useProgram(self.shaderEnv.programs[1]);
					}

					context.globalCompositeOperation = 'copy';

					// Copy Main Canvas to Shader texture
					self.shaderEnv.texture = _gl.texImage2D(
						_gl.TEXTURE_2D,
						0,
						_gl.RGBA,
						_gl.RGBA,
						_gl.UNSIGNED_BYTE,
						canvas
					);

					context.globalCompositeOperation = 'normal';

					self.shaderEnv.render(delta, canvas);

					if(pipeline) {
						// copy buffer to layer canvas, clear first
						context.clearRect(0,0,canvas.width,canvas.height);
						context.drawImage(
							bufferCan,
							0,
							0,
							canvas.width,
							canvas.height
						);

						// draw 2d operations
						Module.loop(/*layer.canvas*/self.previewCanvas, /*context*/self.previewContext, self.video, meydaOutput, self.meyda, delta, self.bpm, self.kick, _gl);

						//copy layer back to buffer, clear first
						bufferCtx.clearRect(0,0,canvas.width,canvas.height);
						bufferCtx.drawImage(
							layer.canvas,
							0,
							0,
							canvas.width,
							canvas.height
						);

					} else {

						Module.loop(/*canvas*/self.previewCanvas, /*context*/self.previewContext, self.video, meydaOutput, self.meyda, delta, self.bpm, self.kick, _gl);

					}
				}

				if(Module instanceof self.ModuleShader) {

					// Switch program
					if(Module.programIndex !== self.shaderEnv.activeProgram) {
						self.shaderEnv.activeProgram = Module.programIndex;

						_gl.useProgram(self.shaderEnv.programs[Module.programIndex]);
					}

					context.globalCompositeOperation = 'copy';

					// Copy Main Canvas to Shader texture
					self.shaderEnv.texture = _gl.texImage2D(
						_gl.TEXTURE_2D,
						0,
						_gl.RGBA,
						_gl.RGBA,
						_gl.UNSIGNED_BYTE,
						canvas
					);

					context.globalCompositeOperation = 'normal';

					// Set Uniforms
					if('uniforms' in Module.info) {
						forIn(Module.info.uniforms, (uniformKey, uniform) => {

							var uniLoc = _gl.getUniformLocation(self.shaderEnv.programs[self.shaderEnv.activeProgram], uniformKey);
							var value;

							switch(uniform.type) {
								case 'f':
									value = parseFloat(Module[uniformKey]);
									_gl.uniform1f(uniLoc, value);
									break;

								case 'i':
									value = parseInt(Module[uniformKey]);
									_gl.uniform1i(uniLoc, value);
									break;

								case 'b':
									value = Module[uniformKey];
									if(value) value = 1;
									else value = 0;
									
									_gl.uniform1i(uniLoc, value);
									break;

							}
						});
					}

					// Set Meyda Uniforms
					// TODO: support all meyda feature types
					if('meyda' in Module.info) {
						if(Module.info.meyda.length > 0) {
							Module.info.meyda.forEach((feature) => {
								let uniLoc = _gl.getUniformLocation(self.shaderEnv.programs[self.shaderEnv.activeProgram], feature);

								let value = parseFloat(meydaOutput[feature]);
								console.log(feature, value);
								_gl.uniform1f(uniLoc, value);
							});

						}
					}

					// Render
					self.shaderEnv.render(delta, canvas);

					if(Module.info.blend !== 'normal') {
						context.globalCompositeOperation = Module.info.blend;
					}

					// Copy Shader Canvas to Main Canvas
					if(pipeline) {
						bufferCtx.clearRect(0,0,canvas.width,canvas.height);
						bufferCtx.drawImage(
							self.shaderEnv.canvas,
							0,
							0,
							canvas.width,
							canvas.height
						);

					} else {
						context.drawImage(
							self.shaderEnv.canvas,
							0,
							0,
							canvas.width,
							canvas.height
						);
					}

				} else if(Module instanceof self.Module2D) {

					if(Module.info.blend !== 'normal') {
						context.globalCompositeOperation = Module.info.blend;
					}

					if(pipeline) {

						// copy buffer to layer canvas, clear first
						context.clearRect(0,0,canvas.width,canvas.height);
						context.drawImage(
							bufferCan,
							0,
							0,
							canvas.width,
							canvas.height
						);

						// draw 2d operations
						Module.draw(layer.canvas, context, self.video, meydaOutput, self.meyda, delta, self.bpm, self.kick);

						//copy layer back to buffer, clear first
						bufferCtx.clearRect(0,0,canvas.width,canvas.height);
						bufferCtx.drawImage(
							layer.canvas,
							0,
							0,
							canvas.width,
							canvas.height
						);

					} else {

						Module.draw(canvas, context, self.video, meydaOutput, self.meyda, delta, self.bpm, self.kick);

					}
					
				} else if(Module instanceof self.Module3D) {
					let texture = self.threeEnv.texture;

					// copy current canvas to our textureCanvas, clear first
					self.threeEnv.textureCanvasContext.clearRect(0, 0, canvas.width, canvas.height);

					self.threeEnv.textureCanvasContext.drawImage(
						canvas,
						0,
						0,
						canvas.width,
						canvas.height
					);
					
					//self.threeEnv.material.map = self.threeEnv.texture;
					self.threeEnv.material.map.needsUpdate = true;

					Module.draw(Module.getScene(), Module.getCamera(), self.threeEnv.material, texture, meydaOutput);
					self.threeEnv.renderer.render(Module.getScene(), Module.getCamera());

					if(Module.info.blend !== 'normal') {
						context.globalCompositeOperation = Module.info.blend;
					}

					if(pipeline) {
						bufferCtx.clearRect(0,0,canvas.width,canvas.height);
						bufferCtx.drawImage(
							self.threeEnv.canvas,
							0,
							0,
							canvas.width,
							canvas.height
						);

					} else {
						context.drawImage(
							self.threeEnv.canvas,
							0,
							0,
							canvas.width,
							canvas.height
						);
					}
				}

				context.restore();
				self.threeEnv.texture.needsUpdate = true;
			}

			if(pipeline) {
				context.clearRect(0,0,canvas.width,canvas.height);
				context.drawImage(
					bufferCan,
					0,
					0,
					canvas.width,
					canvas.height
				);
			}
		}

		self.mux();

		self.previewContext.clearRect(0, 0, self.previewCanvas.width, self.previewCanvas.height);
		self.previewContext.drawImage(
			self.outputCanvas,
			self.previewCanvasImageValues.x,
			self.previewCanvasImageValues.y,
			self.previewCanvasImageValues.width,
			self.previewCanvasImageValues.height
		);
	};
};