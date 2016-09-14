(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.bot = function() {

	};

	/* TODO: bind to modV scope <<< cannot at present */
	var modVBot = function(module, controlIndex, modV) {
		var self = modV;

		function bpmToMs(bpm) {
			return (60000 / bpm);
		}

		function randomIntFromRange(min, max) {
			return Math.floor(Math.random()*(max-min+1)+min);
		}

		function randomFloatFromRange(min, max) {
			return Math.random()*(max-min+1)+min;
		}

		var interval = bpmToMs(self.bpm);

		var control = module.info.controls[controlIndex];
		var controlNode = document.getElementById(control.getID());

		function loop() {
			//for(var cntrl in module.info.controls) {

				if(control instanceof self.CheckboxControl) {

					controlNode.checked = module[control.variable] = !Math.round(Math.random());


				} else if(!(control.type instanceof self.VideoControl) && !(control.type instanceof self.ImageControl)) {

					var rand;

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

			if(self.bpm === 0) {
				interval = 1000;
				console.log('No BPM yet', self.bpm, 'Using 120 instead.');
			} else {
				interval = bpmToMs(self.bpm);
			}
		}

		if(self.bpm === 0) interval = 1000;
		var timer = setInterval(loop, interval);

		this.removeBot = function() {
			clearInterval(timer);
		};
	};

	modV.prototype.attachBot = function(module, controlIndex) {
		var self = this;
		var mod = self.activeModules[module];
		var control = mod.info.controls[controlIndex];
		var controlID = control.getID();

		if(self.bots[controlID]) return false; // Bot already attached
		var bot = new modVBot(mod, controlIndex, self); //jshint ignore: line
		self.bots[controlID] = bot;
	};

	modV.prototype.removeBot = function(module, controlIndex) {
		var self = this;
		var mod = self.activeModules[module];
		var control = mod.info.controls[controlIndex];
		var controlID = control.getID();

		if(!self.bots[controlID]) return false; // No bot
		self.bots[controlID].removeBot();
		delete self.bots[controlID];
		
		return true; // There was a bot, it has now been deleted
	};

})();