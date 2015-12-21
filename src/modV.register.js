(function(bModule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.register = function(Module) {
		var self = this;
		
		if(Module instanceof self.Module2D) {
			console.info('Register: Module2D');

			// Set meta
			Module.info.alpha = 1;
			Module.info.disabled = true;

			// Get name
			var name = Module.info.name;

			// Parse Meyda
			if(Module.info.meyda) {
				Module.info.meyda.forEach(self.addMeydaFeature);
			}

			// Initialise Module
			Module.init();

			// Parse Controls
			// Not necessary any more.
			// New UI will parse controls on creation.

			// Add to registry
			self.registeredMods[name] = Module;

			// TODO: remove setModOrder and modOrder
			self.setModOrder(name, Object.size(self.registeredMods));

			// TEST
			self.registeredMods[name].info.disabled = false;
		}
	};

})(module);