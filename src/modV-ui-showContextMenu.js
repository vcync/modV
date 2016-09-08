(function() {
	'use strict';

	modV.prototype.showContextMenu = function(type, variables, e) {
		var self = this;
		
		var existingMenu = document.querySelector('.context-menu');
		if(existingMenu) {
			existingMenu.parentNode.removeChild(existingMenu);
		}


		var menuItems = [];

		switch(type) {
			case 'control':

				menuItems.push(buildControlMenu(variables[0], variables[1], variables[2], self));
				menuItems.push(buildCopyPasteMenu(variables[0], variables[2], variables[3], self));
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
				var menuItemNode = document.createElement('div');
				menuItemNode.classList.add('context-menu-item');
				menuItemNode.textContent = menuItem.title;
				menuItemNode.addEventListener('click', function() {
					menuItem.callback();
					menuNode.parentNode.removeChild(menuNode);
					document.removeEventListener('click', menuNextClickHandler, false);
				});

				if(!menuItem.enabled) {
					menuItemNode.classList.add('disabled');
				}

				menuNode.appendChild(menuItemNode);
			});
		});

		menuNode.style.left = e.clientX + 'px';
		menuNode.style.top = e.clientY + 'px';

		document.body.appendChild(menuNode);
	};

	var MenuItem = function(settings) {

		var self = this;

		self.title = settings.title;
		self.callback = settings.callback;
		self.enabled = settings.enabled;

	};

	// TODO:
	var SubMenuItem = function(items) { //jshint ignore:line

		this.items = items;

	};

	function buildControlMenu(Control, controlIndex, Module, modVSelf) {

		var items = [];

		var attatchRobotSettings = {
			title: 'Attach Robot',
			enabled: true,
			callback: function() {
				modVSelf.attachBot(Module.info.name, controlIndex);
			}
		};

		var detatchRobotSettings = {
			title: 'Detatch Robot',
			enabled: true,
			callback: function() {
				modVSelf.removeBot(Module.info.name, controlIndex);
			}
		};

		if(modVSelf.bots[Control.getID()]) {
			detatchRobotSettings.enabled = true;
			attatchRobotSettings.enabled = false;
		} else {
			detatchRobotSettings.enabled = false;
			attatchRobotSettings.enabled = true;
		}

		items.push(new MenuItem(attatchRobotSettings));
		items.push(new MenuItem(detatchRobotSettings));

		return items;

	}

	function buildCopyPasteMenu(Control, Module, inputNode, modVSelf) {

		var items = [];

		items.push(new MenuItem({
			title: 'Copy Value',
			enabled: true,
			callback: function() {
				if(Control instanceof modVSelf.CheckboxControl) {
					modVSelf.copiedValue = inputNode.querySelector('input[type="checkbox"]').checked;
				} else {
					modVSelf.copiedValue = inputNode.value;
				}
			}
		}));

		
		var pasteItemSettings = {
			title: 'Paste Value',
			enabled: true,
			callback: function() {
				if(modVSelf.copiedValue !== null) {

					if(Control instanceof modVSelf.CheckboxControl) {
						inputNode.querySelector('input[type="checkbox"]').checked = modVSelf.copiedValue;
					} else {
						inputNode.value = modVSelf.copiedValue;
					}

					inputNode.value = modVSelf.copiedValue;

					var value;
					if(Control.varType === 'int') value = parseInt(modVSelf.copiedValue);
					else if(Control.varType === 'float') value = parseFloat(modVSelf.copiedValue);
					else value = modVSelf.copiedValue;

					Module[Control.variable] = value;
				}
			}
		};

		if(modVSelf.copiedValue !== null) {
			pasteItemSettings.enabled = true;
			pasteItemSettings.title = 'Paste Value (' + modVSelf.copiedValue + ')';
		} else {
			pasteItemSettings.enabled = false;
		} 

		items.push(new MenuItem(pasteItemSettings));

		return items;

	}

})(module);