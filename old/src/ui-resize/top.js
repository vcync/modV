module.exports = function(resizeTarget) {
	return function attachResizeTop(handle, cb) {
		let allowDrag = false;
		let topNode = document.querySelector('.top');
		let bottomNode = document.querySelector('.bottom');

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

			let percentageHeight = (e.clientY / window.innerHeight) * 100;

			bottomNode.style.height = (100-percentageHeight) + '%';
			topNode.style.height = percentageHeight + '%';

			if(cb) cb();
		});
	};
};