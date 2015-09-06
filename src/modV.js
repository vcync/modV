(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */
	
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

	var modV = function(options) {
		var self = this,
			aCtx, // Audio Context
			analyser, // Analyser Node 
			sampleSize,
			javascriptNode,
			microphone,
			FFTData;

		// Save user options
		if(typeof options !== 'undefined') self.options = options;
		else self.options = {};

		self.clearing = true;
		if(!self.options.clearing) self.clearing = false;

		if(!self.options.controlDomain) self.options.controlDomain = location.protocol + '//' + location.host;

		// Attach message handler for sockets and windows
		self.addMessageHandler();

		self.amplitudeArray = null;

		self.gainNode = null;
		self.meydaSupport = false;

		self.modOrder = [];
		self.registeredMods = {};

		self.video = document.createElement('video');
		self.video.autoplay = true;
		self.video.muted = true;

		self.canvas = undefined;

		self.meydaSupport = false;
		self.muted = true;

		self.ready = false;

		// WebSocket
		self.ws = undefined;

		// Window resize
		function resize(e, width, height) {
			if(e) {
				width = window.innerWidth;
				height = window.innerHeight;
			}
			self.canvas.width = width;
			self.canvas.height = height;

			if (window.devicePixelRatio > 1 && 'retina' in self.options) {
				if(self.options.retina) {
					var canvasWidth = width;
					var canvasHeight = height;

					self.canvas.width = canvasWidth * window.devicePixelRatio;
					self.canvas.height = canvasHeight * window.devicePixelRatio;
					self.canvas.style.width = width + 'px';
					self.canvas.style.height = height + 'px';
				}
			}

			if(typeof window.THREE == 'object') {
				self.threejs.renderer.setSize(window.innerWidth, window.innerHeight);
				self.threejs.camera.aspect = window.innerWidth / window.innerHeight;
				self.threejs.camera.updateProjectionMatrix();
				self.threejs.renderer.setSize(self.canvas.width, self.canvas.height);
			}

			for(var mod in self.registeredMods) {
				if(typeof self.registeredMods[mod].init === 'function') self.registeredMods[mod].init(self.canvas, self.context);
			}
		}

		// Create canvas
		self.setCanvas = function(el) {
			if(el.nodeName !== 'CANVAS') {
				console.error('modV: setCanvas was not supplied with a CANVAS element.');
				return false;
			}
			self.canvas = el;
			self.context = el.getContext('2d');

			if(typeof window.THREE === 'object') {
				self.threejs.canvas = document.createElement('canvas');

				self.threejs.renderer = new THREE.WebGLRenderer({canvas: self.threejs.canvas, autoClear: false, alpha: true});
				self.threejs.renderer.setSize( window.innerWidth, window.innerHeight );
				self.threejs.renderer.setClearColor(0x000000, 0);
			}

			window.addEventListener('resize', resize, false);
			resize(false, window.innerWidth, window.innerHeight);

			return true;
		};

		if(self.options.canvas) {
			self.setCanvas(self.options.canvas);
		}

		// Create Windows
		self.createWindows();

		// Collection of palette controls
		self.palettes = [];

		self.presets = {};

		self.profiles = {};

		self.mediaManager = new WebSocket("ws://localhost:3132/");
		self.mediaManagerAvailable = false;
		
		self.mediaManager.onopen = function() {
			console.info('Media Manager connected, retriveing media list');
			self.mediaManager.send(JSON.stringify({request: 'update'}));
			self.mediaManagerAvailable = true;
		};

		self.mediaManager.onmessage = function(m) {
			var parsed = JSON.parse(m.data);

			console.log('Media Manager says:', m.data);
			console.log(parsed);

			if('type' in parsed) {
				switch(parsed.type) {
					case 'update':
						self.profiles = parsed.payload;
						self.mediaSelectors.forEach(function(ms) {
							ms.update(self.profiles);
						});

						var arr = [];
						for(var profile in self.profiles) {
							arr.push(profile);
						}

						self.palettes.forEach(function(palette) {
							palette.updateProfiles(arr);
						});
					break;
				}
			}
		};

		self.loadPreset = function(id) {
			console.log(id);
			self.factoryReset();

			for(var mod in self.presets[id]) {

				var m = self.presets[id][mod];
				
				if('controls' in m) {
					m.controls.forEach(function(control, idx) {
						var val = control.currValue;
						
						if('append' in control) {
							if(typeof val === 'string') {
								val = val.replace(control.append, '');
							} else {
								val = val.toString();
								val = val.replace(control.append, '');
							}
						}

						if(control.type === 'image' || control.type === 'multiimage' || control.type === 'video') return;

						self.controllerWindow.postMessage({
							type: 'ui',
							varType: control.type,
							modName: m.name,
							name: control.label,
							payload: val,
							index: m.order
						}, self.options.controlDomain);

						if(control.append) {
							val = val + control.append;
						}

						self.registeredMods[mod][control.variable] = val;

					});
				}
				console.log(m);
				//registeredMods[mod].info = m;
				self.registeredMods[mod].info.blend = m.blend;

				// Update blendmode UI
				self.controllerWindow.postMessage({
					type: 'ui-blend',
					modName: m.name,
					payload: m.blend
				}, self.options.controlDomain);

				self.registeredMods[mod].info.disabled = m.disabled;

				// Update enabled UI
				self.controllerWindow.postMessage({
					type: 'ui-enabled',
					modName: m.name,
					payload: !m.disabled
				}, self.options.controlDomain);
				
				console.log(m.name, 'now @ ', self.setModOrder(m.name, m.order));

			}
		};

		self.meydaFeatures = ['complexSpectrum'];
	
		self.addMeydaFeature = function(feature) {
			if(!Array.contains(feature, self.meydaFeatures)) {
				self.meydaFeatures.push(feature);
				return true;
			} else return false;
		};

		// Check for Meyda
		if(typeof window.Meyda === 'function') {
			self.meydaSupport = true;
			console.info('meyda detected, expanded audio analysis available.', 'Use this.meyda to access from console.');
		}

		self.bpm = 0;
		self.bpmHold = false;
		self.bpmHeldAt = 120;
		var bpmInfoUpdater;
		// Check for BeatDetektor
		if(typeof window.BeatDetektor === 'function') {
			self.beatDetektorSupport = true;
			console.info('BeatDetektor detected, BPM analysis available.', 'modV robot now available.');
			self.beatDetektorMed = new BeatDetektor(85,169);
			bpmInfoUpdater = setInterval(function() {
				self.controllerWindow.postMessage({
					type: 'info',
					name: 'detected-bpm',
					payload: self.bpm,
				}, self.options.controlDomain);

			}, 1000);
		}

		// Lookup presets
		if(!localStorage.getItem('presets')) {
			localStorage.setItem('presets', JSON.stringify({}));
		} else {
			self.presets = JSON.parse(localStorage.getItem('presets'));
			for(var presetname in self.presets) {
				self.addPresetToController(presetname, self.options.controlDomain);
				console.log('Successfuly read saved preset with name:', presetname);
			}
		}

		self.setDimensions = function(width, height) {
			if(typeof width === 'undefined' && typeof height === 'undefined') {
				console.error('modV: setDimensions was not supplied anything!');
			} else if(typeof width !== 'number') {
				console.error('modV: setDimensions was not supplied with a number type.');
				return;
			} else if(typeof height !== 'number') {
				console.error('modV: setDimensions was not supplied with a number type.');
				return;
			}

			resize(false, width, height);
		};

		self.start = function() {
			if(typeof self.canvas !== 'object') {
				console.error('modV: Canvas not set');
				return false;
			}

			if(self.options.remote && !self.remoteSuccess) {
				self.initSockets();

				console.log('Remote server not connected yet, waiting for connection to start.');
				setTimeout(self.start, 1000);
			} else {

				if(self.options.remote) {
					for(var mod in self.registeredMods) {
						var infoToSend = JSON.parse(JSON.stringify(self.registeredMods[mod].info)); // copy the set
						var variables = [];

						if('controls' in self.registeredMods[mod].info) {
							self.registeredMods[mod].info.controls.forEach(function(controlSet) {
								var variable = controlSet.variable;
								variables.push(variable);
							});

							variables.forEach(function(v) {
								infoToSend[v] = self.registeredMods[mod][v];
							});
						}

						self.ws.send(JSON.stringify({
							type: 'register',
							payload: infoToSend
						}));
					}
				}

				requestAnimationFrame(self.loop.bind(self)); //modV-drawLoop.js //TODO: figure out why we're using bind (I get it, but seems stupid)
			}

			return true;
		};

		/* Usermedia access */
		/* Turn all this stuff off or we'll get a really bad audio input when also using video ~~trust me~~ */
		var contraints = {
				audio: {
					optional: [
						{googNoiseSuppression: false},
						{googEchoCancellation: false},
						{googEchoCancellation2: false},
						{googAutoGainControl: false},
						{googNoiseSuppression2: false},
						{googHighpassFilter: false},
						{googTypingNoiseDetection: false}
					]
				}/*,
				video: {
					optional: [
						{googNoiseSuppression: false},
						{googEchoCancellation: false},
						{googEchoCancellation2: false},
						{googAutoGainControl: false},
						{googNoiseSuppression2: false},
						{googHighpassFilter: false},
						{googTypingNoiseDetection: false}
					]
				}*/
		};

		navigator.getUserMedia = navigator.getUserMedia 	||
							 navigator.webkitGetUserMedia	||
							 navigator.mozGetUserMedia		||
							 navigator.msGetUserMedia		||
							 navigator.oGetUserMedia;
		
		/* Ask for webcam and audio access  */
		navigator.getUserMedia(contraints, function(stream) {
			
			// Create video stream
			self.video.src = window.URL.createObjectURL(stream);
			
			// Create new Audio Context
			aCtx = new window.AudioContext();
			
			// Create new Audio Analyser
			analyser = aCtx.createAnalyser();
			
			// Create a script processor
			javascriptNode = aCtx.createScriptProcessor(sampleSize, 1, 1);
			
			// Tell the processor to start analysing when we have activity
			javascriptNode.onaudioprocess = function () {
				analyser.getByteTimeDomainData(self.amplitudeArray);
			};
			
			// Create a gain node
			self.gainNode = aCtx.createGain();
			
			// Mute the node
			self.gainNode.gain.value = 0;
			
			// Create the audio input stream
			microphone = aCtx.createMediaStreamSource(stream);
			
			// Connect the audio stream to the gain node (audio->gain)
			microphone.connect(self.gainNode);
			
			// Connect the gain node to the output (audio->gain->destination)
			self.gainNode.connect(aCtx.destination);
			
			// If meyda is about, use it
			if(self.meydaSupport) self.meyda = new Meyda(aCtx, microphone, 512);
			
			// Connect the audio stream to the analyser (this is a passthru) (audio->(analyser)->gain->destination)
			microphone.connect(analyser);
			
			// Connect the analyser to the JS node
			analyser.connect(javascriptNode);
			
			// Connect the JS node to the destination
			javascriptNode.connect(aCtx.destination);
			
			// Create a new Uint8Array for the analysis
			FFTData = new Uint8Array(analyser.frequencyBinCount);
			
			// TODO: More friendly name?
			self.amplitudeArray = FFTData;
			
			// Tell the rest of the script we're all good.
			self.ready = true;
		}, function() {
			// o noes
			console.log('Error setting up WebAudio - please make sure you\'ve allowed modV access.');
		});

	};

	module.exports = modV;
	window.modV = modV;
})(module);