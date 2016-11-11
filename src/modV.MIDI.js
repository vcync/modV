modV.prototype.MIDI = class {
	
	constructor() {

		this.access = null;
		this.inputs = null;
		this.learning = false;
		this.currentNode = null;
		this.currentControl = null;

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

			if(!this.assignments.get(input.id)) this.assignments.set(input.id, new Map());

			// each time there is a midi message call the onMIDIMessage function
			input.addEventListener('midimessage', this.handleInput.bind(this));
		}
	}

	handleInput(message) {
		let data = message.data;
		let midiChannel = parseInt(data[1]);
		let inputMap = this.assignments.get(message.currentTarget.id);
		let Control = inputMap.get(midiChannel);

		if(this.learning) {
			let inputNode = this.currentNode;
			
			inputNode.dataset.midichannel = midiChannel;
			inputNode.dataset.midideviceid = message.currentTarget.id;

			inputMap.set(midiChannel, this.currentControl);

			this.currentControl = null;
			this.currentNode = null;
			this.learning = false;
		}

		var midiNode = document.querySelector("input[data-midichannel='" + data[1] + "'][data-midideviceid='" + message.currentTarget.id + "']");
		if(midiNode && Control) {
			let calculatedValue = Math.map(parseInt(data[2]), 0, 127, parseFloat(midiNode.min), parseFloat(midiNode.max));

			console.log(calculatedValue);
			midiNode.value = calculatedValue;
			Control.writeValue(Math.round(calculatedValue));
		}
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