module.exports = function(modV) {
	modV.prototype.loop = function loop(δ) {
		requestAnimationFrame(this.loop.bind(this));

		let features;

		if(this.ready) {
			if(this.meydaFeatures.length > 0) features = this.meyda.get(this.meydaFeatures);

			if(features) {
				this.activeFeatures = features;

				this.beatDetektor.process((δ / 1000.0), features.complexSpectrum.real);
				if(this.useDetectedBPM) {
					this.updateBPM(this.beatDetektor.win_bpm_int_lo);
				}
			}

			this.beatDetektorKick.process(this.beatDetektor);
			this.kick = this.beatDetektorKick.isKick();

			if(this.bpmHold) {
				this.bpm = this.bpmHeldAt;
			} else {
				this.bpmHeldAt = this.bpm;
			}
		}

		this.LFOs.forEach(function(LFO) {
			LFO.update();
		});

		this.draw(features, δ);
	};
};