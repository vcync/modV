(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.createActiveListItem = function(Module, dragStartCB, dragEndCB) {
		var self = this;

		// Temp container (TODO: don't do this)
		var temp = document.getElementById('temp');

		// Create active list item
		var template = self.templates.querySelector('#active-item');
		var activeItem = document.importNode(template.content, true);

		var titleNode = activeItem.querySelector('.title');

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

			// Send to remote
			self.remote.update('moduleInfoUpdate', {
				value: Module.info.alpha,
				variable: 'alpha',
				name: Module.info.name,
				layerIndex: Module.getLayer()
			});
		});

		opacityRangeNode.addEventListener('contextmenu', function(ev) {
			ev.preventDefault();
			
			self.showContextMenu('opacity', [Module, this], ev);

			return false;
		}, false);

		// Attach listener to Blending Select
		var compositeSelectNode = activeItem.querySelector('.composite-operations');
		compositeSelectNode.addEventListener('change', function() {
			Module.info.blend = this.value;

			// Send to remote
			self.remote.update('moduleInfoUpdate', {
				value: Module.info.blend,
				variable: 'blend',
				name: Module.info.name,
				layerIndex: Module.getLayer()
			});
		});

		// Attach listener to Enable Checkbox
		var enableCheckboxNode = activeItem.querySelector('input[type=checkbox].enable');
		enableCheckboxNode.addEventListener('change', function() {
			Module.info.disabled = !this.checked;

			// Send to remote
			self.remote.update('moduleInfoUpdate', {
				value: Module.info.disabled,
				variable: 'disabled',
				name: Module.info.name,
				layerIndex: Module.getLayer()
			});
		});

		var id = Module.info.safeName + '-' + Date.now();
		var enableLabelNode = activeItem.querySelector('.customCheckbox label');
		enableLabelNode.setAttribute('for', id);
		enableCheckboxNode.setAttribute('id', id);


		activeItem.dataset.moduleName = Module.info.safeName;

		activeItem.addEventListener('dragstart', function(e) {
			e.dataTransfer.setData('modulename', activeItem.dataset.moduleName);
			if(typeof dragStartCB === 'function') {
				dragStartCB(activeItem);
			}
		});

		activeItem.addEventListener('dragend', function() {
			if(typeof dragEndCB === 'function') {
				dragEndCB(activeItem);
			}
		});

		return activeItem;
	};

})();