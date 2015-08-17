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

		if(event.origin !== modV.options.controlDomain) return;
		var id, node;

		if(event.data.type === 'new-preset') {
			var opt = document.createElement('option');
			opt.value = opt.textContent = event.data.name;

			var presetSelect = modV.controllerWindow.window.document.querySelector('#presetListContainer select');
			presetSelect.appendChild(opt);
		}

		if(event.data.type === 'ui') {
			console.log('Controller window UI update', event.data);
			id = event.data.modName + '-' + event.data.name.toLowerCase().replace(/\s+/g, '');
			
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
	container.addInput('mute', 'Mute', 'checkbox', 'checked', true, 'change', function() {
		modV.controllerWindow.window.opener.postMessage({type: 'global', name: 'mute', payload: this.checked}, modV.options.controlDomain);
	});

	// - factory reset button
	container.addInput('factory-reset', 'Factory Reset', 'button', 'value', 'factory-reset', 'click', function() {
		modV.controllerWindow.window.opener.postMessage({type: 'global', name: 'factory-reset', payload: this.value}, modV.options.controlDomain);
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