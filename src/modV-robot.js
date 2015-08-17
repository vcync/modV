(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.bot = function() {

	};

	var bots = {};

	var modVBot = function(module) {

		function bpmToMs(bpm) {
			console.log(bpm);
			return (60000 / bpm);
		}

		function randomIntFromRange(min, max) {
			return Math.floor(Math.random()*(max-min+1)+min);
		}

		function randomFloatFromRange(min, max) {
			return Math.random()*(max-min+1)+min;
		}

		var interval = bpmToMs(modV.bpm);

		function loop() {
			for(var cntrl in module.info.controls) {
				var control = module.info.controls[cntrl];

				if(control.type === 'checkbox') {

					module[control.variable] = !Math.round(Math.random());

				} else if(control.type !== 'video' && control.type !== 'image' && control.type !== 'multiimage') {

					var rand;

					switch(control.varType) {
						case 'int':
							rand = randomIntFromRange(control.min, control.max);

							if('append' in control) {
								module[control.variable] = rand + control.append;
							} else {
								module[control.variable] = rand;
							}

							break;

						case 'float':
							rand = randomFloatFromRange(control.min, control.max);

							if('append' in control) {
								module[control.variable] = rand + control.append;
							} else {
								module[control.variable] = rand;
							}

							break;

						default:
							rand = String.fromCharCode(0x30A0 + Math.random() * (0x30FF-0xFFFF+1));

							if('append' in control) {
								module[control.variable] = rand + control.append;
							} else {
								module[control.variable] = rand;
							}

							break;
					}

					modV.controllerWindow.postMessage({
					 	type: 'ui',
					 	varType: control.varType,
					 	modName: module.info.name,
					 	name: control.label,
					 	payload: rand,
					 	index: parseInt(cntrl)
					}, modV.options.controlDomain);

					if(modV.options.remote) {
						modV.ws.send(JSON.stringify({
							type: 'ui',
							varType: control.varType,
							modName: module.info.name,
							name: control.label,
							payload: rand,
							index: parseInt(cntrl)
						}));
					}
				}

			}

			if(modV.bpm === 0) {
				interval = 1000;
				console.log('No BPM yet', modV.bpm, 'Using 120 instead.');
			} else {
				interval = bpmToMs(modV.bpm);
			}
		}

		if(modV.bpm === 0) interval = 1000;
		var timer = setInterval(loop, interval);

		this.removeBot = function() {
			clearInterval(timer);
		};
	};

	modV.prototype.attachBot = function(module) {
		var mod = modV.registeredMods[module];
		if(bots[mod.info.name]) return false; // Bot already attached
		var bot = new modVBot(mod);
		bots[mod.info.name] = bot;
	};

	modV.prototype.removeBot = function(module) {
		var mod = modV.registeredMods[module];
		if(!bots[mod.info.name]) return false; // No bot
		bots[mod.info.name].removeBot();
		delete bots[mod.info.name];
		return true; // There was a bot, it has now been deleted
	};

})(module);