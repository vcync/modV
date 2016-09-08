(function() {
	'use strict';

	modV.prototype.factoryReset = function() {

		forIn(this.registeredMods, (mod, m) => {
			
			m.info.disabled = true;
			m.info.blend = 'normal';

			m.defaults.forEach((control) => {
				var val = control.currValue;

				if(control.type === 'image' || control.type === 'multiimage' || control.type === 'video') return;
				
				if('append' in control) {
					val = val.replace(control.append, '');
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