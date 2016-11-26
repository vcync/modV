modV.prototype.buildLFOContextMenu = function(Control, Module) {
	let items = [];

	let controlTitle = 'Add LFO';

	items.push(new this.MenuItem({
		title: controlTitle,
		enabled: true,
		// callback: () => {
		// 	let LFOControl = new this.LFOController(Control, Module, {
		// 		freq: 1.3,
		// 		amplitude: 2,
		// 		waveform: 'sine'
		// 	});

		// 	this.LFOs.push(LFOControl);
		// },
		submenuItems: [
			new this.MenuItem({
				title: 'Sine',
				enabled: true,
				callback: () => {
					let LFOControl = new this.LFOController(Control, Module, {
						freq: 1.3,
						amplitude: 2,
						waveform: 'sine'
					});

					this.LFOs.push(LFOControl);
				}
			}),
			new this.MenuItem({
				title: 'Sawtooth',
				enabled: true,
				callback: () => {
					let LFOControl = new this.LFOController(Control, Module, {
						freq: 1.3,
						amplitude: 2,
						waveform: 'sawtooth'
					});

					this.LFOs.push(LFOControl);
				}
			}),
			new this.MenuItem({
				title: 'Triangle',
				enabled: true,
				callback: () => {
					let LFOControl = new this.LFOController(Control, Module, {
						freq: 1.3,
						amplitude: 2,
						waveform: 'triangle'
					});

					this.LFOs.push(LFOControl);
				}
			}),
			new this.MenuItem({
				title: 'Square',
				enabled: true,
				callback: () => {
					let LFOControl = new this.LFOController(Control, Module, {
						freq: 1.3,
						amplitude: 2,
						waveform: 'square'
					});

					this.LFOs.push(LFOControl);
				}
			}),
			new this.MenuItem({
				title: 'Noise',
				enabled: true,
				callback: () => {
					let LFOControl = new this.LFOController(Control, Module, {
						freq: 1.3,
						amplitude: 2,
						waveform: 'noise'
					});

					this.LFOs.push(LFOControl);
				}
			})
		]
	}));

	return items;
};