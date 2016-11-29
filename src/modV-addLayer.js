modV.prototype.addLayer = function(canvas, context, clearing) {
	let list = document.getElementsByClassName('active-list')[0];
	let Layer = new this.Layer('Layer ' + (this.layers.length+1), canvas, context, clearing, this);

	list.appendChild(Layer.getNode());

	let layerIndex = this.layers.push(Layer)-1;

	this.remote.update('addlayer', {
		index: layerIndex
	});

	return layerIndex;
};