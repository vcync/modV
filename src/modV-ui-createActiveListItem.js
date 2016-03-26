(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.createActiveListItem = function(ModuleRef) {
		var self = this;

		console.log('Active item create', ModuleRef);

		// Temp container (TODO: don't do this)
		var temp = document.getElementById('temp');

		// Create active list item
		var template = self.templates.querySelector('#active-item');
		var activeItem = document.importNode(template.content, true);

		var titleNode = activeItem.querySelector('.title');

		titleNode.textContent = ModuleRef.name;
		
		// Init node in temp (TODO: don't do this)
		temp.innerHTML = '';
		temp.appendChild(activeItem);
		// Grab initialised node
		activeItem = temp.querySelector('div');

		// Attach listener to Opacity Range
		var opacityRangeNode = activeItem.querySelector('input[type=range].opacity');
		opacityRangeNode.addEventListener('input', function() {
			ModuleRef.alpha = parseFloat(this.value);
		});

		// Get Solo Checkbox
		var soloCheckboxNode = activeItem.querySelector('input[type=checkbox].solo');
		// Check if already soloed
		soloCheckboxNode.checked = ModuleRef.solo;
		// Attach listener to Solo Checkbox
		soloCheckboxNode.addEventListener('change', function() {
			ModuleRef.solo = this.checked;
		});

		// Attach listener to Blending Select
		var compositeSelectNode = activeItem.querySelector('.composite-operations');
		compositeSelectNode.addEventListener('change', function() {
			ModuleRef.blend = this.value;
		});

		// Attach listener to Enable Checkbox
		var enableCheckboxNode = activeItem.querySelector('input[type=checkbox].enable');
		enableCheckboxNode.addEventListener('change', function() {
			ModuleRef.disabled = !this.checked;
		});

		activeItem.dataset.moduleName = ModuleRef.safeName;

		return activeItem;
	};

})();