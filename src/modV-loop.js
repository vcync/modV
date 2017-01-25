module.exports = function(modV) {
	modV.prototype.loop = function(timestamp) {
		var self = this;
		requestAnimationFrame(self.loop.bind(self));

		if(!self.meydaSupport) self.myFeatures = [];
		
		if(self.ready) {
			
			if(self.meydaSupport && self.reallyReady) {
				if(self.meydaFeatures.length > 0) self.myFeatures = self.meyda.get(self.meydaFeatures);
				
				self.beatDetektorMed.process((timestamp / 1000.0), self.myFeatures.complexSpectrum.real);
				if(self.useDetectedBPM) {
					self.updateBPM(self.beatDetektorMed.win_bpm_int_lo);
				}

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
			// TODO: clear this up
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

		self.LFOs.forEach(function(LFO) {
			LFO.update();
		});

		self.drawFrame(self.myFeatures, timestamp);
	};
};