module.exports = function(modV) {

	modV.prototype.moveLayerToIndex = function(oldIndex, newIndex) {
		let layerToMove = this.layers.splice(oldIndex, 1)[0];
		this.layers.splice(newIndex, 0, layerToMove);

		this.layers.forEach((Layer, index) => {
			Layer.updateIndex(index);
		});

		// Send to remote
		this.remote.update('layerOrder', {
			oldIndex: oldIndex,
			newIndex: newIndex
		});

		this.emit('layerReorder',
			layerToMove,
			oldIndex,
			newIndex
		);

		this.updateLayerSelectors();
	};
};