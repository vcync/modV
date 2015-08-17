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
			
			console.log(event.data);

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