module.exports = function saveOption(option, value) {
	this.sendJSON({
		request: 'save-option',
		key: option,
		value: value
	});
};