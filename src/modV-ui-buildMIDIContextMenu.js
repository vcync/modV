module.exports = function(Control, Module, inputNode) {
	let items = [];

	let assigned = false;
	let controlTitle = 'Learn Assignment';

	if(inputNode.dataset.midichannel !== undefined) {
		assigned = true;
		controlTitle = 'Forget Assignment (assigned to ' + this.MIDIInstance.getNameFromID(inputNode.dataset.id) + ' on channel ' + inputNode.dataset.midichannel;
	}

	items.push(new this.MenuItem({
		title: 'Learn Assignment',
		enabled: !assigned,
		callback: () => {
			this.MIDIInstance.learning = true;
			this.MIDIInstance.currentNode = inputNode;
			this.MIDIInstance.currentControlKey = Control.variable;
			this.MIDIInstance.currentModuleName = Module.info.name;
		}
	}));

	return items;
};