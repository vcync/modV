(function(bModule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.createActiveListItem = function(Module) {
		var self = this;
		var gallery = document.getElementsByClassName('gallery')[0];
		var list = document.getElementsByClassName('active-list')[0];

		// Temp container (TODO: don't do this)
		var temp = document.getElementById('temp');

		// Create active list item
		var template = self.templates.querySelector('#active-item');
		var activeItem = document.importNode(template.content, true);

		var titleNode = activeItem.querySelector('.title');
		var optionsContainerNode = activeItem.querySelector('.options');
		var enabledContainerNode = activeItem.querySelector('.enabled');

		titleNode.textContent = Module.info.name;
		
		// Init node in temp (TODO: don't do this)
		temp.innerHTML = '';
		temp.appendChild(activeItem);
		// Grab initialised node
		activeItem = temp.querySelector('div');

		// Attach listener to Opacity Range
		var opacityRangeNode = activeItem.querySelector('input[type=range].opacity');
		opacityRangeNode.addEventListener('input', function() {
			Module.info.alpha = parseFloat(this.value);
		});

		// Attach listener to Blending Select
		var compositeSelectNode = activeItem.querySelector('.composite-operations');
		compositeSelectNode.addEventListener('change', function(e) {
			Module.info.blend = this.value;
		});

		// Attach listener to Enable Checkbox
		var enableCheckboxNode = activeItem.querySelector('input[type=checkbox].enable');
		enableCheckboxNode.addEventListener('change', function(e) {
			Module.info.disabled = !this.checked;
		});

		activeItem.dataset.moduleName = Module.info.safeName;

		return activeItem;
	};

})(module);