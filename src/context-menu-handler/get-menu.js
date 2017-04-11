const isEqual = require('lodash.isequal');
const Menu = require('../../libraries/menu.js');

if(!window.nw) {
	var nw = {};
	nw.Menu = Menu.Menu;
	nw.MenuItem = Menu.MenuItem;
} else {
	var nw = window.nw;
}

module.exports = function(hooks) {
	return function getMenu(hookIn) {
		if(!hookIn) return false;

		let filteredHooks = hooks.filter(hook => {
			if('nodeType' in hookIn) {
				if(!isEqual(hook.nodeType, hookIn.nodeType)) return false;
			}

			if('className' in hookIn) {
				if(!isEqual(hook.className, hookIn.className)) return false;
			}

			if('nodeAttributes' in hookIn) {
				if(!isEqual(hook.nodeAttributes, hookIn.nodeAttributes)) return false;
			}

			return true;
		});

		let menuItemCount = 0;
		filteredHooks.forEach(hook => {
			hook.menuItems.forEach(() => {
				menuItemCount++;
			});
		});


		if(hookIn.menu) {
			if(menuItemCount === hookIn.menu.items.length) {
				return hookIn.menu;
			}
		} else {
			let newMenu = new nw.Menu();
			let menuItemCount = 0;
			filteredHooks.forEach((hook, idx) => {
				hook.menuItems.forEach(menuItem => {
					newMenu.append(menuItem);
					menuItemCount++;
				});

				if(filteredHooks.length-1 !== idx) newMenu.append(new nw.MenuItem({type: 'separator'}));
			});

			filteredHooks.filter(hook => {
				hook.menu = newMenu;
			});

			filteredHooks.forEach(hook => {
				let index = hooks.indexOf(hook);
				if(index > -1) {
					hooks[index] = hook;
				}
			});

			return newMenu;
		}
	};
};