(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var modV = require('./modV');
var modV = require('./modV-messageHandler');
var modV = require('./modV-ContainerGenerator');
var modV = require('./modV-windowControl');
var modV = require('./modV-drawLoop');
var modV = require('./modV-setmodOrder');
var modV = require('./modV-genBlendModeOps');
var modV = require('./modV-registerMod');
var modV = require('./modV-factoryReset');
var modV = require('./modV-webSockets');
},{"./modV":13,"./modV-ContainerGenerator":2,"./modV-drawLoop":3,"./modV-factoryReset":4,"./modV-genBlendModeOps":5,"./modV-messageHandler":6,"./modV-registerMod":8,"./modV-setmodOrder":10,"./modV-webSockets":11,"./modV-windowControl":12}],2:[function(require,module,exports){
(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	// from here: http://stackoverflow.com/questions/18663941/finding-closest-element-without-jquery
	function getClosestWithClass(el, tag, classN) {
		tag = tag.toUpperCase();
		do {
			if (el.nodeName === tag && el.classList.contains(classN)) {
				return el;
			}
		} while (el = el.parentNode); // jshint ignore:line
	
		return false;
	}

	modV.prototype.ContainerGenerator = function(title, movable) {
		var self = this;

		var contTitle = title;
		var thatIn = self;

		self.div = document.createElement('div');
		self.div.classList.add('module');
		
		var header = document.createElement('header');
		var headerTxt = document.createTextNode(contTitle);

		var mover = document.createElement('div');
		mover.classList.add('mover');

		mover.draggable = true;
		mover.addEventListener('dragstart', function(e) {
			
			e.dataTransfer.setData('text', e.target.parentNode.parentNode.dataset.name);
			
		}, false);

		header.appendChild(headerTxt);

		if(movable) {
			header.appendChild(mover);

			self.div.addEventListener('drop', function(e) {
				e.preventDefault();
				var target = getClosestWithClass(e.target, 'div', 'module');
				target.style.backgroundColor = 'white';
				console.log(target);
				
				var targetdata = target.dataset.name;
				
				var data = e.dataTransfer.getData('text');
				var nodeToMove = modV.controllerWindow.document.querySelector('div.module[data-name="' + data + '"]');
				nodeToMove.parentNode.insertBefore(nodeToMove, target);
				
				modV.controllerWindow.window.opener.postMessage({type: 'setOrderFromElements', x: data, y: targetdata}, modV.options.controlDomain);
				
				console.log(nodeToMove);
			}, false);

			var relatedTarget;
			
			self.div.addEventListener('dragover', function(e) {
				e.preventDefault();
				relatedTarget = getClosestWithClass(e.target, 'div', 'module');
				
				try {
					relatedTarget.style.backgroundColor = 'green';
				} catch(err) {
					
				}
			}, false);
			
			self.div.addEventListener('dragleave', function(e) {
				e.preventDefault();
				relatedTarget.style.backgroundColor = 'white';
				
				//elem.parentNode.insertBefore(nodeToMove, );
			}, false);

		}

		self.div.appendChild(header);

		var elements = [];

		self.addInput = function(id, title, type, valueName, value, event, callback) {

			var element = document.createElement('input');
			element.type = type;

			if(valueName instanceof Array) {

				valueName.forEach(function(valueN, idx) {
					element[valueN] = value[idx];
				});

			} else {
				element[valueName] = value;
			}

			element.addEventListener(event, callback);
			element.id = contTitle + '-' + id;

			var container = document.createElement('div');
			container.classList.add('pure-g');

			var left = document.createElement('div');
			left.classList.add('pure-u-1-5');

			var label = document.createElement('label');
			label.setAttribute('for', contTitle + '-' + id);
			label.textContent = title;

			left.appendChild(label);

			var right = document.createElement('div');
			right.classList.add('pure-u-4-5');
			right.appendChild(element);

			container.appendChild(left);
			container.appendChild(right);

			elements.push(container);

		};

		self.addSpecial = function(element) {

			var container = document.createElement('div');
			container.classList.add('pure-g');

			var div = document.createElement('div');
			div.classList.add('pure-u-1-1');

			container.appendChild(div);
			div.appendChild(element);

			elements.push(container);

		};

		self.output = function() {
			elements.forEach(function(block) {
				thatIn.div.appendChild(block);
			});

			return self.div;
		};
	};

})(module);
},{}],3:[function(require,module,exports){
(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.drawFrame = function(meydaOutput, delta) {
		var self = this;
		

		if(!modV.ready) return;
		if(modV.clearing) {
			console.log('clearing');
			modV.context.clearRect(0, 0, modV.canvas.width, modV.canvas.height);
		}
		for(var i=0; i < modV.modOrder.length; i++) {
			if(typeof modV.registeredMods[modV.modOrder[i]] === 'object') {

				if(modV.registeredMods[modV.modOrder[i]].info.disabled || modV.registeredMods[modV.modOrder[i]].info.alpha === 0) continue;
				modV.context.save();
				modV.context.globalAlpha = modV.registeredMods[modV.modOrder[i]].info.alpha;

				if(modV.registeredMods[modV.modOrder[i]].info.blend !== 'normal') modV.context.globalCompositeOperation = modV.registeredMods[modV.modOrder[i]].info.blend;

				if(!modV.registeredMods[modV.modOrder[i]].info.threejs) {

					modV.registeredMods[modV.modOrder[i]].draw(modV.canvas, modV.context, modV.amplitudeArray, modV.video, meydaOutput, delta);

				} else {

					modV.registeredMods[modV.modOrder[i]].draw(modV.canvas, modV.context, modV.amplitudeArray, modV.video, meydaOutput, delta);
					modV.context.drawImage(modV.threejs.canvas, 0, 0);
					modV.threejs.renderer.render(modV.threejs.scene, modV.threejs.camera);
				}
				modV.context.restore();
			}
		}
		if(modV.options.previewWindow) previewCtx.drawImage(modV.canvas, 0, 0, previewCanvas.width, previewCanvas.height);
	};

	modV.prototype.loop = function(timestamp) {
		var self = this;

		requestAnimationFrame(modV.loop);

		if(!modV.meydaSupport) modV.myFeatures = [];
		
		if(modV.ready) {
			
			if(modV.meydaSupport && modV.reallyReady) {
				modV.myFeatures = modV.meyda.get(modV.meydaFeatures);
				//bd_med.process((timestamp / 1000.0), modV.myFeatures.complexSpectrum.real);
				//modV.bpm = bd_med.win_bpm_int_lo;
			} else {
				//modV.context.clearRect(0, 0, modV.canvas.width, modV.canvas.height);
				modV.reallyReady = true;
			}

		} else {
			modV.context.clearRect(0, 0, modV.canvas.width, modV.canvas.height);
			var text = 'Please allow popups and share your media inputs.';
			var font = modV.context.font =  72 + 'px "Helvetica", sans-serif';
			modV.context.textAlign = 'left';
			modV.context.fillStyle = 'hsl(' + timestamp / 10 + ', 100%, 50%)';
			var w = modV.context.measureText(text).width;

			if(!modV.options.retina) font = modV.context.font =  36 + 'px "Helvetica", sans-serif';
			w = modV.context.measureText(text).width;

			modV.context.fillText(text, modV.canvas.width/2 - w/2, modV.canvas.height/2 + 36);

			text = 'Check the docs at http://modv.readme.io/ for more info.';
			font = modV.context.font =  42 + 'px "Helvetica", sans-serif';
			modV.context.textAlign = 'left';
			modV.context.fillStyle = 'hsl(' + timestamp / 10 + ', 100%, 50%)';
			w = modV.context.measureText(text).width;

			if(!modV.options.retina) font = modV.context.font =  20 + 'px "Helvetica", sans-serif';
			w = modV.context.measureText(text).width;

			modV.context.fillText(text, modV.canvas.width/2 - w/2, modV.canvas.height/2 + 36 + 72);
		}

		modV.drawFrame(modV.myFeatures, timestamp);
	};

})(module);
},{}],4:[function(require,module,exports){
(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.factoryReset = function() {
		for(var mod in modV.registeredMods) {
			var m = modV.registeredMods[mod];
			
			m.info.disabled = true;
			m.info.blend = 'normal';

			modV.controllerWindow.postMessage({
				type: 'ui-enabled',
				modName: m.info.name,
				payload: false
			}, modV.options.controlDomain);

			m.defaults.forEach(function(control, idx) {
				var val = control.currValue;

				if(control.type === 'image' || control.type === 'multiimage' || control.type === 'video') return;
				
				if('append' in control) {
					val = val.replace(control.append, '');
				}

				var id = m.name + '-' + control.variable;

				modV.controllerWindow.postMessage({
					type: 'ui',
					varType: control.type,
					modName: m.info.name,
					name: control.label,
					payload: val
				}, modV.options.controlDomain);

				// If we have a WebSocket server, send the reset
				if(modV.options.remote) {
					modV.ws.send(JSON.stringify({
						type: 'ui',
						varType: control.type,
						modName: m.info.name,
						name: control.label,
						payload: val,
						index: idx
					}));
				}

				if('append' in control) {
					val = val + control.append;
				}

				modV.registeredMods[mod][control.variable] = val;

			});

		}

		// Clear the screen
		modV.context.clearRect(0, 0, modV.canvas.width, modV.canvas.height);
	};

})(module);
},{}],5:[function(require,module,exports){
(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.genBlendModeOps = function() {
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
	};

})(module);
},{}],6:[function(require,module,exports){
(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

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
	
	
	/* Handles ALL controls, popup windows and websocket remote controls */
	modV.prototype.receiveMessage = function(event, websocket) {
		if(event.origin !== modV.options.controlDomain && !websocket) return;
		var index;
		if(event.data.type === 'variable') {
			
			// Parse Variable
			var variable = parseVar(event.data.varType, event.data.payload);
			
			// Set variable value
			if('append' in event.data) {
				modV.registeredMods[event.data.modName][event.data.name] = variable + event.data.append;
			} else {
				modV.registeredMods[event.data.modName][event.data.name] = variable;
			}
			
			// Set current value for preset purposes
			modV.registeredMods[event.data.modName].info.controls[event.data.index].currValue = variable;
			
			// Websocket message? Update the UI
			if(websocket) {
				var payload = event.data.payload;
				
				if('append' in event.data) {
					payload = payload.replace(event.data.append, '');
				}
								
				modV.controllerWindow.postMessage({
					type: 'ui',
					varType: event.data.varType,
					modName: event.data.modName,
					name: event.data.name,
					payload: payload,
					index: event.data.index
				}, modV.options.controlDomain);
			}
		}
		
		if(event.data.type === 'image') {
			modV.registeredMods[event.data.modName][event.data.name].src = event.data.payload;
		}
		
		if(event.data.type === 'video') {
			modV.registeredMods[event.data.modName][event.data.name].src = event.data.payload;
			modV.registeredMods[event.data.modName][event.data.name].load();
			modV.registeredMods[event.data.modName][event.data.name].play();
		}

		if(event.data.type === 'multiimage') {
			if(event.data.wipe) modV.registeredMods[event.data.modName][event.data.name].length = 0;
			event.data.payload.forEach(function(file) {
				var newImage = new Image();
				newImage.src = file;
				modV.registeredMods[event.data.modName][event.data.name].push(newImage);
			});
		}
		
		if(event.data.type === 'modBlend') {
			modV.registeredMods[event.data.modName].info.blend = event.data.payload;

			// Websocket message? Update the UI
			if(websocket) {
				modV.controllerWindow.postMessage({
					type: 'ui-blend',
					modName: event.data.modName,
					payload: event.data.payload
				}, modV.options.controlDomain);
				console.log(event.data);
			}
		}
		
		if(event.data.type === 'modOpacity') {
			modV.registeredMods[event.data.modName].info.alpha = event.data.payload;

			// Websocket message? Update the UI
			if(websocket) {
				modV.controllerWindow.postMessage({
					type: 'ui-opacity',
					modName: event.data.modName,
					payload: event.data.payload
				}, modV.options.controlDomain);
				console.log(event.data);
			}
		}
		
		if(event.data.type === 'setOrderUp') {
			index = -1;
			modV.modOrder.forEach(function(mod, idx) {
				if(event.data.modName === mod) index = idx;
			});
			if(index > 0) {
				index -= 1;
				modV.setModOrder(event.data.modName, index);
			}
		}
		
		if(event.data.type === 'setOrderFromElements') {
			index = -1;
			modV.modOrder.forEach(function(mod, idx) {
				if(event.data.y === mod) index = idx;
			});
			
			if(index > 0) {
				modV.setModOrder(event.data.x, index);
			}
		}
		
		if(event.data.type === 'check') {
			if(!event.data.payload) {
				modV.registeredMods[event.data.modName].info.disabled = true;
			} else {
				modV.registeredMods[event.data.modName].info.disabled = false;
			}

			// Websocket message? Update the UI
			if(websocket) {
				modV.controllerWindow.postMessage({
					type: 'ui-enabled',
					modName: event.data.modName,
					payload: event.data.payload
				}, modV.options.controlDomain);
			}
		}
		
		if(event.data.type === 'global') {
			if(event.data.name === 'clearing') {
				if(event.data.payload) {
					modV.clearing = true;
				} else {
					modV.clearing = false;
				}
			}
			
			if(event.data.name === 'mute') {
				if(event.data.payload) {
					modV.gainNode.gain.value = 0;
				} else {
					modV.gainNode.gain.value = 1;
				}
			}
			
			if(event.data.name === 'savepreset') {
				var preset = {};
				
				for (var mod in modV.registeredMods) {
					preset[mod] = modV.registeredMods[mod].info;
				}
				
				modV.presets[event.data.payload.name] = preset;
				localStorage.setItem('presets', JSON.stringify(modV.presets));
				console.info('Wrote preset with name:', event.data.payload.name);

				// update preset list in controls window (TODO: THE SAME FOR WEBSOCKET)
			}

			if(event.data.name === 'loadpreset') {
				modV.loadPreset(event.data.payload.name);
				// load preset (TODO: THE SAME FOR WEBSOCKET)
			}

			if(event.data.name === 'factory-reset') {
				modV.factoryReset();
			}
		}
	};

	window.addEventListener('message', modV.prototype.receiveMessage, false);

})(module);
},{}],7:[function(require,module,exports){
// var modV = function (options) {
	
// 	function factoryReset() {
// 		for(var mod in registeredMods) {
// 			var m = registeredMods[mod];
			
// 			m.info.disabled = true;

// 			controllerWindow.postMessage({
// 				type: 'ui-enabled',
// 				modName: m.info.name,
// 				payload: false
// 			}, that.options.controlDomain);

// 			m.defaults.forEach(function(control, idx) {
// 				var val = control.currValue;

// 				if(control.type === 'image' || control.type === 'multiimage') return;
				
// 				if('append' in control) {
// 					val = val.replace(control.append, '');
// 				}

// 				id = m.name + '-' + control.variable;

// 				controllerWindow.postMessage({
// 					type: 'ui',
// 					varType: control.type,
// 					modName: m.info.name,
// 					name: control.label,
// 					payload: val,
// 					index: m.info.order
// 				}, that.options.controlDomain);

// 				// If we have a WebSocket server, send the reset
// 				if(that.options.remote) {
// 					ws.send(JSON.stringify({
// 						type: 'ui',
// 						varType: control.type,
// 						modName: m.info.name,
// 						name: control.label,
// 						payload: val,
// 						index: m.info.order
// 					}));
// 				}

// 				if(control.append) {
// 					val = val + control.append;
// 				}

// 				registeredMods[mod][control.variable] = val;

// 			});

// 		}
// 	}

// 	var bots = {};

// 	var modVBot = function(module) {
	
// 		function bpmToMs(bpm) {
// 			console.log(bpm);
// 			return (60000 / bpm);
// 		}

// 		function randomIntFromRange(min, max) {
// 			return Math.floor(Math.random()*(max-min+1)+min);
// 		}

// 		function randomFloatFromRange(min, max) {
// 			return Math.random()*(max-min+1)+min;
// 		}

// 		var interval = bpmToMs(that.bpm);

// 		function loop() {
// 			for(var cntrl in module.info.controls) {
// 				var control = module.info.controls[cntrl];

// 				if(control.type === 'checkbox') {

// 					module[control.variable] = !Math.round(Math.random());

// 				} else if(control.type !== 'video' && control.type !== 'image' && control.type !== 'multiimage') {

// 					var rand;

// 					switch(control.varType) {
// 						case 'int':
// 							rand = randomIntFromRange(control.min, control.max);

// 							if('append' in control) {
// 								module[control.variable] = rand + control.append;
// 							} else {
// 								module[control.variable] = rand;
// 							}

// 							break;

// 						case 'float':
// 							rand = randomFloatFromRange(control.min, control.max);

// 							if('append' in control) {
// 								module[control.variable] = rand + control.append;
// 							} else {
// 								module[control.variable] = rand;
// 							}

// 							break;

// 						default:
// 							rand = String.fromCharCode(0x30A0 + Math.random() * (0x30FF-0xFFFF+1));

// 							if('append' in control) {
// 								module[control.variable] = rand + control.append;
// 							} else {
// 								module[control.variable] = rand;
// 							}

// 							break;
// 					}

// 					controllerWindow.postMessage({
// 					 	type: 'ui',
// 					 	varType: control.varType,
// 					 	modName: module.info.name,
// 					 	name: control.label,
// 					 	payload: rand,
// 					 	index: module.info.order
// 					}, that.options.controlDomain);
// 				}

// 			}

// 			if(that.bpm === 0) {
// 				interval = 1000;
// 				console.log('No BPM yet', that.bpm);
// 			} else {
// 				interval = bpmToMs(that.bpm);
// 			}
// 		}

// 		if(that.bpm === 0) interval = 1000;
// 		var timer = setInterval(loop, interval);

// 		this.removeBot = function() {
// 			clearInterval(timer);
// 		};
// 	};

// 	this.attachBot = function(module) {
// 		var mod = registeredMods[module];
// 		var bot = new modVBot(mod);
// 		bots[mod.info.name] = bot;
// 	};

// 	this.removeBot = function(module) {
// 		var mod = registeredMods[module];
// 		if(!bots[mod.info.name]) return false; // No bot
// 		bots[mod.info.name].removeBot();
// 		delete bots[mod.info.name];
// 		return true; // There was a bot, it has now been deleted
// 	};

// 	// from here: http://stackoverflow.com/questions/18663941/finding-closest-element-without-jquery
// 	function getClosestWithClass(el, tag, classN) {
// 		tag = tag.toUpperCase();
// 		do {
// 			if (el.nodeName === tag && el.classList.contains(classN)) {
// 				return el;
// 			}
// 		} while (el = el.parentNode);
	
// 		return false;
// 	}
	
// 	// from here: http://stackoverflow.com/questions/5223/length-of-a-javascript-object-that-is-associative-array
// 	Object.size = function(obj) {
// 		var size = 0, key;
// 		for (key in obj) {
// 			if (obj.hasOwnProperty(key)) size++;
// 		}
// 		return size;
// 	};
	
// 	// based on: http://stackoverflow.com/questions/6116474/how-to-find-if-an-array-contains-a-specific-string-in-javascript-jquery
// 	Array.contains = function(needle, arrhaystack) {
// 		return (arrhaystack.indexOf(needle) > -1);
// 	};
	
// 	navigator.getUserMedia = navigator.getUserMedia 	  ||
// 							 navigator.webkitGetUserMedia ||
// 							 navigator.mozGetUserMedia 	  ||
// 							 navigator.msGetUserMedia 	  ||
// 							 navigator.oGetUserMedia;
	
// 	var modOrder = [],
// 		registeredMods = {},
// 		that = this,
// 		video = document.createElement('video'),
// 		meydaSupport = false,
// 		muted = true,
// 		ws; // WebSocket

// 	this.loadPreset = function(id) {
// 		console.log(id);
// 		factoryReset();

// 		for(var mod in this.presets[id]) {

// 			var m = this.presets[id][mod];
			
// 			if('controls' in m) {
// 				m.controls.forEach(function(control, idx) {
// 					var val = control.currValue;
					
// 					if('append' in control) {
// 						if(typeof val === 'string') {
// 							val = val.replace(control.append, '');
// 						} else {
// 							val = val.toString();
// 							val = val.replace(control.append, '');
// 						}
// 					}

// 					if(control.type === 'image' || control.type === 'multiimage' || control.type === 'video') return;

// 					controllerWindow.postMessage({
// 						type: 'ui',
// 						varType: control.type,
// 						modName: m.name,
// 						name: control.label,
// 						payload: val,
// 						index: m.order
// 					}, that.options.controlDomain);

// 					controllerWindow.postMessage({
// 						type: 'ui-enabled',
// 						modName: m.name,
// 						payload: !m.disabled
// 					}, that.options.controlDomain);

// 					if(control.append) {
// 						val = val + control.append;
// 					}

// 					registeredMods[mod][control.variable] = val;

// 				});
// 			}
// 			console.log(m);
// 			//registeredMods[mod].info = m;
// 			registeredMods[mod].info.blend = m.blend;
// 			registeredMods[mod].info.disabled = m.disabled;
			
// 			console.log(m.name, 'now @ ', this.setModOrder(m.name, m.order));

// 		}
// 	};

// 	// Lookup presets
// 	if(!localStorage.getItem('presets')) {
// 		localStorage.setItem('presets', JSON.stringify({}));
// 		this.presets = {};
// 	} else {
// 		this.presets = JSON.parse(localStorage.getItem('presets'));
// 		for(var presetname in this.presets) {
// 			console.log('Successfuly read saved preset with name:', presetname);
// 		}
// 	}
	
// 	// Global Variables for Audio
// 	var javascriptNode,
// 		sampleSize 		= 1024,  		// number of samples to collect before analysing data
// 		amplitudeArray 	= [],			// array to hold time data
// 		aCtx,
// 		analyser,
// 		microphone,
// 		gainNode,
// 		ready 			= false;

// 	this.meydaFeatures = ['complexSpectrum'];
	
// 	this.addMeydaFeature = function(feature) {
// 		if(!Array.contains(feature, that.meydaFeatures)) {
// 			that.meydaFeatures.push(feature);
// 			return true;
// 		} else return false;
// 	};
	
// 	// Check for Meyda
// 	if(typeof window.Meyda === 'function') {
// 		meydaSupport = true;
// 		console.info('meyda detected, expanded audio analysis available.', 'Use this.meyda to access from console.');
// 	}

// 	// Check for THREE
// 	if(typeof window.THREE === 'object') {
// 		this.threejs = {
// 			scene: new THREE.Scene(),
// 			camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
// 			renderer: null
// 		};

// 		console.log(this.threejs);
// 	}
	
// 	video.autoplay = true;
// 	video.muted = true;
	
// 	// Save user options
// 	if(typeof options !== 'undefined') this.options = options;
// 	else this.options = {};
	
// 	// Function to create blend mode options
// 	function genBlendModeOps() {
// 		var selectEl = document.createElement('select');
// 		var blends = [
// 			'normal',
// 			'multiply',
// 			'overlay',
// 			'darken',
// 			'lighten',
// 			'color-dodge',
// 			'color-burn',
// 			'hard-light',
// 			'soft-light',
// 			'difference',
// 			'exclusion',
// 			'hue',
// 			'saturation',
// 			'color',
// 			'luminosity'
// 		];
		
// 		var modes = [
// 			'clear',
// 			'copy',
// 			'destination',
// 			'source-over',
// 			'destination-over',
// 			'source-in',
// 			'destination-in',
// 			'source-out',
// 			'destination-out',
// 			'source-atop',
// 			'destination-atop',
// 			'xor',
// 			'lighter'
// 		];
		
// 		var blendsOptgroup = document.createElement('optgroup');
// 		blendsOptgroup.label = 'Blend Modes';
		
// 		blends.forEach(function(blend) {
// 			var option = document.createElement('option');
// 			option.value = blend;
// 			option.textContent = blend.replace('-', ' ');
// 			option.textContent = option.textContent.charAt(0).toUpperCase() + option.textContent.slice(1);
// 			blendsOptgroup.appendChild(option);
// 		});
		
// 		var modesOptgroup = document.createElement('optgroup');
// 		modesOptgroup.label = 'Composite Modes';
		
// 		modes.forEach(function(mode) {
// 			var option = document.createElement('option');
// 			option.value = mode;
// 			option.textContent = mode.replace('-', ' ');
// 			option.textContent = option.textContent.charAt(0).toUpperCase() + option.textContent.slice(1);
// 			modesOptgroup.appendChild(option);
// 		});
		
// 		selectEl.appendChild(blendsOptgroup);
// 		selectEl.appendChild(modesOptgroup);
// 		return selectEl;
// 	}
	
// 	// Setup window control
	
// 	if(!this.options.controlDomain) this.options.controlDomain = location.protocol + '//' + location.host;
	
// 	function parseVar(varType, variable) {
// 		switch(varType) {
// 			case 'float':
// 				variable = parseFloat(variable);
// 				break;
				
// 			case 'int':
// 				variable = parseInt(variable);
// 				break;
				
// 			case 'checkbox':
// 				//variable = JSON.parse(variable.toLowerCase());
// 				break;
				
// 			default:
// 				variable = variable;
// 		}
		
// 		return variable;
// 	}
	
// 	window.addEventListener('message', receiveMessage, false);

// 	/* Handles ALL controls, popup windows and websocket remote controls */
// 	function receiveMessage(event, websocket) {
// 		if(event.origin !== that.options.controlDomain && !websocket) return;
// 		var index;
// 		if(event.data.type === 'variable') {
			
// 			// Parse Variable
// 			var variable = parseVar(event.data.varType, event.data.payload);
			
// 			// Set variable value
// 			if('append' in event.data) {
// 				registeredMods[event.data.modName][event.data.name] = variable + event.data.append;
// 			} else {
// 				registeredMods[event.data.modName][event.data.name] = variable;
// 			}
			
// 			// Set current value for preset purposes
// 			registeredMods[event.data.modName].info.controls[event.data.index].currValue = variable;
			
// 			// Websocket message? Update the UI
// 			if(websocket) {
// 				var payload = event.data.payload;
				
// 				if('append' in event.data) {
// 					payload = payload.replace(event.data.append, '');
// 				}
								
// 				controllerWindow.postMessage({
// 					type: 'ui',
// 					varType: event.data.varType,
// 					modName: event.data.modName,
// 					name: event.data.name,
// 					payload: payload,
// 					index: event.data.index
// 				}, that.options.controlDomain);
// 			}
// 		}
		
// 		if(event.data.type === 'image') {
// 			registeredMods[event.data.modName][event.data.name].src = event.data.payload;
// 		}
		
// 		if(event.data.type === 'video') {
// 			registeredMods[event.data.modName][event.data.name].src = event.data.payload;
// 			registeredMods[event.data.modName][event.data.name].load();
// 			registeredMods[event.data.modName][event.data.name].play();
// 		}

// 		if(event.data.type === 'multiimage') {
// 			if(event.data.wipe) registeredMods[event.data.modName][event.data.name].length = 0;
// 			event.data.payload.forEach(function(file) {
// 				var newImage = new Image();
// 				newImage.src = file;
// 				registeredMods[event.data.modName][event.data.name].push(newImage);
// 			});
// 		}
		
// 		if(event.data.type === 'modBlend') {
// 			registeredMods[event.data.modName].info.blend = event.data.payload;

// 			// Websocket message? Update the UI
// 			if(websocket) {
// 				controllerWindow.postMessage({
// 					type: 'ui-blend',
// 					modName: event.data.modName,
// 					payload: event.data.payload
// 				}, that.options.controlDomain);
// 				console.log(event.data);
// 			}
// 		}
		
// 		if(event.data.type === 'modOpacity') {
// 			registeredMods[event.data.modName].info.alpha = event.data.payload;

// 			// Websocket message? Update the UI
// 			if(websocket) {
// 				controllerWindow.postMessage({
// 					type: 'ui-opacity',
// 					modName: event.data.modName,
// 					payload: event.data.payload
// 				}, that.options.controlDomain);
// 				console.log(event.data);
// 			}
// 		}
		
// 		if(event.data.type === 'setOrderUp') {
// 			index = -1;
// 			modOrder.forEach(function(mod, idx) {
// 				if(event.data.modName === mod) index = idx;
// 			});
// 			if(index > 0) {
// 				index -= 1;
// 				that.setModOrder(event.data.modName, index);
// 			}
// 		}
		
// 		if(event.data.type === 'setOrderFromElements') {
// 			index = -1;
// 			modOrder.forEach(function(mod, idx) {
// 				if(event.data.y === mod) index = idx;
// 			});
			
// 			if(index > 0) {
// 				that.setModOrder(event.data.x, index);
// 			}
// 		}
		
// 		if(event.data.type === 'check') {
// 			if(!event.data.payload) {
// 				registeredMods[event.data.modName].info.disabled = true;
// 			} else {
// 				registeredMods[event.data.modName].info.disabled = false;
// 			}

// 			// Websocket message? Update the UI
// 			if(websocket) {
// 				controllerWindow.postMessage({
// 					type: 'ui-enabled',
// 					modName: event.data.modName,
// 					payload: event.data.payload
// 				}, that.options.controlDomain);
// 			}
// 		}
		
// 		if(event.data.type === 'global') {
// 			if(event.data.name === 'clearing') {
// 				if(event.data.payload) {
// 					that.clearing = true;
// 				} else {
// 					that.clearing = false;
// 				}
// 			}
			
// 			if(event.data.name === 'mute') {
// 				if(event.data.payload) {
// 					gainNode.gain.value = 0;
// 				} else {
// 					gainNode.gain.value = 1;
// 				}
// 			}
			
// 			if(event.data.name === 'savepreset') {
// 				var preset = {};
				
// 				for (var mod in registeredMods) {
// 					preset[mod] = registeredMods[mod].info;
// 				}
				
// 				that.presets[event.data.payload.name] = preset;
// 				localStorage.setItem('presets', JSON.stringify(that.presets));
// 				console.info('Wrote preset with name:', event.data.payload.name);

// 				// update preset list in controls window (TODO: THE SAME FOR WEBSOCKET)
// 			}

// 			if(event.data.name === 'loadpreset') {
// 				that.loadPreset(event.data.payload.name);
// 				// load preset (TODO: THE SAME FOR WEBSOCKET)
// 			}

// 			if(event.data.name === 'factory-reset') {

// 				factoryReset();

// 			}
// 		}
// 	}
// 	var controllerWindow = window.open('',
// 									   '_blank',
// 									   'width=' + (1440/100)*33.4 +
// 									   ',height=' + screen.height +
// 									   ', location=yes, menubar=yes, left=' + (screen.width/100)*66.6);
	
// 	// Load presets into window (TO DO)
// 	controllerWindow.window.presets = {};

// 	var link = document.createElement('link');
	
// 	link.href = window.location.origin + window.location.pathname + 'control-stylesheet.css';
// 	link.rel = 'stylesheet';

// 	controllerWindow.window.document.head.appendChild(link);

// 	controllerWindow.window.document.body.classList.add('pure-form-stacked');
	
// 	var drunkenMess = function() {
// 		return 'You sure about that, you drunken mess?';
// 	};
	
// 	if(this.options.previewWindow) {
// 		// Preview window
// 		var previewWindow = window.open('', '_blank', 'width=640, height=480, location=no, menubar=no, left=0');
// 		var previewCanvas = document.createElement('canvas');
// 		var previewCtx = previewCanvas.getContext('2d');
		
// 		previewWindow.document.body.style.margin = '0px';
// 		previewCanvas.width = 640;
// 		previewCanvas.height = 480;
// 		previewWindow.onbeforeunload = drunkenMess;
// 		previewWindow.document.body.appendChild(previewCanvas);
// 	}
								   
// 	controllerWindow.onbeforeunload = drunkenMess;
// 	window.onbeforeunload = drunkenMess;
	
// 	var slipJS = document.createElement('script');
// 	slipJS.src = './slip/slip.js';
	
// 	slipJS.onload = function() {
	
// 		controllerWindow.window.document.body.addEventListener('slip:beforewait', function(e){
// 			if (e.target.className.indexOf('instant') > -1) e.preventDefault();
// 		}, false);
	
// 		controllerWindow.window.document.body.addEventListener('slip:reorder', function(e){
// 			e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
// 			return false;
// 		}, false);
		
// 		controllerWindow.window.initSlip = function() {
// 			new Slip(controllerWindow.window.document.body);
// 		};
// 		controllerWindow.window.initSlip();
// 	};
	
// 	controllerWindow.window.document.head.appendChild(slipJS);
	
// 	// Window Controls
// 	controllerWindow.window.receiveMessage = function(event) {
// 		if(event.origin !== that.options.controlDomain) return;
// 		var id, node;

// 		if(event.data.type === 'ui') {
// 			id = event.data.modName + '-' + event.data.name;
			
// 			node = controllerWindow.window.document.getElementById(id);
// 			if(!node) return;
// 			controllerWindow.window.console.log(id, node, event.data.payload);
						
// 			if(event.data.varType === 'checkbox') {
// 				node.checked = event.data.payload;
// 			} else {
// 				node.value = event.data.payload;
// 			}
// 		}

// 		if(event.data.type === 'ui-blend') {
// 			id = event.data.modName + '-blend';
// 			node = controllerWindow.window.document.getElementById(id);
// 			controllerWindow.window.console.log(id, node, event.data.payload);

// 			for (var i = 0; i < node.options.length; i++) {
// 				if (node.options[i].value === event.data.payload) {
// 					node.selectedIndex = i;
// 					break;
// 				}
// 			}
// 		}

// 		if(event.data.type === 'ui-enabled') {
// 			id = event.data.modName + '-enabled';
// 			node = controllerWindow.window.document.getElementById(id);
// 			controllerWindow.window.console.log(id, node, event.data.payload);
// 			node.checked = event.data.payload;
// 		}

// 		if(event.data.type === 'ui-opacity') {
// 			id = event.data.modName + '-opacity';
// 			node = controllerWindow.window.document.getElementById(id);
// 			controllerWindow.window.console.log(id, node, event.data.payload);
// 			node.value = event.data.payload;
// 		}
		
// 	};
// 	controllerWindow.window.addEventListener('message', controllerWindow.window.receiveMessage, false);
	
// 	window.addEventListener('beforeunload', function() {
// 		try {
// 			controllerWindow.close();
// 			previewWindow.close();
// 		} catch(e) {
// 			// oops window not found.
// 		}
// 	}, false);
	
// 	/* Setup remote control */
// 	var remoteSuccess = false,
// 		uuid;
	
// 	if(this.options.remote) {
// 		try {
// 			ws = new WebSocket(this.options.remote);
			
// 			ws.onerror = function () {
// 				remoteSuccess = true; // Failed connection, so start anyway
// 	        };
		
// 			ws.onmessage = function(e) {
// 				var data = JSON.parse(e.data);
// 				console.log('Message received:', data);
				
// 				if(!('type' in data)) return false;
				
// 				var pl = data.payload;
				
// 				switch(data.type) {
					
// 					case 'hello':
// 						console.log(pl.name, 'says hi. Server version number:', pl.version);
// 						remoteSuccess = true;
// 						uuid = pl.id;
// 						ws.send(JSON.stringify({type: 'declare', payload: {type: 'client', id: uuid}}));
// 						break;
						
// 					case 'registerCB':
// 						// Sorta debug only - will do something with this later on.
// 						console.log('Server says', pl.name, 'was registered with order number', pl.index);
						
// 						if(registeredMods[pl.name].info.name === pl.name) {
// 							if(registeredMods[pl.name].info.order === pl.index) {
// 								console.log('True!');
// 							} else {
// 								console.log('False!');
// 							}
// 						} else {
// 							console.log('False!');
// 						}
						
// 						break;
					
// 					default:
// 						receiveMessage({data: data}, true);
// 				}
// 			};
			
// 			ws.onclose = function() {
// 				console.log('Connection closed');
// 			};
			
// 			ws.onopen = function() {
// 				console.log('Successful initial connection to', that.options.remote);
// 			};
// 		} catch(e) {
// 			console.error('There was an un-identified Web Socket error');
// 		}
// 	}
	
// 	/* Turn all this stuff off or we'll get a really bad audio input when also using video ~~trust me~~ */
// 	var contraints = {
// 			audio: {
// 				optional: [
// 					{googNoiseSuppression: false},
// 					{googEchoCancellation: false},
// 					{googEchoCancellation2: false},
// 					{googAutoGainControl: false},
// 					{googNoiseSuppression2: false},
// 					{googHighpassFilter: false},
// 					{googTypingNoiseDetection: false}
// 				]
// 			},
// 			video: {
// 				optional: [
// 					{googNoiseSuppression: false},
// 					{googEchoCancellation: false},
// 					{googEchoCancellation2: false},
// 					{googAutoGainControl: false},
// 					{googNoiseSuppression2: false},
// 					{googHighpassFilter: false},
// 					{googTypingNoiseDetection: false}
// 				]
// 			}
// 	};
	
// 	/* Ask for webcam and audio access  */
// 	navigator.getUserMedia(contraints, function(stream) {
		
// 		// Create video stream
// 		video.src = window.URL.createObjectURL(stream);
		
// 		// Create new Audio Context
// 		aCtx = new window.AudioContext();
		
// 		// Create new Audio Analyser
// 		analyser = aCtx.createAnalyser();
		
// 		// Create a script processor
// 		javascriptNode = aCtx.createScriptProcessor(sampleSize, 1, 1);
		
// 		// Tell the processor to start analysing when we have activity
// 		javascriptNode.onaudioprocess = function () {
// 			analyser.getByteTimeDomainData(amplitudeArray);
// 		};
		
// 		// Create a gain node
// 		gainNode = aCtx.createGain();
		
// 		// Mute the node
// 		gainNode.gain.value = 0;
		
// 		// Create the audio input stream
// 		microphone = aCtx.createMediaStreamSource(stream);
		
// 		// Connect the audio stream to the gain node (audio->gain)
// 		microphone.connect(gainNode);
		
// 		// Connect the gain node to the output (audio->gain->destination)
// 		gainNode.connect(aCtx.destination);
		
// 		// If meyda is about, use it
// 		if(meydaSupport) that.meyda = new Meyda(aCtx, microphone, 512);
		
// 		// Connect the audio stream to the analyser (this is a passthru) (audio->(analyser)->gain->destination)
// 		microphone.connect(analyser);
		
// 		// Connect the analyser to the JS node
// 		analyser.connect(javascriptNode);
		
// 		// Connect the JS node to the destination
// 		javascriptNode.connect(aCtx.destination);
		
// 		// Create a new Uint8Array for the analysis
// 		FFTData = new Uint8Array(analyser.frequencyBinCount);
		
// 		// More friendly name? (should tidy all this up at some point)
// 		amplitudeArray = FFTData;
		
// 		// Tell the rest of the script we're all good.
// 		ready = true;
// 	}, function() {
// 		// o noes
// 		console.log('Error setting up WebAudio - please make sure you\'ve allowed modV access.');
// 	});

// 	this.canvas = undefined;
// 	this.clearing = true;

// 	this.setCanvas = function(el) {
// 		if(el.nodeName !== 'CANVAS') {
// 			console.error('modV: setCanvas was not supplied with a CANVAS element.');
// 			return false;
// 		}
// 		this.canvas = el;
// 		this.context = el.getContext('2d');

// 		if(typeof window.THREE === 'object') {
// 			this.threejs.canvas = document.createElement('canvas');

// 			this.threejs.renderer = new THREE.WebGLRenderer({canvas: this.threejs.canvas, autoClear: false, alpha: true});
// 			this.threejs.renderer.setSize( window.innerWidth, window.innerHeight );
// 			this.threejs.renderer.setClearColor(0x000000, 0);
// 		}

// 		window.addEventListener('resize', function() {
// 			that.threejs.renderer.setSize(window.innerWidth, window.innerHeight);
// 			that.canvas.width = window.innerWidth;
// 			that.canvas.height = window.innerHeight;

// 			if (window.devicePixelRatio > 1 && 'retina' in that.options) {
// 				if(that.options.retina) {
// 					var canvasWidth = window.innerWidth;
// 					var canvasHeight = window.innerHeight;

// 					that.canvas.width = canvasWidth * window.devicePixelRatio;
// 					that.canvas.height = canvasHeight * window.devicePixelRatio;
// 					that.canvas.style.width = window.innerWidth + 'px';
// 					that.canvas.style.height = window.innerHeight + 'px';
// 				}
// 			}

// 			if(typeof window.THREE == 'object') {
// 				that.threejs.camera.aspect = window.innerWidth / window.innerHeight;
// 		    	that.threejs.camera.updateProjectionMatrix();
// 				that.threejs.renderer.setSize(that.canvas.width, that.canvas.height);
// 			}

// 			for(var mod in registeredMods) {
// 				if(typeof registeredMods[mod].init === 'function') registeredMods[mod].init(that.canvas, that.context);
// 			}
// 		}, false);
// 		return true;
// 	};

// 	this.setDimensions = function(width, height) {
// 		if(typeof width === 'undefined' && typeof height === 'undefined') {
// 			console.error('modV: setDimensions was not supplied anything!');
// 		} else if(typeof width !== 'number') {
// 			console.error('modV: setDimensions was not supplied with a number type.');
// 			return;
// 		} else if(typeof height !== 'number') {
// 			console.error('modV: setDimensions was not supplied with a number type.');
// 			return;
// 		}

// 		if(typeof width === 'undefined' && typeof height !== 'undefined') this.canvas.width = this.canvas.height = height;
// 		else if(typeof width !== 'undefined' && typeof height === 'undefined') this.canvas.width = this.canvas.height = width;
// 		else {
// 			if(typeof window.THREE === 'object') {
// 				this.threejs.renderer.setSize(width, height);
// 			}
// 			this.canvas.width = width;
// 			this.canvas.height = height;
// 		}

// 		if (window.devicePixelRatio > 1 && 'retina' in this.options) {
// 			if(that.options.retina) {
// 				var canvasWidth = this.canvas.width;
// 				var canvasHeight = this.canvas.height;

// 				this.canvas.width = canvasWidth * window.devicePixelRatio;
// 				this.canvas.height = canvasHeight * window.devicePixelRatio;
// 				this.canvas.style.width = canvasWidth + 'px';
// 				this.canvas.style.height = canvasHeight + 'px';

// 			}
// 		}
// 	};
	
// 	// Add global controls to UI

// 	function genContainer(title, movable) {
// 		var contTitle = title;
// 		var thatIn = this;

// 		this.div = document.createElement('div');
// 		this.div.classList.add('module');
		
// 		var header = document.createElement('header');
// 		var headerTxt = document.createTextNode(contTitle);

// 		var mover = document.createElement('div');
// 		mover.classList.add('mover');

// 		mover.draggable = true;
// 		mover.addEventListener('dragstart', function(e) {
			
// 			e.dataTransfer.setData('text', e.target.parentNode.parentNode.dataset.name);
			
// 		}, false);

// 		header.appendChild(headerTxt);
// 		if(movable) {
// 			header.appendChild(mover);

// 			this.div.addEventListener('drop', function(e) {
// 				e.preventDefault();
// 				var target = getClosestWithClass(e.target, 'div', 'module');
// 				target.style.backgroundColor = 'white';
// 				console.log(target);
				
// 				var targetdata = target.dataset.name;
				
// 				var data = e.dataTransfer.getData('text');
// 				var nodeToMove = controllerWindow.document.querySelector('div.module[data-name="' + data + '"]');
// 				nodeToMove.parentNode.insertBefore(nodeToMove, target);
				
// 				controllerWindow.window.opener.postMessage({type: 'setOrderFromElements', x: data, y: targetdata}, that.options.controlDomain);
				
// 				console.log(nodeToMove);
// 			}, false);
			
// 			this.div.addEventListener('dragover', function(e) {
// 				e.preventDefault();
// 				relatedTarget = getClosestWithClass(e.target, 'div', 'module');
				
// 				try {
// 					relatedTarget.style.backgroundColor = 'green';
// 				} catch(err) {
					
// 				}
// 			}, false);
			
// 			this.div.addEventListener('dragleave', function(e) {
// 				e.preventDefault();
// 				relatedTarget.style.backgroundColor = 'white';
				
// 				//elem.parentNode.insertBefore(nodeToMove, );
// 			}, false);

// 		}

// 		this.div.appendChild(header);

// 		var elements = [];

// 		this.addInput = function(id, title, type, valueName, value, event, callback) {

// 			var element = document.createElement('input');
// 			element.type = type;

// 			if(valueName instanceof Array) {

// 				valueName.forEach(function(valueN, idx) {
// 					element[valueN] = value[idx];
// 				});

// 			} else {
// 				element[valueName] = value;
// 			}

// 			element.addEventListener(event, callback);
// 			element.id = contTitle + '-' + id;

// 			var container = document.createElement('div');
// 			container.classList.add('pure-g');

// 			var left = document.createElement('div');
// 			left.classList.add('pure-u-1-5');

// 			var label = document.createElement('label');
// 			label.setAttribute('for', contTitle + '-' + id);
// 			label.textContent = title;

// 			left.appendChild(label);

// 			var right = document.createElement('div');
// 			right.classList.add('pure-u-4-5');
// 			right.appendChild(element);

// 			container.appendChild(left);
// 			container.appendChild(right);

// 			elements.push(container);

// 		};

// 		this.addSpecial = function(element) {

// 			var container = document.createElement('div');
// 			container.classList.add('pure-g');

// 			var div = document.createElement('div');
// 			div.classList.add('pure-u-1-1');

// 			container.appendChild(div);
// 			div.appendChild(element);

// 			elements.push(container);

// 		};

// 		this.output = function() {
// 			elements.forEach(function(block) {
// 				thatIn.div.appendChild(block);
// 			});

// 			return this.div;
// 		};
// 	}

// 	var container = new genContainer('Global', false);
	
// 	// - clearing
// 	container.addInput('clearing', 'Clearing', 'checkbox', 'checked', false, 'change', function() {
// 		controllerWindow.window.opener.postMessage({type: 'global', name: 'clearing', payload: this.checked}, that.options.controlDomain);
// 	});

// 	// - mute / unmute input
// 	container.addInput('mute', 'Mute', 'checkbox', 'checked', false, 'change', function() {
// 		controllerWindow.window.opener.postMessage({type: 'global', name: 'mute', payload: this.checked}, that.options.controlDomain);
// 	});

// 	// - factory reset button
// 	container.addInput('factory-reset', 'Factory Reset', 'button', 'value', 'factory-reset', 'click', function() {
// 		controllerWindow.window.opener.postMessage({type: 'global', name: 'factory-reset', payload: this.value}, that.options.controlDomain);
// 		console.log('YUUHHH');
// 	});
	
// 	// - save preset
// 	var savePresetDiv = document.createElement('div');
// 	savePresetDiv.id = 'savePresetContainer';

// 	var text = document.createElement('input');
// 	text.type = 'text';
// 	text.placeholder = 'Preset Name';
	
// 	var button = document.createElement('button');
// 	button.textContent = 'Save new Preset';
	
// 	button.addEventListener('click', function() {
		
// 		var savePresetContainer = controllerWindow.document.getElementById('savePresetContainer');
// 		var text = savePresetContainer.querySelector('input[type="text"]');

// 		var confirmed = false,
// 			dialog = false;
		
// 		if(text.value in that.presets) {
// 			dialog = true;
// 			confirmed = confirm('A preset with the name "' + text.value + '"already exists!\nIs it okay to overwrite?');
// 		}
		
// 		if(!dialog || (dialog && confirmed)) {
// 			controllerWindow.window.opener.postMessage({
// 				type: 'global',
// 				name: 'savepreset',
// 				payload: {
// 					name: text.value
// 				}
// 			}, that.options.controlDomain);

// 			dialog = confirmed = false;
// 		}
// 	});
// 	savePresetDiv.appendChild(text);
// 	savePresetDiv.appendChild(button);
// 	container.addSpecial(savePresetDiv);

// 	// - load preset
// 	function updatePresetList() {
// 		var dropdown = document.createElement('select');

// 		for(var key in that.presets) {
// 			var option = document.createElement('option');
// 			option.textContent = key;
// 			option.value = key.toLowerCase();
// 			dropdown.appendChild(option);
// 		}

// 		var presetListContainer = controllerWindow.document.getElementById('presetListContainer');
// 		presetListContainer.replaceChild(dropdown, presetListContainer.querySelector('select'));
// 	}

// 	var loadPresetDiv = document.createElement('div');
// 	loadPresetDiv.id = 'presetListContainer';
	
// 	var loadPresetDropdown = document.createElement('select');

// 	var loadPresetButton = document.createElement('button');
// 	loadPresetButton.textContent = 'Load Preset';
// 	loadPresetButton.addEventListener('click', function() {

// 		var presetListContainer = controllerWindow.document.getElementById('presetListContainer');

// 		controllerWindow.window.opener.postMessage({
// 			type: 'global',
// 			name: 'loadpreset',
// 			payload: {
// 				name: presetListContainer.querySelector('select').value
// 			}
// 		}, that.options.controlDomain);

		
// 	});

// 	loadPresetDiv.appendChild(loadPresetDropdown);
// 	loadPresetDiv.appendChild(loadPresetButton);
// 	container.addSpecial(loadPresetDiv);
	
// 	controllerWindow.document.body.appendChild(container.output());

// 	updatePresetList();
	
// 	this.registerMod = function(mod) {
// 		mod = new mod();
// 		mod.defaults = [];
// 		if(typeof mod.init === 'function') mod.init(this.canvas, this.context);
// 		if(!('blend' in mod.info)) mod.info.blend = 'normal';
// 		if(!('alpha' in mod.info)) mod.info.alpha = 1;
// 		mod.info.disabled = true;
		
// 		if(meydaSupport && ('meyda' in mod.info)) {
// 			mod.info.meyda.forEach(this.addMeydaFeature);
// 		} else if(!meydaSupport && ('meyda' in mod.info)) {
// 			console.warn('Whilst registering the module \'' + mod.info.name + '\', modV detected it requests Meyda which has not been included on the page. You may encounter problems using this module without Meyda.');
// 		}

// 		var fieldset = document.createElement('fieldset');

// 		var container = new genContainer(mod.info.name, true);
		
// 		var relatedTarget = null;
		
// 		fieldset.addEventListener('dragleave', function(e) {
// 			e.preventDefault();
// 			relatedTarget.style.backgroundColor = 'white';
			
// 			//elem.parentNode.insertBefore(nodeToMove, );
// 		}, false);

// 		container.div.dataset.name = mod.info.name;
		
// 		fieldset.dataset.name = mod.info.name;
// 		fieldset.style.position = 'relative';
// 		var legend = document.createElement('legend');
// 		legend.textContent = mod.info.name;
// 		legend.style.fontSize = '20px';
// 		fieldset.appendChild(legend);

// 		fieldset.appendChild(document.createElement('br'));

// 		container.addInput('enabled', 'Enabled', 'checkbox', 'checked', false, 'change', function() {
// 			controllerWindow.window.opener.postMessage({type: 'check',
// 				modName: mod.info.name,
// 				payload: this.checked
// 			}, that.options.controlDomain);

// 			if(that.options.remote) {
// 				try {
// 					ws.send(JSON.stringify({
// 						type: 'ui-enabled',
// 						modName: mod.info.name,
// 						payload: this.checked
// 					}));
// 				} catch(e) {

// 				}
// 			}
// 		});

// 		container.addInput('opacity', 'Opacity', 'range', ['value', 'min', 'max', 'step'], [mod.info.alpha, 0, 1, 0.01], 'input', function() {
// 			controllerWindow.window.opener.postMessage({
// 				type: 'modOpacity',
// 				modName: mod.info.name,
// 				payload: this.value
// 			}, that.options.controlDomain);

// 			if(that.options.remote) {
// 				ws.send(JSON.stringify({
// 					type: 'ui-opacity',
// 					modName: mod.info.name,
// 					payload: this.value
// 				}));
// 			}
// 		});
		
// 		// Add Blending options
// 		var blendCompSelect = genBlendModeOps();
// 		label = document.createElement('label');
// 		label.textContent = 'Blending ';
		
// 		blendCompSelect.addEventListener('change', function() {
// 			controllerWindow.window.opener.postMessage({
// 				type: 'modBlend',
// 				modName: mod.info.name,
// 				payload: this.value
// 			}, that.options.controlDomain);

// 			if(that.options.remote) {
// 				ws.send(JSON.stringify({
// 					type: 'ui-blend',
// 					modName: mod.info.name,
// 					payload: this.value
// 				}));
// 			}
// 		});
		
// 		blendCompSelect.id = mod.info.name + '-blend';

// 		label.appendChild(blendCompSelect);
// 		container.addSpecial(label);

// 		//fieldset.appendChild(label);
// 		//fieldset.appendChild(document.createElement('br'));
		
// 		var mover = document.createElement('div');
// 		mover.classList.add('mover');
// 		mover.classList.add('instant');
// 		// Move this:
// 		mover.style.width = '50px';
// 		mover.style.height = '50px';
// 		mover.style.borderRadius = '50%';
// 		mover.style.backgroundColor = 'red';
// 		mover.style.textAlign = 'center';
// 		mover.style.fontSize = '44px';
// 		mover.style.color = 'white';
// 		mover.style.position = 'absolute';
// 		mover.style.right = '-8px';
// 		mover.style.top = '-8px';
		
// 		mover.draggable = true;
// 		mover.addEventListener('dragstart', function(e) {
			
// 			e.dataTransfer.setData('text', e.target.parentNode.dataset.name);
			
// 		}, false);
		
// 		mover.addEventListener('dragend', function(e) {
// 			//console.log(e.target);
// 			//e.dataTransfer.setData("text", e.target.parentNode.dataset.name);
// 		}, false);
// 		//fieldset.appendChild(mover);
		

// 		// Register controls
// 		if('controls' in mod.info) {

// 			mod.info.controls.forEach(function(controlSet, idx) {
// 				mod.defaults.push(JSON.parse(JSON.stringify(controlSet))); // ugly, but we need to copy the set, not ref it.

// 				var variable = controlSet.variable;
// 				var label = document.createElement('label');
// 				var labelText = controlSet.label;
// 				label.textContent = labelText + ' ';

// 				label.oncontextmenu = function(e) {
// 					console.log(e);
// 					var div = document.createElement('div');
// 					div.classList.add('menu');
// 					div.style.top = e.clientY + e.offsetY + 'px';
// 					div.style.left = e.clientX + e.offsetX + 'px';
// 					controllerWindow.window.document.body.appendChild(div);
// 					return false;
// 				 };
				
				
// 				fieldset.appendChild(document.createElement('hr'));
// 				var image;

// 				if(controlSet.type === 'video') {
// 					image = new Image();
// 					image.src = mod[variable].src;

// 					label.classList.add('filedrop');

// 					label.addEventListener('dragover', function(e) {
// 						e.preventDefault();
// 						this.classList.add('dragover');
// 					});

// 					label.addEventListener('dragend', function(e) {
// 						e.preventDefault();
// 						this.classList.remove('dragover');
// 					});
						
// 					label.addEventListener('drop', function(e) {
// 						e.preventDefault();
// 						this.classList.remove('dragover');
// 						var file = e.dataTransfer.files[0];
// 						if (!file || !file.type.match(/video.*/)) return;
// 						var imageURL = window.URL.createObjectURL(file);
// 						controllerWindow.window.opener.postMessage({type: 'video', modName: mod.info.name, name: variable, payload: imageURL, index: idx}, that.options.controlDomain);
// 						mod[variable].play();
// 					});

// 					label.appendChild(image);

// 					container.addSpecial(label);

// 				} else if(controlSet.type === 'image') {
// 					image = new Image();
// 					image.src = mod[variable].src;

// 					label.classList.add('filedrop');

// 					label.addEventListener('dragover', function(e) {
// 						e.preventDefault();
// 						this.classList.add('dragover');
// 					});

// 					label.addEventListener('dragend', function(e) {
// 						e.preventDefault();
// 						this.classList.remove('dragover');
// 					});
						
// 					label.addEventListener('drop', function(e) {
// 						e.preventDefault();
// 						this.classList.remove('dragover');
// 						var file = e.dataTransfer.files[0];
// 						if (!file || !file.type.match(/image.*/)) return;
// 						var imageURL = window.URL.createObjectURL(file);
// 						controllerWindow.window.opener.postMessage({type: 'image', modName: mod.info.name, name: variable, payload: imageURL, index: idx}, that.options.controlDomain);
// 						image.src = imageURL;
// 					});

// 					label.appendChild(image);

// 					container.addSpecial(label);

// 				} else if(controlSet.type === 'multiimage') {

// 					image = new Image();
// 					//image.src = mod[variable][0].src;

// 					label.classList.add('filedrop');

// 					label.addEventListener('dragover', function(e) {
// 						e.preventDefault();
// 						this.classList.add('dragover');
// 					});

// 					label.addEventListener('dragend', function(e) {
// 						e.preventDefault();
// 						this.classList.remove('dragover');
// 					});
						
// 					label.addEventListener('drop', function(e) {
// 						e.preventDefault();
// 						var altPressed = e.altKey;
// 						this.classList.remove('dragover');
// 						var files = e.dataTransfer.files;
// 						var images = [];
// 						for(var i = 0, file; (file = files[i]); i++) {
// 							if (!file || !file.type.match(/image.*/)) continue;
// 							var imageURL = window.URL.createObjectURL(file);
// 							image.src = imageURL;
// 							images.push(imageURL);
// 						}
						
// 						controllerWindow.window.opener.postMessage({
// 							type: 'multiimage',
// 							modName: mod.info.name,
// 							name: variable,
// 							payload: images,
// 							wipe: altPressed,
// 							index: idx
// 						}, that.options.controlDomain);
// 					});



// 					label.appendChild(image);

// 					container.addSpecial(label);
				
// 				} else if(controlSet.type === 'checkbox') {
					
// 					mod.info.controls[idx].currValue = mod[variable];
// 					mod.defaults[idx].currValue = mod[variable];

// 					container.addInput(controlSet.label,
// 						controlSet.label,
// 						controlSet.type,
// 						'checked',
// 						controlSet.checked,
// 						'change',
// 						function() {
// 							controllerWindow.window.opener.postMessage({
// 								type: 'variable',
// 								varType: controlSet.type,
// 								modName: mod.info.name,
// 								name: variable,
// 								payload: this.checked,
// 								index: idx
// 							}, that.options.controlDomain);
// 						}
// 					);
				
// 				} else {
// 					var varr;
// 					if('append' in controlSet) {
// 						varr = mod[variable].replace(controlSet.append, '');
// 					} else {
// 						varr = mod[variable];
// 					}

// 					mod.info.controls[idx].currValue = mod[variable];
// 					mod.defaults[idx].currValue = varr;

// 					container.addInput(controlSet.label,
// 						controlSet.label,
// 						controlSet.type,
// 						['value', 'min', 'max', 'step'],
// 						[varr, controlSet.min, controlSet.max, controlSet.step],
// 						'input',
// 						function() {

// 							if('append' in controlSet) {
// 								var value = (this.value + controlSet.append);
// 								controllerWindow.window.opener.postMessage({
// 									type: 'variable',
// 									varType: controlSet.varType,
// 									modName: mod.info.name,
// 									name: variable,
// 									payload: value,
// 									index: idx,
// 									append: controlSet.append
// 								}, that.options.controlDomain);

// 								if(that.options.remote) {
// 									ws.send(JSON.stringify({
// 										type: 'ui',
// 										varType: controlSet.varType,
// 										modName: mod.info.name,
// 										name: variable,
// 										payload: value,
// 										index: idx,
// 										append: controlSet.append
// 									}));
// 								}
// 							}
// 							else {
// 								controllerWindow.window.opener.postMessage({
// 									type: 'variable',
// 									varType: controlSet.varType,
// 									modName: mod.info.name,
// 									name: variable,
// 									payload: this.value,
// 									index: idx
// 								}, that.options.controlDomain);

// 								if(that.options.remote) {
// 									ws.send(JSON.stringify({
// 										type: 'ui',
// 										varType: controlSet.varType,
// 										modName: mod.info.name,
// 										name: variable,
// 										payload: this.value,
// 										index: idx
// 									}));
// 								}
// 							}
// 						}
// 					);
// 				}

// 				//fieldset.appendChild(label);
// 				fieldset.appendChild(document.createElement('br'));
// 			});

// 		}
		
// 		controllerWindow.document.body.appendChild(container.output());
// 		//controllerWindow.document.body.appendChild(fieldset);

// 		//registeredMods[mod.info.name];

// 		var registered = registeredMods[mod.info.name] = mod;
// 		this.setModOrder(mod.info.name, Object.size(registeredMods));
		
// 		if(this.options.remote) {
// 			try {
// 				ws.send({type: 'register', payload: mod.info});
// 			} catch(e) {
// 				// Nothing to do here.
// 			}
// 		}
		
// 		return registered;
// 	};

// 	this.setModOrder = function(modName, order) {
// 		if(modOrder[order] === 'undefined') modOrder[order] = modName;
// 		else {
// 			var index = -1;
// 			modOrder.forEach(function(mod, idx) {
// 				if(modName === mod) index = idx;
// 			});
// 			if(index > -1) modOrder.splice(index, 1);
// 			modOrder.splice(order, 0, modName);
			
// 			modOrder.forEach(function(mod, idx) {
// 				registeredMods[mod].info.order = idx;
// 				//var mover = controllerWindow.document.querySelector('fieldset[data-name="' + mod + '"]').getElementsByClassName('mover')[0];
// 				//mover.textContent = idx;
// 			});
// 		}
		
// 		// Reorder DOM elements (ugh ;_;)
// 		var list = controllerWindow.document.body;
// 		var items = list.querySelectorAll('fieldset[data-name]');
// 		var itemsArr = [];
// 		for (var i in items) {
// 			if(items[i].nodeType === 1) { // Remove the whitespace text nodes
// 				itemsArr.push(items[i]);
// 			}
// 		}
		
// 		itemsArr.sort(function(a, b) {
// 			var aOrder = registeredMods[a.dataset.name].info.order;
// 			var bOrder = registeredMods[b.dataset.name].info.order;
			
// 			return aOrder-bOrder;
// 		});
		
// 		for(i = 0; i < itemsArr.length; ++i) {
// 			list.appendChild(itemsArr[i]);
// 		}
		
// 		return order;
// 	};
		
// 	this.drawFrame = function(meydaOutput, delta) {
// 		if(!ready) return;
// 		if(this.clearing) this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
// 		for(var i=0; i < modOrder.length; i++) {
// 			if(typeof registeredMods[modOrder[i]] === 'object') {
// 				if(registeredMods[modOrder[i]].info.disabled || registeredMods[modOrder[i]].info.alpha === 0) continue;
// 				this.context.save();
// 				this.context.globalAlpha = registeredMods[modOrder[i]].info.alpha;
// 				if(registeredMods[modOrder[i]].info.blend !== 'normal') this.context.globalCompositeOperation = registeredMods[modOrder[i]].info.blend;
// 				if(!registeredMods[modOrder[i]].info.threejs) {
// 					registeredMods[modOrder[i]].draw(this.canvas, this.context, amplitudeArray, video, meydaOutput, delta);
// 				} else {
// 					registeredMods[modOrder[i]].draw(this.canvas, this.context, amplitudeArray, video, meydaOutput, delta);
// 					this.context.drawImage(this.threejs.canvas, 0, 0);
// 					this.threejs.renderer.render(this.threejs.scene, this.threejs.camera);
// 				}
// 				this.context.restore();
// 			}
// 		}
// 		if(this.options.previewWindow) previewCtx.drawImage(this.canvas, 0, 0, previewCanvas.width, previewCanvas.height);
// 	};
	
// 	var myFeatures;
// 	this.bpm = 0;
// 	var bd_med = new BeatDetektor(85,169);
// 	var reallyReady = false;

// 	var loop = function(timestamp) {
// 		requestAnimationFrame(loop);
		
// 		if(meydaSupport && ready) {
			
// 			if(reallyReady) {
// 				myFeatures = that.meyda.get(that.meydaFeatures);
// 				bd_med.process((timestamp / 1000.0), myFeatures.complexSpectrum.real);
// 				that.bpm = bd_med.win_bpm_int_lo;
// 			} else {
// 				that.context.clearRect(0, 0, that.canvas.width, that.canvas.height);
// 				reallyReady = true;
// 			}

// 		} else {
// 			that.context.clearRect(0, 0, that.canvas.width, that.canvas.height);
// 			text = 'Please allow popups and share your media inputs.';
// 			font = that.context.font =  72 + 'px "Helvetica", sans-serif';
// 			that.context.textAlign = 'left';
// 			that.context.fillStyle = 'hsl(' + timestamp / 10 + ', 100%, 50%)';
// 			var w = that.context.measureText(text).width;

// 			if(!that.options.retina) font = that.context.font =  36 + 'px "Helvetica", sans-serif';
// 			w = that.context.measureText(text).width;

// 			that.context.fillText(text, that.canvas.width/2 - w/2, that.canvas.height/2 + 36);

// 			text = 'Check the docs at http://modv.readme.io/ for more info.';
// 			font = that.context.font =  42 + 'px "Helvetica", sans-serif';
// 			that.context.textAlign = 'left';
// 			that.context.fillStyle = 'hsl(' + timestamp / 10 + ', 100%, 50%)';
// 			w = that.context.measureText(text).width;

// 			if(!that.options.retina) font = that.context.font =  20 + 'px "Helvetica", sans-serif';
// 			w = that.context.measureText(text).width;

// 			that.context.fillText(text, that.canvas.width/2 - w/2, that.canvas.height/2 + 36 + 72);
// 		}

// 		that.drawFrame(myFeatures, timestamp);
// 	};

// 	this.start = function() {
// 		if(that.options.remote && !remoteSuccess) {
// 			console.log('Websocket not connected yet, waiting for connection to start.');
// 			setTimeout(this.start, 1000);
// 		} else {

// 			if(that.options.remote) {
// 				for(var mod in registeredMods) {
// 					ws.send(JSON.stringify({type: 'register', payload: registeredMods[mod].info}));
// 				}
// 			}

// 			requestAnimationFrame(loop);
// 		}
// 	};
// };
},{}],8:[function(require,module,exports){
(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.registerMod = function(Mod) {
		var self = this;

		var mod = new Mod();
		mod.defaults = [];
		if(typeof mod.init === 'function') mod.init(this.canvas, this.context);
		if(!('blend' in mod.info)) mod.info.blend = 'normal';
		if(!('alpha' in mod.info)) mod.info.alpha = 1;
		mod.info.disabled = true;
		
		if(modV.meydaSupport && ('meyda' in mod.info)) {
			mod.info.meyda.forEach(modV.addMeydaFeature);
		} else if(!modV.meydaSupport && ('meyda' in mod.info)) {
			console.warn('Whilst registering the module \'' + mod.info.name + '\', modV detected it requests Meyda which has not been included on the page. You may encounter problems using this module without Meyda.');
		}

		var fieldset = document.createElement('fieldset');
		
		var container = new modV.ContainerGenerator(mod.info.name, true);
		
		var relatedTarget = null;
		
		fieldset.addEventListener('dragleave', function(e) {
			e.preventDefault();
			relatedTarget.style.backgroundColor = 'white';
			
			//elem.parentNode.insertBefore(nodeToMove, );
		}, false);

		container.div.dataset.name = mod.info.name;
		
		fieldset.dataset.name = mod.info.name;
		fieldset.style.position = 'relative';
		var legend = document.createElement('legend');
		legend.textContent = mod.info.name;
		legend.style.fontSize = '20px';
		fieldset.appendChild(legend);

		fieldset.appendChild(document.createElement('br'));

		container.addInput('enabled', 'Enabled', 'checkbox', 'checked', false, 'change', function() {
			modV.controllerWindow.window.opener.postMessage({type: 'check',
				modName: mod.info.name,
				payload: this.checked
			}, modV.options.controlDomain);

			if(modV.options.remote) {
				try {
					modV.ws.send(JSON.stringify({
						type: 'ui-enabled',
						modName: mod.info.name,
						payload: this.checked
					}));
				} catch(e) {

				}
			}
		});

		container.addInput('opacity', 'Opacity', 'range', ['value', 'min', 'max', 'step'], [mod.info.alpha, 0, 1, 0.01], 'input', function() {
			modV.controllerWindow.window.opener.postMessage({
				type: 'modOpacity',
				modName: mod.info.name,
				payload: this.value
			}, modV.options.controlDomain);

			if(modV.options.remote) {
				modV.ws.send(JSON.stringify({
					type: 'ui-opacity',
					modName: mod.info.name,
					payload: this.value
				}));
			}
		});
		
		// Add Blending options
		var blendCompSelect = modV.genBlendModeOps();
		var label = document.createElement('label');
		label.textContent = 'Blending ';
		
		blendCompSelect.addEventListener('change', function() {
			modV.controllerWindow.window.opener.postMessage({
				type: 'modBlend',
				modName: mod.info.name,
				payload: this.value
			}, modV.options.controlDomain);

			if(modV.options.remote) {
				modV.ws.send(JSON.stringify({
					type: 'ui-blend',
					modName: mod.info.name,
					payload: this.value
				}));
			}
		});
		
		blendCompSelect.id = mod.info.name + '-blend';

		label.appendChild(blendCompSelect);
		container.addSpecial(label);

		//fieldset.appendChild(label);
		//fieldset.appendChild(document.createElement('br'));
		
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
		//fieldset.appendChild(mover);
		

		// Register controls
		if('controls' in mod.info) {

			mod.info.controls.forEach(function(controlSet, idx) {
				mod.defaults.push(JSON.parse(JSON.stringify(controlSet))); // ugly, but we need to copy the set, not ref it.

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
					modV.controllerWindow.window.document.body.appendChild(div);
					return false;
				 };
				
				
				fieldset.appendChild(document.createElement('hr'));
				var image;

				if(controlSet.type === 'video') {
					image = new Image();
					image.src = mod[variable].src;

					label.classList.add('filedrop');

					label.addEventListener('dragover', function(e) {
						e.preventDefault();
						this.classList.add('dragover');
					});

					label.addEventListener('dragend', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
					});
						
					label.addEventListener('drop', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
						var file = e.dataTransfer.files[0];
						if (!file || !file.type.match(/video.*/)) return;
						var imageURL = window.URL.createObjectURL(file);
						modV.controllerWindow.window.opener.postMessage({type: 'video', modName: mod.info.name, name: variable, payload: imageURL, index: idx}, modV.options.controlDomain);
						mod[variable].play();
					});

					label.appendChild(image);

					container.addSpecial(label);

				} else if(controlSet.type === 'image') {
					image = new Image();
					image.src = mod[variable].src;

					label.classList.add('filedrop');

					label.addEventListener('dragover', function(e) {
						e.preventDefault();
						this.classList.add('dragover');
					});

					label.addEventListener('dragend', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
					});
						
					label.addEventListener('drop', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
						var file = e.dataTransfer.files[0];
						if (!file || !file.type.match(/image.*/)) return;
						var imageURL = window.URL.createObjectURL(file);
						modV.controllerWindow.window.opener.postMessage({type: 'image', modName: mod.info.name, name: variable, payload: imageURL, index: idx}, modV.options.controlDomain);
						image.src = imageURL;
					});

					label.appendChild(image);

					container.addSpecial(label);

				} else if(controlSet.type === 'multiimage') {

					image = new Image();
					//image.src = mod[variable][0].src;

					label.classList.add('filedrop');

					label.addEventListener('dragover', function(e) {
						e.preventDefault();
						this.classList.add('dragover');
					});

					label.addEventListener('dragend', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
					});
						
					label.addEventListener('drop', function(e) {
						e.preventDefault();
						var altPressed = e.altKey;
						this.classList.remove('dragover');
						var files = e.dataTransfer.files;
						var images = [];
						for(var i = 0, file; (file = files[i]); i++) {
							if (!file || !file.type.match(/image.*/)) continue;
							var imageURL = window.URL.createObjectURL(file);
							image.src = imageURL;
							images.push(imageURL);
						}
						
						modV.controllerWindow.window.opener.postMessage({
							type: 'multiimage',
							modName: mod.info.name,
							name: variable,
							payload: images,
							wipe: altPressed,
							index: idx
						}, modV.options.controlDomain);
					});



					label.appendChild(image);

					container.addSpecial(label);
				
				} else if(controlSet.type === 'checkbox') {
					
					mod.info.controls[idx].currValue = mod[variable];
					mod.defaults[idx].currValue = mod[variable];

					container.addInput(controlSet.label,
						controlSet.label,
						controlSet.type,
						'checked',
						controlSet.checked,
						'change',
						function() {
							console.log('checkbox changed');
							modV.controllerWindow.window.opener.postMessage({
								type: 'variable',
								varType: controlSet.type,
								modName: mod.info.name,
								name: variable,
								payload: this.checked,
								index: idx
							}, modV.options.controlDomain);
						}
					);
				
				} else {
					var varr;
					if('append' in controlSet) {
						varr = mod[variable].replace(controlSet.append, '');
					} else {
						varr = mod[variable];
					}

					mod.info.controls[idx].currValue = mod[variable];
					mod.defaults[idx].currValue = varr;

					container.addInput(controlSet.label,
						controlSet.label,
						controlSet.type,
						['value', 'min', 'max', 'step'],
						[varr, controlSet.min, controlSet.max, controlSet.step],
						'input',
						function() {

							if('append' in controlSet) {
								var value = (this.value + controlSet.append);
								modV.controllerWindow.window.opener.postMessage({
									type: 'variable',
									varType: controlSet.varType,
									modName: mod.info.name,
									name: variable,
									payload: value,
									index: idx,
									append: controlSet.append
								}, modV.options.controlDomain);

								if(modV.options.remote) {
									modV.ws.send(JSON.stringify({
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
								modV.controllerWindow.window.opener.postMessage({
									type: 'variable',
									varType: controlSet.varType,
									modName: mod.info.name,
									name: variable,
									payload: this.value,
									index: idx
								}, modV.options.controlDomain);

								if(modV.options.remote) {
									modV.ws.send(JSON.stringify({
										type: 'ui',
										varType: controlSet.varType,
										modName: mod.info.name,
										name: variable,
										payload: this.value,
										index: idx
									}));
								}
							}
						}
					);
				}

				fieldset.appendChild(document.createElement('br'));
			});

		}
		
		modV.controllerWindow.document.body.appendChild(container.output());

		var registered = modV.registeredMods[mod.info.name] = mod;
		modV.setModOrder(mod.info.name, Object.size(modV.registeredMods));
		
		if(this.options.remote) {
			try {
				modV.ws.send({type: 'register', payload: mod.info});
			} catch(e) {
				// Nothing to do here.
			}
		}
		
		return registered;	
	};

})(module);
},{}],9:[function(require,module,exports){
(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.setModOrder = function(modName, order) {
		var self = this;

		if(modV.modOrder[order] === 'undefined') modV.modOrder[order] = modName;
		else {
			var index = -1;
			modV.modOrder.forEach(function(mod, idx) {
				if(modName === mod) index = idx;
			});
			if(index > -1) modV.modOrder.splice(index, 1);
			modV.modOrder.splice(order, 0, modName);
			
			modV.modOrder.forEach(function(mod, idx) {
				modV.registeredMods[mod].info.order = idx;
			});
		}
		
		// Reorder DOM elements (ugh ;_;)
		var list = modV.controllerWindow.document.body;
		var items = list.querySelectorAll('fieldset[data-name]');
		var itemsArr = [];
		for (var i in items) {
			if(items[i].nodeType === 1) { // Remove the whitespace text nodes
				itemsArr.push(items[i]);
			}
		}
		
		itemsArr.sort(function(a, b) {
			var aOrder = modV.registeredMods[a.dataset.name].info.order;
			var bOrder = modV.registeredMods[b.dataset.name].info.order;
			
			return aOrder-bOrder;
		});
		
		for(i = 0; i < itemsArr.length; ++i) {
			list.appendChild(itemsArr[i]);
		}
		
		return order;
	};

})(module);
},{}],10:[function(require,module,exports){
module.exports=require(9)
},{}],11:[function(require,module,exports){
(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	/* Setup remote control */
	modV.prototype.remoteSuccess = false;
	modV.prototype.uuid = undefined;
	
	modV.prototype.initSockets = function() {
		if(modV.options.remote) {
			try {
				modV.ws = new WebSocket(modV.options.remote);
				
				modV.ws.onerror = function () {
					modV.remoteSuccess = true; // Failed connection, so start anyway
		        };
			
				modV.ws.onmessage = function(e) {
					var data = JSON.parse(e.data);
					console.log('Message received:', data);
					
					if(!('type' in data)) return false;
					
					var pl = data.payload;
					
					switch(data.type) {
						
						case 'hello':
							console.log(pl.name, 'says hi. Server version number:', pl.version);
							modV.remoteSuccess = true;
							modV.uuid = pl.id;
							modV.ws.send(JSON.stringify({type: 'declare', payload: {type: 'client', id: modV.uuid}}));
							break;
							
						case 'registerCB':
							// Sorta debug only - will do something with this later on.
							console.log('Server says', pl.name, 'was registered with order number', pl.index);
							
							if(modV.registeredMods[pl.name].info.name === pl.name) {
								if(modV.registeredMods[pl.name].info.order === pl.index) {
									console.log('True!');
								} else {
									console.log('False!');
								}
							} else {
								console.log('False!');
							}
							
							break;
						
						default:
							modV.receiveMessage({data: data}, true);
					}
				};
				
				modV.ws.onclose = function() {
					console.log('Connection closed');
				};
				
				modV.ws.onopen = function() {
					console.log('Successful initial connection to', modV.options.remote);
				};
			} catch(e) {
				console.error('There was an un-identified Web Socket error', e);
			}
		}
	};

})(module);
},{}],12:[function(require,module,exports){
(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.controllerWindow = window.open('',
		'_blank',
		'width=' + (1440/100)*33.4 +
		',height=' + screen.height +
		', location=yes, menubar=yes, left=' + (screen.width/100)*66.6);

	var link = document.createElement('link');
	
	link.href = window.location.origin + window.location.pathname + 'control-style.css';
	link.rel = 'stylesheet';

	modV.prototype.controllerWindow.window.document.head.appendChild(link);

	modV.prototype.controllerWindow.window.document.body.classList.add('pure-form-stacked');
	
	var drunkenMess = function() {
		return 'You sure about that, you drunken mess?';
	};
	
	// if(modV.options.previewWindow) {
	// 	// Preview window
	// 	var previewWindow = window.open('', '_blank', 'width=640, height=480, location=no, menubar=no, left=0');
	// 	var previewCanvas = document.createElement('canvas');
	// 	var previewCtx = previewCanvas.getContext('2d');
		
	// 	previewWindow.document.body.style.margin = '0px';
	// 	previewCanvas.width = 640;
	// 	previewCanvas.height = 480;
	// 	previewWindow.onbeforeunload = drunkenMess;
	// 	previewWindow.document.body.appendChild(previewCanvas);
	// }
								   
	modV.prototype.controllerWindow.onbeforeunload = drunkenMess;
	window.onbeforeunload = drunkenMess;
	
	var slipJS = document.createElement('script');
	slipJS.src = './libraries/slip.js';
	
	slipJS.onload = function() {
	
		modV.prototype.controllerWindow.window.document.body.addEventListener('slip:beforewait', function(e){
			if (e.target.className.indexOf('instant') > -1) e.preventDefault();
		}, false);
	
		modV.prototype.controllerWindow.window.document.body.addEventListener('slip:reorder', function(e){
			e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
			return false;
		}, false);
		
		modV.prototype.controllerWindow.window.initSlip = function() {
			new Slip(controllerWindow.window.document.body);
		};
		modV.prototype.controllerWindow.window.initSlip();
	};
	
	modV.prototype.controllerWindow.window.document.head.appendChild(slipJS);
	
	// Window Controls
	modV.prototype.controllerWindow.window.receiveMessage = function(event) {
		console.log(event);

		if(event.origin !== modV.options.controlDomain) return;
		var id, node;

		if(event.data.type === 'new-preset') {
			var opt = document.createElement('option');
			opt.value = opt.textContent = event.data.name;

			var presetSelect = modV.controllerWindow.window.document.querySelector('#presetListContainer select');
			presetSelect.appendChild(opt);
		}

		if(event.data.type === 'ui') {
			id = event.data.modName + '-' + event.data.name;
			
			node = modV.controllerWindow.window.document.getElementById(id);
			if(!node) return;
			modV.controllerWindow.window.console.log(id, node, event.data.payload);
						
			if(event.data.varType === 'checkbox') {
				node.checked = event.data.payload;
			} else {
				node.value = event.data.payload;
			}
		}

		if(event.data.type === 'ui-blend') {
			id = event.data.modName + '-blend';
			node = modV.controllerWindow.window.document.getElementById(id);
			modV.controllerWindow.window.console.log(id, node, event.data.payload);

			for (var i = 0; i < node.options.length; i++) {
				if (node.options[i].value === event.data.payload) {
					node.selectedIndex = i;
					break;
				}
			}
		}

		if(event.data.type === 'ui-enabled') {
			id = event.data.modName + '-enabled';
			node = modV.controllerWindow.window.document.getElementById(id);
			modV.controllerWindow.window.console.log(id, node, event.data.payload);
			node.checked = event.data.payload;
		}

		if(event.data.type === 'ui-opacity') {
			id = event.data.modName + '-opacity';
			node = modV.controllerWindow.window.document.getElementById(id);
			modV.controllerWindow.window.console.log(id, node, event.data.payload);
			node.value = event.data.payload;
		}
		
	};
	modV.prototype.controllerWindow.window.addEventListener('message', modV.prototype.controllerWindow.window.receiveMessage, false);
	
	window.addEventListener('beforeunload', function() {
		try {
			modV.controllerWindow.close();
			previewWindow.close();
		} catch(e) {
			// oops window not found.
		}
	}, false);

	// Add modV controls
	var container = new modV.prototype.ContainerGenerator('Global', false);
	
	// - clearing
	container.addInput('clearing', 'Clearing', 'checkbox', 'checked', false, 'change', function() {
		modV.controllerWindow.window.opener.postMessage({type: 'global', name: 'clearing', payload: this.checked}, modV.options.controlDomain);
	});

	// - mute / unmute input
	container.addInput('mute', 'Mute', 'checkbox', 'checked', false, 'change', function() {
		modV.controllerWindow.window.opener.postMessage({type: 'global', name: 'mute', payload: this.checked}, modV.options.controlDomain);
	});

	// - factory reset button
	container.addInput('factory-reset', 'Factory Reset', 'button', 'value', 'factory-reset', 'click', function() {
		modV.controllerWindow.window.opener.postMessage({type: 'global', name: 'factory-reset', payload: this.value}, modV.options.controlDomain);
		console.log('YUUHHH');
	});
	
	// - save preset
	var savePresetDiv = document.createElement('div');
	savePresetDiv.id = 'savePresetContainer';

	var text = document.createElement('input');
	text.type = 'text';
	text.placeholder = 'Preset Name';
	
	var button = document.createElement('button');
	button.textContent = 'Save new Preset';
	
	button.addEventListener('click', function() {
		
		var savePresetContainer = modV.controllerWindow.document.getElementById('savePresetContainer');
		var text = savePresetContainer.querySelector('input[type="text"]');

		var confirmed = false,
			dialog = false;
		
		if(text.value in modV.presets) {
			dialog = true;
			confirmed = confirm('A preset with the name "' + text.value + '"already exists!\nIs it okay to overwrite?');
		}
		
		if(!dialog || (dialog && confirmed)) {
			modV.controllerWindow.window.opener.postMessage({
				type: 'global',
				name: 'savepreset',
				payload: {
					name: text.value
				}
			}, modV.options.controlDomain);

			dialog = confirmed = false;
		}
	});
	savePresetDiv.appendChild(text);
	savePresetDiv.appendChild(button);
	container.addSpecial(savePresetDiv);

	// TODO - MOVE LOADING PRESETS TO modV.js
	// TODO - WRITE CONTROLLER MESSAGE HANDLER FOR PRESET LIST UPDATES
	// TODO - WRITE WEBSOCKET PRESET HANDLER
	// TODO - ADD OPTION TO (SETTINGS) FOR SAVING ENABLED MODULES ONLY
	// TODO - PRESET EXPORT
	// TODO - ADD PRESET KEY TO MODULE INFO (PER MODULE PRESETS)
	// TODO - VALIDATION ON PRESET READING. CHECK NAME, AUTHOR AND VERSION

	// - load preset
	modV.prototype.addPresetToController = function(presetName, controlDomain) {
		console.log('adding to preset list with', presetName);

		modV.prototype.controllerWindow.postMessage({type: 'new-preset', name: presetName}, controlDomain);
	};

	var loadPresetDiv = document.createElement('div');
	loadPresetDiv.id = 'presetListContainer';
	
	var loadPresetDropdown = document.createElement('select');

	var loadPresetButton = document.createElement('button');
	loadPresetButton.textContent = 'Load Preset';
	loadPresetButton.addEventListener('click', function() {

		var presetListContainer = modV.controllerWindow.document.getElementById('presetListContainer');

		modV.controllerWindow.window.opener.postMessage({
			type: 'global',
			name: 'loadpreset',
			payload: {
				name: presetListContainer.querySelector('select').value
			}
		}, modV.options.controlDomain);

		
	});

	loadPresetDiv.appendChild(loadPresetDropdown);
	loadPresetDiv.appendChild(loadPresetButton);
	container.addSpecial(loadPresetDiv);
	
	modV.prototype.controllerWindow.document.body.appendChild(container.output());

})(module);
},{}],13:[function(require,module,exports){
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

		self.amplitudeArray = null;

		self.gainNode = null;
		self.meydaSupport = false;

		self.modOrder = [];
		self.registeredMods = {};

		self.video = document.createElement('video');
		self.video.autoplay = true;
		self.video.muted = true;

		self.canvas = undefined;
		self.clearing = true;

		self.meydaSupport = false;
		self.muted = true;
		self.ws = undefined; // WebSocket

		self.ready = false;

		self.presets = {};

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

						self.controllerWindow.postMessage({
							type: 'ui-enabled',
							modName: m.name,
							payload: !m.disabled
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
				self.registeredMods[mod].info.disabled = m.disabled;
				
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

		// Parse user options
		if(typeof options !== 'undefined') self.options = options;
		else self.options = {};

		if(!self.options.clearing) self.clearing = false;

		if(!self.options.controlDomain) self.options.controlDomain = location.protocol + '//' + location.host;

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

		function resize() {
			self.canvas.width = window.innerWidth;
			self.canvas.height = window.innerHeight;

			if (window.devicePixelRatio > 1 && 'retina' in self.options) {
				if(self.options.retina) {
					var canvasWidth = window.innerWidth;
					var canvasHeight = window.innerHeight;

					self.canvas.width = canvasWidth * window.devicePixelRatio;
					self.canvas.height = canvasHeight * window.devicePixelRatio;
					self.canvas.style.width = window.innerWidth + 'px';
					self.canvas.style.height = window.innerHeight + 'px';
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
			resize();

			return true;
		};

		if(self.options.canvas) {
			self.setCanvas(self.options.canvas);
		}

		self.start = function() {
			if(typeof self.canvas !== 'object') {
				console.error('modV: Canvas not set');
				return false;
			}

			if(self.options.remote && !self.remoteSuccess) {
				self.initSockets();

				console.log('Websocket not connected yet, waiting for connection to start.');
				setTimeout(self.start, 1000);
			} else {

				if(self.options.remote) {
					for(var mod in self.registeredMods) {
						self.ws.send(JSON.stringify({
								type: 'register',
								payload: self.registeredMods[mod].info
						}));
					}
				}

				requestAnimationFrame(self.loop);
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
			
			// More friendly name? (should tidy all this up at some point)
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
},{}]},{},[1,2,3,4,5,6,7,8,9,11,12,13])