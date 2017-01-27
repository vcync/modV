module.exports = function forIn(item, filter) {
	for(var name in item) {
		if(item.hasOwnProperty(name)) {
			filter(name, item[name]);
		}
	}
};