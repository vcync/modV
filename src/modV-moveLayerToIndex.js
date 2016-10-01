modV.prototype.moveLayerToIndex = function(oldIndex, newIndex) {
	var layerToMove = this.layers.splice(oldIndex, 1)[0];
	this.layers.splice(newIndex, 0, layerToMove);

	this.layers.forEach((Layer, index) => {
		Layer.updateIndex(index);
	});
};