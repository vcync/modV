const forIn = require('./fragments/for-in');

let ProfileSelector = function(callbacks) {
	let self = this;

	let select = document.createElement('select');
	select.classList.add('profile-selector');

	this.node = select;
	this.value = null;

	this.update = (profiles) => {
		// Clear select
		while(select.firstChild) {
			select.removeChild(select.firstChild);
		}

		forIn(profiles, profileName => {
			let option = document.createElement('option');
			option.value = profileName;
			option.textContent = profileName;

			select.appendChild(option);
		});

		if(!this.value) this.value = select.options[0].value;

		if(!('onupdate' in callbacks)) return;
		else callbacks.onupdate(profiles);
	};

	function selectChanged() {
		self.value = select.options[select.selectedIndex].value;

		if('onchange' in callbacks) callbacks.onchange(select.options[select.selectedIndex].value);
		return;
	}

	select.addEventListener('change', selectChanged);
};

module.exports = function(modV) {
	modV.prototype.ProfileSelector = function(callbacks) {
		let self = this;
		let ps = new ProfileSelector(callbacks);
		ps.init = function() {
			if(!self.mediaManager.available) return;
			this.update(self.profiles);
		};

		let idx = this.profileSelectors.push(ps)-1;
		return this.profileSelectors[idx];
	};
};