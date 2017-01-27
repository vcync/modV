

/* * * * * * * * * * * * * * * *
 * callbacks = {
 *   onchange = function(){},
 *
 * }
 * * * * * * * * * * * * * * * */
var MediaSelector = function(type, callbacks) {
	var self = this;

	var select = document.createElement('select');
	select.classList.add('mediaSelector', type);

	self.currentFile = '';

	self.update = function(profiles) {
		var key,
			profile,
			optGroup;

		// Clear select
		while(select.firstChild) {
			select.removeChild(select.firstChild);
		}

		var image, images, i, option;

		if(type === 'image') {

			for(key in profiles) {
				// we can't use forIn in this case as we have continues to deal with
				if(profiles.hasOwnProperty(key)) {
					profile = profiles[key];

					// Skip if we have no images
					if(!('images' in profile.files)) continue;

					images = profile.files.images;

					optGroup = document.createElement('optgroup');
					optGroup.label = key;

					self.currentFile = images[0];

					for(i=0; i < images.length; i++) {
						image = images[i];

						option = document.createElement('option');
						option.value = image.path;
						option.textContent = image.name;

						optGroup.appendChild(option);
					}

					select.appendChild(optGroup);
				}
			}

		} else if(type === 'multiimage') {
			// TODO: set self.currentFile
			select.multiple = true;

			for(key in profiles) {
				// we can't use forIn in this case as we have continues to deal with
				if(profiles.hasOwnProperty(key)) {
					profile = profiles[key];

					// Skip if we have no images
					if(!('images' in profile.files)) continue;

					images = profile.files.images;

					optGroup = document.createElement('optgroup');
					optGroup.label = key;

					for(i=0; i < images.length; i++) {
						image = images[i];

						option = document.createElement('option');
						option.value = image.path;
						option.textContent = image.name;

						optGroup.appendChild(option);
					}

					select.appendChild(optGroup);
				}
			}

		} else if(type === 'video') {
			for(key in profiles) {
				// we can't use forIn in this case as we have continues to deal with
				if(profiles.hasOwnProperty(key)) {
					profile = profiles[key];

					// Skip if we have no videos
					if(!('videos' in profile.files)) continue;

					var videos = profile.files.videos;

					optGroup = document.createElement('optgroup');
					optGroup.label = key;

					self.currentFile = videos[0];

					for(i=0; i < videos.length; i++) {
						var video = videos[i];

						option = document.createElement('option');
						option.value = video.path;
						option.textContent = video.name;

						optGroup.appendChild(option);
					}

					select.appendChild(optGroup);
				}
			}
		}
	};

	function selectChanged() {
		if(!('onchange' in callbacks)) return;

		if(type === 'multiimage') {
			var arr = [];

			// For the future...
			// for(var el of select.selectedOptions) {
			// 	arr.push(el.value);
			// }

			// For now...
			[].forEach.call(select.selectedOptions, function(el) {
				arr.push(el.value);
			});

			callbacks.onchange(arr);
		} else {
			callbacks.onchange(select.value);
		}
	}

	select.addEventListener('change', selectChanged);

	self.returnHTML = function() {
		return select;
	};
};

module.exports = function(modV) {
	modV.prototype.MediaSelector = function(type, callbacks) {
		var ms = new MediaSelector(type, callbacks);
		ms.update(this.profiles);

		var idx = this.mediaSelectors.push(ms)-1;
		return this.mediaSelectors[idx];
	};
};