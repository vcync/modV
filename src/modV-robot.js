(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.bot = function() {

	};

	var bots = {};

	/* TODO: bind to modV scope <<< cannot at present */
	var modVBot = function(module, modV) {
		var self = modV;

		function bpmToMs(bpm) {
			console.log('BPM', bpm);
			return (60000 / bpm);
		}

		function randomIntFromRange(min, max) {
			return Math.floor(Math.random()*(max-min+1)+min);
		}

		function randomFloatFromRange(min, max) {
			return Math.random()*(max-min+1)+min;
		}

		var interval = bpmToMs(self.bpm);

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

					self.controllerWindow.postMessage({
					 	type: 'ui',
					 	varType: control.varType,
					 	modName: module.info.name,
					 	name: control.label,
					 	payload: rand,
					 	index: parseInt(cntrl)
					}, self.options.controlDomain);

					if(self.options.remote) {
						self.ws.send(JSON.stringify({
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

	modV.prototype.attachBot = function(module) {
		var self = this;
		var mod = self.registeredMods[module];
		if(bots[mod.info.name]) return false; // Bot already attached
		var bot = new modVBot(mod, self);
		bots[mod.info.name] = bot;

		self.controllerWindow.postMessage({
			type: 'info',
			name: 'active-bots',
			payload: Object.keys(bots).length,
		}, self.options.controlDomain);
	};

	modV.prototype.removeBot = function(module) {
		var self = this;
		var mod = self.registeredMods[module];
		if(!bots[mod.info.name]) return false; // No bot
		bots[mod.info.name].removeBot();
		delete bots[mod.info.name];

		self.controllerWindow.postMessage({
			type: 'info',
			name: 'active-bots',
			payload: Object.keys(bots).length,
		}, self.options.controlDomain);
		
		return true; // There was a bot, it has now been deleted
	};

})(module);