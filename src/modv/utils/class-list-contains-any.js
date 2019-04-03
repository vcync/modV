/**
 * @param {Element} node
 * @param {Array<string>} classNames
 * @return {boolean}
 */
function classListContainsAny(node, classNames) {
  if (!node || !classNames || !(typeof node.classList.value === 'string')) {
    return false
  }

  if (!Array.isArray(classNames)) {
    throw new Error('2nd argument must be Array')
  }

  /**
   * List of element classnames, separated by a space
   * @type {string}
   */
  const classList = node.classList.value

  for (let i = 0; i < classNames.length; i += 1) {
    if (classList.includes(classNames[i])) {
      return true
    }
  }

  return false
}

export default classListContainsAny
