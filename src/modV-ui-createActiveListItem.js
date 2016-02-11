(function(bModule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.createActiveListItem = function(itemEl, clone) {
		var self = this;
		var gallery = document.getElementsByClassName('gallery')[0];
		var list = document.getElementsByClassName('active-list')[0];

		// Temp container (TODO: don't do this)
		var temp = document.getElementById('temp');

		// Move back to gallery
		swapElements(clone, itemEl);

		// Create active list item
		var template = self.templates.querySelector('#active-item');
		var activeItem = document.importNode(template.content, true);

		// Set name, check for dupes and rename if found
		var name = clone.dataset.moduleName;
		var dataname = name;
		var dupes = list.querySelectorAll('.active-item[data-module-name|="' + name.replace(' ', '-') + '"]');
		if(dupes.length > 0) {
			name += " (" + dupes.length + ")";
		}

		var titleNode = activeItem.querySelector('.title');
		var optionsContainerNode = activeItem.querySelector('.options');
		var enabledContainerNode = activeItem.querySelector('.enabled');

		titleNode.textContent = name;
		
		// Init node in temp (TODO: don't do this)
		temp.innerHTML = '';
		temp.appendChild(activeItem);
		// Grab initialised node
		activeItem = temp.querySelector('div');

		activeItem.dataset.moduleName = name.replace(' ', '-');

		return {
			node: activeItem,
			dupe: dupes.length,
			name: name.replace('-', ' ')
		};
	};

})(module);