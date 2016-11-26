/*jslint browser: true */

// map() from Processing
Math.map = function(value, low1, high1, low2, high2) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
};

// from here: http://stackoverflow.com/questions/5223/length-of-a-javascript-object-that-is-associative-array
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

// based on: http://stackoverflow.com/questions/6116474/how-to-find-if-an-array-contains-a-specific-string-in-javascript-jquery
Array.contains = function(needle, arrhaystack) {
	return (arrhaystack.indexOf(needle) > -1);
};

window.replaceAll = function(string, operator, replacement) {
	return string.split(operator).join(replacement);
};

// Get HTML document request
window.getDocument = function(url, callback) {
	var xhr = new XMLHttpRequest();

	xhr.onload = function() {
		callback(xhr.responseXML);
	};

	xhr.open("GET", url);
	xhr.responseType = "document";
	xhr.send();
};

window.forIn = function(item, filter) {
	for(var name in item) {
		if(item.hasOwnProperty(name)) {
			filter(name, item[name]);
		}
	}
};

navigator.getUserMedia = navigator.getUserMedia 		||
						 navigator.webkitGetUserMedia	||
						 navigator.mozGetUserMedia		||
						 navigator.msGetUserMedia		||
						 navigator.oGetUserMedia;

var modV = function(options) {

	console.log('      modV Copyright  (C)  2016 Sam Wray      '+ "\n" +
				'----------------------------------------------'+ "\n" +
				'      modV is licensed  under GNU GPL V3      '+ "\n" +
				'This program comes with ABSOLUTELY NO WARRANTY'+ "\n" +
				'For details, see http://localhost:3131/LICENSE'+ "\n" +
				'----------------------------------------------');

	var self = this,
		aCtx, // Audio Context
		analyser, // Analyser Node 
		microphone;

	self.version = "1.4";

	// UI Templates
	self.templates = document.querySelector('link[rel="import"]').import;

	// Load user options
	if(typeof options !== 'undefined') self.options = options;

	self.options.user = "please set username";

	self.clearing = true;
	if(!self.options.clearing) self.clearing = false;

	if(!self.options.headless) {
		self.headless = false;
		self.options.headless = false;
	} else {
		self.headless = true;
	}

	if(!self.options.controlDomain) self.options.controlDomain = location.protocol + '//' + location.host;

	self.baseURL = self.options.baseURL || '';

	// Attach message handler for sockets and windows
	self.addMessageHandler();

	self.gainNode = null;
	self.meydaSupport = false;

	self.modOrder = [];
	self.moduleStore = {};
	self.registeredMods = {};
	self.activeModules = {};
	self.mediaSelectors = [];
	self.LFOs = [];

	self.video = document.createElement('video');
	self.video.autoplay = true;
	self.video.muted = true;

	// MIDI
	this.MIDIInstance = new this.MIDI();
	this.MIDIInstance.start();

	// Remote
	self.remoteConnect();

	// Layers store
	self.layers = [];
	self.activeLayer = 0;

	self.canvas = self.options.canvas || document.createElement('canvas');
	self.context = self.canvas.getContext('2d');

	self.previewCanvas = document.createElement('canvas');
	self.previewContext = self.previewCanvas.getContext('2d');

	self.bufferCanvas = document.createElement('canvas');
	self.bufferContext = self.bufferCanvas.getContext('2d');

	document.querySelector('.canvas-preview').appendChild(self.previewCanvas);

	self.outputCanvas = document.createElement('canvas');
	self.outputContext = self.outputCanvas.getContext('2d');

	self.previewCanvasImageValues = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};

	self.addLayer(self.canvas, self.context, false);

	self.soloCanvas = undefined;

	self.meydaSupport = false;
	self.muted = true;

	self.ready = false;

	// Clipboard store
	self.copiedValue = null;

	// Robots
	self.bots = {};

	// WebSocket
	self.ws = undefined;

	// Set name
	self.setName = function(name) {
		self.options.user = name;
		self.saveOptions();
	};

	// Window resize
	self.resize = function() {
		self.THREE.renderer.setSize(self.outputCanvas.width, self.outputCanvas.height);

		if(window.devicePixelRatio > 1 && self.options.retina) {
			self.width = self.previewWindow.innerWidth * self.previewWindow.devicePixelRatio;
			self.height = self.previewWindow.innerHeight * self.previewWindow.devicePixelRatio;

		} else {
			self.width = self.previewWindow.innerWidth;
			self.height = self.previewWindow.innerHeight;
		}

		self.outputCanvas.width = self.width;
		self.outputCanvas.height = self.height;

		self.bufferCanvas.width = self.width;
		self.bufferCanvas.height = self.height;

		self.THREE.textureCanvas.width = self.width;
		self.THREE.textureCanvas.height =  self.height;

		self.shaderEnv.resize(self.width, self.height);

		self.calculatePreviewCanvasValues();

		self.layers.forEach(layer => {
			let canvas = layer.canvas;
			canvas.width = self.width;
			canvas.height = self.height;
		});

		forIn(self.activeModules, (mod, Module) => {
			if('resize' in Module) {
				let layer = self.layers[Module.getLayer()];

				if(Module instanceof self.Module3D) {
					Module.resize(layer.canvas, Module.getScene(), Module.getCamera(), self.THREE.material, self.THREE.texture);
				} else {
					Module.resize(layer.canvas, layer.context);
				}
			}
		});
	};

	self.mainWindowResize = function() {
		// set canvas size
		var boundingRect = self.previewCanvas.getBoundingClientRect();
		self.previewCanvas.width = boundingRect.width;
		self.previewCanvas.height = boundingRect.height;

		self.calculatePreviewCanvasValues();
	};

	self.calculatePreviewCanvasValues = () => {

		// thanks to http://ninolopezweb.com/2016/05/18/how-to-preserve-html5-canvas-aspect-ratio/
		// for great aspect ratio advice!
		var widthToHeight = self.width / self.height;
		var newWidth = self.previewCanvas.width,
			newHeight = self.previewCanvas.height;

		var newWidthToHeight = newWidth / newHeight;
	
		if (newWidthToHeight > widthToHeight) {
			newWidth = Math.round(newHeight * widthToHeight);
		} else {
			newHeight = Math.round(newWidth / widthToHeight);
		}

		self.previewCanvasImageValues.x = Math.round((self.previewCanvas.width/2) - (newWidth/2));
		self.previewCanvasImageValues.y = Math.round((self.previewCanvas.height/2) - (newHeight/2));
		self.previewCanvasImageValues.width = newWidth;
		self.previewCanvasImageValues.height = newHeight;
	};

	window.addEventListener('resize', self.mainWindowResize);

	// Create canvas
	self.setCanvas = function(el) {
		if(el.nodeName !== 'CANVAS') {
			console.error('modV: setCanvas was not supplied with a CANVAS element.');
			return false;
		}
		self.canvas = el;
		self.context = el.getContext('2d');

		return true;
	};

	// Create Windows
	self.createWindows();

	// Collection of palette controls
	self.palettes = [];

	self.presets = {};

	self.profiles = {};

	self.mediaManager = new WebSocket("ws://localhost:3132/");

	self.mediaManager.onerror = function() {
		console.warn('Media Manager not available - did you start modV in no-manager mode?');
	};

	self.mediaManagerAvailable = false;
	
	self.mediaManager.onopen = function() {
		console.info('Media Manager connected, retriveing media list');
		self.mediaManager.send(JSON.stringify({request: 'update'}));
		self.mediaManagerAvailable = true;
	};

	self.mediaManager.onmessage = function(m) {
		var parsed = JSON.parse(m.data);

		console.log('Media Manager says:', parsed);

		if('type' in parsed) {
			switch(parsed.type) {
				case 'update':
					self.profiles = parsed.payload;
					self.mediaSelectors.forEach(function(ms) {
						ms.update(self.profiles);
					});

					var arr = [];
					forIn(self.profiles, profile => {
						arr.push(profile);
					});


					let presetSelectNode = document.querySelector('#loadPresetSelect');
					if(presetSelectNode) presetSelectNode.innerHTML = '';

					forIn(self.profiles, (profileName, profile) => {
						forIn(profile.presets, (presetName, preset) => {
							if(presetSelectNode) {
								var optionNode = document.createElement('option');
								optionNode.value = presetName;
								optionNode.textContent = presetName;

								presetSelectNode.appendChild(optionNode);
							}
							
							self.presets[presetName] = preset;
						});
					});

					self.palettes.forEach(function(palette) {
						palette.updateProfiles(self.profiles);
					});
				break;
			}
		}
	};

	window.addEventListener('beforeunload', () => {
		self.mediaManager.close();
	});

	self.meydaFeatures = ['complexSpectrum'];

	self.addMeydaFeature = function(feature) {
		if(!Array.contains(feature, self.meydaFeatures)) {
			self.meydaFeatures.push(feature);
			return true;
		} else return false;
	};

	// Check for Meyda
	if(typeof window.Meyda === 'object') {
		self.meydaSupport = true;
		console.info('meyda detected, expanded audio analysis available.');
	}

	self.bpm = 0;
	self.bpmHold = false;
	self.bpmHeldAt = 120;

	// Check for BeatDetektor
	if(typeof window.BeatDetektor === 'function') {
		self.beatDetektorSupport = true;
		console.info('BeatDetektor detected, BPM analysis available.', 'modV robot now available.');
		self.beatDetektorMed = new BeatDetektor(85,169);

		self.beatDetektorKick = new BeatDetektor.modules.vis.BassKick();
		self.kick = false;
	}

	// Check for THREE
	if(typeof window.THREE === 'object') {
		console.info('THREE.js detected.', 'Revision:', THREE.REVISION);
		self.THREE = {};

		self.THREE.textureCanvas = document.createElement('canvas');
		self.THREE.textureCanvasContext = self.THREE.textureCanvas.getContext('2d');

		self.THREE.texture = new THREE.Texture(self.THREE.textureCanvas);
		self.THREE.texture.minFilter = THREE.LinearFilter;

		self.THREE.material = new THREE.MeshBasicMaterial({
			map: self.THREE.texture,
			side: THREE.DoubleSide
		});

		self.THREE.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		self.THREE.renderer.setPixelRatio(window.devicePixelRatio);

		self.THREE.canvas = self.THREE.renderer.domElement;
	}

	/* Save modV's config to local storage */
	self.saveOptions = function() {
		localStorage.setItem('modVoptions', JSON.stringify(self.options)); 
	};

	/* Load modV's config to local storage */
	self.loadOptions = function(callback) {
		if(localStorage.getItem('modVoptions')) {
			var loadedOptions = JSON.parse(localStorage.getItem('modVoptions'));
			forIn(loadedOptions, key => {
				if(!(key in self.options)) {
					self.options[key] = loadedOptions[key];
				}
			});
		}

		if(callback) callback();
	};

	// Shader handling
	self.shaderEnv = {};
	self.shaderSetup();

	self.start = function() {

		// Load Options
		self.loadOptions(function() {

			// Scan Stream sources and setup User Media
			scanMediaStreamSources(function(foundSources) {

				var audioSource;
				var videoSource;

				foundSources.audio.forEach(function(audioSrc) {
					if(audioSrc.deviceId === self.options.audioSource) {
						audioSource = audioSrc.deviceId;
					}
				});

				foundSources.video.forEach(function(videoSrc) {
					if(videoSrc.deviceId === self.options.videoSource) {
						videoSource = videoSrc.deviceId;
					}
				});

				if(foundSources.video.length > 0) self.setMediaSource(audioSource || foundSources.audio[0].deviceId, videoSource || foundSources.video[0].deviceId);
				else self.setMediaSource(audioSource || foundSources.audio[0].deviceId, undefined);
				if(!self.headless) self.startUI();
			});
			

			
			if(typeof self.canvas !== 'object') {
				console.error('modV: Canvas not set');
				return false;
			}

			requestAnimationFrame(self.loop.bind(self));
		});
	};

	/* Usermedia access */

	// Store all available Media inputs
	self.mediaStreamSources = {
		video: [],
		audio: []
	};

	function scanMediaStreamSources(callback) {
		navigator.mediaDevices.enumerateDevices().then((devices) => {
			self.mediaStreamSources.video = [];
			self.mediaStreamSources.audio = [];

			devices.forEach(function(device) {
				
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
	self.rescanMediaStreamSources = function(callback) {
		scanMediaStreamSources(callback);
	};

	self.setMediaSource = function(audioSourceID, videoSourceID) {
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
		if(self.mediaStreamSources.video.length > 0) {
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

		self.options.audioSource = audioSourceID;
		self.options.videoSource = videoSourceID;
		self.saveOptions();

		/* Ask for user media access */
		navigator.getUserMedia(constraints, userMediaSuccess, userMediaError);
	};

	function userMediaSuccess(stream) {

		self.rescanMediaStreamSources();

		// Create video stream
		self.video.src = window.URL.createObjectURL(stream);
		
		// If we have opened a previous AudioContext, destroy it as the number of AudioContexts
		// are limited to 6
		if(aCtx) aCtx.close();

		// Create new Audio Context
		aCtx = new window.AudioContext();
		
		// Create new Audio Analyser
		analyser = aCtx.createAnalyser();
		
		// Create a gain node
		self.gainNode = aCtx.createGain();
		
		// Mute the node
		self.gainNode.gain.value = 0;
		
		// Create the audio input stream (audio)
		microphone = aCtx.createMediaStreamSource(stream);

		// Connect the audio stream to the analyser (this is a passthru) (audio->(analyser))
		microphone.connect(analyser);
		
		// Connect the audio stream to the gain node (audio->(analyser)->gain)
		microphone.connect(self.gainNode);
		
		// Connect the gain node to the output (audio->(analyser)->gain->destination)
		self.gainNode.connect(aCtx.destination);
		
		// If meyda is about, use it
		if(self.meydaSupport) {
			self.meyda = new Meyda.createMeydaAnalyzer({
				audioContext: aCtx,
				source: microphone,
				bufferSize: 512,
				windowingFunction: 'rect'
			});
		}
		
		// Tell the rest of the script we're all good.
		self.ready = true;
	}

	function userMediaError() {
		console.log('Error setting up WebAudio - please make sure you\'ve allowed modV access.');
		alert('Please allow modV access to your webcam and/or microphone.');
	}

};

module.exports = modV;
window.modV = modV;