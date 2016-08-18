(function() {
	'use strict';

	modV.prototype.factoryReset = function() {

		forIn(this.registeredMods, (mod, m) => {
			
			m.info.disabled = true;
			m.info.blend = 'normal';

			this.controllerWindow.postMessage({
				type: 'ui-enabled',
				modName: m.info.name,
				payload: false
			}, this.options.controlDomain);

			// If we have a WebSocket server
			if(this.options.remote) {
				this.ws.send(JSON.stringify({
					type: 'ui-enabled',
					modName: m.info.name,
					payload: false,
				}));
			}

			m.defaults.forEach((control, idx) => {
				var val = control.currValue;

				if(control.type === 'image' || control.type === 'multiimage' || control.type === 'video') return;
				
				if('append' in control) {
					val = val.replace(control.append, '');
				}

				this.controllerWindow.postMessage({
					type: 'ui',
					varType: control.type,
					modName: m.info.name,
					name: control.label,
					payload: val
				}, this.options.controlDomain);

				// If we have a WebSocket server
				if(this.options.remote) {
					this.ws.send(JSON.stringify({
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

				this.registeredMods[mod][control.variable] = val;

			});

		});

		// Clear the screen
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	};

})();