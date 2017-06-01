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

  for(let i = 0; i < classNames.length; i++) {
    if(!nodeClassName.includes(classNames[i])) {
      return false;
    }
  }

  return true;
}

/**
 * @param {Element} node
 * @param {Array<string>} classNames
 * @return {boolean}
 */
function classListContainsAny(node, classNames) {
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

  for(let i = 0; i < classNames.length; i++) {
    if(classList.includes(classNames[i])) {
      return true;
    }
  }

  return false;
}

/**
 * @todo Try-Catch is bad, needs to rewrite
 * @param {Object} color
 * @return {string}
 */
function colorToRGBString(color) {
  try {
    return 'rgb(' +
      color[0] +
      ', ' +
      color[1] +
      ', ' +
      color[2] +
      ')';
  } catch(e) {
    return 'rgb(0,0,0)';
  }
}

/**
 * @todo We can make a common Color type with getHex etc methods (safe and easy to use)
 * Modified from: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param {string} hex
 * @return {?Array<number>}
 */
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

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
  for(var name in item) {
    if(item.hasOwnProperty(name)) {
      callback(name, item[name]);
    }
  }
}

/**
 * @callback getDocumentCallback
 * @param {?Document} XML or HTML Document
 */

/**
 * @param {string} url
 * @param {getDocumentCallback} callback
 */
function getDocument(url, callback) {
  var xhr = new XMLHttpRequest();

  xhr.onload = function() {
    callback(xhr.responseXML);
  };

  xhr.open("GET", url);
  xhr.responseType = "document";
  xhr.send();
}

/**
 * @param {string} url
 * @param {Element} targetElement Element in which script is inserted
 * @param {Module} module
 * @return {Promise}
 */
function loadJS(url, targetElement = document.body, module){
  return new Promise(resolve => {
    const scriptTag = document.createElement('script');

    scriptTag.onload = function() {
      resolve(module);
    };
    scriptTag.onreadystatechange = function() {
      resolve(module);
    };

    scriptTag.src = url;
    targetElement.appendChild(scriptTag);
  });
}

function replaceAll(string, operator, replacement) {
  return string.split(operator).join(replacement);
}

const REPLACE_ALL_STR1_REGEXP = new RegExp(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g);

const REPLACE_ALL_STR2_REGEXP = new RegExp(/\$/g);

/**
 * http://dumpsite.com/forum/index.php?topic=4.msg8#msg8
 * @param {string} source
 * @param {string} str1
 * @param {string} str2
 * @param {boolean} ignoreCase
 * @return {string}
 */
function replaceAll(source, str1, str2, ignoreCase = false) {
  const str1ReplaceRegexpFlag = ignoreCase ? "gi" : "g";
  const regexp = new RegExp(str1.replace(REPLACE_ALL_STR1_REGEXP, '\\$&'), str1ReplaceRegexpFlag);
  const formattedStr2 = (typeof(str2)=="string") ? str2.replace(REPLACE_ALL_STR2_REGEXP, "$$$$") : str2;
  return source.replace(regexp, formattedStr2);
}

/**
 * @param {Element} obj1
 * @param {Element} obj2
 */
function swapElements(obj1, obj2) { //jshint ignore: line
  // save the location of obj2
  const parent2 = obj2.parentNode;
  const next2 = obj2.nextSibling;
  // special case for obj1 is the next sibling of obj2
  if (next2 === obj1) {
    // just put obj1 before obj2
    parent2.insertBefore(obj1, obj2);
  } else {
    // insert obj2 right before obj1
    obj1.parentNode.insertBefore(obj2, obj1);

    // now insert obj1 where obj2 was
    if (next2) {
      // if there was an element after obj2, then insert obj1 right before that
      parent2.insertBefore(obj1, next2);
    } else {
      // otherwise, just append as last child
      parent2.appendChild(obj1);
    }
  }
}

module.exports = {
  classListContainsAll,
  classListContainsAny,
  colorToRGBString,
  forIn,
  getDocument,
  hexToRgb,
  loadJS,
  replaceAll,
  swapElements,
};
