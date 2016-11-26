modV.prototype.buildLFOContextMenu = function(Control, Module) {
	let items = [];

	let controlTitle = 'Add LFO';

	items.push(new this.MenuItem({
		title: controlTitle,
		enabled: true,
		callback: () => {
			let LFOControl = new this.LFOController(Control, Module, {
				freq: 1.3,
				amplitude: 2,
				waveform: 'sine'
			});

			this.LFOs.push(LFOControl);
		}
	}));

	return items;
};