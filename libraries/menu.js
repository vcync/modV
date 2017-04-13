module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
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
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__menu__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__is_decendant__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__symbols__ = __webpack_require__(5);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }




var EventEmitter2 = __webpack_require__(6).EventEmitter2;

var MenuItem = function (_EventEmitter) {
	_inherits(MenuItem, _EventEmitter);

	function MenuItem() {
		var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, MenuItem);

		var _this = _possibleConstructorReturn(this, (MenuItem.__proto__ || Object.getPrototypeOf(MenuItem)).call(this));

		var modifiersEnum = ['cmd', 'command', 'super', 'shift', 'ctrl', 'alt'];
		var typeEnum = ['separator', 'checkbox', 'normal'];
		var type = isValidType(settings.type) ? settings.type : 'normal';
		var submenu = settings.submenu || null;
		var click = settings.click || null;
		var modifiers = validModifiers(settings.modifiers) ? settings.modifiers : null;
		var label = settings.label || '';

		var enabled = settings.enabled;
		if (typeof settings.enabled === 'undefined') enabled = true;

		if (submenu) {
			submenu.parentMenuItem = _this;
		}

		Object.defineProperty(_this, 'type', {
			get: function get() {
				return type;
			}
		});

		Object.defineProperty(_this, 'submenu', {
			get: function get() {
				return submenu;
			},
			set: function set(inputMenu) {
				console.warn('submenu should be set on initialisation, changing this at runtime could be slow on some platforms.');
				if (!(inputMenu instanceof __WEBPACK_IMPORTED_MODULE_0__menu__["a" /* default */])) {
					console.error('submenu must be an instance of Menu');
					return;
				} else {
					submenu = inputMenu;
					submenu.parentMenuItem = _this;
				}
			}
		});

		Object.defineProperty(_this, 'click', {
			get: function get() {
				return click;
			},
			set: function set(inputCallback) {
				if (typeof inputCallback !== 'function') {
					console.error('click must be a function');
					return;
				} else {
					click = inputCallback;
				}
			}
		});

		Object.defineProperty(_this, 'modifiers', {
			get: function get() {
				return modifiers;
			},
			set: function set(inputModifiers) {
				modifiers = validModifiers(inputModifiers) ? inputModifiers : modifiers;
				_this.rebuild();
			}
		});

		Object.defineProperty(_this, 'enabled', {
			get: function get() {
				return enabled;
			},
			set: function set(inputEnabled) {
				enabled = inputEnabled;
				_this.rebuild();
			}
		});

		Object.defineProperty(_this, 'label', {
			get: function get() {
				return label;
			},
			set: function set(inputLabel) {
				label = inputLabel;
				_this.rebuild();
			}
		});

		_this.icon = settings.icon || null;
		_this.iconIsTemplate = settings.iconIsTemplate || false;
		_this.tooltip = settings.tooltip || '';
		_this.checked = settings.checked || false;

		_this.key = settings.key || null;
		_this.node = null;

		if (_this.key) {
			_this.key = _this.key.toUpperCase();
		}

		function validModifiers() {
			var modifiersIn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

			var modsArr = modifiersIn.split('+');
			for (var i = 0; i < modsArr; i++) {
				var mod = modsArr[i].trim();
				if (modifiersEnum.indexOf(mod) < 0) {
					console.error(mod + ' is not a valid modifier');
					return false;
				}
			}
			return true;
		}

		function isValidType() {
			var typeIn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
			var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			if (typeEnum.indexOf(typeIn) < 0) {
				if (debug) console.error(typeIn + ' is not a valid type');
				return false;
			}
			return true;
		}
		return _this;
	}

	_createClass(MenuItem, [{
		key: '_clickHandle_click',
		value: function _clickHandle_click() {
			if (!this.enabled || this.submenu) return;

			this.parentMenu.popdownAll();
			if (this.type === 'checkbox') {
				this.node.classList.toggle('checked');
				this.checked = !this.checked;
			}

			this.emit('click', this);

			if (this.click) this.click();
		}
	}, {
		key: '_clickHandle_click_menubarTop',
		value: function _clickHandle_click_menubarTop() {
			this.node.classList.toggle('submenu-active');

			if (this.submenu) {
				if (this.node.classList.contains('submenu-active')) {
					this.submenu.popup(this.node.offsetLeft, this.node.clientHeight, true, true);
					this.parentMenu.currentSubmenu = this.submenu;
				} else {
					this.submenu.popdown();
					this.parentMenu.currentSubmenu = null;
				}
			}
		}
	}, {
		key: '_mouseoverHandle_menubarTop',
		value: function _mouseoverHandle_menubarTop() {
			if (this.parentMenu.hasActiveSubmenu) {
				if (this.node.classList.contains('submenu-active')) return;

				this.parentMenu.clearActiveSubmenuStyling(this.node);
				this.node.classList.add('submenu-active');

				if (this.parentMenu.currentSubmenu) {
					this.parentMenu.currentSubmenu.popdown();
					this.parentMenu.currentSubmenu = null;
				}

				if (this.submenu) {
					this.submenu.popup(this.node.offsetLeft, this.node.clientHeight, true, true);
					this.parentMenu.currentSubmenu = this.submenu;
				}
			}
		}
	}, {
		key: 'buildItem',
		value: function buildItem() {
			var _this2 = this;

			var menuBarTopLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
			var rebuild = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			var node = document.createElement('li');
			node.classList.add('menu-item', this.type);

			menuBarTopLevel = menuBarTopLevel || this.menuBarTopLevel || false;
			this.menuBarTopLevel = menuBarTopLevel;

			if (menuBarTopLevel) {
				node.addEventListener('mousedown', this._clickHandle_click_menubarTop.bind(this));
				node.addEventListener('mouseover', this._mouseoverHandle_menubarTop.bind(this));
			} else if (this.type !== 'separator') {
				node.addEventListener('click', this._clickHandle_click.bind(this));
				node.addEventListener('mouseup', function (e) {
					if (e.button === 2) _this2._clickHandle_click();
				});
			}

			var iconWrapNode = document.createElement('div');
			iconWrapNode.classList.add('icon-wrap');

			if (this.icon) {
				var iconNode = new Image();
				iconNode.src = this.icon;
				iconNode.classList.add('icon');
				iconWrapNode.appendChild(iconNode);
			}

			var labelNode = document.createElement('div');
			labelNode.classList.add('label');

			var modifierNode = document.createElement('div');
			modifierNode.classList.add('modifiers');

			var checkmarkNode = document.createElement('div');
			checkmarkNode.classList.add('checkmark');

			if (this.checked && !menuBarTopLevel) {
				node.classList.add('checked');
			}

			var text = '';

			if (this.submenu && !menuBarTopLevel) {
				text = '▶︎';

				node.addEventListener('mouseout', function (e) {
					if (node !== e.target) {
						if (!__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__is_decendant__["a" /* default */])(node, e.target)) _this2.submenu.popdown();
					}
					node.classList.add('submenu-active');
				});
			}

			if (this.modifiers && !menuBarTopLevel) {
				var mods = this.modifiers.split('+');

				// Looping this way to keep order of symbols - required by macOS
				for (var symbol in __WEBPACK_IMPORTED_MODULE_2__symbols__["a" /* modifierSymbols */]) {
					if (mods.indexOf(symbol) > -1) {
						text += __WEBPACK_IMPORTED_MODULE_2__symbols__["a" /* modifierSymbols */][symbol];
					}
				}
			}

			if (this.key && !menuBarTopLevel) {
				text += this.key;
			}

			if (!this.enabled) {
				node.classList.add('disabled');
			}

			if (!menuBarTopLevel) {
				node.addEventListener('mouseover', function () {
					if (_this2.submenu) {
						if (_this2.submenu.node) {
							if (_this2.submenu.node.classList.contains('show')) {
								return;
							}
						}

						var parentNode = node.parentNode;

						var x = parentNode.offsetWidth + parentNode.offsetLeft - 2;
						var y = parentNode.offsetTop + node.offsetTop - 4;
						_this2.submenu.popup(x, y, true, menuBarTopLevel);
						_this2.parentMenu.currentSubmenu = _this2.submenu;
					} else {
						if (_this2.parentMenu.currentSubmenu) {
							_this2.parentMenu.currentSubmenu.popdown();
							_this2.parentMenu.currentSubmenu.parentMenuItem.node.classList.remove('submenu-active');
							_this2.parentMenu.currentSubmenu = null;
						}
					}
				});
			}

			if (this.icon) labelNode.appendChild(iconWrapNode);

			var textLabelNode = document.createElement('span');
			textLabelNode.textContent = this.label;
			textLabelNode.classList.add('label-text');

			node.appendChild(checkmarkNode);

			labelNode.appendChild(textLabelNode);
			node.appendChild(labelNode);

			modifierNode.appendChild(document.createTextNode(text));
			node.appendChild(modifierNode);

			node.title = this.tooltip;
			if (!rebuild) this.node = node;
			return node;
		}
	}, {
		key: 'rebuild',
		value: function rebuild() {
			if (!this.node && this.type !== 'separator') return;
			var newNode = void 0;

			newNode = this.buildItem(this.menuBarTopLevel, true);

			if (this.node) {
				if (this.node.parentNode) this.node.parentNode.replaceChild(newNode, this.node);
			}

			this.node = newNode;
		}
	}]);

	return MenuItem;
}(EventEmitter2);

