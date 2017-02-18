const makeControlGroup = require('../../make-control-group');
const appendChildren = require('../../append-children');

module.exports = function(Palette) {
	Palette.prototype.generateControls = function() {

		let loadPaletteListSelect = this.loadPaletteListSelect;
		let loadProfileSelector = this.loadProfileSelector;
		let saveProfileSelector = this.saveProfileSelector;
		let profilesList = this.profilesList;

		var paletteDiv = document.createElement('div');
		paletteDiv.classList.add('palette');
		
		this.makePalette(this.colors).forEach(function(swatch) {
			paletteDiv.appendChild(swatch);
		});
		
	   	var controlsDiv = document.createElement('div');
		
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
		timerRangeNode.value = this.timePeriod/1000;

		timerRangeNode.addEventListener('input', () => {
			this.timePeriod = timerRangeNode.value;
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

			var loadedColors = profilesList[selectedProfile].palettes[selectedPalette];

			this.colors = loadedColors;

			paletteDiv.innerHTML = '';
			this.makePalette(this.colors).forEach(function(swatch) {
				paletteDiv.appendChild(swatch);
			});

		});

		controlsDiv.appendChild(loadPaletteButton);
		
		return controlsDiv;
	};
};