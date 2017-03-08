module.exports = function(modV) {

	modV.prototype.draw = function(meydaOutput, delta) {
		if(!this.ready) return;

		const _gl = this.shaderEnv.gl;

		for(let layerIndex=0; layerIndex < this.layers.length; layerIndex++) {

			const layer = this.layers[layerIndex];
			let canvas = layer.canvas;
			const context = layer.context;
			const clearing = layer.clearing;
			const alpha = layer.alpha;
			const enabled = layer.enabled;
			const inherit = layer.inherit;
			const inheritFrom = layer.inheritFrom;

			const bufferCan = this.bufferCanvas;
			const bufferCtx = this.bufferContext;

			const pipeline = layer.pipeline;
			if(pipeline && clearing) {
				bufferCtx.clearRect(0,0,canvas.width,canvas.height);
			}

			if(clearing) {
				context.clearRect(0, 0, canvas.width, canvas.height);
			}

			if(inherit) {
				let lastCanvas;

				if(inheritFrom < 0) {
					if(layerIndex-1 > -1) {
						lastCanvas = this.layers[layerIndex-1].canvas;
					} else {
						lastCanvas = this.outputCanvas;
					}
				} else {
					lastCanvas = this.layers[inheritFrom].canvas;
				}

				context.drawImage(lastCanvas, 0, 0, lastCanvas.width, lastCanvas.height);

				if(pipeline) bufferCtx.drawImage(lastCanvas, 0, 0, lastCanvas.width, lastCanvas.height);
			}

			if(!enabled || alpha === 0) continue;

			for(let i=0; i < layer.moduleOrder.length; i++) {

				const Module = layer.modules[layer.moduleOrder[i]];

				if(Module.info.disabled || Module.info.alpha === 0) continue;

				context.save();
				context.globalAlpha = Module.info.alpha || 1;

				// for inheritance
				if(pipeline && i !== 0) canvas = bufferCan;
				else if(pipeline) canvas = layer.canvas;

				if(Module instanceof this.ModuleScript) {

					// Update GL texture

					// Switch program to default passthrough
					if(this.shaderEnv.activeProgram !== 1) {
						this.shaderEnv.activeProgram = 1;
						_gl.useProgram(this.shaderEnv.programs[1]);
					}

					context.globalCompositeOperation = 'copy';

					// Copy Main Canvas to Shader texture
					this.shaderEnv.texture = _gl.texImage2D(
						_gl.TEXTURE_2D,
						0,
						_gl.RGBA,
						_gl.RGBA,
						_gl.UNSIGNED_BYTE,
						canvas
					);

					context.globalCompositeOperation = 'normal';

					this.shaderEnv.render(delta, canvas);

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
						Module.loop(/*layer.canvas*/this.previewCanvas, /*context*/this.previewContext, this.videoStream, meydaOutput, this.meyda, delta, this.bpm, this.kick, _gl);

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

						Module.loop(/*canvas*/this.previewCanvas, /*context*/this.previewContext, this.videoStream, meydaOutput, this.meyda, delta, this.bpm, this.kick, _gl);

					}
				}

				if(Module instanceof this.ModuleShader) {

					// Switch program
					if(Module.programIndex !== this.shaderEnv.activeProgram) {
						this.shaderEnv.activeProgram = Module.programIndex;

						_gl.useProgram(this.shaderEnv.programs[Module.programIndex]);
					}

					context.globalCompositeOperation = 'copy';

					// Copy Main Canvas to Shader texture
					this.shaderEnv.texture = _gl.texImage2D(
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

							const uniLoc = _gl.getUniformLocation(this.shaderEnv.programs[this.shaderEnv.activeProgram], uniformKey);
							let value;

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
								let uniLoc = _gl.getUniformLocation(this.shaderEnv.programs[this.shaderEnv.activeProgram], feature);

								let value = parseFloat(meydaOutput[feature]);
								_gl.uniform1f(uniLoc, value);
							});

						}
					}

					// Render
					this.shaderEnv.render(delta, canvas);
					context.globalCompositeOperation = Module.info.blend;
					

					// Copy Shader Canvas to Main Canvas
					if(pipeline) {
						bufferCtx.clearRect(0,0,canvas.width,canvas.height);
						bufferCtx.drawImage(
							this.shaderEnv.canvas,
							0,
							0,
							canvas.width,
							canvas.height
						);

					} else {
						context.drawImage(
							this.shaderEnv.canvas,
							0,
							0,
							canvas.width,
							canvas.height
						);
					}

				} else if(Module instanceof this.Module2D) {

					context.globalCompositeOperation = Module.info.blend;

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
						Module.draw(layer.canvas, context, this.videoStream, meydaOutput, this.meyda, delta, this.bpm, this.kick);

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

						Module.draw(canvas, context, this.videoStream, meydaOutput, this.meyda, delta, this.bpm, this.kick);

					}
					
				} else if(Module instanceof this.Module3D) {
					let texture = this.threeEnv.texture;

					// copy current canvas to our textureCanvas, clear first
					this.threeEnv.textureCanvasContext.clearRect(0, 0, canvas.width, canvas.height);

					this.threeEnv.textureCanvasContext.drawImage(
						canvas,
						0,
						0,
						canvas.width,
						canvas.height
					);
					
					//this.threeEnv.material.map = this.threeEnv.texture;
					this.threeEnv.material.map.needsUpdate = true;

					Module.draw(Module.getScene(), Module.getCamera(), this.threeEnv.material, texture, meydaOutput);
					this.threeEnv.renderer.render(Module.getScene(), Module.getCamera());

					context.globalCompositeOperation = Module.info.blend;

					if(pipeline) {
						bufferCtx.clearRect(0,0,canvas.width,canvas.height);
						bufferCtx.drawImage(
							this.threeEnv.canvas,
							0,
							0,
							canvas.width,
							canvas.height
						);

					} else {
						context.drawImage(
							this.threeEnv.canvas,
							0,
							0,
							canvas.width,
							canvas.height
						);
					}
				}

				context.restore();
				this.threeEnv.texture.needsUpdate = true;
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

		this.mux();

		this.previewContext.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
		this.previewContext.drawImage(
			this.outputCanvas,
			this.previewCanvasImageValues.x,
			this.previewCanvasImageValues.y,
			this.previewCanvasImageValues.width,
			this.previewCanvasImageValues.height
		);
	};
};