let store;

function handleInput(message) {
  const {
    data: [type, channel, data],
    currentTarget: { id, name, manufacturer }
  } = message;

  store.commit("midi/WRITE_DATA", {
    id: `${id}-${name}-${manufacturer}`,
    type,
    channel,
    data: type === 176 ? data / 127 : data
  });

  if (store.state.midi.learning) {
    store.state.midi.learning(message);
  }
}

function handleDevices(inputs) {
  // loop over all available inputs and listen for any MIDI input
  for(let input of inputs.values()) { // eslint-disable-line
    // each time there is a midi message call the onMIDIMessage function
    input.removeEventListener("midimessage", handleInput);
    input.addEventListener("midimessage", handleInput);

    store.commit("midi/ADD_DEVICE", {
      id: input.id,
      name: input.name,
      manufacturer: input.manufacturer
    });
  }
}

async function setupMidi() {
  store = this.store;

  if (navigator.requestMIDIAccess) {
    const access = await navigator.requestMIDIAccess({ sysex: false });

    handleDevices(access.inputs);

    access.addEventListener("statechange", e => {
      handleDevices(e.currentTarget.inputs);
    });
  } else {
    console.warn("MIDI access was unavailable in your browser.");
  }
}

export default setupMidi;
