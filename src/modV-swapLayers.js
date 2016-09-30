modV.prototype.swapLayers = function(oldIndex, newIndex) {
	let oldLayer = this.layers[oldIndex];
	let newLayer = this.layers[newIndex];

	oldLayer.updateIndex(newIndex);
	newLayer.updateIndex(oldIndex);

	[this.layers[oldIndex], this.layers[newIndex]] = [this.layers[newIndex], this.layers[oldIndex]];
};