/* harmony default export */ __webpack_exports__["a"] = (MenuItem);

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__menu_item__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recursive_node_find__ = __webpack_require__(4);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }




var Menu = function () {
	function Menu() {
		var _this = this;

		var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, Menu);

		var typeEnum = ['contextmenu', 'menubar'];
		var items = [];
		var type = isValidType(settings.type) ? settings.type : 'contextmenu';

		Object.defineProperty(this, 'items', {
			get: function get() {
				return items;
			}
		});

		Object.defineProperty(this, 'type', {
			get: function get() {
				return type;
			},
			set: function set(typeIn) {
				type = isValidType(typeIn) ? typeIn : type;
			}
		});

		this.append = function (item) {
			if (!(item instanceof __WEBPACK_IMPORTED_MODULE_0__menu_item__["a" /* default */])) {
				console.error('appended item must be an instance of MenuItem');
				return false;
			}
			item.parentMenu = _this;
			var index = items.push(item);
			_this.rebuild();
			return index;
		};

		this.insert = function (item, index) {
			if (!(item instanceof __WEBPACK_IMPORTED_MODULE_0__menu_item__["a" /* default */])) {
				console.error('inserted item must be an instance of MenuItem');
				return false;
			}

			items.splice(index, 0, item);
			item.parentMenu = _this;
			_this.rebuild();
			return true;
		};

		this.remove = function (item) {
			if (!(item instanceof __WEBPACK_IMPORTED_MODULE_0__menu_item__["a" /* default */])) {
				console.error('item to be removed is not an instance of MenuItem');
				return false;
			}

			var index = items.indexOf(item);
			if (index < 0) {
				console.error('item to be removed was not found in this.items');
				return false;
			} else {
				items.splice(index, 0);
				_this.rebuild();
				return true;
			}
		};

		this.removeAt = function (index) {
			items.splice(index, 0);
			_this.rebuild();
			return true;
		};

		this.node = null;
		this.clickHandler = this._clickHandle_hideMenu.bind(this);
		this.currentSubmenu = null;
		this.parentMenuItem = null;

		function isValidType() {
			var typeIn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
			var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			if (typeEnum.indexOf(typeIn) < 0) {
				if (debug) console.error(typeIn + ' is not a valid type');
				return false;
			}
			return true;
		}

		if (this.type === 'menubar') {
			document.addEventListener('click', this.clickHandler);
		}
	}

	_createClass(Menu, [{
		key: '_clickHandle_hideMenu',
		value: function _clickHandle_hideMenu(e) {
			if (!this.isNodeInChildMenuTree(e.target)) {
				if (this.node.classList.contains('show') || this.type === 'menubar') this.popdown();
			}
		}
	}, {
		key: 'createMacBuiltin',
		value: function createMacBuiltin() {
			console.error('This method is not available in browser :(');
			return false;
		}
	}, {
		key: 'popup',
		value: function popup(x, y) {
			var submenu = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
			var menubarSubmenu = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

			var menuNode = void 0;
			var setRight = false;

			submenu = submenu || this.submenu;
			this.submenu = menubarSubmenu;

			menubarSubmenu = menubarSubmenu || this.menubarSubmenu;
			this.menubarSubmenu = menubarSubmenu;

			if (this.node) {
				menuNode = this.node;
			} else {
				menuNode = this.buildMenu(submenu, menubarSubmenu);
				this.node = menuNode;
			}

			this.items.forEach(function (item) {
				if (item.submenu) {
					item.node.classList.remove('submenu-active');
					item.submenu.popdown();
				}
			});

			var width = menuNode.clientWidth;
			var height = menuNode.clientHeight;

			if (x + width > window.innerWidth) {
				setRight = true;
				if (submenu) {
					var node = this.parentMenu.node;
					x = node.offsetWidth + (window.innerWidth - node.offsetLeft - node.offsetWidth) - 2;
				} else {
					x = 0;
				}
			}

			if (y + height > window.innerHeight) {
				y = window.innerHeight - height;
			}

			if (!setRight) {
				menuNode.style.left = x + 'px';
				menuNode.style.right = 'auto';
			} else {
				menuNode.style.right = x + 'px';
				menuNode.style.left = 'auto';
			}

			menuNode.style.top = y + 'px';
			menuNode.classList.add('show');

			if (!submenu) document.addEventListener('click', this.clickHandler);

			if (this.node) {
				if (this.node.parentNode) {
					if (menuNode === this.node) return;
					this.node.parentNode.replaceChild(menuNode, this.node);
				} else {
					document.body.appendChild(this.node);
				}
			} else {
				document.body.appendChild(menuNode);
			}
		}
	}, {
		key: 'popdown',
		value: function popdown() {
			if (this.node) this.node.classList.remove('show');
			if (this.type !== 'menubar') document.removeEventListener('click', this.clickHandler);

			if (this.type === 'menubar') {
				this.clearActiveSubmenuStyling();
			}

			this.items.forEach(function (item) {
				if (item.submenu) {
					item.submenu.popdown();
				}
			});
		}
	}, {
		key: 'popdownAll',
		value: function popdownAll() {
			this.topmostMenu.popdown();
			return;
		}
	}, {
		key: 'buildMenu',
		value: function buildMenu() {
			var _this2 = this;

			var submenu = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
			var menubarSubmenu = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			var menuNode = this.menuNode;
			if (submenu) menuNode.classList.add('submenu');
			if (menubarSubmenu) menuNode.classList.add('menubar-submenu');

			this.items.forEach(function (item) {
				var itemNode = void 0;
				if (_this2.type === 'menubar') itemNode = item.buildItem(true);else itemNode = item.buildItem();
				menuNode.appendChild(itemNode);
			});
			return menuNode;
		}
	}, {
		key: 'rebuild',
		value: function rebuild() {
			if (!this.node && this.type !== 'menubar') return;
			var newNode = void 0;

			if (this.type === 'menubar') {
				newNode = this.buildMenu();
			} else {
				newNode = this.buildMenu(this.submenu, this.menubarSubmenu);
			}

			if (this.node) {
				if (this.node.parentNode) this.node.parentNode.replaceChild(newNode, this.node);
			} else {
				document.body.appendChild(newNode);
			}

			this.node = newNode;
		}
	}, {
		key: 'clearActiveSubmenuStyling',
		value: function clearActiveSubmenuStyling(notThisNode) {
			var submenuActive = this.node.querySelectorAll('.submenu-active');
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = submenuActive[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var node = _step.value;

					if (node === notThisNode) continue;
					node.classList.remove('submenu-active');
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}, {
		key: 'isNodeInChildMenuTree',
		value: function isNodeInChildMenuTree() {
			var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (!node) return false;
			return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__recursive_node_find__["a" /* default */])(this, node);
		}
	}, {
		key: 'menuNode',
		get: function get() {
			var node = document.createElement('ul');
			node.classList.add('nwjs-menu', this.type);
			return node;
		}
	}, {
		key: 'parentMenu',
		get: function get() {
			if (this.parentMenuItem) {
				return this.parentMenuItem.parentMenu;
			} else {
				return undefined;
			}
		}
	}, {
		key: 'hasActiveSubmenu',
		get: function get() {
			if (this.node.querySelector('.submenu-active')) {
				return true;
			} else {
				return false;
			}
		}
	}, {
		key: 'topmostMenu',
		get: function get() {
			var menu = this;

			while (menu.parentMenu) {
				if (menu.parentMenu) {
					menu = menu.parentMenu;
				}
			}

			return menu;
		}
	}]);

	return Menu;
}();

