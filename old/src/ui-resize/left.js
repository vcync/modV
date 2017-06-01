module.exports = function(resizeTarget) {
	return function attachResizeLeft(handle) {
		let allowDrag = false;
		let layersNode = document.querySelector('.active-list-wrapper');
		let galleryOuterNode = document.querySelector('.gallery-wrapper');

		window.addEventListener('mousedown', (e) => {
			if(e.which > 1) return;
	 		allowDrag = true;
			resizeTarget = e.target;
		});

		window.addEventListener('mouseup', () => {
			allowDrag = false;
			resizeTarget = null;
		});

		window.addEventListener('mousemove', (e) => {
			if(!allowDrag) return;
			if(resizeTarget !== handle) return;

			let percentageWidth = (e.clientX / window.innerWidth) * 100;

			galleryOuterNode.style.width = (100-percentageWidth) + '%';
			layersNode.style.width = percentageWidth + '%';
		});
	};
};