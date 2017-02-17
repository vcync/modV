module.exports = function calculateStep(colors, currentColor, currentTime, timePeriod) {
	var r1, g1, b1;
	try {	
		r1 = colors[currentColor][0];
		g1 = colors[currentColor][1];
		b1 = colors[currentColor][2];
	} catch(e) {
		// try catch because the user may delete the current colour which throws the array and nextIndex out of sync
		// TODO: fix case where user deletes current colour
		return;
	}
	
	var nextColor = currentColor + 1;
	
	if(nextColor > colors.length-1) {
		nextColor = 0;
	}
	
	var r2 = colors[nextColor][0];
	var g2 = colors[nextColor][1];
	var b2 = colors[nextColor][2];
	
	var p = currentTime / (timePeriod - 1);
	var r = Math.round((1.0-p) * r1 + p * r2 + 0.5);
	var g = Math.round((1.0-p) * g1 + p * g2 + 0.5);
	var b = Math.round((1.0-p) * b1 + p * b2 + 0.5);
	
	return [r, g, b];
};