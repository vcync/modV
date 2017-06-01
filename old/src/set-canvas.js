module.exports = function(modV) {
	modV.prototype.setCanvas = function(el) {
		if(el.nodeName !== 'CANVAS') {
			console.error('modV: setCanvas was not supplied with a CANVAS element.');
			return false;
		}
		this.canvas = el;
		this.context = el.getContext('2d');

		return true;
	};
};