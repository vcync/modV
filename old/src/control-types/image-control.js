const ControlError = require('./control-error');
const Control = require('./control');

module.exports = function(modV) {
	modV.prototype.ImageControl = class ImageControl extends Control {

		constructor(settings) {
			let ImageControlError = new ControlError('ImageControl');

			// Check for settings Object
			if(!settings) throw new ImageControlError('ImageControl had no settings');

			// All checks pass, call super
			super(settings);
		}

		makeNode(ModuleRef, modV, isPreset, internalPresetValue) {
			let id;
			let Module;
			let variable = this.variable;
			let settings = this.settings;

			if(!settings.useInternalValue) {
				Module = ModuleRef;
				id = Module.info.safeName + '-' + variable;
			} else {
				id = ModuleRef;
			}

			let Media = modV.MediaSelector(
				'image', {
					onchange: path => {
						Module[this.variable].src = path;
					}
				},
				Module[this.variable].src
			);

			if(Media.currentFile) {
				Module[this.variable].src =  Media.currentFile.path;
			}

			let node = Media.returnHTML();
			node.classList.add('modv-image-control');

			this.init(id, ModuleRef, node, isPreset, internalPresetValue, modV);
			return node;
		}
	};
};