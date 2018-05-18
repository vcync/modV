import store from '@/../store/';

/**
 * Returns window area
 * @param {Window} win
 * @return {number}
 */
function getWindowSize(win) {
  return {
    area: win.innerWidth * win.innerHeight,
    width: win.innerWidth,
    height: win.innerHeight,
  };
}

/**
 * Returns Window, which area is larger
 * @param {Window} windowOne
 * @param {Window} windowTwo
 * @return {Window}
 */
function compareWindowsSize(windowOne, windowTwo) {
  const windowOneArea = getWindowSize(windowOne).area;
  const windowTwoArea = getWindowSize(windowTwo).area;

  return windowOneArea > windowTwoArea ? windowOne : windowTwo;
}

/**
 * Returns WindowController object with largest window area
 * @see modV-windowControl.js
 * @return {?WindowController}
 */
function getLargestWindow(windowControllers) {
  const windowReference = store.getters['windows/windowReference'];
  const windows = [];
  windowControllers.forEach((windowC) => {
    windows.push(windowReference(windowC.window));
  });

  if (windows.length === 0) {
    return null;
  }

  const reference = windows
    .reduce((accumulator, currentValue) => compareWindowsSize(accumulator, currentValue));

  const index = windows.indexOf(reference);

  return {
    window: windows[index],
    controller: windowControllers[index],
    size: getWindowSize(windows[index]),
  };
}

export default getLargestWindow;
