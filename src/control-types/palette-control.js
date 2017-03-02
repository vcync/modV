const Palette = require('./palette');

module.exports = function(modV) {
	modV.prototype.PaletteControl = function PaletteControl(settings) {
		if(typeof settings === "undefined") settings = {};
		
		this.getSettings = function() {
			return settings;
		};

		this.id = '';

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
		for(let key in settings) {
			if(settings.hasOwnProperty(key)) {
				this[key] = settings[key];
			}
		}


		this.makeNode = function(Module, modVSelf) {
			this.creationTime = Date.now();
			let id = Module.info.safeName + '-' + settings.variable + '-' + this.creationTime;

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

			let self = this;
			function updateColoursSetting(colours) {
				self.colours = colours;
			}

			this.callbacks.add = updateColoursSetting;
			this.callbacks.remove = updateColoursSetting;

			let pal = new Palette(this.colours, this.timePeriod, this.callbacks, modVSelf);
			
			let paletteIndex = modVSelf.palettes.push(pal)-1;
			this.paletteIndex = paletteIndex;
			
			this.id = pal.id = id;

			return pal.generateControls();

		};
	};

};