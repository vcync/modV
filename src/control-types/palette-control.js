const makeControlGroup = require('../make-control-group');
const appendChildren = require('../append-children');

var Palette = function(colours, timePeriod, callbacks, modV) {
	
	var self = this;

	colours = JSON.parse(JSON.stringify(colours)) || [];

	self.useBPM = false;
	self.bpmDivison = 1;
	self.id = '';

	if('init' in callbacks) callbacks.init(colours);
	
	timePeriod = Math.round((timePeriod/1000) * 60);
	
	var currentColour = 0;
	var currentTime = 0;
   	
	// Modified from: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	function hexToRgb(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16)
		] : null;
	}
	
	self.addColour = function(colour) {
		var rgbFromHex;
		if(typeof colour === "string") {

			rgbFromHex = hexToRgb(colour);
			colours.push(rgbFromHex);
			
		} else if(colour.constructor === Array) {

			colours.push(rgbFromHex);

		} else return;

		if('add' in callbacks) callbacks.add(colours);
		return colours.length;
	};
	
	self.removeAtIndex = function(index) {
		var returnVal = colours.splice(index, 1);
		if('remove' in callbacks) callbacks.remove(colours);
		return returnVal;
	};
	
	self.getColours = function() {
		return colours;
	};
	
	function colourToRGBString(colour) {
		try {
			return 'rgb(' +
				colour[0] +
				', ' +
				colour[1] +
				', ' +
				colour[2] +
				')';
		} catch(e) {
			return 'rgb(0,0,0)';
		}
	}
	
	function calculateStep() {
		var r1, g1, b1;
		try {	
			r1 = colours[currentColour][0];
			g1 = colours[currentColour][1];
			b1 = colours[currentColour][2];
		} catch(e) {
			// try catch because the user may delete the current colour which throws the array and nextIndex out of sync
			// TODO: fix case where user deletes current colour
			return;
		}
		
		var nextColour = currentColour + 1;
		
		if(nextColour > colours.length-1) {
			nextColour = 0;
		}
		
		var r2 = colours[nextColour][0];
		var g2 = colours[nextColour][1];
		var b2 = colours[nextColour][2];
		
		var p = currentTime / (timePeriod - 1);
		var r = Math.round((1.0-p) * r1 + p * r2 + 0.5);
		var g = Math.round((1.0-p) * g1 + p * g2 + 0.5);
		var b = Math.round((1.0-p) * b1 + p * b2 + 0.5);
		
		return [r, g, b];
	}
	
	self.nextStep = function() {
		
		if(self.useBPM) {
			timePeriod = Math.round(callbacks.getBPM() / self.bpmDivison);
		}

		if(colours.length < 1) {
			// If there are no colours, return false
			return false;
		} else if(colours.length < 2) {
			// If there are less than two colours, just return the only colour
			return colourToRGBString(colours[0]);
		}
		
		currentTime++;
		if(currentTime >= timePeriod) {
			if(currentColour > colours.length-2) {
				currentColour = 0;
			} else {
				currentColour++;
			}
			currentTime = 0;
		}
		
		var returned = calculateStep();
		returned = colourToRGBString(returned);

		if('next' in callbacks) callbacks.next(returned);
		
		return returned;
	};
	
	self.setTimePeriod = function() {
		// TODO: sets time period and updates current time period if old is greater than new
	};
	
	function makeColourSwatch(colour) {
		var swatch = document.createElement('div');
		swatch.classList.add('swatch');
		swatch.style.backgroundColor = colourToRGBString(colour);
		swatch.addEventListener('click', function() {

			var nodeList = Array.prototype.slice.call(this.parentNode.children);
			var idx = nodeList.indexOf(this);

			self.removeAtIndex(idx);
			this.remove();
		});
		return swatch;
	}

	var profilesList = [];
	var loadPaletteListSelect = document.createElement('select');

	self.updateLoadPaletteSelect = (profile) => {
		loadPaletteListSelect.innerHTML = '';

		forIn(profilesList[profile].palettes, palette => {
			let option = document.createElement('option');
			option.textContent = option.value = palette;
			loadPaletteListSelect.appendChild(option);
		});
	};

	self.updateProfiles = function(profiles) {

		profilesList = profiles;

		loadPaletteListSelect.innerHTML = '';

		forIn(profilesList[loadProfileSelector.value].palettes, palette => {
			let option = document.createElement('option');
			option.textContent = option.value = palette;
			loadPaletteListSelect.appendChild(option);
		});
	};

	var loadProfileSelector = modV.ProfileSelector({
		onupdate: (profiles) => {
			this.updateProfiles(profiles);
		},
		onchange: (value) => {
			console.log('load profile selector changed, selected value is', value);
			this.updateLoadPaletteSelect(value);
		}
	});

	loadProfileSelector.init();

	let saveProfileSelector = modV.ProfileSelector({
		onchange: (value) => {
			console.log('save profile selector changed, selected value is', value);
			//self.updateProfiles();
		}
	});

	saveProfileSelector.init();

	self.makePalette = function(colours) {
		var swatches = [];
		colours.forEach(function(colour) {
			var swatch = makeColourSwatch(colour);
			swatches.push(swatch);
		});

		return swatches;
	};
	
	self.generateControls = function() {

		//self.updateProfiles(modV.profiles);

		var paletteDiv = document.createElement('div');
		paletteDiv.classList.add('palette');
		
		self.makePalette(colours).forEach(function(swatch) {
			paletteDiv.appendChild(swatch);
		});
		
	   	var controlsDiv = document.createElement('div');
		
		var colourPicker = document.createElement('input');
		colourPicker.type = 'color';
		
		var addButton = document.createElement('button');
		addButton.textContent = '+';
		addButton.addEventListener('click', function() {
			var coloursLength = self.addColour(colourPicker.value);
			var swatch = makeColourSwatch(colours[coloursLength-1]);
			swatch.id = coloursLength-1;
			paletteDiv.appendChild(swatch);

		});

		var timerRangeNode = document.createElement('input');
		timerRangeNode.type = 'range';
		timerRangeNode.min = 2;
		timerRangeNode.max = 500;
		timerRangeNode.value = timePeriod/1000;

		timerRangeNode.addEventListener('input', function() {
			timePeriod = this.value;
		});

		let timerRangeGroup = makeControlGroup('Timer Division', timerRangeNode);
		let paletteSwatchGroup = makeControlGroup('Swatches', paletteDiv);

		let addControlsDiv = document.createElement('div');
		appendChildren(addControlsDiv, [colourPicker, addButton]);
		let addColorGroup = makeControlGroup('Add Color', addControlsDiv);

		controlsDiv.appendChild(paletteSwatchGroup);
		controlsDiv.appendChild(addColorGroup);
		controlsDiv.appendChild(timerRangeGroup);



		var savePaletteButton = document.createElement('button');
		savePaletteButton.textContent = 'Save Palette to profile';

		var savePaletteName = document.createElement('input');
		savePaletteName.type = 'text';
		savePaletteName.placeholder = 'Palette name';

		savePaletteButton.addEventListener('click', function() {
			var profilesSelectValue = saveProfileSelector.value;
			if('savePalette' in callbacks) callbacks.savePalette(profilesSelectValue, savePaletteName.value, colours);
		});

		let savePaletteDiv = document.createElement('div');
		appendChildren(savePaletteDiv, [saveProfileSelector.node, savePaletteName, savePaletteButton]);

		let savePaletteGroup = makeControlGroup('Save Palette', savePaletteDiv);
		controlsDiv.appendChild(savePaletteGroup);
		



		controlsDiv.appendChild(document.createElement('hr'));

		var syncToBPMCheckbox = document.createElement('input');
		syncToBPMCheckbox.type = 'checkbox';
		syncToBPMCheckbox.checked = false;
		syncToBPMCheckbox.addEventListener('change', function() {
			self.useBPM = this.checked;
		});

		var syncToBPMLabel = document.createElement('label');
		syncToBPMLabel.textContent = 'Use detected BPM ';
		syncToBPMLabel.appendChild(syncToBPMCheckbox);

		controlsDiv.appendChild(syncToBPMLabel);

		var bpmDivisionSpan = document.createElement('span');
		bpmDivisionSpan.textContent = self.bpmDivison;

		var bpmDivisionRange = document.createElement('input');
		bpmDivisionRange.type = 'range';
		bpmDivisionRange.value = 0;
		bpmDivisionRange.min = 0;
		bpmDivisionRange.max = 64;
		bpmDivisionRange.step = 4;

		bpmDivisionRange.addEventListener('input', function() {
			var val = this.value;
			if(val === 0) val = 1;
			self.bpmDivison = this.value;
			bpmDivisionSpan.textContent = self.bpmDivison;

		});

		var bpmDivisonLabel = document.createElement('label');
		bpmDivisonLabel.textContent = 'BPM Division ';

		bpmDivisonLabel.appendChild(bpmDivisionRange);
		bpmDivisonLabel.appendChild(bpmDivisionSpan);

		controlsDiv.appendChild(bpmDivisonLabel);

		controlsDiv.appendChild(document.createElement('hr'));
		controlsDiv.appendChild(loadProfileSelector.node);
		controlsDiv.appendChild(loadPaletteListSelect);


		var loadPaletteButton = document.createElement('button');
		loadPaletteButton.textContent = 'Load Palette';
		// TODO
		loadPaletteButton.addEventListener('click', function() {

			var selectedProfile = loadProfileSelector.value;
			var selectedPalette = loadPaletteListSelect.options[loadPaletteListSelect.selectedIndex].value;

			var loadedColours = profilesList[selectedProfile].palettes[selectedPalette];

			colours = loadedColours;

			paletteDiv.innerHTML = '';
			self.makePalette(colours).forEach(function(swatch) {
				paletteDiv.appendChild(swatch);
			});

		});

		controlsDiv.appendChild(loadPaletteButton);
		
		return controlsDiv;
	};

};

