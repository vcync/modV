const buildControlMenu		= require('./modV-ui-buildControlMenu.js');
const buildCopyPasteMenu	= require('./modV-ui-buildCopyPasteMenu.js');
const buildMIDIContextMenu	= require('./modV-ui-buildMIDIContextMenu.js');
const buildLFOContextMenu	= require('./modV-ui-buildLFOContextMenu.js');

// TODO:
var SubMenuItem = function(items) { //jshint ignore:line

	this.items = items;

};

module.exports = function(modV) {

	modV.prototype.showContextMenu = function(type, variables, e) {
		var self = this;
		
		var existingMenu = document.querySelector('.context-menu');
		if(existingMenu) {
			existingMenu.parentNode.removeChild(existingMenu);
		}


		var menuItems = [];

		switch(type) {
			case 'control':
				menuItems.push(buildControlMenu(variables[0], variables[1], self));
				menuItems.push(buildCopyPasteMenu(variables[0], variables[1], variables[2], self));
				menuItems.push(buildMIDIContextMenu(variables[0], variables[1], variables[2], self));
				menuItems.push(buildLFOContextMenu(variables[0], variables[1], self));
				break;

			case 'opacity':
				//menuItems.push(buildControlMenu(variables[0], variables[1], variables[2], self));
				//menuItems.push(buildCopyPasteMenu(variables[0], variables[2], variables[3], self));
				menuItems.push(buildMIDIContextMenu(variables[0], variables[1], variables[2], self));
				break;
		}


		var menuNode = document.createElement('div');
		menuNode.classList.add('context-menu');

		function menuNextClickHandler(e) {

			if(e.currentTarget !== menuNode) {
				menuNode.parentNode.removeChild(menuNode);
			}
			document.removeEventListener('click', menuNextClickHandler, false);
		}

		document.addEventListener('click', menuNextClickHandler, false);

		menuItems.forEach(function(menuItemGroup) {

			menuItemGroup.forEach(function(menuItem) {
				let menuItemNode = menuItem.makeNode(menuNode, menuNextClickHandler);
				menuNode.appendChild(menuItemNode);
			});
		});

		menuNode.style.left = e.clientX + 'px';
		menuNode.style.top = e.clientY + 'px';

		document.body.appendChild(menuNode);
	};

};