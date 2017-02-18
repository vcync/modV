module.exports = function(Palette) {
	Palette.prototype.removeAtIndex = function(index) {
		var returnVal = this.colors.splice(index, 1);
		if('remove' in this.callbacks) this.callbacks.remove(this.colors);
		return returnVal;
	};
};