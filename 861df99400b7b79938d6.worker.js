/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! correcting-interval 2.0.0 | Copyright 2014 Andrew Duthie | MIT License */
/* jshint evil: true */
;(function(global, factory) {
  // Use UMD pattern to expose exported functions
  if (typeof exports === 'object') {
    // Expose to Node.js
    module.exports = factory();
  } else if (true) {
    // Expose to RequireJS
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }

  // Expose to global object (likely browser window)
  var exports = factory();
  for (var prop in exports) {
    global[prop] = exports[prop];
  }
}(this, function() {
  // Track running intervals
  var numIntervals = 0,
    intervals = {};

  // Polyfill Date.now
  var now = Date.now || function() {
    return new Date().valueOf();
  };

  var setCorrectingInterval = function(func, delay) {
    var id = numIntervals++,
      planned = now() + delay;

    // Normalize func as function
    switch (typeof func) {
      case 'function':
        break;
      case 'string':
        var sFunc = func;
        func = function() {
          eval(sFunc);
        };
        break;
      default:
        func = function() { };
    }

    function tick() {
      func();

      // Only re-register if clearCorrectingInterval was not called during function
      if (intervals[id]) {
        planned += delay;
        intervals[id] = setTimeout(tick, planned - now());
      }
    }

    intervals[id] = setTimeout(tick, delay);
    return id;
  };

  var clearCorrectingInterval = function(id) {
    clearTimeout(intervals[id]);
    delete intervals[id];
  };

  return {
    setCorrectingInterval: setCorrectingInterval,
    clearCorrectingInterval: clearCorrectingInterval
  };
}));

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function colorToRgbString(color) {
  try {
    return `rgb(${color.r},${color.g},${color.b})`;
  } catch (e) {
    return 'rgb(0,0,0)';
  }
}

function colorToRgbaString(color) {
  try {
    return `rgba(${color.r},${color.g},${color.b},1)`;
  } catch (e) {
    return 'rgba(0,0,0,1)';
  }
}

function calculateStep(colors, currentColor, currentTime, timePeriod) {
  let r1;
  let g1;
  let b1;

  try {
    r1 = colors[currentColor].r;
    g1 = colors[currentColor].g;
    b1 = colors[currentColor].b;
  } catch (e) {
    // try catch because the user may delete the
    // current color which throws the array and nextIndex out of sync
    // TODO: fix case where user deletes current color
    return [0, 0, 0];
  }

  let nextColor = currentColor + 1;

  if (nextColor > colors.length - 1) {
    nextColor = 0;
  }

  const r2 = colors[nextColor].r;
  const g2 = colors[nextColor].g;
  const b2 = colors[nextColor].b;

  const p = currentTime / (timePeriod - 1);
  const r = Math.round((1.0 - p) * r1 + p * r2 + 0.5); // eslint-disable-line
  const g = Math.round((1.0 - p) * g1 + p * g2 + 0.5); // eslint-disable-line
  const b = Math.round((1.0 - p) * b1 + p * b2 + 0.5); // eslint-disable-line

  return { r, g, b, a: 1 };
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : null;
}

function Palette(colorsIn, timePeriod, id, returnFormat) {
  this.bpm = 120;
  this.useBpm = false;
  this.bpmDivision = 16;
  this.creationTime = Date.now();
  this.returnFormat = returnFormat;

  const stringed = JSON.stringify(colorsIn);

  this.colors = JSON.parse(stringed) || [];
  this.timePeriod = timePeriod || 100;

  this.currentColor = 0; // jshint ignore:line
  this.currentTime = 0; // jshint ignore:line
  // this.timePeriod = Math.round((this.timePeriod/1000) * 60);

  this.getId = function getId() {
    return id;
  };
}

Palette.prototype.addColor = function addColor(color) {
  let rgbFromHex;
  if (typeof color === 'string') {
    rgbFromHex = hexToRgb(color);
    this.colors.push(rgbFromHex);
  } else if (Array.isArray(color.constructor)) {
    this.colors.push(rgbFromHex);
  } else return false;

  return this.colors.length;
};

Palette.prototype.getColors = function getColors() {
  return this.colors;
};

Palette.prototype.removeAtIndex = function removeAtIndex(index) {
  const returnVal = this.colors.splice(index, 1);
  return returnVal;
};

Palette.prototype.nextStep = function nextStep(cb) {
  if (this.useBpm) {
    // fps * 60 seconds / bpm / BpmDiv
    this.timePeriod = (((60 * 60) / this.bpm) * this.bpmDivision);
  }

  if (this.colors.length < 1) {
    // If there are no colors, return false
    return false;
  } else if (this.colors.length < 2) {
    // If there are less than two colors, just return the only color
    return colorToRgbString(this.colors[0]);
  }

  this.currentTime += (1000 / 60);

  if (this.currentTime >= this.timePeriod) {
    if (this.currentColor > this.colors.length - 2) {
      this.currentColor = 0;
    } else {
      this.currentColor += 1;
    }
    this.currentTime = 0;
  }

  const step = calculateStep(this.colors, this.currentColor, this.currentTime, this.timePeriod);
  let returned = '';

  if (this.returnFormat === 'rgbaString') {
    returned = colorToRgbaString(step);
  } else {
    returned = colorToRgbString(step);
  }

  cb(returned);
  return returned;
};

Palette.prototype.update = function update() {
  return new Promise((resolve) => {
    this.nextStep(resolve);
  });
};

Palette.prototype.setTimePeriod = function setTimePeriod() {
  // TODO: sets time period and updates current time period if old is greater than new
};

