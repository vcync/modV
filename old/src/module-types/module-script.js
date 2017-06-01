const Module = require('./module');

module.exports = function(modV) {

	/**
	 * @extends Module
	 */
	class ModuleScript extends Module {

		/**
		 * @param {ModuleSettings} settings
		 */
		constructor(settings) {
			super(settings);
		}
	}

	/**
	 * @name ModuleScript
	 * @memberOf modV
	 * @type {ModuleScript}
	 */
	modV.prototype.ModuleScript = ModuleScript;
};