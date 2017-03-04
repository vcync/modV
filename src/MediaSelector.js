

/* * * * * * * * * * * * * * * *
 * callbacks = {
 *   onchange = function(){},
 *
 * }
 * * * * * * * * * * * * * * * */
let MediaSelector = function(type, callbacks, defaultOption) {
	function areSameFile(path1, path2) {
		if(path2.indexOf(path1.slice(2)) > -1) {
			return true;
		} else {
			return false;
		}
	}

	let select = document.createElement('select');
	select.classList.add('mediaSelector', type);

	this.currentFile = null;

	this.update = function(profiles) {
		let key,
			profile,
			optGroup;

		// Clear select
		while(select.firstChild) {
			select.removeChild(select.firstChild);
		}

		let image, images, option;
		let optionSelected = false;

		let optGroups = [];

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

					this.currentFile = images[0];

					let options = [];

					for(let i=0; i < images.length; i++) {
						image = images[i];

						option = document.createElement('option');
						option.value = image.path;
						option.textContent = image.name;

						if(areSameFile(image.path, defaultOption)) {
							option.selected = true;
							optionSelected = true;
						}

						options.push(option);
					}

					options.sort((a, b) => {
						return a.textContent.localeCompare(b.textContent);
					});

					options.forEach(node => {
						optGroup.appendChild(node);
					});

					optGroups.push(optGroup);
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

					let options = [];

					optGroup = document.createElement('optgroup');
					optGroup.label = key;

					for(let i=0; i < images.length; i++) {
						image = images[i];

						option = document.createElement('option');
						option.value = image.path;
						option.textContent = image.name;

						options.push(option);
					}

					options.sort((a, b) => {
						return a.textContent.localeCompare(b.textContent);
					});

					options.forEach(node => {
						optGroup.appendChild(node);
					});

					optGroups.push(optGroup);
				}
			}

		} else if(type === 'video') {
			for(key in profiles) {
				// we can't use forIn in this case as we have continues to deal with
				if(profiles.hasOwnProperty(key)) {
					profile = profiles[key];

					// Skip if we have no videos
					if(!('videos' in profile.files)) continue;

					let videos = profile.files.videos;
					let options = [];

					optGroup = document.createElement('optgroup');
					optGroup.label = key;

					this.currentFile = videos[0];

					for(let i=0; i < videos.length; i++) {
						let video = videos[i];

						option = document.createElement('option');
						option.value = video.path;
						option.textContent = video.name;

						options.push(option);
					}

					options.sort((a, b) => {
						return a.textContent.localeCompare(b.textContent);
					});

					options.forEach(node => {
						optGroup.appendChild(node);
					});

					optGroups.push(optGroup);
				}
			}
		}

		optGroups.sort((a, b) => {
			return a.label.localeCompare(b.label);
		});

		optGroups.forEach(node => {
			select.appendChild(node);
		});

		if(!optionSelected) {
			let option = select.querySelector('option');
			if(!option) return;
			
			option.selected = true;
			this.currentFile = {path: select.querySelector('option').value}; 
			optionSelected = true;
		} else {
			this.currentFile = {path: select.options[select.selectedIndex].value, name: select.options[select.selectedIndex].textContent};
		}
	};

	function selectChanged() {
		if(!('onchange' in callbacks)) return;

		if(type === 'multiimage') {
			let arr = [];

			for(let el of select.selectedOptions) {
				arr.push(el.value);
			}

			callbacks.onchange(arr);
		} else {
			callbacks.onchange(select.value);
		}
	}

	select.addEventListener('change', selectChanged);

	this.returnHTML = function() {
		return select;
	};
};

module.exports = function(modV) {
	modV.prototype.MediaSelector = function(type, callbacks, defaultOption) {
		let ms = new MediaSelector(type, callbacks, defaultOption);
		ms.update(this.profiles);

		let idx = this.mediaSelectors.push(ms)-1;
		return this.mediaSelectors[idx];
	};
};