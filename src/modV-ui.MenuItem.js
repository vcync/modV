modV.prototype.MenuItem = class {
	
	constructor(settings) {

		this.title = settings.title;
		this.callback = settings.callback;
		this.enabled = settings.enabled;
	}

	makeNode(menuNode, nextClickHandler) {

		let menuItemNode = document.createElement('div');
		menuItemNode.classList.add('context-menu-item');
		menuItemNode.textContent = this.title;
		menuItemNode.addEventListener('click', () => {
			this.callback();
			
			menuItemNode.parentNode.parentNode.removeChild(menuNode);
			document.removeEventListener('click', nextClickHandler, false);
		});

		if(!this.enabled) {
			menuItemNode.classList.add('disabled');
		}

		return menuItemNode;
	}
};