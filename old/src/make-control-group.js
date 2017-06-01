module.exports = function makeControlGroup(labelText, inputNode) {

	let controlGroup = document.createElement('div');
	controlGroup.classList.add('control-group');

	let labelNode = document.createElement('label');
	labelNode.textContent = labelText;

	controlGroup.appendChild(labelNode);
	controlGroup.appendChild(inputNode);

	return controlGroup;
};