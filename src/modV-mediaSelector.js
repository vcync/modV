(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	var MediaSelector = function(type, callbacks) {
	
		var self = this;
		var select = document.createElement('select');
		select.classList.add('mediaSelector', type);

		// TODO: populate select with mediamanager data
		// TODO: group using optgroup for profiles for now

		self.update = function() {
			var key,
				profile,
				optGroups = [],
				optGroup;

			if(type == 'image') {
				
				for(key in modV.profiles) {
					profile = modV.profiles[key];

					// Skip if we have no images
					if(!('images' in profile.files)) continue;

					var images = profile.files.images;

					optGroup = document.createElement('optgroup');
					optGroup.label = key;

					for(var i=0; i < images.length; i++) {
						var image = images[i];

						var option = document.createElement('option');
						option.value = image.path;
						option.textContent = image.name;

						optGroup.appendChild(option);
					}

					select.appendChild(optGroup);
				}

			} else if(type == 'multiimage') {
				select.multiple = true;

				for(key in modV.profiles) {
					profile = modV.profiles[key];
					optGroup = document.createElement('optgroup');
					profile.images.forEach();
				}
			} else if(type == 'video') {
				for(key in modV.profiles) {
					profile = modV.profiles[key];
					optGroup = document.createElement('optgroup');

				}
			}
		};

		self.update();

		function selectChanged(e) {

		}

		select.addEventListener('change', selectChanged);

		self.returnHTML = function() {
			return select;
		};
	};

	modV.prototype.mediaSelectors = [];

	modV.prototype.MediaSelector = function(callbacks) {
		var ms = new MediaSelector(callbacks);
		var idx = modV.mediaSelectors.push(ms)-1;
		return modV.mediaSelectors[idx];
	};

})(module);