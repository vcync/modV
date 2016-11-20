(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.ImageControl = function(settings) {
		var self = this;
		
		self.getSettings = function() {
			return settings;
		};
		
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
			//var selectNode = document.createElement('select');
			var startSource;
			var startSourceFound = false;

			// for(var profile in modVSelf.profiles) {

			// 	if( modVSelf.profiles[profile].files.images.length > 0 ) {

			// 		var optGroupNode = document.createElement('optgroup');
			// 		optGroupNode.label = profile;

			// 		modVSelf.profiles[profile].files.images.forEach(function(image, idx) {

			// 			var optionNode = document.createElement('option');

			// 			if(!startSourceFound && idx === 0) {
			// 				startSource = image.path;
			// 				startSourceFound = true;
			// 				optionNode.selected = true;
			// 			}

			// 			optionNode.value = profile + ',' + idx;
			// 			optionNode.textContent = image.name;

			// 			optGroupNode.appendChild(optionNode);
			// 		});

					
			// 		selectNode.appendChild(optGroupNode);
			// 	}

			// }



			// selectNode.addEventListener('change', function() {

			// 	var profileValue = this.value.split(',');

			// 	var src = modVSelf.profiles[profileValue[0]].files.images[profileValue[1]].path;

			// 	Module[self.variable].src = src;
			
			// }, false);

			let Media = modVSelf.MediaSelector('image', {
				onchange: path => {
					Module[self.variable].src = path;
				}
			});

			Module[self.variable].src = Media.currentFile.path;

			return Media.returnHTML();
		};
	};

})(module);