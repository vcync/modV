// based on: http://stackoverflow.com/questions/6116474/how-to-find-if-an-array-contains-a-specific-string-in-javascript-jquery
Array.contains = function(needle, arrhaystack) {
	return (arrhaystack.indexOf(needle) > -1);
};