const forIn = require('./fragments/for-in');

let ProfileSelector = function(callbacks) {
	
	let select = document.createElement('select');
	select.classList.add('profile-selector');

	this.update = function(profiles) {

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
	};

	function selectChanged() {
		if(!('onchange' in callbacks)) return;

		callbacks.onchange(select.value);
	}

	select.addEventListener('change', selectChanged);

	this.returnHTML = function() {
		return select;
	};
};

module.exports = function(modV) {
	modV.prototype.ProfileSelector = function(callbacks) {
		let ps = new ProfileSelector(callbacks);
		ps.update(this.profiles);

		let idx = this.profileSelectors.push(ps)-1;
		return this.profileSelectors[idx];
	};
};