const { classListContainsAll, classListContainsAny } = require('../utils');

/**
 * @param {Element} node
 * @param {Object} hook
 * @todo Typedef for Hook
 */
module.exports = function nodeMatchesHook(node, hook) {
	if(!node || !hook) return false;

	if(typeof hook.nodeType === 'string') {
		if(node.nodeName.toLowerCase() !== hook.nodeType.toLowerCase().trim()) return false;
	} else if(Array.isArray(hook.nodeType)) {

		if(
			!hook.nodeType.find(el => {
				return (node.nodeName.toLowerCase() === el.toLowerCase().trim());
			})
		) {
			return false;
		}
	}

	let classList;
	if(Array.isArray(hook.className)) classList = hook.className;
	else classList = Array(hook.className);

	if(hook.matchAnyClass) {
		if(!classListContainsAny(node, classList)) return false;
	} else {
		if(!classListContainsAll(node, classList)) return false;
	}

	for(let attrib in hook.nodeAttributes) {
		if(attrib in node) {
			if(node[attrib] !== hook.nodeAttributes[attrib]) return false;
		}
	}

	return true;
};
