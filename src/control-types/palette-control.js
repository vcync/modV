const ControlError = require('./control-error');
const Control = require('./control');

const appendChildren = require('../append-children');
const makeControlGroup = require('../make-control-group');
const colorToRGBString = require('../fragments/color-to-rgb-string');
const hexToRgb = require('../fragments/hex-to-rgb');

module.exports = function(modV) {
	modV.prototype.PaletteControl = class PaletteControl extends Control {

		constructor(settings) {
			let CheckboxControlError = new ControlError('PaletteControl');

			// Check for settings Object
			if(!settings) throw new CheckboxControlError('PaletteControl had no settings');

			// All checks pass, call super
			super(settings);

			this.colors = [];
			let timePeriod = settings.timePeriod || 30;

			Object.defineProperty(this, 'timePeriod', {
				get: () => {
					return timePeriod;
				},
				set: (input) => {
					if(!this.id || !this.modV) return;
					timePeriod = parseInt(input);

					this.modV.setPalette(this.id, {
						timePeriod: timePeriod
					});
				}
			});

			this.nodes = {};
		}

		makeNode(modV, Module, id, isPreset, internalPresetValue) {
			let settings = this.settings;
			this.colors = settings.colors || this.colors;
			this.timePeriod = settings.timePeriod || this.timePeriod;
      
      modV.createPalette(id, this.colors, this.timePeriod);

			Object.defineProperty(Module, this.variable, {
				get: () => {
					let step = modV.palettes.get(id);
					return step ? step.currentStep : 'rgba(0,0,0,0)';
				}
			});

			let controlsDiv = document.createElement('div');

			let loadPaletteSelect = document.createElement('select');

			function updateLoadPaletteSelect(profile) {
				loadPaletteSelect.innerHTML = '';

				forIn(modV.profiles[profile].palettes, palette => {
					let option = document.createElement('option');
					option.textContent = option.value = palette;
					loadPaletteSelect.appendChild(option);
				});
			}

			this.updateProfiles = function(profiles) {
				loadPaletteSelect.innerHTML = '';

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
					loadPaletteSelect.appendChild(node);
				});
			};

			let loadProfileSelector = modV.ProfileSelector({
				onupdate: (profiles) => {
					this.updateProfiles(profiles);
				},
				onchange: (value) => {
					updateLoadPaletteSelect(value);
				}
			});
			loadProfileSelector.init();

			let saveProfileSelector = modV.ProfileSelector({
				onchange: (value) => {
					console.log('save profile selector changed, selected value is', value);
				}
			});
			saveProfileSelector.init();

			var paletteDiv = document.createElement('div');
			paletteDiv.classList.add('palette');
			this.nodes.paletteDiv = paletteDiv;

			this.makePalette(this.colors).forEach((swatch) => {
				paletteDiv.appendChild(swatch);
			});

			var colorPicker = document.createElement('input');
			colorPicker.type = 'color';

			var addButton = document.createElement('button');
			addButton.textContent = '+';
			addButton.addEventListener('click', () => {
				var colorsLength = this.addColor(colorPicker.value);
				var swatch = this.makeColorSwatch(this.colors[colorsLength-1]);
				swatch.id = colorsLength-1;
				paletteDiv.appendChild(swatch);

			});

			var timerRangeNode = document.createElement('input');
			timerRangeNode.type = 'range';
			timerRangeNode.min = 2;
			timerRangeNode.max = 500;
			timerRangeNode.value = this.timePeriod;

			timerRangeNode.addEventListener('input', () => {
				this.timePeriod = timerRangeNode.value;
				modV.setPalette(id, {
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
				console.warn('TODO: make BPM work in worker');
				modV.setPalette(id, {
					useBPM: syncToBPMCheckbox.checked
				});
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
			controlsDiv.appendChild(loadPaletteSelect);


			var loadPaletteButton = document.createElement('button');
			loadPaletteButton.textContent = 'Load Palette';
			// TODO
			loadPaletteButton.addEventListener('click', () => {

				var selectedProfile = loadProfileSelector.value;
				var selectedPalette = loadPaletteSelect.options[loadPaletteSelect.selectedIndex].value;

				var loadedColors = modV.profiles[selectedProfile].palettes[selectedPalette];

				this.colors = [];
				this.addColor(loadedColors);

				paletteDiv.innerHTML = '';
				this.makePalette(this.colors).forEach(function(swatch) {
					paletteDiv.appendChild(swatch);
				});

			});

			controlsDiv.appendChild(loadPaletteButton);

			this.init(id, Module, document.createElement('input'), isPreset, internalPresetValue, modV);

			return controlsDiv;
		}

		addColor(color) {
			let rgbFromHex;
			if(typeof color === 'string') {

				rgbFromHex = hexToRgb(color);
				this.colors.push(rgbFromHex);

			} else if(Array.isArray(color)) {

				color.forEach(col => {
					this.colors.push(col);
				});

			} else return;

			this.modV.setPalette(this.id, {
				colors: this.colors
			});

			return this.colors.length;
		}

		removeAtIndex(index) {
			var returnVal = this.colors.splice(index, 1);

			this.modV.setPalette(this.id, {
				colors: this.colors
			});

			return returnVal;
		}

		clearPalette() {
			this.nodes.paletteDiv.innerHTML = '';
		}

		setPalette(colors) {
			this.clearPalette();
			this.colors = [];
			this.addColor(colors);
			this.makePalette(this.colors).forEach((swatch) => {
				this.nodes.paletteDiv.appendChild(swatch);
			});
			return this.colors;
		}

		makeColorSwatch(color) {
			let swatch = document.createElement('div');
			swatch.classList.add('swatch');
			swatch.style.backgroundColor = colorToRGBString(color);
			swatch.addEventListener('click', () => {

				let nodeList = Array.prototype.slice.call(swatch.parentNode.children);
				let idx = nodeList.indexOf(swatch);

				this.removeAtIndex(idx);
				swatch.remove();
			});
			return swatch;
		}

		makePalette(colors) {
			var swatches = [];
			colors.forEach((color) => {
				var swatch = this.makeColorSwatch(color);
				swatches.push(swatch);
			});

			return swatches;
		}
	};
};