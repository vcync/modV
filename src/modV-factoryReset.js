(function() {
	'use strict';

	modV.prototype.factoryReset = function() {
		var self = this;
		for(var mod in self.registeredMods) {
			var m = self.registeredMods[mod];
			
			m.info.disabled = true;
			m.info.blend = 'normal';

			self.controllerWindow.postMessage({
				type: 'ui-enabled',
				modName: m.info.name,
				payload: false
			}, self.options.controlDomain);

			// If we have a WebSocket server
			if(self.options.remote) {
				self.ws.send(JSON.stringify({
					type: 'ui-enabled',
					modName: m.info.name,
					payload: false,
				}));
			}

			m.defaults.forEach(function(control, idx) {
				var val = control.currValue;

				if(control.type === 'image' || control.type === 'multiimage' || control.type === 'video') return;
				
				if('append' in control) {
					val = val.replace(control.append, '');
				}

				self.controllerWindow.postMessage({
					type: 'ui',
					varType: control.type,
					modName: m.info.name,
					name: control.label,
					payload: val
				}, self.options.controlDomain);

				// If we have a WebSocket server
				if(self.options.remote) {
					self.ws.send(JSON.stringify({
						type: 'ui',
						varType: control.type,
						modName: m.info.name,
						name: control.variable,
						payload: val,
						index: idx
					}));
				}

				if('append' in control) {
					val = val + control.append;
				}

				self.registeredMods[mod][control.variable] = val;

			});

		}

		// Clear the screen
		self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
	};

})();