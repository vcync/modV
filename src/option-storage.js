module.exports = {
	save: function saveOptions(callback) {
		localStorage.setItem('modVoptions', JSON.stringify(this.options)); 
		if(callback) callback();
	},

	load: function loadOptions(callback) {
		if(localStorage.getItem('modVoptions')) {
			var loadedOptions = JSON.parse(localStorage.getItem('modVoptions'));
			forIn(loadedOptions, key => {
				if(!(key in this.options)) {
					this.options[key] = loadedOptions[key];
				}
			});
		}

		if(callback) callback();
	}
};