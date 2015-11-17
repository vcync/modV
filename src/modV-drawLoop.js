(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.drawFrame = function(meydaOutput, delta) {
		var self = this;
		

		if(!self.ready) return;
		if(self.clearing) {
			self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
			if(self.options.previewWindow) self.previewCtx.clearRect(0, 0, self.previewCanvas.width, self.previewCanvas.height);
		}
		for(var i=0; i < self.modOrder.length; i++) {
			if(typeof self.registeredMods[self.modOrder[i]] === 'object') {

				if(self.registeredMods[self.modOrder[i]].info.disabled || self.registeredMods[self.modOrder[i]].info.alpha === 0) continue;
				self.context.save();
				self.context.globalAlpha = self.registeredMods[self.modOrder[i]].info.alpha;

				if(self.registeredMods[self.modOrder[i]].info.blend !== 'normal') self.context.globalCompositeOperation = self.registeredMods[self.modOrder[i]].info.blend;

				if(!self.registeredMods[self.modOrder[i]].info.threejs) {

					self.registeredMods[self.modOrder[i]].draw(self.canvas, self.context, self.amplitudeArray, self.video, meydaOutput, delta, self.bpm);

				} else {

					self.registeredMods[self.modOrder[i]].draw(self.canvas, self.context, self.amplitudeArray, self.video, meydaOutput, delta, self.bpm);
					self.context.drawImage(self.threejs.canvas, 0, 0);
					self.threejs.renderer.render(self.threejs.scene, self.threejs.camera);
				}
				self.context.restore();
			}
		}
		if(self.options.previewWindow) self.previewCtx.drawImage(self.canvas, 0, 0, self.previewCanvas.width, self.previewCanvas.height);
	};

	modV.prototype.loop = function(timestamp) {
		var self = this;

		requestAnimationFrame(self.loop.bind(self)); //TODO: find out why we have to use bind here

		if(!self.meydaSupport) self.myFeatures = [];
		
		if(self.ready) {
			
			if(self.meydaSupport && self.reallyReady) {
				self.myFeatures = self.meyda.get(self.meydaFeatures);
				self.beatDetektorMed.process((timestamp / 1000.0), self.myFeatures.complexSpectrum.real);
				self.bpm = self.beatDetektorMed.win_bpm_int_lo;

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

})(module);