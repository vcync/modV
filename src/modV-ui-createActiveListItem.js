module.exports = function(modV) {

	modV.prototype.createActiveListItem = function(Module, dragStartCB, dragEndCB, isPreset) {
		// Temp container (TODO: don't do this)
		let temp = document.getElementById('temp');

		// Create active list item
		let template = this.templates.querySelector('#active-item');
		let activeItem = document.importNode(template.content, true);

		let titleNode = activeItem.querySelector('.title');

		titleNode.textContent = Module.info.name;

		// Init node in temp (TODO: don't do this)
		temp.innerHTML = '';
		temp.appendChild(activeItem);
		// Grab initialised node
		activeItem = temp.querySelector('div');

		// // Attach listener to Opacity Range
		let opacityRangeNode = activeItem.querySelector('input[type=range].opacity');

		let AlphaRangeControl = new this.RangeControl({
			label: 'Opacity',
			min: 0,
			max: 1,
			varType: 'float',
			step: 0.01,
			default: 1,
			useInternalValue: true,
			variable: 'modVReserved:alpha',
			oninput: (value) => {
				Module.info.alpha = parseFloat(value);

				// Send to remote
				this.remote.update('moduleInfoUpdate', {
					value: Module.info.alpha,
					variable: 'alpha',
					name: Module.info.name,
					layerIndex: Module.getLayer()
				});
			}
		});

		let AlphaRangeControlNode = AlphaRangeControl.makeNode(
			this, Module, Module.info.safeName + '-' + 'ListItemOpacity', isPreset, Module.info.alpha
		);

		opacityRangeNode.parentNode.replaceChild(AlphaRangeControlNode, opacityRangeNode);

		AlphaRangeControlNode.addEventListener('contextmenu', (ev) => {
			ev.preventDefault();

			this.showContextMenu('opacity', [AlphaRangeControl, Module, AlphaRangeControlNode], ev);

			return false;
		}, false);

		// Attach listener to Blending Select
		let compositeSelectNode = activeItem.querySelector('.composite-operations');
		// compositeSelectNode.addEventListener('change', function() {
		// 	Module.info.blend = this.value;

		// 	// Send to remote
		// 	self.remote.update('moduleInfoUpdate', {
		// 		value: Module.info.blend,
		// 		variable: 'blend',
		// 		name: Module.info.name,
		// 		layerIndex: Module.getLayer()
		// 	});
		// });

		let BlendingControl = new this.CompositeOperationControl({
			label: 'Blending',
			useInternalValue: true,
			variable: 'modVReserved:blend',
			oninput: (value) => {
				Module.info.blend = value;

				// Send to remote
				this.remote.update('moduleInfoUpdate', {
					value: Module.info.blend,
					variable: 'blend',
					name: Module.info.name,
					layerIndex: Module.getLayer()
				});
			}
		});

		let BlendingControlNode = BlendingControl.makeNode(
			this, Module, Module.info.safeName + '-' + 'BlendingMode', isPreset, Module.info.blend
		);

		compositeSelectNode.parentNode.replaceChild(BlendingControlNode, compositeSelectNode);

		BlendingControlNode.addEventListener('contextmenu', function(ev) {
			ev.preventDefault();

			this.showContextMenu('opacity', [BlendingControl, Module, BlendingControlNode], ev);

			return false;
		}, false);


		// Attach listener to Enable Checkbox
		let enableCheckboxNode = activeItem.querySelector('.enable-group .customCheckbox');

		let EnableCheckboxControl = new this.CheckboxControl({
			label: 'Enabled',
			checked: !Module.info.disabled,
			useInternalValue: true,
			variable: 'modVReserved:disabled',
			oninput: (value) => {
				Module.info.disabled = !value;

				// Send to remote
				this.remote.update('moduleInfoUpdate', {
					value: Module.info.disabled,
					variable: 'disabled',
					name: Module.info.name,
					layerIndex: Module.getLayer()
				});
			}
		});

		let EnableCheckboxControlNode = EnableCheckboxControl.makeNode(
			this, Module, Module.info.safeName + '-' + 'ListItemEnable', isPreset, !Module.info.disabled
		);

		enableCheckboxNode.parentNode.replaceChild(EnableCheckboxControlNode, enableCheckboxNode);

		EnableCheckboxControlNode.addEventListener('contextmenu', (ev) => {
			ev.preventDefault();

			this.showContextMenu('opacity', [EnableCheckboxControl, Module, EnableCheckboxControlNode], ev);

			return false;
		}, false);

		activeItem.dataset.moduleName = Module.info.safeName;

		activeItem.addEventListener('dragstart', (e) => {
			e.dataTransfer.setData('modulename', activeItem.dataset.moduleName);
			if(typeof dragStartCB === 'function') {
				dragStartCB(activeItem);
			}
		});

		activeItem.addEventListener('dragend', () => {
			if(typeof dragEndCB === 'function') {
				dragEndCB(activeItem);
			}
		});

		return {
			node: activeItem,
			controls: {
				alpha: AlphaRangeControl,
				blend: BlendingControl,
				disabled: EnableCheckboxControl
			}
		};
	};

};