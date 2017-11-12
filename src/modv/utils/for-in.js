/**
 * @callback forInCallback
 * @param {string} key
 * @param {*} value
 */

/**
 * @param {Object} item
 * @param {forInCallback} callback
 */
function forIn(item, callback) {
  Object.keys(item).forEach((name) => {
    callback(name, item[name]);
  });
}

export default forIn;
