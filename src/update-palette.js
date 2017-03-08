module.exports = function(modV) {
	modV.prototype.updatePalette = function(id, currentColor, currentStep) {
		this.palettes.set(id, {
			currentColor: currentColor,
			currentStep: currentStep
		});
	};
};