module.exports = function(modV) {
	modV.prototype.PaletteControl = function(settings) {
		var self = this;
		if(typeof settings === "undefined") settings = {};
		
		self.getSettings = function() {
			return settings;
		};

		self.id = '';

		//TODO: error stuff
/*		// RangeControl error handle
		function ControlError(message) {
			// Grab the stack
			this.stack = (new Error()).stack;

			// Parse the stack for some helpful debug info
			var reg = /\((.*?)\)/;    
			var stackInfo = this.stack.split('\n').pop().trim();
			stackInfo = reg.exec(stackInfo)[0];

			// Expose name and message
			this.name = 'modV.RangeControl Error';
			this.message = message + ' ' + stackInfo || 'Error';  
		}
		// Inherit from Error
		ModuleError.prototype = Object.create(Error.prototype);
		ModuleError.prototype.constructor = ModuleError;

		self.getSettings = function() {
			return settings;
		};

		// Check for settings Object
		if(!settings) throw new ModuleError('RangeControl had no settings');
		// Check for info Object
		if(!('info' in settings)) throw new ModuleError('RangeControl had no info in settings');
		// Check for info.name
		if(!('name' in settings.info)) throw new ModuleError('RangeControl had no name in settings.info');
		// Check for info.author
		if(!('author' in settings.info)) throw new ModuleError('RangeControl had no author in settings.info');
		// Check for info.version
		if(!('version' in settings.info)) throw new ModuleError('RangeControl had no version in settings.info');*/

		// Copy settings values to local scope
		for(var key in settings) {
			if(settings.hasOwnProperty(key)) {
				self[key] = settings[key];
			}
		}


		self.makeNode = function(Module, modVSelf) {
			self.creationTime = Date.now();
			let id = Module.info.safeName + '-' + settings.variable + '-' + self.creationTime;

			self.callbacks = {};

			self.callbacks.next = function(colour) {
				Module[self.variable] = colour;
				//Module.updateVariable(self.variable, colour, modVSelf);
			};

			self.callbacks.getBPM = function() {
				return modVSelf.bpm;
			};

			self.callbacks.savePalette = function(profile, paletteName, palette) {

				window.postMessage({
					type: 'global',
					name: 'savepalette',
					payload: {
						palette: palette,
						profile: profile,
						name: paletteName
					}
				}, modVSelf.options.controlDomain);

			};

			function updateColoursSetting(colours) {
				self.colours = colours;
			}

			self.callbacks.add = updateColoursSetting;
			self.callbacks.remove = updateColoursSetting;

			var pal = new Palette(self.colours, self.timePeriod, self.callbacks, modVSelf);

			var paletteIndex = modVSelf.palettes.push(pal)-1;
			self.paletteIndex = paletteIndex;
			
			self.id = pal.id = id;

			return pal.generateControls();

		};
	};

};