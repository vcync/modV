const Meyda = require('meyda');

function userMediaSuccess(stream) {

	this.rescanMediaStreamSources();

	// Create video stream
	this.videoStream.src = window.URL.createObjectURL(stream);
	
	// If we have opened a previous AudioContext, destroy it as the number of AudioContexts
	// are limited to 6
	if(this.audioContext) this.audioContext.close();

	// Create new Audio Context
	this.audioContext = new window.AudioContext();
	
	// Create new Audio Analyser
	this.analyserNode = this.audioContext.createAnalyser();
	
	// Create a gain node
	this.gainNode = this.audioContext.createGain();
	
	// Mute the node
	this.gainNode.gain.value = 0;
	
	// Create the audio input stream (audio)
	this.audioStream = this.audioContext.createMediaStreamSource(stream);

	// Connect the audio stream to the analyser (this is a passthru) (audio->(analyser))
	this.audioStream.connect(this.analyserNode);
	
	// Connect the audio stream to the gain node (audio->(analyser)->gain)
	this.audioStream.connect(this.gainNode);
	
	// Connect the gain node to the output (audio->(analyser)->gain->destination)
	this.gainNode.connect(this.audioContext.destination);
	
	// Set up Meyda
	this.meyda = new Meyda.createMeydaAnalyzer({
		audioContext: this.audioContext,
		source: this.audioStream,
		bufferSize: 512,
		windowingFunction: 'rect'
	});
	
	// Tell the rest of the script we're all good.
	this.ready = true;
}

function userMediaError() {
	console.log('Error setting up WebAudio - please make sure you\'ve allowed modV access.');
	alert('Please allow modV access to an audio input or additionally, a video input.');
}

module.exports = function(modV) {
	modV.prototype.setMediaSource = function(audioSourceID, videoSourceID) {
		var constraints = {
			audio: {
				optional: [
					{googNoiseSuppression: false},
					{googEchoCancellation: false},
					{googEchoCancellation2: false},
					{googAutoGainControl: false},
					{googNoiseSuppression2: false},
					{googHighpassFilter: false},
					{googTypingNoiseDetection: false},
					{sourceId: audioSourceID}
				]
			}
		};

		/* If there is a video stream source, add the video permission */
		if(this.mediaStreamSources.video.length > 0) {
			constraints.video = {
				optional: [
					{googNoiseSuppression: false},
					{googEchoCancellation: false},
					{googEchoCancellation2: false},
					{googAutoGainControl: false},
					{googNoiseSuppression2: false},
					{googHighpassFilter: false},
					{googTypingNoiseDetection: false},
					{sourceId: videoSourceID}
				]
			};
		}

		this.options.audioSource = audioSourceID;
		this.options.videoSource = videoSourceID;
		this.saveOptions();

		/* Ask for user media access */
		navigator.getUserMedia(constraints, userMediaSuccess.bind(this), userMediaError);
	};
};