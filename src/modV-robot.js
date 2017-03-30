let modVBot = function(module, controlKey, modV) {

	function bpmToMs(bpm) {
		return (60000 / bpm);
	}

	function randomIntFromRange(min, max) {
		return Math.floor(Math.random()*(max-min+1)+min);
	}

	function randomFloatFromRange(min, max) {
		return Math.random()*(max-min+1)+min;
	}

	let interval = bpmToMs(modV.bpm);

	let control = module.info.controls[controlKey];

	function loop() {
		//for(let cntrl in module.info.controls) {

			if(control instanceof modV.CheckboxControl) {

				control.update(!Math.round(Math.random()));


			} else if(!(control.type instanceof modV.VideoControl) && !(control.type instanceof modV.ImageControl)) {

				let rand;

				switch(control.varType) {
					case 'int':
						rand = randomIntFromRange(control.min, control.max);
						control.update(rand);
						break;

					case 'float':
						rand = randomFloatFromRange(control.min, control.max);
						control.update(rand);
						break;

					default:
						rand = String.fromCharCode(0x30A0 + Math.random() * (0x30FF-0xFFFF+1));
						control.update(rand);
						break;
				}


			}

		//}

		if(modV.bpm === 0) {
			interval = 1000;
			console.log('No BPM yet', modV.bpm, 'Using 120 instead.');
		} else {
			interval = bpmToMs(modV.bpm);
		}
	}

	if(modV.bpm === 0) interval = 1000;
	let timer = setInterval(loop, interval);

	this.removeBot = function() {
		clearInterval(timer);
	};
};

module.exports = function(modV) {

	modV.prototype.attachBot = function(module, controlKey) {
		let mod = this.activeModules[module];
		let control = mod.info.controls[controlKey];
		let controlID = control.id;

		if(this.bots[controlID]) return false; // Bot already attached
		let bot = new modVBot(mod, controlKey, this); //jshint ignore: line
		this.bots[controlID] = bot;
	};

	modV.prototype.removeBot = function(module, controlKey) {
		let mod = this.activeModules[module];
		let control = mod.info.controls[controlKey];
		let controlID = control.id;

		if(!this.bots[controlID]) return false; // No bot
		this.bots[controlID].removeBot();
		delete this.bots[controlID];

		return true; // There was a bot, it has now been deleted
	};
};