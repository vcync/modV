/**
 * Returns window area
 * @param {Window} win
 * @return {number}
 */
function getWindowSize(win) {
	return win.innerWidth * win.innerHeight;
}

/**
 * Returns Window, which area is larger
 * @param {Window} windowOne
 * @param {Window} windowTwo
 * @return {Window}
 */
function compareWindowsSize(windowOne, windowTwo) {
	const windowOneArea = getWindowSize(windowOne);
	const windowTwoArea = getWindowSize(windowTwo);

	return windowOneArea > windowTwoArea ? windowOne : windowTwo;
}

/**
 * Returns WindowController object with largest window area
 * @see modV-windowControl.js
 * @return {?WindowController}
 */
function getLargestWindow() {
	if (this.outputWindows.length === 0) {
		return null;
	}

	return this.outputWindows.reduce((accumulator, currentValue) => compareWindowsSize(accumulator.window, currentValue.window));
}

module.exports = getLargestWindow;