/* harmony default export */ __webpack_exports__["a"] = (Menu);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = isDescendant;
function isDescendant(parent, child) {
	var node = child.parentNode;
	while (node !== null) {
		if (node === parent) {
			return true;
		}
		node = node.parentNode;
	}
	return false;
}

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__menu__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__menu_item__ = __webpack_require__(0);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Menu", function() { return __WEBPACK_IMPORTED_MODULE_0__menu__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "MenuItem", function() { return __WEBPACK_IMPORTED_MODULE_1__menu_item__["a"]; });





/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__is_decendant__ = __webpack_require__(2);
/* harmony export (immutable) */ __webpack_exports__["a"] = recursiveNodeFind;


function recursiveNodeFind(menu, node) {
	if (menu.node === node) {
		return true;
	} else if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__is_decendant__["a" /* default */])(menu.node, node)) {
		return true;
	} else if (menu.items.length > 0) {
		for (var i = 0; i < menu.items.length; i++) {
			var menuItem = menu.items[i];
			if (!menuItem.node) continue;

			if (menuItem.node === node) {
				return true;
			} else if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__is_decendant__["a" /* default */])(menuItem.node, node)) {
				return true;
			} else {
				if (menuItem.submenu) {
					if (recursiveNodeFind(menuItem.submenu, node)) {
						return true;
					} else {
						continue;
					}
				}
			}
		}
	} else {
		return false;
	}

	return false;
}

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return modifierSymbols; });
/* unused harmony export keySymbols */
var modifierSymbols = {
	shift: '⇧',
	ctrl: '⌃',
	alt: '⌥',
	cmd: '⌘',
	super: '⌘',
	command: '⌘'
};

