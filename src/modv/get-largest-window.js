import store from '@/../store/';

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
function getLargestWindow(windowControllers) {
  const windowReference = store.getters['windows/windowReference'];
  const windows = [];
  windowControllers.forEach((windowC) => {
    windows.push(windowReference(windowC.window));
  });

  if (windows.length === 0) {
    return null;
  }

  const reference = windows.reduce(
    (accumulator, currentValue) => compareWindowsSize(accumulator, currentValue),
  );

  const index = windows.indexOf(reference);

  return {
    window: windows[index],
    controller: windowControllers[index],
  };
}

export default getLargestWindow;
