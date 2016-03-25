/* globals BeatDetektor, Meyda, MediaStreamTrack */
(function(bModule) {
	'use strict';
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

		// Save user options
		if(typeof options !== 'undefined') self.options = options;
		else {
			self.loadOptions();
		}

		self.clearing = true;
		if(!self.options.clearing) self.clearing = false;

		if(!self.options.controlDomain) self.options.controlDomain = location.protocol + '//' + location.host;

		// Attach message handler for sockets and windows
		self.addMessageHandler();

		self.gainNode = null;
		self.meydaSupport = false;

		self.modOrder = [];
		self.registeredMods = {};

		self.video = document.createElement('video');
		self.video.autoplay = true;
		self.video.muted = true;

		self.canvas = undefined;

		self.soloCanvas = undefined;

		self.meydaSupport = false;
		self.muted = true;

		self.ready = false;

		// Copy Paste
		self.copiedValue = null;

		// Robots
		self.bots = {};

		// WebSocket
		self.ws = undefined;

		// UI Templates
		self.templates = document.querySelector('link[rel="import"]').import;

		// Module Clone
		self.cloneModule = function(obj, getSettings) {
/*			var key, settings, temp;
			if(getSettings) settings = obj.getSettings();
			if (obj === null || typeof obj !== "object") {
				return obj;
			}
			if(!getSettings) temp = new obj.constructor();
			else temp = new obj.constructor(settings);

			for (key in obj) {
				try {
					if(obj[key] === THREE[key]) temp[key] = new obj.constructor();
					temp[key] = self.cloneModule(obj[key], false);
				} catch(e) {
					//console.error('Cannot clone native code', e);
				}
			}*/

			var temp = obj.clone();

			return temp;
		};

		// Window resize
		self.resize = function() {
			self.THREE.renderer.setSize(self.canvas.width, self.canvas.height);

			for(var mod in self.registeredMods) {
				var Module = self.registeredMods[mod];

				if('resize' in Module) {
					if(Module instanceof self.Module3D) {
						Module.resize(self.canvas, Module.getScene(), Module.getCamera(), self.THREE.material, self.THREE.texture);
					} else {
						Module.resize(self.canvas, self.context);	
					}
				}
			}
		};

		// Create canvas
		self.setCanvas = function(el) {
			if(el.nodeName !== 'CANVAS') {
				console.error('modV: setCanvas was not supplied with a CANVAS element.');
				return false;
			}
			self.canvas = el;
			self.context = el.getContext('2d');

			//window.addEventListener('resize', resize, false);
			//resize(false, window.innerWidth, window.innerHeight);

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

			function updateControl(control) {
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

				/*self.controllerWindow.postMessage({
					type: 'ui',
					varType: control.type,
					modName: m.name,
					name: control.label,
					payload: val,
					index: m.order
				}, self.options.controlDomain);*/

				if(control.append) {
					val = val + control.append;
				}

				self.registeredMods[mod][control.variable] = val;

			}

			for(var mod in self.presets[id]) {

				var m = self.presets[id][mod];
				
				if('controls' in m) {
					m.controls.forEach(updateControl);
				}
				console.log(m);
				//registeredMods[mod].info = m;
				self.registeredMods[mod].info.blend = m.blend;

				// Update blendmode UI
				/*self.controllerWindow.postMessage({
					type: 'ui-blend',
					modName: m.name,
					payload: m.blend
				}, self.options.controlDomain);
*/
				self.registeredMods[mod].info.disabled = m.disabled;

				// Update enabled UI
				/*self.controllerWindow.postMessage({
					type: 'ui-enabled',
					modName: m.name,
					payload: !m.disabled
				}, self.options.controlDomain);*/
				
				console.log(m.name, 'now @ ', self.setModOrder(m.name, m.order));

			}
		};

		self.savePreset = function(name, profile) {
			var preset = {
				modOrder: self.modOrder,
				moduleData: {}
			};
			
			function extractValues(Control) {
				preset.moduleData[mod].values[Control.variable] = Module[Control.variable];
			}

			for (var i=0; i < self.modOrder.length; i++) {
				var mod = self.modOrder[i];

				var Module = self.registeredMods[mod];
				
				preset.moduleData[mod] = {};
				preset.moduleData[mod].disabled = Module.info.disabled;
				preset.moduleData[mod].blend = Module.info.blend;
				preset.moduleData[mod].name = Module.info.name;

				preset.moduleData[mod].values = {};
				Module.info.controls.forEach(extractValues);
			}
			
			self.presets[name] = preset;
			localStorage.setItem('presets', JSON.stringify(self.presets));
			console.info('Wrote preset with name:', name, 'in profile', profile, preset);

			if(self.mediaManagerAvailable) {
				self.mediaManager.send(JSON.stringify({
					request: 'save-preset',
					profile: profile,
					payload: preset,
					name: name
				}));
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
		//if(typeof window.Meyda === 'object') {
		if(typeof window.Meyda === 'function') {
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

			self.THREE.texture = new THREE.Texture(self.canvas);
			self.THREE.texture.minFilter = THREE.LinearFilter;

			self.THREE.material = new THREE.MeshBasicMaterial({
				map: self.THREE.texture,
				side: THREE.DoubleSide
			});

			self.THREE.soloTexture = new THREE.Texture(self.soloCanvas);
			self.THREE.soloTexture.minFilter = THREE.LinearFilter;

			self.THREE.soloMaterial = new THREE.MeshBasicMaterial({
				map: self.THREE.soloTexture,
				side: THREE.DoubleSide
			});

			self.THREE.renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true
			});
			self.THREE.renderer.setPixelRatio( window.devicePixelRatio );

			self.THREE.canvas = self.THREE.renderer.domElement;
		}

		// Lookup presets
		if(!localStorage.getItem('presets')) {
			localStorage.setItem('presets', JSON.stringify({}));
		} else {
			self.presets = JSON.parse(localStorage.getItem('presets'));
			for(var presetname in self.presets) {
				//self.addPresetToController(presetname, self.options.controlDomain);
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

			//resize(false, width, height);
		};

		/* Save modV's config to local storage */
		self.saveOptions = function() {
			localStorage.setItem('modVoptions', JSON.stringify(self.options)); 
		};

		/* Load modV's config to local storage */
		self.loadOptions = function() {
			if(localStorage.getItem('modVoptions')) {
				self.options = JSON.parse(localStorage.getItem('modVoptions'));
			}
		};

		// Shader handling
		self.shaderEnv = {};
		self.shaderSetup();

		self.start = function() {
			// Scan Stream sources and setup User Media
			scanMediaStreamSources(function(foundSources) {
				self.setMediaSource(foundSources.audio[0].id, foundSources.video[0].id);
				self.startUI();
			});
			

			
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

		// Store all available Media inputs
		self.mediaStreamSources = {
			video: [],
			audio: []
		};

		function scanMediaStreamSources(callback) {

			MediaStreamTrack.getSources(function(sources) {
				
				self.mediaStreamSources.video = [];
				self.mediaStreamSources.audio = [];

				sources.forEach(function(source) {

					if(source.kind === 'audio') {
						self.mediaStreamSources.audio.push(source);
					} else {
						self.mediaStreamSources.video.push(source);
					}

				});
				if(callback) callback(self.mediaStreamSources);
			});

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
			
			console.log(typeof aCtx, typeof microphone);

			// If meyda is about, use it
			if(self.meydaSupport) {
				/*self.meyda = new Meyda.createMeydaAnalyzer({
					audioContext: aCtx,
					source: microphone,
					bufferSize: 512
				});*/
				self.meyda = new Meyda(aCtx, microphone, 512);
			}
			
			// Tell the rest of the script we're all good.
			self.ready = true;
		}

		function userMediaError() {
			console.log('Error setting up WebAudio - please make sure you\'ve allowed modV access.');
		}

	};

	bModule.exports = modV;
	window.modV = modV;
})(module);