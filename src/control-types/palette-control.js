const Palette = require('./palette');

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
			console.log(pal);
			
			var paletteIndex = modVSelf.palettes.push(pal)-1;
			self.paletteIndex = paletteIndex;
			
			self.id = pal.id = id;

			return pal.generateControls();

		};
	};

};