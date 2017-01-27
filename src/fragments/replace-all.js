module.exports = function replaceAll(string, operator, replacement) {
	return string.split(operator).join(replacement);
};