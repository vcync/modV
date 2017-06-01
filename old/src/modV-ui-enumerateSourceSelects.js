module.exports = function(modV) {

	modV.prototype.enumerateSourceSelects = function() {
		var audioSelectNode = document.querySelector('#audioSourceGlobal');
		var videoSelectNode = document.querySelector('#videoSourceGlobal');

		if(!audioSelectNode || !videoSelectNode) return;

		audioSelectNode.innerHTML = '';
		videoSelectNode.innerHTML = '';

		// Set up media sources
		this.mediaStreamSources.audio.forEach((audioSource) => {
			var optionNode = document.createElement('option');
			optionNode.value = audioSource.deviceId;
			optionNode.textContent = audioSource.label;

			if(audioSource.deviceId === this.options.audioSource) {
				optionNode.selected = true;
			}
			audioSelectNode.appendChild(optionNode);
		});

		this.mediaStreamSources.video.forEach((videoSource) => {
			var optionNode = document.createElement('option');
			optionNode.value = videoSource.deviceId;
			optionNode.textContent = videoSource.label;
			
			if(videoSource.deviceId === this.options.videoSource) {
				optionNode.selected = true;
			}
			videoSelectNode.appendChild(optionNode);
		});
	};
};