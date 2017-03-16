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
	let controlNode = document.getElementById(control.getID());

	function loop() {
		//for(let cntrl in module.info.controls) {

			if(control instanceof modV.CheckboxControl) {

				controlNode.checked = module[control.variable] = !Math.round(Math.random());


			} else if(!(control.type instanceof modV.VideoControl) && !(control.type instanceof modV.ImageControl)) {

				let rand;

				switch(control.varType) {
					case 'int':
						rand = randomIntFromRange(control.min, control.max);

						if('append' in control) {
							controlNode.value = rand;
							module[control.variable] = rand + control.append;
						} else {
							controlNode.value = module[control.variable] = rand;
						}

						break;

					case 'float':
						rand = randomFloatFromRange(control.min, control.max);

						if('append' in control) {
							controlNode.value = rand;
							module[control.variable] = rand + control.append;
						} else {
							controlNode.value = module[control.variable] = rand;
						}

						break;

					default:
						rand = String.fromCharCode(0x30A0 + Math.random() * (0x30FF-0xFFFF+1));

						if('append' in control) {
							controlNode.value = rand;
							module[control.variable] = rand + control.append;
						} else {
							controlNode.value = module[control.variable] = rand;
						}

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
		let controlID = control.getID();

		if(this.bots[controlID]) return false; // Bot already attached
		let bot = new modVBot(mod, controlKey, this); //jshint ignore: line
		this.bots[controlID] = bot;
	};

	modV.prototype.removeBot = function(module, controlKey) {
		let mod = this.activeModules[module];
		let control = mod.info.controls[controlKey];
		let controlID = control.getID();

		if(!this.bots[controlID]) return false; // No bot
		this.bots[controlID].removeBot();
		delete this.bots[controlID];

		return true; // There was a bot, it has now been deleted
	};
};