var keySymbols = {
	up: '↑',
	esc: '⎋',
	tab: '⇥',
	left: '←',
	down: '↓',
	right: '→',
	pageUp: '⇞',
	escape: '⎋',
	pageDown: '⇟',
	backspace: '⌫',
	space: 'Space'
};



/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
;!function(undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {
      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);
      this._maxListeners = conf.maxListeners !== undefined ? conf.maxListeners : defaultMaxListeners;

      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);
      conf.verboseMemoryLeak && (this.verboseMemoryLeak = conf.verboseMemoryLeak);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    } else {
      this._maxListeners = defaultMaxListeners;
    }
  }

  function logPossibleMemoryLeak(count, eventName) {
    var errorMsg = '(node) warning: possible EventEmitter memory ' +
        'leak detected. ' + count + ' listeners added. ' +
        'Use emitter.setMaxListeners() to increase limit.';

    if(this.verboseMemoryLeak){
      errorMsg += ' Event name: ' + eventName + '.';
    }

    if(typeof process !== 'undefined' && process.emitWarning){
      var e = new Error(errorMsg);
      e.name = 'MaxListenersExceededWarning';
      e.emitter = this;
      e.count = count;
      process.emitWarning(e);
    } else {
      console.error(errorMsg);

      if (console.trace){
        console.trace();
      }
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    this.verboseMemoryLeak = false;
    configure.call(this, conf);
  }
  EventEmitter.EventEmitter2 = EventEmitter; // backwards compatibility for exporting EventEmitter property

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }

    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name !== undefined) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else {
          if (typeof tree._listeners === 'function') {
            tree._listeners = [tree._listeners];
          }

          tree._listeners.push(listener);

          if (
            !tree._listeners.warned &&
            this._maxListeners > 0 &&
            tree._listeners.length > this._maxListeners
          ) {
            tree._listeners.warned = true;
            logPossibleMemoryLeak.call(this, tree._listeners.length, name);
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  }

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    if (n !== undefined) {
      this._maxListeners = n;
      if (!this._conf) this._conf = {};
      this._conf.maxListeners = n;
    }
  };

  EventEmitter.prototype.event = '';


  EventEmitter.prototype.once = function(event, fn) {
    return this._once(event, fn, false);
  };

  EventEmitter.prototype.prependOnceListener = function(event, fn) {
    return this._once(event, fn, true);
  };

  EventEmitter.prototype._once = function(event, fn, prepend) {
    this._many(event, 1, fn, prepend);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    return this._many(event, ttl, fn, false);
  }

  EventEmitter.prototype.prependMany = function(event, ttl, fn) {
    return this._many(event, ttl, fn, true);
  }

  EventEmitter.prototype._many = function(event, ttl, fn, prepend) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      return fn.apply(this, arguments);
    }

    listener._origin = fn;

    this._on(event, listener, prepend);

    return self;
  };

  EventEmitter.prototype.emit = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) {
        return false;
      }
    }

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all && this._all.length) {
      handler = this._all.slice();
      if (al > 3) {
        args = new Array(al);
        for (j = 0; j < al; j++) args[j] = arguments[j];
      }

      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this, type);
          break;
        case 2:
          handler[i].call(this, type, arguments[1]);
          break;
        case 3:
          handler[i].call(this, type, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
      if (typeof handler === 'function') {
        this.event = type;
        switch (al) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          args = new Array(al - 1);
          for (j = 1; j < al; j++) args[j - 1] = arguments[j];
          handler.apply(this, args);
        }
        return true;
      } else if (handler) {
        // need to make copy of handlers because list can change in the middle
        // of emit call
        handler = handler.slice();
      }
    }

    if (handler && handler.length) {
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this);
          break;
        case 2:
          handler[i].call(this, arguments[1]);
          break;
        case 3:
          handler[i].call(this, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
      return true;
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }

    return !!this._all;
  };

  EventEmitter.prototype.emitAsync = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
        if (!this._events.newListener) { return Promise.resolve([false]); }
    }

    var promises= [];

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all) {
      if (al > 3) {
        args = new Array(al);
        for (j = 1; j < al; j++) args[j] = arguments[j];
      }
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(this._all[i].call(this, type));
          break;
        case 2:
          promises.push(this._all[i].call(this, type, arguments[1]));
          break;
        case 3:
          promises.push(this._all[i].call(this, type, arguments[1], arguments[2]));
          break;
        default:
          promises.push(this._all[i].apply(this, args));
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      switch (al) {
      case 1:
        promises.push(handler.call(this));
        break;
      case 2:
        promises.push(handler.call(this, arguments[1]));
        break;
      case 3:
        promises.push(handler.call(this, arguments[1], arguments[2]));
        break;
      default:
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
        promises.push(handler.apply(this, args));
      }
    } else if (handler && handler.length) {
      handler = handler.slice();
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(handler[i].call(this));
          break;
        case 2:
          promises.push(handler[i].call(this, arguments[1]));
          break;
        case 3:
          promises.push(handler[i].call(this, arguments[1], arguments[2]));
          break;
        default:
          promises.push(handler[i].apply(this, args));
        }
      }
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        return Promise.reject(arguments[1]); // Unhandled 'error' event
      } else {
        return Promise.reject("Uncaught, unspecified 'error' event.");
      }
    }

    return Promise.all(promises);
  };

  EventEmitter.prototype.on = function(type, listener) {
    return this._on(type, listener, false);
  };

  EventEmitter.prototype.prependListener = function(type, listener) {
    return this._on(type, listener, true);
  };

  EventEmitter.prototype.onAny = function(fn) {
    return this._onAny(fn, false);
  };

  EventEmitter.prototype.prependAny = function(fn) {
    return this._onAny(fn, true);
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype._onAny = function(fn, prepend){
    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if (!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    if(prepend){
      this._all.unshift(fn);
    }else{
      this._all.push(fn);
    }

    return this;
  }

  EventEmitter.prototype._on = function(type, listener, prepend) {
    if (typeof type === 'function') {
      this._onAny(type, listener);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if (this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else {
      if (typeof this._events[type] === 'function') {
        // Change to array.
        this._events[type] = [this._events[type]];
      }

      // If we've already got an array, just add
      if(prepend){
        this._events[type].unshift(listener);
      }else{
        this._events[type].push(listener);
      }

      // Check for listener leak
      if (
        !this._events[type].warned &&
        this._maxListeners > 0 &&
        this._events[type].length > this._maxListeners
      ) {
        this._events[type].warned = true;
        logPossibleMemoryLeak.call(this, this._events[type].length, type);
      }
    }

    return this;
  }

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1);
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }

        this.emit("removeListener", type, listener);

        return this;
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }

        this.emit("removeListener", type, listener);
      }
    }

    function recursivelyGarbageCollect(root) {
      if (root === undefined) {
        return;
      }
      var keys = Object.keys(root);
      for (var i in keys) {
        var key = keys[i];
        var obj = root[key];
        if ((obj instanceof Function) || (typeof obj !== "object") || (obj === null))
          continue;
        if (Object.keys(obj).length > 0) {
          recursivelyGarbageCollect(root[key]);
        }
        if (Object.keys(obj).length === 0) {
          delete root[key];
        }
      }
    }
    recursivelyGarbageCollect(this.listenerTree);

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          this.emit("removeListenerAny", fn);
          return this;
        }
      }
    } else {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++)
        this.emit("removeListenerAny", fns[i]);
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if (this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else if (this._events) {
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if (this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.eventNames = function(){
    return Object.keys(this._events);
  }

  EventEmitter.prototype.listenerCount = function(type) {
    return this.listeners(type).length;
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  if (true) {
     // AMD. Register as an anonymous module.
    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
      return EventEmitter;
    }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = EventEmitter;
  }
  else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
}();

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }),
/* 7 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ })
/******/ ]);