/* harmony default export */ __webpack_exports__["a"] = (Palette);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__class_list_contains_all__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__class_list_contains_any__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__color_to_rgb_string__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__for_in__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__get_document__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__hex_to_rgb__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__load_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__replace_all__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__swap_elements__ = __webpack_require__(11);
/* unused harmony reexport classListContainsAll */
/* unused harmony reexport classListContainsAny */
/* unused harmony reexport colorToRGBString */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_3__for_in__["a"]; });
/* unused harmony reexport getDocument */
/* unused harmony reexport hexToRgb */
/* unused harmony reexport loadJS */
/* unused harmony reexport replaceAll */
/* unused harmony reexport swapElements */













/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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

/* unused harmony default export */ var _unused_webpack_default_export = (classListContainsAll);


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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
  const classList = node.classList.value;

  for (let i = 0; i < classNames.length; i += 1) {
    if (classList.includes(classNames[i])) {
      return true;
    }
  }

  return false;
}

/* unused harmony default export */ var _unused_webpack_default_export = (classListContainsAny);


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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

/* unused harmony default export */ var _unused_webpack_default_export = (colorToRGBString);


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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

/* harmony default export */ __webpack_exports__["a"] = (forIn);


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @callback getDocumentCallback
 * @param {?Document} XML or HTML Document
 */

/**
 * @param {string} url
 * @param {getDocumentCallback} callback
 */
function getDocument(url, callback) {
  const xhr = new XMLHttpRequest();

  xhr.onload = () => {
    callback(xhr.responseXML);
  };

  xhr.open('GET', url);
  xhr.responseType = 'document';
  xhr.send();
}

/* unused harmony default export */ var _unused_webpack_default_export = (getDocument);


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @todo We can make a common Color type with getHex etc methods (safe and easy to use)
 * Modified from: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param {string} hex
 * @return {?Array<number>}
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : null;
}

/* unused harmony default export */ var _unused_webpack_default_export = (hexToRgb);


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @param {string} url
 * @param {Element} targetElement Element in which script is inserted
 * @param {Module} module
 * @return {Promise}
 */
function loadJS(url, targetElement = document.body, module) {
  return new Promise((resolve) => {
    const scriptTag = document.createElement('script');

    scriptTag.onload = () => {
      resolve(module);
    };
    scriptTag.onreadystatechange = () => {
      resolve(module);
    };

    scriptTag.src = url;
    targetElement.appendChild(scriptTag);
  });
}

/* unused harmony default export */ var _unused_webpack_default_export = (loadJS);


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const REPLACE_ALL_STR1_REGEXP = new RegExp(/([/,!\\^${}[\]().*+?|<>\-&])/g);
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
  const str1ReplaceRegexpFlag = ignoreCase ? 'gi' : 'g';
  const regexp = new RegExp(str1.replace(REPLACE_ALL_STR1_REGEXP, '\\$&'), str1ReplaceRegexpFlag);
  const formattedStr2 = (typeof str2 === 'string') ? str2.replace(REPLACE_ALL_STR2_REGEXP, '$$$$') : str2;
  return source.replace(regexp, formattedStr2);
}

/* unused harmony default export */ var _unused_webpack_default_export = (replaceAll);


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @param {Element} obj1
 * @param {Element} obj2
 */
function swapElements(obj1, obj2) {
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

/* unused harmony default export */ var _unused_webpack_default_export = (swapElements);


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_correcting_interval__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_correcting_interval___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_correcting_interval__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Palette__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils__ = __webpack_require__(2);
/* eslint-env worker */





let timer;
const palettes = new Map();
self.palettes = palettes;

function createPalette(colors, duration, id) {
  const pal = new __WEBPACK_IMPORTED_MODULE_1__Palette__["a" /* default */](colors, duration, id);
  palettes.set(id, pal);
  postMessage({
    message: 'palette-create',
    paletteId: pal.getId(),
  });
}

function setPalette(id, data) {
  const pal = palettes.get(id);

  __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* forIn */])(data, (key, item) => {
    pal[key] = item;
  });

  palettes.set(id, pal);
}

function removePalette(id) {
  palettes.delete(id);
}

function loop() {
  palettes.forEach((palette) => {
    palette.update().then((step) => {
      postMessage({
        message: 'palette-update',
        paletteId: palette.getId(),
        currentStep: step,
        currentColor: palette.currentColor,
      });
    });
  });
}

onmessage = function onmessage(e) {
  if (!('message' in e.data)) return;

  if (e.data.message === 'create-palette') {
    createPalette(e.data.colors, e.data.duration, e.data.paletteId, e.data.returnFormat);
  }

  if (e.data.message === 'set-palette') {
    setPalette(e.data.paletteId, e.data.options);
  }

  if (e.data.message === 'remove-palette') {
    removePalette(e.data.paletteId);
  }

  if (e.data.message === 'stop-loop') {
    __WEBPACK_IMPORTED_MODULE_0_correcting_interval___default.a.clearCorrectingInterval(timer);
    timer = undefined;
  }

  if (e.data.message === 'start-loop') {
    if (timer === undefined) __WEBPACK_IMPORTED_MODULE_0_correcting_interval___default.a.setCorrectingInterval(loop, 1000 / 60);
  }
};

if (timer === undefined) __WEBPACK_IMPORTED_MODULE_0_correcting_interval___default.a.setCorrectingInterval(loop, 1000 / 60);


/***/ })
/******/ ]);
//# sourceMappingURL=861df99400b7b79938d6.worker.js.map