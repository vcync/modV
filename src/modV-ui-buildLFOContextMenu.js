module.exports = function(Control, Module, modV) {
	let items = [];

	let controlTitle = 'Add LFO';
	let id = Module.info.safeName + '-LFO-' + Control.variable;

	let LFO = modV.LFOs.find((LFO) => {
		return LFO.id === id;
	});

	if(LFO) {
		controlTitle = 'Remove LFO';

		items.push(new modV.MenuItem({
			title: controlTitle,
			enabled: true,
			callback: () => {
					modV.LFOs.splice(modV.LFOs.indexOf(LFO), 1);
				}
			})
		);

		return items;
	}

	// info here: http://testtone.com/calculators/lfo-speed-calculator
	function hzFromBPM(bpm) {

		let secondsPerBeat = 60 / bpm;
		let secondsPerNote = secondsPerBeat * (4 / 2);
		let hertz = 1 / secondsPerNote;

		return hertz;
	}

	items.push(new modV.MenuItem({
		title: controlTitle,
		enabled: true,
		// callback: () => {
		// 	let LFOControl = new modV.LFOController(Control, Module, {
		// 		freq: 1.3,
		// 		amplitude: 2,
		// 		waveform: 'sine'
		// 	});

		// 	modV.LFOs.push(LFOControl);
		// },
		submenuItems: [
			new modV.MenuItem({
				title: 'Sine',
				enabled: true,
				callback: () => {



					let LFOControl = new modV.LFOController(Control, Module, {
						freq: hzFromBPM(modV.bpm),
						amplitude: 2,
						waveform: 'sine'
					}, modV);

					modV.LFOs.push(LFOControl);
				}
			}),
			new modV.MenuItem({
				title: 'Sawtooth',
				enabled: true,
				callback: () => {
					let LFOControl = new modV.LFOController(Control, Module, {
						freq: 1.3,
						amplitude: 2,
						waveform: 'sawtooth'
					}, modV);

					modV.LFOs.push(LFOControl);
				}
			}),
			new modV.MenuItem({
				title: 'Triangle',
				enabled: true,
				callback: () => {
					let LFOControl = new modV.LFOController(Control, Module, {
						freq: 1.3,
						amplitude: 2,
						waveform: 'triangle'
					}, modV);

					modV.LFOs.push(LFOControl);
				}
			}),
			new modV.MenuItem({
				title: 'Square',
				enabled: true,
				callback: () => {
					let LFOControl = new modV.LFOController(Control, Module, {
						freq: 1.3,
						amplitude: 2,
						waveform: 'square'
					}, modV);

					modV.LFOs.push(LFOControl);
				}
			}),
			new modV.MenuItem({
				title: 'Noise',
				enabled: true,
				callback: () => {
					let LFOControl = new modV.LFOController(Control, Module, {
						freq: 1.3,
						amplitude: 2,
						waveform: 'noise'
					}, modV);

					modV.LFOs.push(LFOControl);
				}
			})
		]
	}));

	return items;
};