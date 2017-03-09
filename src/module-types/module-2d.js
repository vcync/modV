const Module = require('./module');

module.exports = function(modV) {
	modV.prototype.Module2D = class Module2D extends Module {

		constructor(settings) {
			super(settings);
		}
	};
};