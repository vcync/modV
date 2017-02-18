module.exports = function colourToRGBString(colour) {
	try {
		return 'rgb(' +
			colour[0] +
			', ' +
			colour[1] +
			', ' +
			colour[2] +
			')';
	} catch(e) {
		return 'rgb(0,0,0)';
	}
};