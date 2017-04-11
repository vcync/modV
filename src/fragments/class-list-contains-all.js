module.exports = function classListContainsAll(node, classNames) {
	if(!node || !classNames) return false;
	if(!Array.isArray(classNames)) throw '2nd argument must be Array';

	let classList = node.classList.value;

	for(let i=0; i < classNames.length; i++) {
		let className = classNames[i];

		if(classList.search(className) < 0) {
			return false;
		}
	}

	return true;
};