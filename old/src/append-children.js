module.exports = function appendChildren(element, children) {
	children.forEach(child => {
		element.appendChild(child);
	});
};