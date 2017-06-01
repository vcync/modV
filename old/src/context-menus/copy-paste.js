module.exports = function(nw) {
	let modV = this;
	modV.copiedValue = null;

	function getControlDataFromNode(node) {
		if(!node) return false;

		let parts = node.id.split('-');

		let variable = parts.pop();
		let moduleName = parts.join(' ');

		let Module = modV.activeModules[moduleName];
		let controlId = Module.info.controls[variable].id;

		return {
			moduleName,
			controlId,
			variable,
			Control: Module.info.controls[variable],
			Module
		};
	}

	let copyMenuItem = new nw.MenuItem({
		label: 'Copy',
		click: function() {
			let node = modV.menus.contextMenuTarget;
			let data = getControlDataFromNode(node);
			let Control = data.Control;

			if(Control instanceof modV.CheckboxControl) {
				modV.copiedValue = Control.node.checked;
			} else {
				modV.copiedValue = node.value;
			}
		}
	});

	let pasteMenuItem = new nw.MenuItem({
		label: 'Paste',
		click: function() {
			let node = modV.menus.contextMenuTarget;
			let data = getControlDataFromNode(node);
			let Control = data.Control;
			let Module = data.Module;

			if(modV.copiedValue !== null) {

				if(Control instanceof modV.CheckboxControl) {
					node.querySelector('input[type="checkbox"]').checked = modV.copiedValue;
				} else {
					node.value = modV.copiedValue;
				}

				node.value = modV.copiedValue;

				var value;
				if(Control.varType === 'int') value = parseInt(modV.copiedValue);
				else if(Control.varType === 'float') value = parseFloat(modV.copiedValue);
				else value = modV.copiedValue;

				Module[Control.variable] = value;
			}
		}
	});

	copyMenuItem.on('click', function() {

	});

	this.menus.addHook({
		nodeType: ['input', 'button', 'select'],
		className: [
			'modv-button-control',
			'modv-color-control',
			'modv-composite-operation-control',
			'modv-image-control',
			'modv-range-control',
			'modv-select-control',
			'modv-text-control',
			'modv-video-control'
		],
		matchAnyClass: true,
		menuItems: [
			new nw.MenuItem({
				label: 'Internal Clipboard',
				enabled: false
			}),
			copyMenuItem,
			pasteMenuItem
		],
		beforeShow: function() {
			if(modV.copiedValue !== null) {
				pasteMenuItem.enabled = true;
				pasteMenuItem.label = 'Paste (' + modV.copiedValue + ')';
			} else {
				pasteMenuItem.enabled = false;
			}
		}
	});
};