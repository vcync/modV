module.exports = function(nw) {
	let modV = this;

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

	let learnMenuItem = new nw.MenuItem({
		label: 'Learn Assignment',
		click: function() {
			let node = modV.menus.contextMenuTarget;
			let data = getControlDataFromNode(node);
			let Control = data.Control;
			let Module = data.Module;

			if(node.dataset.midichannel === undefined) {
				modV.MIDIInstance.learning = true;
				modV.MIDIInstance.currentNode = node;
				modV.MIDIInstance.currentControlKey = Control.variable;
				modV.MIDIInstance.currentModuleName = Module.info.name;
			} else {
				console.log('forget assignment context action');
			}
		}
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
				label: 'MIDI',
				enabled: false
			}),
			learnMenuItem
		],
		beforeShow: function() {
			let node = modV.menus.contextMenuTarget;

			if(node.dataset.midichannel !== undefined) {
				learnMenuItem.label = 'Forget Assignment (' + modV.MIDIInstance.getNameFromID(node.dataset.midideviceid) + ' on channel ' + node.dataset.midichannel + ')';
			} else {
				learnMenuItem.label = 'Learn Assignment';
			}
		}
	});
};