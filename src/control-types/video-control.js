const ControlError = require('./control-error');
const Control = require('./control');

module.exports = function(modV) {
	modV.prototype.VideoControl = class VideoControl extends Control {

		constructor(settings) {
			let VideoControlError = new ControlError('VideoControl');

			// Check for settings Object
			if(!settings) throw new VideoControlError('VideoControl had no settings');

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

			let Media = modV.MediaSelector('video', {
				onchange: path => {
					Module[this.variable].src = path;
					Module[this.variable].play();
				}
			});

			if(Media.currentFile) {
				Module[this.variable].src = Media.currentFile.path;
				Module[this.variable].play();
			}

			let node = Media.returnHTML();
			node.classList.add('modv-video-control');

			this.init(id, ModuleRef, node, isPreset, internalPresetValue, modV);
			return node;
		}
	};
};