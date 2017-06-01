class Tab {
	constructor(name, contentEl, selected) {

		let tabElement = document.createElement('div');
		tabElement.classList.add('tab-item');
		tabElement.textContent = name;

		this.contentEl = contentEl;
		this.tabElement = tabElement;

		if(selected) {
			tabElement.classList.add('selected');
		} else {
			contentEl.classList.add('hidden');
		}
	}

	get tab() {
		return this.tabElement;
	}

	select() {
		this.tabElement.classList.add('selected');
		this.contentEl.classList.remove('hidden');
	}

	deSelect() {
		this.tabElement.classList.remove('selected');
		this.contentEl.classList.add('hidden');
	}
}

module.exports = function(modV) {

	modV.prototype.TabController = function(className) {

		return function() {
			this.tabs = [];

			let tabBar = document.createElement('div');
			tabBar.classList.add('tab-bar');
			if(className) tabBar.classList.add(className);

			this.add = (name, contentEl, selected) => {

				let newTab = new Tab(name, contentEl, selected);
				this.tabs.push(newTab);

				tabBar.appendChild(newTab.tab);

				newTab.tab.addEventListener('click', () => {
					this.tabs.forEach(currentTab => {
						currentTab.deSelect();
					});

					newTab.select();
				});

			};

			this.tabBar = function() {
				return tabBar;
			};
		};
	};
};