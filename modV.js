var modV = function (options) {

	(function() {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = 	window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame  =	window[vendors[x] + 'CancelAnimationFrame'] ||
											window[vendors[x] + 'CancelRequestAnimationFrame'];
		}
	 
		if(!window.requestAnimationFrame) {
			window.requestAnimationFrame = function(callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() { callback(currTime + timeToCall); },
				  timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}
	 
		if(!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		}
	}());
	
	// from here: http://stackoverflow.com/questions/18663941/finding-closest-element-without-jquery
	function getClosest(el, tag) {
		tag = tag.toUpperCase();
		do {
			if (el.nodeName === tag) {
				return el;
			}
		} while (el = el.parentNode);
	
		return false;
	}
	
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
	
	navigator.getUserMedia = navigator.getUserMedia 	  ||
							 navigator.webkitGetUserMedia ||
							 navigator.mozGetUserMedia 	  ||
							 navigator.msGetUserMedia 	  ||
							 navigator.oGetUserMedia;
	
	var modOrder = [],
		registeredMods = {},
		that = this,
		video = document.createElement('video'),
		meydaSupport = false,
		muted = true;
	
	this.presets = {};
	
	// Global Variables for Audio
	var javascriptNode,
		sampleSize 		= 1024,  		// number of samples to collect before analysing data
		amplitudeArray 	= [],			// array to hold time data
		aCtx,
		analyser,
		microphone,
		gainNode,
		ready 			= false;
		
	this.meyda;
	this.meydaFeatures = [];
	
	this.addMeydaFeature = function(feature) {
		if(!Array.contains(feature, that.meydaFeatures)) {
			that.meydaFeatures.push(feature);
			return true;
		} else return false;
	};
	
	// Check for Meyda
	if(typeof window.Meyda === 'function') {
		meydaSupport = true;
		console.info('meyda detected, expanded audio analysis available.', 'Use this.meyda to access from console.');
	}
	
	video.autoplay = true;
	video.muted = true;
	
	// Save user options
	if(typeof options !== 'undefined') this.options = options;
	else this.options = {};
	
	// Function to create blend mode options
	function genBlendModeOps() {
		var selectEl = document.createElement('select');
		var blends = [
			'normal',
			'multiply',
			'overlay',
			'darken',
			'lighten',
			'color-dodge',
			'color-burn',
			'hard-light',
			'soft-light',
			'difference',
			'exclusion',
			'hue',
			'saturation',
			'color',
			'luminosity'
		];
		
		var modes = [
			'clear',
			'copy',
			'destination',
			'source-over',
			'destination-over',
			'source-in',
			'destination-in',
			'source-out',
			'destination-out',
			'source-atop',
			'destination-atop',
			'xor',
			'lighter'
		];
		
		var blendsOptgroup = document.createElement('optgroup');
		blendsOptgroup.label = 'Blend Modes';
		
		blends.forEach(function(blend) {
			var option = document.createElement('option');
			option.value = blend;
			option.textContent = blend.replace('-', ' ');
			option.textContent = option.textContent.charAt(0).toUpperCase() + option.textContent.slice(1);
			blendsOptgroup.appendChild(option);
		});
		
		var modesOptgroup = document.createElement('optgroup');
		modesOptgroup.label = 'Composite Modes';
		
		modes.forEach(function(mode) {
			var option = document.createElement('option');
			option.value = mode;
			option.textContent = mode.replace('-', ' ');
			option.textContent = option.textContent.charAt(0).toUpperCase() + option.textContent.slice(1);
			modesOptgroup.appendChild(option);
		});
		
		selectEl.appendChild(blendsOptgroup);
		selectEl.appendChild(modesOptgroup);
		return selectEl;
	}
	
	// sineWave timer object
	function sineTimer(frequency, amplitude, center) {
		frequency = frequency || 0.4;
		amplitude = amplitude || 127;
		center 	  = center 	  || 128;
		var i = 0.0,
			that = this;
		
		function calcSine() {
			radians = i * (Math.PI/180);
			that.value = 128 + Math.round(amplitude * (Math.sin(2 * Math.PI * frequency * i)));
			
			if(Math.floor(i) === 360) i = 0;
			else i+=0.1;
		}
				
		this.start = function() {
			this.interval = setInterval(calcSine, 1000/60);
		};
		
		this.stop = function() {
			clearInterval(this.interval);
		};
	}
	
	// Setup window control
	
	if(!this.options.controlDomain) this.options.controlDomain = location.protocol + "//" + location.host;
	
	function parseVar(varType, variable) {
		switch(varType) {
			case 'float':
				variable = parseFloat(variable);
				break;
				
			case 'int':
				variable = parseInt(variable);
				break;
				
			case 'checkbox':
				//variable = JSON.parse(variable.toLowerCase());
				break;
				
			default:
				variable = variable;
		}
		
		return variable;
	}
	
	window.addEventListener('message', receiveMessage, false);
	
	function receiveMessage(event, websocket) {
		if(event.origin !== that.options.controlDomain && !websocket) return;
		if(event.data.type === 'variable') {
			
			// Parse Variable
			var variable = parseVar(event.data.varType, event.data.payload);
			
			// Set variable value
			registeredMods[event.data.modName][event.data.name] = variable;
			
			// Set current value for preset purposes
			registeredMods[event.data.modName].info.controls[event.data.index].currValue = variable;
			
			// If this came from a websocket message, make sure we update the UI (cool ghost-like stuff)
			if(websocket) {
				
				var payload = event.data.payload;
				
				if('append' in event.data) {
					payload = payload.replace(event.data.append, '');
				}
								
				controllerWindow.postMessage({
					type: 'ui',
					varType: event.data.varType,
					modName: event.data.modName,
					name: event.data.name,
					payload: payload,
					index: event.data.index
				}, that.options.controlDomain);
			}
			
			console.log(event.data.modName, event.data.name, registeredMods[event.data.modName].info.controls[event.data.index].currValue);
		}
		
		if(event.data.type === 'image') {
			registeredMods[event.data.modName][event.data.name].src = event.data.payload;
		}
		
		if(event.data.type === 'video') {
			registeredMods[event.data.modName][event.data.name].src = event.data.payload;
			registeredMods[event.data.modName][event.data.name].load();
			registeredMods[event.data.modName][event.data.name].play();
		}

		if(event.data.type === 'multiimage') {
			if(event.data.wipe) registeredMods[event.data.modName][event.data.name].length = 0;
			event.data.payload.forEach(function(file) {
				var newImage = new Image();
				newImage.src = file;
				registeredMods[event.data.modName][event.data.name].push(newImage);
			});
		}
		
		if(event.data.type === 'modBlend') {
			registeredMods[event.data.modName].info.blend = event.data.payload;

			if(websocket) {
				controllerWindow.postMessage({
					type: 'ui-blend',
					modName: event.data.modName,
					payload: event.data.payload,
				}, that.options.controlDomain);
				console.log(event.data);
			}
		}
		
		if(event.data.type === 'modOpacity') {
			registeredMods[event.data.modName].info.alpha = event.data.payload;

			if(websocket) {
				controllerWindow.postMessage({
					type: 'ui-opacity',
					modName: event.data.modName,
					payload: event.data.payload,
				}, that.options.controlDomain);
				console.log(event.data);
			}
		}
		
		if(event.data.type === 'setOrderUp') {
			var index = -1;
			modOrder.forEach(function(mod, idx) {
				if(event.data.modName === mod) index = idx;
			});
			if(index > 0) {
				index -= 1;
				that.setModOrder(event.data.modName, index);
			}
		}
		
		if(event.data.type === 'setOrderFromElements') {
			var index = -1;
			modOrder.forEach(function(mod, idx) {
				if(event.data.y === mod) index = idx;
			});
			
			if(index > 0) {
				that.setModOrder(event.data.x, index);
			}
		}
		
		if(event.data.type === 'check') {
			if(!event.data.payload) {
				registeredMods[event.data.modName].info.disabled = true;
			} else {
				registeredMods[event.data.modName].info.disabled = false;
			}

			if(websocket) {
				controllerWindow.postMessage({
					type: 'ui-enabled',
					modName: event.data.modName,
					payload: event.data.payload,
				}, that.options.controlDomain);
			}
		}
		
		if(event.data.type === 'global') {
			if(event.data.name === 'clearing') {
				if(event.data.payload) {
					that.clearing = true;
				} else {
					that.clearing = false;
				}
			}
			
			if(event.data.name === 'mute') {
				if(event.data.payload) {
					gainNode.gain.value = 0;
				} else {
					gainNode.gain.value = 1;
				}
			}
			
			if(event.data.name === 'savepreset') {
				var preset = {};
				
				for (var mod in registeredMods) {
					preset[mod] = registeredMods[mod].info;
				}
				
				that.presets[event.data.payload.name] = preset;
				console.info('Wrote preset with name:', event.data.payload.name);
			}
		}
	}
	var controllerWindow = window.open('',
									   '_blank',
									   'width=' + (1440/100)*33.4 + ', height=' + screen.height + ', location=yes, menubar=yes, left=' + (screen.width/100)*66.6);
	
	// Load presets into window (TO DO)
	controllerWindow.window.presets = {};
	
	var drunkenMess = function() {
		return 'You sure about that, you drunken mess?';
	};
	
	if(this.options.previewWindow) {
		// Preview window
		var previewWindow = window.open('', '_blank', 'width=640, height=480, location=no, menubar=no, left=0');
		var previewCanvas = document.createElement('canvas');
		var previewCtx = previewCanvas.getContext('2d');
		
		previewWindow.document.body.style.margin = '0px';
		previewCanvas.width = 640;
		previewCanvas.height = 480;
		previewWindow.onbeforeunload = drunkenMess;
		previewWindow.document.body.appendChild(previewCanvas);
	}
								   
	controllerWindow.onbeforeunload = drunkenMess;
	window.onbeforeunload = drunkenMess;
	
	var css = new XMLHttpRequest();
	css.open('GET', 'control-stylesheet.css', false);
	css.onreadystatechange = function ()
	{
		if(css.readyState === 4)
		{
			if(css.status === 200 || css.status === 0)
			{
				var allText = css.responseText;
				
				var styles = allText.split('}');
				
				var style = document.createElement('style');
				style.appendChild(document.createTextNode(''));
				style = controllerWindow.window.document.head.appendChild(style);
				
				styles.forEach(function(rule, idx) {
					if(idx === styles.length-1) return false;
					style.sheet.insertRule(rule + '}', 0);
				});
			}
		}
	};
	css.send(null);
	
	/*
var stylesheet = document.createElement('link');
	stylesheet.type = 'text/css';
	stylesheet.rel = 'stylesheet';
	stylesheet.href = 'http://brkbrkbrk.com/dev/modV/control-stylesheet.css';
	
*/

	var slipJS = document.createElement('script');
	slipJS.src = './slip/slip.js';
	
	slipJS.onload = function() {
	
		controllerWindow.window.document.body.addEventListener('slip:beforewait', function(e){
			if (e.target.className.indexOf('instant') > -1) e.preventDefault();
		}, false);
	
		controllerWindow.window.document.body.addEventListener('slip:reorder', function(e){
			e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
			return false;
		}, false);
		
		controllerWindow.window.initSlip = function() {
			new Slip(controllerWindow.window.document.body);
		};
		controllerWindow.window.initSlip();
	};
	
	
	controllerWindow.window.document.head.appendChild(slipJS);
		
	controllerWindow.window.receiveMessage = function(event) {
		if(event.origin !== that.options.controlDomain) return;
				
		if(event.data.type === 'ui') {
			var id = event.data.modName + '-' + event.data.name;
			
			var node = controllerWindow.window.document.getElementById(id);
			
			controllerWindow.window.console.log(id, node, event.data.payload);
						
			if(event.data.varType === 'checkbox') {
				node.checked = event.data.payload;
			} else {
				node.value = event.data.payload;
			}
		}

		if(event.data.type === 'ui-blend') {
			var id = event.data.modName + '-blend';
			var node = controllerWindow.window.document.getElementById(id);
			controllerWindow.window.console.log(id, node, event.data.payload);

			for (var i = 0; i < node.options.length; i++) {
				if (node.options[i].value === event.data.payload) {
					node.selectedIndex = i;
					break;
				}
			}
		}

		if(event.data.type === 'ui-enabled') {
			var id = event.data.modName + '-enabled';
			var node = controllerWindow.window.document.getElementById(id);
			controllerWindow.window.console.log(id, node, event.data.payload);
			node.checked = event.data.payload;
		}

		if(event.data.type === 'ui-opacity') {
			var id = event.data.modName + '-opacity';
			var node = controllerWindow.window.document.getElementById(id);
			controllerWindow.window.console.log(id, node, event.data.payload);
			node.value = event.data.payload;
		}
		
	};
	controllerWindow.window.addEventListener('message', controllerWindow.window.receiveMessage, false);
	
	window.addEventListener('beforeunload', function() {
		try {
			controllerWindow.close();
			previewWindow.close();
		} catch(e) {
			// oops window not found.
		}
	}, false);
	
	/* Setup remote control */
	var remoteSuccess = false,
		uuid;
	
	if(this.options.remote) {
		try {
			var ws = new WebSocket(this.options.remote);
			
			ws.onerror = function () {
				remoteSuccess = true;
				console.error('Sorry, the web socket at "%s" is un-available', url);
	        };
		
			ws.onmessage = function(e) {
				var data = JSON.parse(e.data);
				console.group('WebSocket logs');
				console.log('Message received:', data);
				
				if(!('type' in data)) return false;
				
				var pl = data.payload;
				
				switch(data.type) {
					
					case 'hello':
						console.log(pl.name, 'says hi. Server version number:', pl.version);
						remoteSuccess = true;
						uuid = pl.id;
						ws.send(JSON.stringify({type: 'declare', payload: {type: 'client', id: uuid}}));
						break;
						
					case 'registerCB':
						// Sorta debug only - will do something with this later on.
						console.log('Server says', pl.name, 'was registered with order number', pl.index);
						
						if(registeredMods[pl.name].info.name === pl.name) {
							if(registeredMods[pl.name].info.order === pl.index) {
								console.log('True!');
							} else {
								console.log('False!');
							}
						} else {
							console.log('False!');
						}
						
						break;
					
					default:
						receiveMessage({data: data}, true);
				}
				console.groupEnd();
			};
			
			ws.onclose = function() {
				console.group('WebSocket logs');
				console.log('Connection closed');
				console.groupEnd();
			};
			
			ws.onopen = function() {
				console.group('WebSocket logs');
				console.log('Successful initial connection to', that.options.remote);
				console.groupEnd();
			};
		} catch(e) {
			console.error('There was an un-identified Web Socket error');
		}
	}
	
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
			},
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
			}
	};
	
	/* Ask for webcam and audio access  */
	navigator.getUserMedia(contraints, function(stream) {
		
		// Create video stream
		video.src = window.webkitURL.createObjectURL(stream);
		
		// Create new Audio Context
		aCtx = new window.AudioContext();
		
		// Create new Audio Analyser
		analyser = aCtx.createAnalyser();
		
		// Create a script processor
		javascriptNode = aCtx.createScriptProcessor(sampleSize, 1, 1);
		
		// Tell the processor to start analysing when we have activity
		javascriptNode.onaudioprocess = function () {
			analyser.getByteTimeDomainData(amplitudeArray);
		};
		
		// Create a gain node
		gainNode = aCtx.createGain();
		
		// Mute the node
		gainNode.gain.value = 0;
		
		// Create the audio input stream
		microphone = aCtx.createMediaStreamSource(stream);
		
		// Connect the audio stream to the gain node (audio->gain)
		microphone.connect(gainNode);
		
		// Connect the gain node to the output (audio->gain->destination)
		gainNode.connect(aCtx.destination);
		
		// If meyda is about, use it
		if(meydaSupport) that.meyda = new Meyda(aCtx, microphone, 512);
		
		// Connect the audio stream to the analyser (this is a passthru) (audio->(analyser)->gain->destination)
		microphone.connect(analyser);
		
		// Connect the analyser to the JS node
		analyser.connect(javascriptNode);
		
		// Connect the JS node to the destination
		javascriptNode.connect(aCtx.destination);
		
		// Create a new Uint8Array for the analysis
		FFTData = new Uint8Array(analyser.frequencyBinCount);
		
		// More friendly name? (should tidy all this up at some point)
		amplitudeArray = FFTData;
		
		// Tell the rest of the script we're all good.
		ready = true;
	}, function() {
		// o noes
		console.log('Error setting up WebAudio - please make sure you\'ve allowed modV access.');
	});

	this.canvas = undefined;
	this.clearing = true;

	this.setCanvas = function(el) {
		if(el.nodeName !== 'CANVAS') {
			console.error('modV: setCanvas was not supplied with a CANVAS element.');
			return false;
		}
		this.canvas = el;
		this.context = el.getContext('2d');
		window.addEventListener('resize', function() {
			that.canvas.width = window.innerWidth;
			that.canvas.height = window.innerHeight;
			for(var mod in registeredMods) {
				if(typeof registeredMods[mod].init === 'function') registeredMods[mod].init(that.canvas, that.context);
			}
		}, false);
		return true;
	};

	this.setDimensions = function(width, height) {
		if(typeof width === 'undefined' && typeof height === 'undefined') {
			console.error('modV: setDimensions was not supplied anything!');
		} else if(typeof width !== 'number') {
			console.error('modV: setDimensions was not supplied with a number type.');
			return;
		} else if(typeof height !== 'number') {
			console.error('modV: setDimensions was not supplied with a number type.');
			return;
		}

		if(typeof width === 'undefined' && typeof height !== 'undefined') this.canvas.width = this.canvas.height = height;
		else if(typeof width !== 'undefined' && typeof height === 'undefined') this.canvas.width = this.canvas.height = width;
		else {
			this.canvas.width = width;
			this.canvas.height = height;
		}
	};
	
	// Add global controls to UI
	var fieldset = document.createElement('fieldset');
	var legend = document.createElement('legend');
	legend.textContent = 'Global';
	fieldset.appendChild(legend);
	
	
	// - clearing
	var label = document.createElement('label');
	label.textContent = 'Clearing ';

	var checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.checked = false;
	checkbox.addEventListener('change', function() {
		controllerWindow.window.opener.postMessage({type: 'global', name: 'clearing', payload: this.checked}, that.options.controlDomain);
	});
	label.appendChild(checkbox);
	fieldset.appendChild(label);
	fieldset.appendChild(document.createElement('br'));
	
	
	// - mute control
	label = document.createElement('label');
	label.textContent = 'Mute ';

	checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.checked = true;
	checkbox.addEventListener('change', function() {
		controllerWindow.window.opener.postMessage({type: 'global', name: 'mute', payload: this.checked}, that.options.controlDomain);
	});
	label.appendChild(checkbox);
	fieldset.appendChild(label);
	fieldset.appendChild(document.createElement('br'));
	
	
	// - save preset
	var div = document.createElement('div');

	var text = document.createElement('input');
	text.type = 'text';
	text.placeholder = 'Preset Name';
	
	var button = document.createElement('button');
	button.textContent = 'Save new Preset';
	
	button.addEventListener('click', function() {
		
		var confirmed = false,
			dialog = false;
		
		if(text.value in that.presets) {
			dialog = true;
			confirmed = confirm('A preset with the name "' + text.value + '"already exists!\nIs it okay to overwrite?');
		}
		
		if(!dialog || (dialog && confirmed)) {
			controllerWindow.window.opener.postMessage({
				type: 'global',
				name: 'savepreset',
				payload: {
					name: text.value
				}
			}, that.options.controlDomain);
		}
	});
	div.appendChild(text);
	div.appendChild(button);
	fieldset.appendChild(div);
	
	controllerWindow.document.body.appendChild(fieldset);
	
	this.registerMod = function(mod) {
		mod = new mod();
		if(typeof mod.init === 'function') mod.init(this.canvas, this.context);
		if(!('blend' in mod.info)) mod.info.blend = 'normal';
		if(!('alpha' in mod.info)) mod.info.alpha = 1;
		mod.info.disabled = true;
		
		if(meydaSupport && ('meyda' in mod.info)) {
			mod.info.meyda.forEach(this.addMeydaFeature);
		} else if(!meydaSupport && ('meyda' in mod.info)) {
			console.warn('Whilst registering the module \'' + mod.info.name + '\', modV detected it requests Meyda which has not been included on the page. You may encounter problems using this module without Meyda.');
		}

		var fieldset = document.createElement('fieldset');
		
		var relatedTarget = null;
		
		fieldset.addEventListener('drop', function(e) {
			e.preventDefault();
			var target = getClosest(e.target, 'fieldset');
			target.style.backgroundColor = 'white';
			console.log(target);
			
			var targetdata = target.dataset.name;
			
			var data = e.dataTransfer.getData('text');
			var nodeToMove = controllerWindow.document.querySelector('fieldset[data-name="' + data + '"]');
			nodeToMove.parentNode.insertBefore(nodeToMove, target);
			
			controllerWindow.window.opener.postMessage({type: 'setOrderFromElements', x: data, y: targetdata}, that.options.controlDomain);
			
			console.log(nodeToMove);
		}, false);
		
		fieldset.addEventListener('dragover', function(e) {
			e.preventDefault();
			relatedTarget = getClosest(e.target, 'fieldset');
			
			try {
				relatedTarget.style.backgroundColor = 'green';
			} catch(err) {
				
			}
		}, false);
		
		fieldset.addEventListener('dragleave', function(e) {
			e.preventDefault();
			relatedTarget.style.backgroundColor = 'white';
			
			//elem.parentNode.insertBefore(nodeToMove, );
		}, false);
		
		fieldset.dataset.name = mod.info.name;
		fieldset.style.position = 'relative';
		var legend = document.createElement('legend');
		legend.textContent = mod.info.name;
		legend.style .fontSize = '20px';
		fieldset.appendChild(legend);

		var label = document.createElement('label');
		label.textContent = 'Enabled ';

		var checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = false;
		checkbox.addEventListener('change', function() {
			controllerWindow.window.opener.postMessage({type: 'check',
				modName: mod.info.name,
				payload: this.checked
			}, that.options.controlDomain);

			if(that.options.remote) {
				ws.send(JSON.stringify({
					type: 'ui-enabled',
					modName: mod.info.name,
					payload: this.checked
				}));
			}
		});

		checkbox.id = mod.info.name + '-enabled';

		label.appendChild(checkbox);
		fieldset.appendChild(label);
		fieldset.appendChild(document.createElement('br'));
		
		var up = document.createElement('button');
		up.textContent = 'UP';
		up.addEventListener('click', function() {
			controllerWindow.window.opener.postMessage({type: 'setOrderUp', modName: mod.info.name}, that.options.controlDomain);
		});
		
		fieldset.appendChild(up);
		fieldset.appendChild(document.createElement('br'));
		
		// Add Opacity control
		var opacityInput = document.createElement('input');
		opacityInput.type = 'range';
		
		label = document.createElement('label');
		label.textContent = 'Opacity ';

		opacityInput.min = 0;
		opacityInput.max = 1;
		opacityInput.step = 0.01;
		opacityInput.value = mod.info.alpha;
		
		opacityInput.addEventListener('input', function() {
			controllerWindow.window.opener.postMessage({
				type: 'modOpacity',
				modName: mod.info.name,
				payload: this.value
			}, that.options.controlDomain);

			if(that.options.remote) {
				ws.send(JSON.stringify({
					type: 'ui-opacity',
					modName: mod.info.name,
					payload: this.value
				}));
			}
		});

		opacityInput.id = mod.info.name + '-opacity';
		
		label.appendChild(opacityInput);
		fieldset.appendChild(label);
		fieldset.appendChild(document.createElement('br'));
		
		// Add Blending options
		var blendCompSelect = genBlendModeOps();
		label = document.createElement('label');
		label.textContent = 'Blending ';
		
		blendCompSelect.addEventListener('change', function() {
			controllerWindow.window.opener.postMessage({
				type: 'modBlend',
				modName: mod.info.name,
				payload: this.value
			}, that.options.controlDomain);

			if(that.options.remote) {
				ws.send(JSON.stringify({
					type: 'ui-blend',
					modName: mod.info.name,
					payload: this.value
				}));
			}
		});
		
		blendCompSelect.id = mod.info.name + '-blend';

		label.appendChild(blendCompSelect);
		fieldset.appendChild(label);
		fieldset.appendChild(document.createElement('br'));
		
		var mover = document.createElement('div');
		mover.classList.add('mover');
		mover.classList.add('instant');
		// Move this:
		mover.style.width = '50px';
		mover.style.height = '50px';
		mover.style.borderRadius = '50%';
		mover.style.backgroundColor = 'red';
		mover.style.textAlign = 'center';
		mover.style.fontSize = '44px';
		mover.style.color = 'white';
		mover.style.position = 'absolute';
		mover.style.right = '-8px';
		mover.style.top = '-8px';
		
		mover.draggable = true;
		mover.addEventListener('dragstart', function(e) {
			
			e.dataTransfer.setData('text', e.target.parentNode.dataset.name);
			
		}, false);
		
		mover.addEventListener('dragend', function(e) {
			//console.log(e.target);
			//e.dataTransfer.setData("text", e.target.parentNode.dataset.name);
		}, false);
		fieldset.appendChild(mover);
		

		// Register controls
		if('controls' in mod.info) {

			mod.info.controls.forEach(function(controlSet, idx) {
				var variable = controlSet.variable;
				var label = document.createElement('label');
				var labelText = controlSet.label;
				label.textContent = labelText + ' ';
				
				label.oncontextmenu = function(e) {
					console.log(e);
					var div = document.createElement('div');
					div.classList.add('menu');
					div.style.top = e.clientY + e.offsetY + 'px';
					div.style.left = e.clientX + e.offsetX + 'px';
					controllerWindow.window.document.body.appendChild(div);
					return false;
				 };
				
				
				fieldset.appendChild(document.createElement('hr'));
				
				if(controlSet.type === 'video') {
					var image = new Image();
					image.src = mod[variable].src;

					fieldset.addEventListener('dragover', function(e) {
						e.preventDefault();
						this.classList.add('dragover');
					});

					fieldset.addEventListener('dragend', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
					});
						
					fieldset.addEventListener('drop', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
						var file = e.dataTransfer.files[0];
						if (!file || !file.type.match(/video.*/)) return;
						var imageURL = window.URL.createObjectURL(file);
						controllerWindow.window.opener.postMessage({type: 'video', modName: mod.info.name, name: variable, payload: imageURL, index: idx}, that.options.controlDomain);
						mod[variable].play();
					});

					label.appendChild(image);

				} else if(controlSet.type === 'image') {
					var image = new Image();
					image.src = mod[variable].src;

					fieldset.addEventListener('dragover', function(e) {
						e.preventDefault();
						this.classList.add('dragover');
					});

					fieldset.addEventListener('dragend', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
					});
						
					fieldset.addEventListener('drop', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
						var file = e.dataTransfer.files[0];
						if (!file || !file.type.match(/image.*/)) return;
						var imageURL = window.URL.createObjectURL(file);
						controllerWindow.window.opener.postMessage({type: 'image', modName: mod.info.name, name: variable, payload: imageURL, index: idx}, that.options.controlDomain);
						image.src = imageURL;
					});

					label.appendChild(image);

				} else if(controlSet.type === 'multiimage') {

					var image = new Image();
					//image.src = mod[variable][0].src;

					fieldset.addEventListener('dragover', function(e) {
						e.preventDefault();
						this.classList.add('dragover');
					});

					fieldset.addEventListener('dragend', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
					});
						
					fieldset.addEventListener('drop', function(e) {
						e.preventDefault();
						var altPressed = e.altKey;
						this.classList.remove('dragover');
						var files = e.dataTransfer.files;
						var images = [];
						for(var i = 0, file; file = files[i]; i++) {
							if (!file || !file.type.match(/image.*/)) continue;
							var imageURL = window.URL.createObjectURL(file);
							image.src = imageURL;
							images.push(imageURL);
						}
						
						controllerWindow.window.opener.postMessage({
							type: 'multiimage',
							modName: mod.info.name,
							name: variable,
							payload: images,
							wipe: altPressed,
							index: idx
						}, that.options.controlDomain);
					});

					label.appendChild(image);
				
				} else if(controlSet.type === 'checkbox') {
					
					var type = 'checkbox';

					var input = document.createElement('input');
					input.type = type;
					input.id = mod.info.name + '-' + variable;

					if('checked' in controlSet) input.checked = controlSet.checked;

					input.addEventListener('change', function() {
						controllerWindow.window.opener.postMessage({
							type: 'variable',
							varType: type,
							modName: mod.info.name,
							name: variable,
							payload: input.checked,
							index: idx
						}, that.options.controlDomain);
					});

					label.appendChild(input);
				
				} else {
					
					var type = controlSet.type;

					var input = document.createElement('input');
					input.type = type;
					input.id = mod.info.name + '-' + variable;

					if('min' in controlSet) input.min = controlSet.min;
					if('max' in controlSet) input.max = controlSet.max;
					if('step' in controlSet) input.step = controlSet.step;
					if(!('varType' in controlSet)) input.varType = 'string';

					if('append' in controlSet) {
						input.value = mod[variable].replace(controlSet.append, '');
					} else {
						input.value = mod[variable];
					}

					mod.info.controls[idx].currValue = mod[variable];
					console.log('cv', mod.info.controls[idx].currValue);

					input.addEventListener('input', function() {
						if('append' in controlSet) {
							var value = (input.value + controlSet.append);
							controllerWindow.window.opener.postMessage({
								type: 'variable',
								varType: controlSet.varType,
								modName: mod.info.name,
								name: variable,
								payload: value,
								index: idx,
								append: controlSet.append
							}, that.options.controlDomain);

							if(that.options.remote) {
								ws.send(JSON.stringify({
									type: 'ui',
									varType: controlSet.varType,
									modName: mod.info.name,
									name: variable,
									payload: value,
									index: idx,
									append: controlSet.append
								}));
							}
						}
						else {
							controllerWindow.window.opener.postMessage({
								type: 'variable',
								varType: controlSet.varType,
								modName: mod.info.name,
								name: variable,
								payload: input.value,
								index: idx
							}, that.options.controlDomain);

							if(that.options.remote) {
								ws.send(JSON.stringify({
									type: 'ui',
									varType: controlSet.varType,
									modName: mod.info.name,
									name: variable,
									payload: input.value,
									index: idx
								}));
							}
						}
					});

					label.appendChild(input);
				}

				fieldset.appendChild(label);
				fieldset.appendChild(document.createElement('br'));
			});

		}
		
		controllerWindow.document.body.appendChild(fieldset);
		
		var registered = registeredMods[mod.info.name] = mod;
		this.setModOrder(mod.info.name, Object.size(registeredMods));
		
		if(this.options.remote) {
			try {
				ws.send({type: 'register', payload: mod.info});
			} catch(e) {
				// Nothing to do here.
			}
		}
		
		return registered;
	};

	this.setModOrder = function(modName, order) {
		if(modOrder[order] === 'undefined') modOrder[order] = modName;
		else {
			var index = -1;
			modOrder.forEach(function(mod, idx) {
				if(modName === mod) index = idx;
			});
			if(index > -1) modOrder.splice(index, 1);
			modOrder.splice(order, 0, modName);
			
			modOrder.forEach(function(mod, idx) {
				registeredMods[mod].info.order = idx;
				var mover = controllerWindow.document.querySelector('fieldset[data-name="' + mod + '"]').getElementsByClassName('mover')[0];
				mover.textContent = idx;
			});
		}
		
		// Reorder DOM elements (ugh ;_;)
		var list = controllerWindow.document.body;
		var items = list.querySelectorAll('fieldset[data-name]');
		var itemsArr = [];
		for (var i in items) {
			if(items[i].nodeType === 1) { // Remove the whitespace text nodes
				itemsArr.push(items[i]);
			}
		}
		
		itemsArr.sort(function(a, b) {
			var aOrder = registeredMods[a.dataset.name].info.order;
			var bOrder = registeredMods[b.dataset.name].info.order;
			
			return aOrder-bOrder;
		});
		
		for(i = 0; i < itemsArr.length; ++i) {
			list.appendChild(itemsArr[i]);
		}
		
		return modOrder;
	};
		
	this.drawFrame = function(meydaOutput) {
		if(!ready) return;
		if(this.clearing) this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for(var i=0; i < modOrder.length; i++) {
			if(typeof registeredMods[modOrder[i]] === 'object') {
				if(registeredMods[modOrder[i]].info.disabled || registeredMods[modOrder[i]].info.alpha === 0) continue;
				this.context.save();
				this.context.globalAlpha = registeredMods[modOrder[i]].info.alpha;
				if(registeredMods[modOrder[i]].info.blend !== 'normal') this.context.globalCompositeOperation = registeredMods[modOrder[i]].info.blend;
				registeredMods[modOrder[i]].draw(this.canvas, this.context, amplitudeArray, video, meydaOutput);
				this.context.restore();
			}
		}
		if(this.options.previewWindow) previewCtx.drawImage(this.canvas, 0, 0, previewCanvas.width, previewCanvas.height);
	};
	
	var myFeatures;

	var loop = function() {
		requestAnimationFrame(loop);
		
		if(meydaSupport && ready) {
			// try {
				myFeatures = that.meyda.get(that.meydaFeatures);
			// } catch(e) {
				// Do nothing!
			// }
		}
		
		that.drawFrame(myFeatures);
	};

	this.start = function() {
		if(that.options.remote && !remoteSuccess) {
			console.group('WebSocket Logs');
			console.log('Websocket not connected yet, waiting for connection to start.');
			setTimeout(this.start, 1000);
			console.groupEnd();
		} else if(that.options.remote) {
			for(var mod in registeredMods) {
				ws.send(JSON.stringify({type: 'register', payload: registeredMods[mod].info}));
			}
			requestAnimationFrame(loop);
		} else {
			requestAnimationFrame(loop);
		}
	};
};