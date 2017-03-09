const Module = require('./module');

module.exports = function(modV) {
	modV.prototype.ModuleScript = class ModuleScript extends Module {

		constructor(settings) {
			super(settings);
		}
	};
};