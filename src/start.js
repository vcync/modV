module.exports = function(modV) {
	modV.prototype.start = function() {
		
		if(!this.options.headless) this.startUI();

		this.loadOptions(() => {

			if(!('user' in this.options)) {
				this.options.user = "please set username";
			}

			if(!('user' in this.options)) {
				this.options.user = "please set username";
			}

			// Scan Stream sources and setup User Media
			this.rescanMediaStreamSources((foundSources) => {

				let audioSource;
				let videoSource;

				foundSources.audio.forEach((audioSrc) => {
					if(audioSrc.deviceId === this.options.audioSource) {
						audioSource = audioSrc.deviceId;
					}
				});

				foundSources.video.forEach((videoSrc) => {
					if(videoSrc.deviceId === this.options.videoSource) {
						videoSource = videoSrc.deviceId;
					}
				});

				if(foundSources.video.length > 0) this.setMediaSource(audioSource || foundSources.audio[0].deviceId, videoSource || foundSources.video[0].deviceId);
				else this.setMediaSource(audioSource || foundSources.audio[0].deviceId, undefined);
			});
			
			if(typeof this.canvas !== 'object') {
				console.error('modV: Canvas not set');
				return false;
			}

			this.resize();

			requestAnimationFrame(this.loop.bind(this));
		});
	};
};