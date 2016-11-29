modV.prototype.updateLayerControls = function() {
	let layerControlsCurrentLayer = document.querySelector('.layer-controls h2');
	let Layer = this.layers[this.activeLayer];
	let layerName = Layer.name;
	layerControlsCurrentLayer.textContent = layerName;

	let layerControlPanel = document.querySelector('.layer-control-panel-wrapper .layer-controls');

	layerControlPanel.querySelector('#clearingLayers').checked = Layer.clearing;
	layerControlPanel.querySelector('#inheritLayers').checked = Layer.inherit;
	layerControlPanel.querySelector('#pipeLineLayers').checked = Layer.pipline;
};