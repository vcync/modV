module.exports = function(Control, Module, inputNode, modV) {
	let items = [];

	let assigned = false;
	let controlTitle = 'Learn Assignment';

	if(inputNode.dataset.midichannel !== undefined) {
		assigned = true;
		controlTitle = 'Forget Assignment (assigned to ' + modV.MIDIInstance.getNameFromID(inputNode.dataset.id) + ' on channel ' + inputNode.dataset.midichannel;
	}

	items.push(new modV.MenuItem({
		title: 'Learn Assignment',
		enabled: !assigned,
		callback: () => {
			modV.MIDIInstance.learning = true;
			modV.MIDIInstance.currentNode = inputNode;
			modV.MIDIInstance.currentControlKey = Control.variable;
			modV.MIDIInstance.currentModuleName = Module.info.name;
		}
	}));

	return items;
};