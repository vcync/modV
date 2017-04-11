const makeControlGroup = require('../make-control-group');
const appendChildren = require('../append-children');
const colorToRGBString = require('../fragments/color-to-rgb-string');
const hexToRgb = require('../fragments/hex-to-rgb');

module.exports = function(modV) {
	modV.prototype.PaletteControl = function PaletteControl(settings) {
		if(typeof settings === "undefined") settings = {};
		let modVSelf;
		let self = this;

		this.getSettings = function() {
			return settings;
		};

		let id;

		this.getId = function() {
			return id;
		};

		//TODO: error stuff
		// RangeControl error handle
		function ControlError(message) {
			// Grab the stack
			this.stack = (new Error()).stack;

			// Parse the stack for some helpful debug info
			var reg = /\((.*?)\)/;
			var stackInfo = this.stack.split('\n').pop().trim();
			try {
				stackInfo = reg.exec(stackInfo)[0];
			} catch(e) {

			}

			// Expose name and message
			this.name = 'modV.PaletteControl Error';
			this.message = message + ' ' + stackInfo || 'Error';
		}
		// Inherit from Error
		ControlError.prototype = Object.create(Error.prototype);
		ControlError.prototype.constructor = ControlError;

		// Check for settings Object
		if(!settings) throw new ControlError('PaletteControl had no settings');
		// Check for colors
		if(!('colors' in settings)) throw new ControlError('PaletteControl had no "colors" in settings');
		// Check for timePeriod
		if(!('timePeriod' in settings)) throw new ControlError('RangeControl had no "timePeriod" in settings');

		// Check for variable
		if(!('variable' in settings)) throw new ControlError('RangeControl had no "variable" in settings');


		// Copy settings values to local scope
		for(let key in settings) {
			if(settings.hasOwnProperty(key)) {
				this[key] = settings[key];
			}
		}

		function makePalette(colors) {
			var swatches = [];
			colors.forEach((color) => {
				var swatch = makeColorSwatch(color);
				swatches.push(swatch);
			});

			return swatches;
		}

		function makeColorSwatch(color) {
			let swatch = document.createElement('div');
			swatch.classList.add('swatch');
			swatch.style.backgroundColor = colorToRGBString(color);
			swatch.addEventListener('click', () => {

				let nodeList = Array.prototype.slice.call(swatch.parentNode.children);
				let idx = nodeList.indexOf(swatch);

				self.removeAtIndex(idx);
				swatch.remove();
			});
			return swatch;
		}

		this.addColor = (color) => {
			let rgbFromHex;
			if(typeof color === 'string') {

				rgbFromHex = hexToRgb(color);
				this.colors.push(rgbFromHex);

			} else if(Array.isArray(color)) {

				color.forEach(col => {
					this.colors.push(col);
				});

			} else return;

			modVSelf.setPalette(id, {
				colors: this.colors
			});

			return this.colors.length;
		};

		this.setPalette = (palette) => {
			this.colors = [];

			palette.forEach(color => {
				this.colors.push(color);
			});

			modVSelf.setPalette(id, {
				colors: this.colors
			});

			return true;
		};

		this.removeAtIndex = (index) => {
			var returnVal = this.colors.splice(index, 1);

			modVSelf.setPalette(id, {
				colors: this.colors
			});

			return returnVal;
		};

		this.makeNode = (modVthis, Module) => {
			modVSelf = modVthis;

			this.creationTime = Date.now();
			id = Module.info.safeName + '-' + settings.variable + '-' + this.creationTime;

			this.callbacks = {};

			this.callbacks.next = (colour) => {
				Module[this.variable] = colour;
				//Module.updateVariable(this.variable, colour, modVSelf);
			};

			this.callbacks.getBPM = function() {
				return modVSelf.bpm;
			};

			this.callbacks.savePalette = function(profile, paletteName, palette) {

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

			modVSelf.createPalette(id, this.colors, this.timePeriod);

			Object.defineProperty(Module, this.variable, {
				get: () => {
					return modVSelf.palettes.get(id).currentStep;
				}
			});


			let loadPaletteListSelect = document.createElement('select');

			function updateLoadPaletteSelect(profile) {
				loadPaletteListSelect.innerHTML = '';

				forIn(modVSelf.profiles[profile].palettes, palette => {
					let option = document.createElement('option');
					option.textContent = option.value = palette;
					loadPaletteListSelect.appendChild(option);
				});
			}

			this.updateProfiles = function(profiles) {

				loadPaletteListSelect.innerHTML = '';

				let options = [];

				forIn(profiles[loadProfileSelector.value].palettes, palette => {
					let option = document.createElement('option');
					option.textContent = option.value = palette;
					options.push(option);
				});

				options.sort((a, b) => {
					return a.textContent.localeCompare(b.textContent);
				});

				options.forEach(node => {
					loadPaletteListSelect.appendChild(node);
				});

			};

			let loadProfileSelector = modVSelf.ProfileSelector({
				onupdate: (profiles) => {
					this.updateProfiles(profiles);
				},
				onchange: (value) => {
					console.log('load profile selector changed, selected value is', value);
					updateLoadPaletteSelect(value);
				}
			});

			loadProfileSelector.init();

			let saveProfileSelector = modVSelf.ProfileSelector({
				onchange: (value) => {
					console.log('save profile selector changed, selected value is', value);
				}
			});

			saveProfileSelector.init();

			var paletteDiv = document.createElement('div');
			paletteDiv.classList.add('palette');

			makePalette(this.colors).forEach(function(swatch) {
				paletteDiv.appendChild(swatch);
			});

		   	var controlsDiv = document.createElement('div');

			var colorPicker = document.createElement('input');
			colorPicker.type = 'color';

			var addButton = document.createElement('button');
			addButton.textContent = '+';
			addButton.addEventListener('click', () => {
				var colorsLength = this.addColor(colorPicker.value);
				var swatch = makeColorSwatch(this.colors[colorsLength-1]);
				swatch.id = colorsLength-1;
				paletteDiv.appendChild(swatch);

			});

			var timerRangeNode = document.createElement('input');
			timerRangeNode.type = 'range';
			timerRangeNode.min = 2;
			timerRangeNode.max = 500;
			timerRangeNode.value = this.timePeriod;

			timerRangeNode.addEventListener('input', () => {
				modVSelf.setPalette(id, {
					timePeriod: timerRangeNode.value
				});
			});

			let timerRangeGroup = makeControlGroup('Timer Division', timerRangeNode);
			let paletteSwatchGroup = makeControlGroup('Swatches', paletteDiv);

			let addControlsDiv = document.createElement('div');
			appendChildren(addControlsDiv, [colorPicker, addButton]);
			let addColorGroup = makeControlGroup('Add Color', addControlsDiv);

			controlsDiv.appendChild(paletteSwatchGroup);
			controlsDiv.appendChild(addColorGroup);
			controlsDiv.appendChild(timerRangeGroup);



			var savePaletteButton = document.createElement('button');
			savePaletteButton.textContent = 'Save Palette to profile';

			var savePaletteName = document.createElement('input');
			savePaletteName.type = 'text';
			savePaletteName.placeholder = 'Palette name';

			savePaletteButton.addEventListener('click', () => {
				var profilesSelectValue = saveProfileSelector.value;
				if('savePalette' in this.callbacks) this.callbacks.savePalette(profilesSelectValue, savePaletteName.value, this.colors);
			});

			let savePaletteDiv = document.createElement('div');
			appendChildren(savePaletteDiv, [saveProfileSelector.node, savePaletteName, savePaletteButton]);

			let savePaletteGroup = makeControlGroup('Save Palette', savePaletteDiv);
			controlsDiv.appendChild(savePaletteGroup);




			controlsDiv.appendChild(document.createElement('hr'));

			var syncToBPMCheckbox = document.createElement('input');
			syncToBPMCheckbox.type = 'checkbox';
			syncToBPMCheckbox.checked = false;
			syncToBPMCheckbox.addEventListener('change', () => {
				this.useBPM = syncToBPMCheckbox.checked;
			});

			var syncToBPMLabel = document.createElement('label');
			syncToBPMLabel.textContent = 'Use detected BPM ';
			syncToBPMLabel.appendChild(syncToBPMCheckbox);

			controlsDiv.appendChild(syncToBPMLabel);

			var bpmDivisionSpan = document.createElement('span');
			bpmDivisionSpan.textContent = this.bpmDivison;

			var bpmDivisionRange = document.createElement('input');
			bpmDivisionRange.type = 'range';
			bpmDivisionRange.value = 0;
			bpmDivisionRange.min = 0;
			bpmDivisionRange.max = 64;
			bpmDivisionRange.step = 4;

			bpmDivisionRange.addEventListener('input', () => {
				var val = bpmDivisionRange.value;
				if(val === 0) val = 1;
				this.bpmDivison = bpmDivisionRange.value;
				bpmDivisionSpan.textContent = this.bpmDivison;

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
			loadPaletteButton.addEventListener('click', () => {

				var selectedProfile = loadProfileSelector.value;
				var selectedPalette = loadPaletteListSelect.options[loadPaletteListSelect.selectedIndex].value;

				var loadedColors = modVSelf.profiles[selectedProfile].palettes[selectedPalette];

				this.colors = [];
				this.addColor(loadedColors);

				paletteDiv.innerHTML = '';
				makePalette(this.colors).forEach(function(swatch) {
					paletteDiv.appendChild(swatch);
				});

			});

			controlsDiv.appendChild(loadPaletteButton);

			return controlsDiv;

		};
	};

};