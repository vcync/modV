/** @module utils */

/**
 * @param {Element} node
 * @param {Array<string>} classNames
 * @return {boolean}
 */
function classListContainsAll(node, classNames) {
  if (!node || !classNames || !(typeof node.classList.value === 'string')) {
    return false;
  }

  if (!Array.isArray(classNames)) {
    throw new Error('2nd argument must be Array');
  }

  /**
   * List of element classnames, separated by a space
   * @type {string}
   */
  const nodeClassName = node.classList.value;

  for (let i = 0; i < classNames.length; i += 1) {
    if (!nodeClassName.includes(classNames[i])) {
      return false;
    }
  }

  return true;
}

export default classListContainsAll;
