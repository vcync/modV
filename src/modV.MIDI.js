modV.prototype.MIDI = class {
	
	constructor() {

		this.access = null;
		this.inputs = null;
		this.learning = false;
		this.currentNode = null;
		this.currentModuleName = null;
		this.currentControlIndex = null;

		this.assignments = new Map();
	}

	getNameFromID(ID) {

		let inputs = this.inputs;
		let name = false;

		for(let input of inputs) {
			if(ID === input.id) name = input.name;
		}

		return name;
	}

	handleDevices() {
		let inputs = this.inputs;

		// loop over all available inputs and listen for any MIDI input
		for (let input of inputs.values()) {

			if(!this.assignments.get(input.id)) this.assignments.set(input.id, {});

			// each time there is a midi message call the onMIDIMessage function
			input.addEventListener('midimessage', this.handleInput.bind(this));
		}
	}

	handleInput(message) {
		let data = message.data;
		let midiChannel = parseInt(data[1]);
		let inputMap = this.assignments.get(message.currentTarget.id);
		let Control;

		let assignment = inputMap[midiChannel];

		if(assignment) {
			let moduleName = assignment.moduleName;
			let controlIndex = assignment.controlIndex;
			Control = modV.activeModules[moduleName].info.controls[controlIndex];
		}

		if(this.learning) {
			inputMap[midiChannel] = this.createAssignment(this.currentNode, message.currentTarget.id, midiChannel, this.currentModuleName, this.currentControlIndex);

			this.currentControlIndex = null;
			this.currentModuleName = null;

			this.currentNode = null;
			this.learning = false;
		}

		var midiNode = document.querySelector("input[data-midichannel='" + data[1] + "'][data-midideviceid='" + message.currentTarget.id + "']");
		if(midiNode && Control) {
			let calculatedValue = Math.map(parseInt(data[2]), 0, 127, parseFloat(midiNode.min), parseFloat(midiNode.max));

			midiNode.value = calculatedValue;
			Control.writeValue(calculatedValue);
		}
	}

	importAssignments(assignments) {

		assignments.forEach((channels, deviceID)  => {

			if(!this.assignments.get(deviceID)) this.assignments.set(deviceID, {});
			let inputMap = this.assignments.get(deviceID);

			forIn(channels, (channel, assignment) => {
				let moduleName = assignment.moduleName;
				let controlIndex = assignment.controlIndex;
				let Control = modV.activeModules[moduleName].info.controls[controlIndex];
				let inputNode = Control.node;

				inputMap[channel] = this.createAssignment(inputNode, deviceID, channel, moduleName, controlIndex);
			});

		});
	}

	createAssignment(node, id, channel, name, controlIndex) {
		let inputNode = node;
		
		inputNode.dataset.midichannel = channel;
		inputNode.dataset.midideviceid = id;

		return {
			controlIndex: controlIndex,
			moduleName: name
		};
	}

	start() {

		// request MIDI access
		if (navigator.requestMIDIAccess) {
			navigator.requestMIDIAccess({
				sysex: false
			}).then((access) => {
				
				this.access = access;
				this.inputs = access.inputs;

				this.handleDevices();

				access.addEventListener('statechange', () => {
					this.handleDevices();
				});

			}, (error) => {
				console.error('MIDI access was refused. Please check your MIDI permissions', error);
			});
		} else {
			console.error('No MIDI support in your browser.');
		}

	}

};