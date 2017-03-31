module.exports = function attachResizeHandles(modV) {
	let resizeTarget = null;

	const attachResizeTop = require('./top')(resizeTarget);
	const attachResizeLeft = require('./left')(resizeTarget);

	attachResizeTop(document.querySelector('resize-handle-top'), () => {
		modV.mainWindowResize();
	});
	attachResizeLeft(document.querySelector('resize-handle-left'));
};