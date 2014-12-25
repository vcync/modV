var modV = function(options) {
	(function() {
	    var lastTime = 0;
	    var vendors = ['ms', 'moz', 'webkit', 'o'];
	    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
	                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
	    }
	 
	    if (!window.requestAnimationFrame)
	        window.requestAnimationFrame = function(callback, element) {
	            var currTime = new Date().getTime();
	            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
	              timeToCall);
	            lastTime = currTime + timeToCall;
	            return id;
	        };
	 
	    if (!window.cancelAnimationFrame)
	        window.cancelAnimationFrame = function(id) {
	            clearTimeout(id);
	        };
	}());
	
	// Helpful!
	
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
		console.log(needle, arrhaystack);
	    return (arrhaystack.indexOf(needle) > -1);
	}

	var modOrder = [],
		registeredMods = {},
		that = this,
		video = document.createElement('video'),
		meydaSupport = false;
		
	this.meyda;
	this.meydaFeatures = [];
	
	this.addMeydaFeature = function(feature) {
		if(!Array.contains(feature, that.meydaFeatures)) {
			that.meydaFeatures.push(feature);
			return true;
		} else return false;
	};
	
	// Check for Meyda
	if(typeof window.Meyda == 'function') {
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
	
	// Setup window control
	
	if(!this.options.controlDomain) this.options.controlDomain = location.protocol + "//" + location.host;
	
	window.addEventListener("message", receiveMessage, false);
	
	function receiveMessage(event) {
		if(event.origin !== that.options.controlDomain) return;
		
		console.log(event.data);
		
		if(event.data.type == 'variable') {
			var variable;
			switch(event.data.varType) {
				case 'float':
					variable = parseFloat(event.data.payload);
					break;
					
				case 'int':
					variable = parseInt(event.data.payload);
					break;
					
				default:
					variable = event.data.payload;
			}
			registeredMods[event.data.modName][event.data.name] = variable;
		}
		
		if(event.data.type == 'image') {
			registeredMods[event.data.modName][event.data.name].src = event.data.payload;
		}
		
		if(event.data.type == 'video') {
			registeredMods[event.data.modName][event.data.name].src = event.data.payload;
			registeredMods[event.data.modName][event.data.name].load();
			registeredMods[event.data.modName][event.data.name].play();
		}

		if(event.data.type == 'multiimage') {
			if(event.data.wipe) registeredMods[event.data.modName][event.data.name].length = 0;
			event.data.payload.forEach(function(file) {
		    	var newImage = new Image();
		    	newImage.src = file;
				registeredMods[event.data.modName][event.data.name].push(newImage);
			});
		}
		
		if(event.data.type == 'modBlend') {
			registeredMods[event.data.modName].info.blend = event.data.payload;
		}
		
		if(event.data.type == 'modOpacity') {
			registeredMods[event.data.modName].info.alpha = event.data.payload;
		}
		
		if(event.data.type == 'setOrderUp') {
			var index = -1;
			modOrder.forEach(function(mod, idx) {
				if(event.data.modName == mod) index = idx;
			});
			if(index > 0) {
				index -= 1;
				that.setModOrder(event.data.modName, index);
			}
		}
		
		if(event.data.type == 'setOrderFromElements') {
			var index = -1;
			modOrder.forEach(function(mod, idx) {
				if(event.data.y == mod) index = idx;
			});
			
			if(index > 0) {
				that.setModOrder(event.data.x, index);
			}	
		}
		
		if(event.data.type == 'check') {
			if(!event.data.payload) {
				registeredMods[event.data.modName].info.disabled = true;
			} else {
				registeredMods[event.data.modName].info.disabled = false;
			}
		}
		
		if(event.data.type == 'global') {
			if(event.data.name == 'clearing') {
				if(event.data.payload) {
					that.clearing = true;
				} else {
					that.clearing = false;
				}
			}
		}
	}
	var controllerWindow = window.open('',
									   '_blank',
									   'width=' + (1440/100)*33.4 + ', height=' + screen.height + ', location=yes, menubar=yes, left=' + (screen.width/100)*66.6);
	
	var drunkenMess = function(e) {
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
	
	var stylesheet = document.createElement('link');
	stylesheet.type = 'text/css';
	stylesheet.rel = 'stylesheet';
	stylesheet.href = 'http://brkbrkbrk.com/dev/modV/control-stylesheet.css';
	controllerWindow.document.getElementsByTagName('head')[0].appendChild(stylesheet);
	
	controllerWindow.window.receiveMessage = function(event) {
		if(event.origin !== this.options.domain) return;
		
	};
	controllerWindow.window.addEventListener("message", controllerWindow.window.receiveMessage, false);
	
	window.addEventListener('beforeunload', function() {
		try {
			controllerWindow.close();
			previewWindow.close();
		} catch(e) {
			// oops window not found.
		}
	}, false);

	// Global Variables for Audio
	var audioContext 	= undefined,
		audioBuffer 	= undefined,
		sourceNode 		= undefined,
		analyserNode 	= undefined,
		javascriptNode 	= undefined,
		audioData 		= null,
		audioPlaying 	= false,
		sampleSize 		= 1024,  		// number of samples to collect before analysing data
		amplitudeArray 	= [],			// array to hold time data
		aCtx 			= undefined,
		analyser 		= undefined,
		microphone 		= undefined,
		gainNode 		= undefined,
		muted 			= true,
		ready 			= false;

		navigator.getUserMedia 	= navigator.getUserMedia 		 ||
						 			navigator.webkitGetUserMedia ||
						 			navigator.mozGetUserMedia 	 ||
						 			navigator.msGetUserMedia 	 ||
						 			navigator.oGetUserMedia;
	
	/* Turn all this stuff off or we'll get a really bad audio input when also using video */
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
	
	navigator.getUserMedia(contraints, function(stream) {
		
		// Do Video
		
		video.src = window.webkitURL.createObjectURL(stream);
		
		aCtx = new window.AudioContext();
		analyser = aCtx.createAnalyser();

		javascriptNode = aCtx.createScriptProcessor(sampleSize, 1, 1);

		javascriptNode.onaudioprocess = function () {
			analyser.getByteTimeDomainData(amplitudeArray);
		};
		gainNode = aCtx.createGain();
		gainNode.gain.value = 0;

		microphone = aCtx.createMediaStreamSource(stream);
		microphone.connect(gainNode);
		gainNode.connect(aCtx.destination);
		
		if(meydaSupport) that.meyda = new Meyda(aCtx, microphone, 512);

		microphone.connect(analyser);
		analyser.connect(javascriptNode);
		javascriptNode.connect(aCtx.destination);
		FFTData = new Uint8Array(analyser.frequencyBinCount);
		amplitudeArray = FFTData;
		ready = true;
	}, function() {
		console.log('Error setting up WebAudio - please make sure you\'ve allowed modV access.');
	});

	this.canvas = undefined;
	this.clearing = true;

	this.setCanvas = function(el) {
		if(el.nodeName != "CANVAS") {
			console.error('modV: setCanvas was not supplied with a CANVAS element.');
			return false;
		}
		this.canvas = el;
		this.context = el.getContext('2d');
		window.addEventListener('resize', function() {
			that.canvas.width = window.innerWidth;
			that.canvas.height = window.innerHeight;
			for(mod in registeredMods) {
				if(typeof mod.init == 'function') mod.init(that.canvas, that.context);
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
	
	// Add global settings
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
		var oldColour = null;
		
		fieldset.addEventListener('drop', function(e) {
			e.preventDefault();
			var target = getClosest(e.target, 'fieldset');
			target.style.backgroundColor = 'white';
			console.log(target);
			
			var targetdata = target.dataset.name;
			
			var data = e.dataTransfer.getData("text");
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

		var br = document.createElement('br');

		var checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = false;
		checkbox.addEventListener('change', function() {
			controllerWindow.window.opener.postMessage({type: 'check', modName: mod.info.name, payload: this.checked}, that.options.controlDomain);
			
		});

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
		
		var label = document.createElement('label');
		label.textContent = 'Opacity ';

		opacityInput.min = 0;
		opacityInput.max = 1;
		opacityInput.step = 0.01;
		opacityInput.value = mod.info.alpha;
		
		opacityInput.addEventListener('input', function() {
			controllerWindow.window.opener.postMessage({type: 'modOpacity', modName: mod.info.name, payload: this.value}, that.options.controlDomain);
		});
		
		label.appendChild(opacityInput);
		fieldset.appendChild(label);
		fieldset.appendChild(document.createElement('br'));
		
		// Add Blending options
		var blendCompSelect = genBlendModeOps();
		var label = document.createElement('label');
		label.textContent = 'Blending ';
		
		blendCompSelect.addEventListener('change', function() {
			controllerWindow.window.opener.postMessage({type: 'modBlend', modName: mod.info.name, payload: this.value}, that.options.controlDomain);
		});
		
		label.appendChild(blendCompSelect);
		fieldset.appendChild(label);
		fieldset.appendChild(document.createElement('br'));
		
		var mover = document.createElement('div');
		mover.classList.add('mover');
		// Delete this:
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
			
			e.dataTransfer.setData("text", e.target.parentNode.dataset.name);
			
		}, false);
		
		mover.addEventListener('dragend', function(e) {
			//console.log(e.target);
			//e.dataTransfer.setData("text", e.target.parentNode.dataset.name);
			
		}, false);
		fieldset.appendChild(mover);
		

		// Register controls
		if('controls' in mod.info) {

			mod.info.controls.forEach(function(controlSet) {
				var variable = controlSet.variable;
				var label = document.createElement('label');
				var labelText = controlSet.label;
				label.textContent = labelText + ' ';
				
				
				fieldset.appendChild(document.createElement('hr'));
				
				if(controlSet.type == 'video') {
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
						controllerWindow.window.opener.postMessage({type: 'video', modName: mod.info.name, name: variable, payload: imageURL}, that.options.controlDomain);
						mod[variable].play();
				    });

				    label.appendChild(image);

				} else if(controlSet.type == 'image') {
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
						controllerWindow.window.opener.postMessage({type: 'image', modName: mod.info.name, name: variable, payload: imageURL}, that.options.controlDomain);
						image.src = imageURL;
				    });

				    label.appendChild(image);

				} else if(controlSet.type == 'multiimage') {

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
						
						controllerWindow.window.opener.postMessage({type: 'multiimage', modName: mod.info.name, name: variable, payload: images, wipe: altPressed}, that.options.controlDomain);
				    });

				    label.appendChild(image);
				
				} else if(controlSet.type == 'checkbox') {
					
					var type = 'checkbox';

					var input = document.createElement('input');
					input.type = type;

					if('checked' in controlSet) input.checked = controlSet.checked;

					input.addEventListener('change', function() {
						controllerWindow.window.opener.postMessage({type: 'variable',
																	varType: controlSet.varType,
																	modName: mod.info.name,
																	name: variable,
																	payload: input.checked
						}, that.options.controlDomain);
					});

					label.appendChild(input);
				
				} else {
					
					var type = controlSet.type;

					var input = document.createElement('input');
					input.type = type;

					if('min' in controlSet) input.min = controlSet.min;
					if('max' in controlSet) input.max = controlSet.max;
					if('step' in controlSet) input.step = controlSet.step;
					if(!('varType' in controlSet)) input.varType = 'string';
					input.value = mod[variable];

					input.addEventListener('input', function() {
						if('append' in controlSet) {
							var value = (input.value + controlSet.append);
							controllerWindow.window.opener.postMessage({type: 'variable', varType: controlSet.varType, modName: mod.info.name, name: variable, payload: value}, that.options.controlDomain);
						}
						else {
							controllerWindow.window.opener.postMessage({type: 'variable', varType: controlSet.varType, modName: mod.info.name, name: variable, payload: input.value}, that.options.controlDomain);
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
				
		return registered;
	};

	this.setModOrder = function(modName, order) {
		if(modOrder[order] == 'undefined') modOrder[order] = modName;
		else {
			var index = -1;
			modOrder.forEach(function(mod, idx) {
				if(modName == mod) index = idx;
			});
			if(index > -1) modOrder.splice(index, 1);
			modOrder.splice(order, 0, modName);
			
			var newOrder = null;
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
			if(items[i].nodeType == 1) { // Remove the whitespace text nodes
				itemsArr.push(items[i]);
			}
		}
		
		itemsArr.sort(function(a, b) {
			var aOrder = registeredMods[a.dataset.name].info.order;
			var bOrder = registeredMods[b.dataset.name].info.order;
			
			return aOrder-bOrder
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
				if(registeredMods[modOrder[i]].info.disabled || registeredMods[modOrder[i]].info.alpha == 0) continue;
				this.context.save();
				this.context.globalAlpha = registeredMods[modOrder[i]].info.alpha;
				if(registeredMods[modOrder[i]].info.blend != 'normal') this.context.globalCompositeOperation = registeredMods[modOrder[i]].info.blend;
				registeredMods[modOrder[i]].draw(this.canvas, this.context, amplitudeArray, video, meydaOutput);
				this.context.restore();
			}
		}
		if(this.options.previewWindow) previewCtx.drawImage(this.canvas, 0, 0, previewCanvas.width, previewCanvas.height);
	};
	
	var myFeatures;

	var animate = function() {
		requestAnimationFrame(animate);
		if(meydaSupport && ready) {
			try {
				myFeatures = that.meyda.get(that.meydaFeatures);
			} catch(e) {
				// Do nothing!
			}
		}
		that.drawFrame(myFeatures);
	};

	this.start = function() {
		requestAnimationFrame(animate);
	};
};