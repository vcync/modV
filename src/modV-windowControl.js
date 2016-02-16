(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	var drunkenMess = function() {
		return 'You sure about that, you drunken mess?';
	};
	window.onbeforeunload = drunkenMess;

	// Creates Controller Window
	// > must be bound to modV's scope
	var createControlWindow = function() {
		var self = this;

		var cWindow = window.open('',
			'_blank',
			'width=' + (screen.width/100)*33.3 +
			',height=' + screen.height +
			', location=yes, menubar=yes, left=' + (screen.width/100)*66.6);

		// Set window CSS
		var link = document.createElement('link');
		link.href = window.location.origin + window.location.pathname + 'control-style.css';
		link.rel = 'stylesheet';
		cWindow.window.document.head.appendChild(link);

		// Set window close confirmation
		cWindow.onbeforeunload = drunkenMess;

		cWindow.window.document.body.classList.add('pure-form-stacked'); // TODO: figure out if this is needed

		// Set Window message reciever
		// > binds to this scope
		cWindow.window.addEventListener('message', cWindowReceiveMessage.bind(self), false);

		// TODO: finish up info panel
		var infoPanel = document.createElement('section');
		infoPanel.classList.add('info-panel', 'pure-u-1-1');
		
		var infoPanelInner = document.createElement('div');
		infoPanelInner.classList.add('pure-g');

		var paletteCount 	= document.createElement('div');
			paletteCount.classList.add('pure-u-1-5', 'palette-count');
		var activeModules 	= document.createElement('div');
			activeModules.classList.add('pure-u-1-5', 'active-modules');
		var frameRate 		= document.createElement('div');
			frameRate.classList.add('pure-u-1-5', 'frame-rate');
		var detectedBPM 	= document.createElement('div');
			detectedBPM.classList.add('pure-u-1-5', 'detected-bpm-container');

		var detectedBPMValue = document.createElement('div');
			detectedBPMValue.classList.add('detected-bpm');

		var bpmHoldCheckbox = document.createElement('input');
			bpmHoldCheckbox.type = 'checkbox';
			bpmHoldCheckbox.checked = false;
			bpmHoldCheckbox.addEventListener('change', function() {
				self.bpmHold = this.checked;
			});

		var bpmHoldLabel = document.createElement('label');
		bpmHoldLabel.textContent = 'Hold BPM';
		bpmHoldLabel.appendChild(bpmHoldCheckbox);

		detectedBPM.appendChild(detectedBPMValue);
		detectedBPM.appendChild(bpmHoldLabel);

		var activeBots 		= document.createElement('div');
			activeBots.classList.add('pure-u-1-5', 'active-bots');

		infoPanelInner.appendChild(paletteCount);
		infoPanelInner.appendChild(activeModules);
		infoPanelInner.appendChild(frameRate);
		infoPanelInner.appendChild(detectedBPM);
		infoPanelInner.appendChild(activeBots);

		infoPanel.appendChild(infoPanelInner);

		cWindow.document.body.appendChild(infoPanel);

		// TODO: tidy up following control code
		// Add modV controls
		var container = new self.ContainerGenerator('Global', false);
		
		// - clearing
		container.addInput('clearing', 'Clearing', 'checkbox', 'checked', false, 'change', function() {
			cWindow.window.opener.postMessage({type: 'global', name: 'clearing', payload: this.checked}, self.options.controlDomain);
		});

		// - mute / unmute input
		container.addInput('mute', 'Mute', 'checkbox', 'checked', true, 'change', function() {
			cWindow.window.opener.postMessage({type: 'global', name: 'mute', payload: this.checked}, self.options.controlDomain);
		});

		// - factory reset button
		container.addInput('factory-reset', 'Factory Reset', 'button', 'value', 'factory-reset', 'click', function() {
			cWindow.window.opener.postMessage({type: 'global', name: 'factory-reset', payload: this.value}, self.options.controlDomain);
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
			
			var savePresetContainer = cWindow.document.getElementById('savePresetContainer');
			var text = savePresetContainer.querySelector('input[type="text"]');

			var confirmed = false,
				dialog = false;
			
			if(text.value in self.presets) {
				dialog = true;
				confirmed = confirm('A preset with the name "' + text.value + '"already exists!\nIs it okay to overwrite?');
			}
			
			if(!dialog || (dialog && confirmed)) {
				cWindow.window.opener.postMessage({
					type: 'global',
					name: 'savepreset',
					payload: {
						name: text.value
					}
				}, self.options.controlDomain);

				dialog = confirmed = false;
			}
		});
		savePresetDiv.appendChild(text);
		savePresetDiv.appendChild(button);
		container.addSpecial(savePresetDiv);

		// TODO - MOVE LOADING PRESETS TO modV.js
		// TODO - WRITE CONTROLLER MESSAGE HANDLER FOR PRESET LIST UPDATES
		// TODO - WRITE WEBSOCKET PRESET HANDLER
		// TODO - ADD OPTION TO (SETTINGS) FOR SAVING ENABLED MODULES ONLY << Very important
		// TODO - PRESET EXPORT << sort of already done (media manaer)? double check when not drunk
		// TODO - ADD PRESET KEY TO MODULE INFO (PER MODULE PRESETS) <<< (so, preset per module - objecy key for preset name then object key of variable names and values)
		// TODO - VALIDATION ON PRESET READING. CHECK NAME, AUTHOR AND VERSION <<< Very important (especially because of new media manager)

		var loadPresetDiv = document.createElement('div');
		loadPresetDiv.id = 'presetListContainer';
		
		var loadPresetDropdown = document.createElement('select');

		var loadPresetButton = document.createElement('button');
		loadPresetButton.textContent = 'Load Preset';
		loadPresetButton.addEventListener('click', function() {

			var presetListContainer = cWindow.document.getElementById('presetListContainer');

			cWindow.window.opener.postMessage({
				type: 'global',
				name: 'loadpreset',
				payload: {
					name: presetListContainer.querySelector('select').value
				}
			}, self.options.controlDomain);
			
		});

		loadPresetDiv.appendChild(loadPresetDropdown);
		loadPresetDiv.appendChild(loadPresetButton);
		container.addSpecial(loadPresetDiv);
		
		cWindow.document.body.appendChild(container.output());

		return cWindow;
	};

	// Creates Preview Window
	// > must be bound to modV's scope
	var createPreviewWindow = function() {
		var self = this;

		// TODO: bind this window's resize to the spect ratio of the main window
		// http://jsfiddle.net/yUenJ/
		// http://stackoverflow.com/a/5664172/1539303

		var pWindow = window.open('', '_blank', 'width=1, height=1, location=no, menubar=no, left=0');
		var pCanvas = document.createElement('canvas');
		var pCtx = pCanvas.getContext('2d');
		
		pWindow.document.body.style.margin = '0px';
		pWindow.document.body.style.backgroundColor = 'black';
		pCanvas.style.position = 'fixed';
		
		pCanvas.style.top = pCanvas.style.bottom = pCanvas.style.left = pCanvas.style.right = 0;

		pWindow.onbeforeunload = drunkenMess;

		pWindow.addEventListener('resize', function() {

			if(window.devicePixelRatio > 1 && self.options.retina) {

				self.canvas.width = pWindow.innerWidth * window.devicePixelRatio;
				self.canvas.height = pWindow.innerHeight * window.devicePixelRatio;
				pCanvas.width = pWindow.innerWidth * window.devicePixelRatio;
				pCanvas.height = pWindow.innerHeight * window.devicePixelRatio;

			} else {

				self.canvas.width = pWindow.innerWidth;
				self.canvas.height = pWindow.innerHeight;
				pCanvas.width = pWindow.innerWidth;
				pCanvas.height = pWindow.innerHeight;

			}
			pCanvas.style.width = pWindow.innerWidth + 'px';
			pCanvas.style.height = pWindow.innerHeight + 'px';

			self.resize();

		});

		//resizeEnd();

		pWindow.document.body.appendChild(pCanvas);

		return [pWindow, pCanvas, pCtx];
	};

	modV.prototype.createWindows = function() {
		var self = this;

		// Set modV.prototype.controllerWindow
		var cWindow = createControlWindow.bind(self);
		self.controllerWindow = cWindow();

		// Set modV.prototype.previewWindow
		if(self.options.previewWindow) {
			var pWindow = createPreviewWindow.bind(self);
			var pOutput = pWindow();
			self.previewWindow 	= pOutput[0];
			self.previewCanvas 	= pOutput[1];
			self.previewCtx 	= pOutput[2];
		}

		// OnClose
		window.addEventListener('beforeunload', function() {
			try {
				self.controllerWindow.close();
				self.previewWindow.close();
			} catch(e) {
				// oops window not found.
			}
		}, false);
	};
								   	
	// var slipJS = document.createElement('script');
	// slipJS.src = './libraries/slip.js';
	
	// slipJS.onload = function() {
	
	// 	modV.prototype.controllerWindow.window.document.body.addEventListener('slip:beforewait', function(e){
	// 		if (e.target.className.indexOf('instant') > -1) e.preventDefault();
	// 	}, false);
	
	// 	modV.prototype.controllerWindow.window.document.body.addEventListener('slip:reorder', function(e){
	// 		e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
	// 		return false;
	// 	}, false);
		
	// 	modV.prototype.controllerWindow.window.initSlip = function() {
	// 		new Slip(controllerWindow.window.document.body);
	// 	};
	// 	modV.prototype.controllerWindow.window.initSlip();
	// };
	
	// modV.prototype.controllerWindow.window.document.head.appendChild(slipJS);
	
	// Controller Window Message Reciever
	// > method must be bound to the modV scope
	var cWindowReceiveMessage = function(event) {
		var self = this;

		if(event.origin !== self.options.controlDomain) return;
		var id, node;

		if(event.data.type === 'new-preset') {
			var opt = document.createElement('option');
			opt.value = opt.textContent = event.data.name;

			var presetSelect = self.controllerWindow.window.document.querySelector('#presetListContainer select');
			presetSelect.appendChild(opt);
		}

		if(event.data.type === 'ui') {
			console.log('Controller window UI update', event.data);
			id = event.data.modName + '-' + event.data.name.toLowerCase().replace(/\s+/g, '');
			
			node = self.controllerWindow.window.document.getElementById(id);
			if(!node) return;
			self.controllerWindow.window.console.log(id, node, event.data.payload);
						
			if(event.data.varType === 'checkbox') {
				node.checked = event.data.payload;
			} else {
				node.value = event.data.payload;
			}
		}

		if(event.data.type === 'ui-blend') {
			id = event.data.modName + '-blend';
			node = self.controllerWindow.window.document.getElementById(id);
			self.controllerWindow.window.console.log(id, node, event.data.payload);

			for (var i = 0; i < node.options.length; i++) {
				if (node.options[i].value === event.data.payload) {
					node.selectedIndex = i;
					break;
				}
			}
		}

		if(event.data.type === 'ui-enabled') {
			id = event.data.modName + '-enabled';
			node = self.controllerWindow.window.document.getElementById(id);
			self.controllerWindow.window.console.log(id, node, event.data.payload);
			node.checked = event.data.payload;
		}

		if(event.data.type === 'ui-opacity') {
			id = event.data.modName + '-opacity';
			node = self.controllerWindow.window.document.getElementById(id);
			self.controllerWindow.window.console.log(id, node, event.data.payload);
			node.value = event.data.payload;
		}

		if(event.data.type === 'info') {
			var panel;
			switch(event.data.name) {

				case 'palette-count':
					panel = self.controllerWindow.document.querySelector('.palette-count');
					panel.textContent = '#palettes:' + event.data.payload;
					break;

				case 'active-modules':
					panel = self.controllerWindow.document.querySelector('.active-modules');
					panel.textContent = 'Active modules: ' + event.data.payload;
					break;

				case 'frame-rate':
					panel = self.controllerWindow.document.querySelector('.frame-rate');
					panel.textContent = 'Frame rate: ' + event.data.payload;
					break;

				case 'detected-bpm':
					panel = self.controllerWindow.document.querySelector('.detected-bpm');
					panel.textContent = 'BPM: ' + event.data.payload;
					break;

				case 'active-bots':
					panel = self.controllerWindow.document.querySelector('.active-bots');
					panel.textContent = 'Active bots: ' + event.data.payload;
					break;
			}
		}
		
	};

	// - load preset
	// TODO: move this into own file
	modV.prototype.addPresetToController = function(presetName, controlDomain) {
		var self = this;

		self.controllerWindow.postMessage({type: 'new-preset', name: presetName}, controlDomain);
	};

})(module);