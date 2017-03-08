let LayerSelector = function(callbacks) {

	let select = document.createElement('select');
	select.classList.add('layerSelector');

	this.update = function(layers) {
		// Clear select
		while(select.firstChild) {
			select.removeChild(select.firstChild);
		}

		let option = document.createElement('option');
		option.textContent = 'Last Layer';
		option.value = -1;
		select.appendChild(option);

		layers.forEach((Layer, idx) => {
			let option = document.createElement('option');
			option.textContent = Layer.name;
			option.value = idx;
			select.appendChild(option);
		});
	};

	function selectChanged() {
		if(!('onchange' in callbacks)) return;
		callbacks.onchange(select.value);
	}

	select.addEventListener('change', selectChanged);

	this.returnHTML = function() {
		return select;
	};
};

module.exports = function(modV) {
	modV.prototype.LayerSelector = function(callbacks) {
		let ms = new LayerSelector(callbacks);
		ms.update(this.layers);

		let idx = this.layerSelectors.push(ms)-1;
		return this.layerSelectors[idx];
	};
};