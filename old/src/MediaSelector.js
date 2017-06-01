

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

		let imagePath, images, option;
		let optionSelected = false;

		let optGroups = [];

		if(type === 'image') {

			for(key in profiles) {
				// we can't use forIn in this case as we have continues to deal with
				if(profiles.hasOwnProperty(key)) {
					profile = profiles[key];

					// Skip if we have no images
					if(!('images' in profile)) continue;

					images = profile.images;

					optGroup = document.createElement('optgroup');
					optGroup.label = key;

					this.currentFile = null;

					let options = [];



					for(let key in images) {
						if(images.hasOwnProperty(key)) {
							imagePath = images[key];

							option = document.createElement('option');
							option.value = imagePath;
							option.textContent = key;

							if(areSameFile(imagePath, defaultOption)) {
								option.selected = true;
								optionSelected = true;
							}

							options.push(option);
						}
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
					if(!('images' in profile)) continue;

					images = profile.images;

					let options = [];

					optGroup = document.createElement('optgroup');
					optGroup.label = key;

					for(let key in images) {
						if(images.hasOwnProperty(key)) {
							imagePath = images[key];
							option = document.createElement('option');
							option.value = imagePath;
							option.textContent = key;

							options.push(option);
						}
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
					if(!('videos' in profile)) continue;

					let videos = profile.videos;
					let options = [];

					optGroup = document.createElement('optgroup');
					optGroup.label = key;

					this.currentFile = null;

					for(let key in videos) {
						if(videos.hasOwnProperty(key)) {
							let videoPath = videos[key];

							option = document.createElement('option');
							option.value = videoPath;
							option.textContent = key;

							options.push(option);
						}
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