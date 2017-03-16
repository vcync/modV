module.exports = function(modV) {
	modV.prototype.addPalette = function(id, colors, duration) {
		if(!this.palettes.has(id)) this.palettes.set(id, {});
		else {
			console.error('Palette with ID', id, 'already exists');
		}
	};
};