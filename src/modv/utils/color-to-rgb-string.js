/**
 * @todo Try-Catch is bad, needs to rewrite
 * @param {Object} color
 * @return {string}
 */
function colorToRGBString(color) {
  try {
    return `rgb(${color[0]},${color[1]},${color[2]})`;
  } catch (e) {
    return 'rgb(0,0,0)';
  }
}

export default colorToRGBString;
