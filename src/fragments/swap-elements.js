module.exports = function swapElements(obj1, obj2) { //jshint ignore: line
	// save the location of obj2
	var parent2 = obj2.parentNode;
	var next2 = obj2.nextSibling;
	// special case for obj1 is the next sibling of obj2
	if (next2 === obj1) {
		// just put obj1 before obj2
		parent2.insertBefore(obj1, obj2);
	} else {
		// insert obj2 right before obj1
		obj1.parentNode.insertBefore(obj2, obj1);

		// now insert obj1 where obj2 was
		if (next2) {
			// if there was an element after obj2, then insert obj1 right before that
			parent2.insertBefore(obj1, next2);
		} else {
			// otherwise, just append as last child
			parent2.appendChild(obj1);
		}
	}
};