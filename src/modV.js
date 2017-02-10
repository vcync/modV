const Meyda = require('meyda');
const THREE = require('three');
const shaderInit = require('./shader-env');
const threeInit = require('./three-env');
const MM = require('./media-manager');
require('./fragments/array-contains');
require('script-loader!../libraries/beatdetektor.js');

var modV = function(options) {

	console.log('      modV Copyright  (C)  2017 Sam Wray      '+ "\n" +
				'----------------------------------------------'+ "\n" +
				'      modV is licensed  under GNU GPL V3      '+ "\n" +
				'This program comes with ABSOLUTELY NO WARRANTY'+ "\n" +
				'For details, see http://localhost:3131/LICENSE'+ "\n" +
				'----------------------------------------------');

	var self = this,
		aCtx, // Audio Context
		analyser, // Analyser Node 
		microphone;

	this.version = require('../package.json').version;

	this.saveOptions = require('./option-storage').save;
	this.loadOptions = require('./option-storage').load;

	// UI Templates
	this.templates = document.querySelector('link[rel="import"]').import;

	// Load user options
	if(typeof options !== 'undefined') this.options = options;

	this.clearing = true;
	if(!this.options.clearing) this.clearing = false;

	if(!this.options.headless) {
		this.headless = false;
		this.options.headless = false;
	} else {
		this.headless = true;
	}

	if(!this.options.controlDomain) this.options.controlDomain = location.protocol + '//' + location.host;

	this.baseURL = this.options.baseURL || '';

	// Attach message handler for sockets and windows
	this.addMessageHandler();

	this.gainNode = null;

	this.modOrder = [];
	this.moduleStore = {};
	this.registeredMods = {};
	this.activeModules = {};
	this.mediaSelectors = [];
	this.LFOs = [];

	this.outputWindows = [];

	this.video = document.createElement('video');
	this.video.autoplay = true;
	this.video.muted = true;

	// MIDI
	this.MIDIInstance = new this.MIDI();
	this.MIDIInstance.start();

	// Remote
	this.remoteConnect();

	// Layers store
	this.layers = [];
	this.activeLayer = 0;

	this.canvas = this.options.canvas || document.createElement('canvas');
	this.context = this.canvas.getContext('2d');

	this.width = 0;
	this.height = 0;

	this.previewCanvas = document.createElement('canvas');
	this.previewContext = this.previewCanvas.getContext('2d');

	this.bufferCanvas = document.createElement('canvas');
	this.bufferContext = this.bufferCanvas.getContext('2d');

	document.querySelector('.canvas-preview').appendChild(this.previewCanvas);

	this.outputCanvas = document.createElement('canvas');
	this.outputContext = this.outputCanvas.getContext('2d');

	this.previewCanvasImageValues = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};

	this.addLayer(this.canvas, this.context, false);

	this.soloCanvas = undefined;

	this.muted = true;

	this.ready = false;

	// Clipboard store
	this.copiedValue = null;

	// Robots
	this.bots = {};

	// WebSocket
	this.ws = undefined;

	// Set name
	this.setName = function(name) {
		this.options.user = name;
		this.mediaManager.saveOption('user', name);
		this.saveOptions();
	};

	// Window resize
	this.resize = require('./resize');

	this.mainWindowResize = () => {
		// set canvas size
		var boundingRect = this.previewCanvas.getBoundingClientRect();
		this.previewCanvas.width = boundingRect.width;
		this.previewCanvas.height = boundingRect.height;

		this.calculatePreviewCanvasValues();
	};

	this.calculatePreviewCanvasValues = () => {

		// thanks to http://ninolopezweb.com/2016/05/18/how-to-preserve-html5-canvas-aspect-ratio/
		// for great aspect ratio advice!
		var widthToHeight = this.width / this.height;
		var newWidth = this.previewCanvas.width,
			newHeight = this.previewCanvas.height;

		var newWidthToHeight = newWidth / newHeight;
	
		if (newWidthToHeight > widthToHeight) {
			newWidth = Math.round(newHeight * widthToHeight);
		} else {
			newHeight = Math.round(newWidth / widthToHeight);
		}

		this.previewCanvasImageValues.x = Math.round((this.previewCanvas.width/2) - (newWidth/2));
		this.previewCanvasImageValues.y = Math.round((this.previewCanvas.height/2) - (newHeight/2));
		this.previewCanvasImageValues.width = newWidth;
		this.previewCanvasImageValues.height = newHeight;
	};

	window.addEventListener('resize', this.mainWindowResize);

	// Create canvas
	this.setCanvas = function(el) {
		if(el.nodeName !== 'CANVAS') {
			console.error('modV: setCanvas was not supplied with a CANVAS element.');
			return false;
		}
		this.canvas = el;
		this.context = el.getContext('2d');

		return true;
	};

	// Create Windows
	this.createWindows();

	// Collection of palette controls
	this.palettes = [];
	this.presets = {};
	this.profiles = {};

	this.mediaManager = new MM(this);

	this.meydaFeatures = ['complexSpectrum'];

	this.addMeydaFeature = feature => {
		if(!Array.contains(feature, this.meydaFeatures)) {
			this.meydaFeatures.push(feature);
			return true;
		} else return false;
	};

	this.bpm = 0;
	this.bpmHold = false;
	this.bpmHeldAt = 120;
	this.useDetectedBPM = true;

	// Set up BeatDetektor
	this.beatDetektor = new BeatDetektor(85,169);
	this.beatDetektorKick = new BeatDetektor.modules.vis.BassKick();
	this.kick = false;
	
	// Set up THREE
	this.threeEnv = threeInit();

	// Shader handling
	this.shaderEnv = shaderInit(this);
	this.resize();

	this.start = () => {

		// Load Options
		this.loadOptions(() => {

			console.log(this.options);

			if(!('user' in this.options)) {
				this.options.user = "please set username";
			}

			// Scan Stream sources and setup User Media
			scanMediaStreamSources((foundSources) => {

				var audioSource;
				var videoSource;

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
				if(!this.headless) this.startUI();
			});
			

			
			if(typeof this.canvas !== 'object') {
				console.error('modV: Canvas not set');
				return false;
			}

			requestAnimationFrame(this.loop.bind(this));
		});
	};

	/* Usermedia access */

	// Store all available Media inputs
	this.mediaStreamSources = {
		video: [],
		audio: []
	};

	function scanMediaStreamSources(callback) {
		navigator.mediaDevices.enumerateDevices().then((devices) => {
			self.mediaStreamSources.video = [];
			self.mediaStreamSources.audio = [];

			devices.forEach((device) => {
				
				if(device.kind === 'audioinput') {
					self.mediaStreamSources.audio.push(device);
				} else if(device.kind === 'videoinput') {
					self.mediaStreamSources.video.push(device);
				}

			});

			self.enumerateSourceSelects();

			return self.mediaStreamSources;
		}).then(callback);
	}

	// Create function to use later on
	this.rescanMediaStreamSources = (callback) => {
		scanMediaStreamSources(callback);
	};

	this.setMediaSource = function(audioSourceID, videoSourceID) {
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

	function userMediaSuccess(stream) {

		this.rescanMediaStreamSources();

		// Create video stream
		this.video.src = window.URL.createObjectURL(stream);
		
		// If we have opened a previous AudioContext, destroy it as the number of AudioContexts
		// are limited to 6
		if(aCtx) aCtx.close();

		// Create new Audio Context
		aCtx = new window.AudioContext();
		
		// Create new Audio Analyser
		analyser = aCtx.createAnalyser();
		
		// Create a gain node
		this.gainNode = aCtx.createGain();
		
		// Mute the node
		this.gainNode.gain.value = 0;
		
		// Create the audio input stream (audio)
		microphone = aCtx.createMediaStreamSource(stream);

		// Connect the audio stream to the analyser (this is a passthru) (audio->(analyser))
		microphone.connect(analyser);
		
		// Connect the audio stream to the gain node (audio->(analyser)->gain)
		microphone.connect(this.gainNode);
		
		// Connect the gain node to the output (audio->(analyser)->gain->destination)
		this.gainNode.connect(aCtx.destination);
		
		// Set up Meyda
		this.meyda = new Meyda.createMeydaAnalyzer({
			audioContext: aCtx,
			source: microphone,
			bufferSize: 512,
			windowingFunction: 'rect'
		});

		
		// Tell the rest of the script we're all good.
		this.ready = true;
	}

	function userMediaError() {
		console.log('Error setting up WebAudio - please make sure you\'ve allowed modV access.');
		alert('Please allow modV access to your webcam and/or microphone.');
	}

};

module.exports = modV;