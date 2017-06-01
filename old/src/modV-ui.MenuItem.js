function isAncestor(descendant,ancestor){
    return descendant.compareDocumentPosition(ancestor) &
        Node.DOCUMENT_POSITION_CONTAINED_BY;
}
module.exports = function(modV) {
	modV.prototype.MenuItem = class {

		constructor(settings) {

			this.title = settings.title;
			this.callback = settings.callback;
			this.enabled = settings.enabled;
			this.submenuItems = settings.submenuItems || [];
			this.submenuShown = false;
		}

		makeNode(menuNode, nextClickHandler) {
			let timer;
			let submenuNode;
			let menuItemNode = document.createElement('div');
			menuItemNode.classList.add('context-menu-item');
			menuItemNode.textContent = this.title;
			menuItemNode.addEventListener('click', () => {
				if(typeof this.callback === 'function') this.callback();

				try {
					menuNode.parentNode.removeChild(menuNode);
				} catch(e) {

				}

				document.removeEventListener('click', nextClickHandler, false);
				this.submenuShown = false;
			});

			menuItemNode.addEventListener('mouseover', () => {
				if(
					this.submenuItems.length < 1 ||
					this.submenuShown ||
					timer
				) return;

				timer = setTimeout(() => {
					submenuNode = this.makeSubmenu();

					document.body.appendChild(submenuNode);

					let x = menuItemNode.offsetWidth;
					let y = -5;
					let width = submenuNode.clientWidth;
					let height = submenuNode.clientHeight;

					let heightFromWindowTop = menuItemNode.offsetTop + menuItemNode.parentNode.offsetTop;
					console.log(heightFromWindowTop + y + height, window.innerHeight);

					if((x + width) > window.innerWidth) {
						x = window.innerWidth - width;
					}

					if((heightFromWindowTop + y + height) > window.innerHeight) {
						y = menuItemNode.clientHeight - height;
						console.log(y);
						console.dir(submenuNode);
					}

					submenuNode.style.left 	= x + 'px';
					submenuNode.style.top 	= y + 'px';

					menuItemNode.appendChild(submenuNode);
					this.submenuShown = true;
					timer = null;
				}, 150);
			});

			menuItemNode.addEventListener('mouseout', (e) => {
				if(
					this.submenuItems.length < 1 ||
					!this.submenuShown ||
					isAncestor(menuItemNode, e.toElement)
				) return;

				if(timer) {
					clearTimeout(timer);
					timer = null;
					return;
				}

				menuItemNode.removeChild(submenuNode);
				this.submenuShown = false;
			});

			if(!this.enabled) {
				menuItemNode.classList.add('disabled');
			}

			return menuItemNode;
		}

		makeSubmenu() {
			let subMenuNode = document.createElement('div');
			subMenuNode.classList.add('context-menu', 'context-menu-submenu');

			this.submenuItems.forEach(submenuItem => {
				let node = submenuItem.makeNode();
				subMenuNode.appendChild(node);
			});

			return subMenuNode;
		}
	};
};