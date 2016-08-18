(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.drawFrame = function(meydaOutput, delta) {
		var self = this;
		

		if(!self.ready) return;

		self.soloCtx.clearRect(0, 0, self.soloCanvas.width, self.soloCanvas.height);
		self.soloCtx.drawImage(
			self.canvas,
			0,
			0,
			self.canvas.width,
			self.canvas.height
		);
		
		if(self.clearing) {
			self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
			if(self.options.previewWindow) self.previewCtx.clearRect(0, 0, self.previewCanvas.width, self.previewCanvas.height);
		}

		var firstSolo = true;

		for(var i=0; i < self.modOrder.length; i++) {
			var Module = self.registeredMods[self.modOrder[i]];

			if(Module.info.disabled || Module.info.alpha === 0) continue;


			self.context.save();
			self.context.globalAlpha = Module.info.alpha;

			self.soloCtx.save();
			if(Module.info.solo) self.soloCtx.globalAlpha = Module.info.alpha;

			if(Module.info.blend !== 'normal') self.context.globalCompositeOperation = Module.info.blend;

			if(Module instanceof self.ModuleShader) {
				var _gl = self.shaderEnv.gl;

				// Switch program
				if(Module.programIndex !== self.shaderEnv.activeProgram) {
					self.shaderEnv.activeProgram = Module.programIndex;

					_gl.useProgram(self.shaderEnv.programs[Module.programIndex]);
				}

				if(Module.info.solo) {

					if(firstSolo) {

						// Copy Main Canvas to Shader Canvas 
						self.shaderEnv.texture = _gl.texImage2D(
							_gl.TEXTURE_2D,
							0,
							_gl.RGBA,
							_gl.RGBA,
							_gl.UNSIGNED_BYTE,
							self.canvas
						);

						firstSolo = false;
					} else {
						// Copy Solo Canvas to Shader Canvas 
						self.shaderEnv.texture = _gl.texImage2D(
							_gl.TEXTURE_2D,
							0,
							_gl.RGBA,
							_gl.RGBA,
							_gl.UNSIGNED_BYTE,
							self.soloCanvas
						);
					}

				} else {

					// Copy Main Canvas to Shader Canvas 
					self.shaderEnv.texture = _gl.texImage2D(
						_gl.TEXTURE_2D,
						0,
						_gl.RGBA,
						_gl.RGBA,
						_gl.UNSIGNED_BYTE,
						self.canvas
					);

				}

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

				// Render
				self.shaderEnv.render(delta, self.canvas);

				if(Module.info.solo) {

					// Copy Shader Canvas to Solo Canvas
					self.soloCtx.drawImage(
						self.shaderEnv.canvas,
						0,
						0,
						self.soloCanvas.width,
						self.soloCanvas.height
					);

				} else {

					// Copy Shader Canvas to Main Canvas
					self.context.drawImage(
						self.shaderEnv.canvas,
						0,
						0,
						self.canvas.width,
						self.canvas.height
					);

				}

			} else if(Module instanceof self.Module2D) {

				if(Module.info.solo) {
					if(firstSolo) {
						Module.draw(self.canvas, self.soloCtx, self.video, meydaOutput, self.meyda, delta, self.bpm, self.kick);
						firstSolo = false;
					} else {
						Module.draw(self.soloCanvas, self.soloCtx, self.video, meydaOutput, self.meyda, delta, self.bpm, self.kick);
					}
				} else {
					Module.draw(self.canvas, self.context, self.video, meydaOutput, self.meyda, delta, self.bpm, self.kick);
				}
				
			} else if(Module instanceof self.Module3D) {
				let texture = self.THREE.texture;

				if(Module.info.solo) {
					if(!firstSolo) {
						texture = self.THREE.soloTexture;
						self.THREE.material.map = texture;
						self.THREE.material.map.needsUpdate = true;
					} else {
						self.THREE.material.map = texture;
						self.THREE.material.map.needsUpdate = true;
						firstSolo = false;
					}
				}

				Module.draw(Module.getScene(), Module.getCamera(), self.THREE.material, texture, meydaOutput);
				self.THREE.renderer.render(Module.getScene(), Module.getCamera());

				if(Module.info.solo) {
					self.soloCtx.drawImage(
						self.THREE.canvas,
						0,
						0,
						self.soloCanvas.width,
						self.soloCanvas.height
					);
				} else {
					self.context.drawImage(
						self.THREE.canvas,
						0,
						0,
						self.canvas.width,
						self.canvas.height
					);
				}
			}

			self.context.restore();
			self.soloCtx.restore();
			self.THREE.texture.needsUpdate = true;
			self.THREE.soloTexture.needsUpdate = true;
			
		}
		if(self.options.previewWindow) self.previewCtx.drawImage(self.canvas, 0, 0, self.previewCanvas.width, self.previewCanvas.height);
	};

	modV.prototype.loop = function(timestamp) {
		var self = this;
		requestAnimationFrame(self.loop.bind(self)); //TODO: find out why we have to use bind here

		if(!self.meydaSupport) self.myFeatures = [];
		
		if(self.ready) {
			
			if(self.meydaSupport && self.reallyReady) {
				if(self.meydaFeatures.length > 0) self.myFeatures = self.meyda.get(self.meydaFeatures);
				
				self.beatDetektorMed.process((timestamp / 1000.0), self.myFeatures.complexSpectrum.real);
				self.bpm = self.beatDetektorMed.win_bpm_int_lo;

				self.beatDetektorKick.process(self.beatDetektorMed);
			
				if(self.beatDetektorKick.isKick()) self.kick = true;
				else self.kick = false;

				if(self.bpmHold) {
					self.bpm = self.bpmHeldAt;
				} else {
					self.bpmHeldAt = self.bpm;
				}
				
			} else {
				self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
				self.reallyReady = true;
			}

		} else {
			self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
			var text = 'Please allow popups and share your media inputs.';
			var font = self.context.font =  72 + 'px "Helvetica", sans-serif';
			self.context.textAlign = 'left';
			self.context.fillStyle = 'hsl(' + timestamp / 10 + ', 100%, 50%)';
			var w = self.context.measureText(text).width;

			if(!self.options.retina) font = self.context.font =  36 + 'px "Helvetica", sans-serif';
			w = self.context.measureText(text).width;

			self.context.fillText(text, self.canvas.width/2 - w/2, self.canvas.height/2 + 36);

			text = 'Check the docs at http://modv.readme.io/ for more info.';
			font = self.context.font =  42 + 'px "Helvetica", sans-serif';
			self.context.textAlign = 'left';
			self.context.fillStyle = 'hsl(' + timestamp / 10 + ', 100%, 50%)';
			w = self.context.measureText(text).width;

			if(!self.options.retina) font = self.context.font =  20 + 'px "Helvetica", sans-serif';
			w = self.context.measureText(text).width;

			self.context.fillText(text, self.canvas.width/2 - w/2, self.canvas.height/2 + 36 + 72);
		}

		self.palettes.forEach(function(palette) {
			palette.nextStep();
		});

		self.drawFrame(self.myFeatures, timestamp);
	};

})();