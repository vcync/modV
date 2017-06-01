module.exports = function(Control, Module, inputNode, modV) {
	var items = [];

	items.push(new modV.MenuItem({
		title: 'Copy Value',
		enabled: true,
		callback: function() {
			if(Control instanceof modV.CheckboxControl) {
				modV.copiedValue = Control.node.checked;
			} else {
				modV.copiedValue = inputNode.value;
			}
		}
	}));

	var pasteItemSettings = {
		title: 'Paste Value',
		enabled: true,
		callback: function() {
			if(modV.copiedValue !== null) {

				if(Control instanceof modV.CheckboxControl) {
					inputNode.querySelector('input[type="checkbox"]').checked = modV.copiedValue;
				} else {
					inputNode.value = modV.copiedValue;
				}

				inputNode.value = modV.copiedValue;

				var value;
				if(Control.varType === 'int') value = parseInt(modV.copiedValue);
				else if(Control.varType === 'float') value = parseFloat(modV.copiedValue);
				else value = modV.copiedValue;

				Module[Control.variable] = value;
			}
		}
	};

	if(modV.copiedValue !== null) {
		pasteItemSettings.enabled = true;
		pasteItemSettings.title = 'Paste Value (' + modV.copiedValue + ')';
	} else {
		pasteItemSettings.enabled = false;
	}

	items.push(new modV.MenuItem(pasteItemSettings));

	return items;
};