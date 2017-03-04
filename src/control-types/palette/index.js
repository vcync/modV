function Palette(colors, timePeriod, callbacks, modV) { //jshint ignore:line
	this.useBPM = false;
	this.bpmDivison = 1;
	this.id = '';

	colors = JSON.parse(JSON.stringify(colors)) || [];

	this.colors = colors;
	this.timePeriod = timePeriod || 100;

	console.log('Palette timePeriod given', timePeriod);
	console.log('Palette timePeriod stored', this.timePeriod);

	this.profilesList = [];
	this.loadPaletteListSelect = document.createElement('select');

	this.currentColor = 0; //jshint ignore:line
	this.currentTime = 0; //jshint ignore:line
	//this.timePeriod = Math.round((this.timePeriod/1000) * 60);
	this.callbacks = callbacks;

	this.loadPaletteListSelect = document.createElement('select');

	this.updateLoadPaletteSelect = (profile) => {
		this.loadPaletteListSelect.innerHTML = '';

		forIn(this.profilesList[profile].palettes, palette => {
			let option = document.createElement('option');
			option.textContent = option.value = palette;
			this.loadPaletteListSelect.appendChild(option);
		});
	};

	this.updateProfiles = function(profiles) {

		this.profilesList = profiles;

		this.loadPaletteListSelect.innerHTML = '';

		let options = [];

		forIn(this.profilesList[this.loadProfileSelector.value].palettes, palette => {
			let option = document.createElement('option');
			option.textContent = option.value = palette;
			options.push(option);
		});

		options.sort((a, b) => {
			return a.textContent.localeCompare(b.textContent);
		});

		options.forEach(node => {
			this.loadPaletteListSelect.appendChild(node);
		});

	};

	this.loadProfileSelector = modV.ProfileSelector({
		onupdate: (profiles) => {
			this.updateProfiles(profiles);
		},
		onchange: (value) => {
			console.log('load profile selector changed, selected value is', value);
			this.updateLoadPaletteSelect(value);
		}
	});

	this.loadProfileSelector.init();

	this.saveProfileSelector = modV.ProfileSelector({
		onchange: (value) => {
			console.log('save profile selector changed, selected value is', value);
		}
	});

	this.saveProfileSelector.init();

	if('init' in callbacks) callbacks.init(colors);
}

require('./add-color')(Palette);
require('./generate-controls')(Palette);
require('./get-colors')(Palette);
require('./remove-at-index')(Palette);
require('./make-color-swatch')(Palette);
require('./make-palette')(Palette);
require('./next-step')(Palette);
require('./set-time-period')(Palette);

module.exports = Palette;