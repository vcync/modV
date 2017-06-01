module.exports = function(Control, Module, modV) {
	let items = [];

	let attatchRobotSettings = {
		title: 'Attach Robot',
		enabled: true,
		callback: function() {
			modV.attachBot(Module.info.name, Control.variable);
		}
	};

	let detatchRobotSettings = {
		title: 'Detatch Robot',
		enabled: true,
		callback: function() {
			modV.removeBot(Module.info.name, Control.variable);
		}
	};

	if(modV.bots[Control.id]) {
		detatchRobotSettings.enabled = true;
		attatchRobotSettings.enabled = false;
	} else {
		detatchRobotSettings.enabled = false;
		attatchRobotSettings.enabled = true;
	}

	items.push(new modV.MenuItem(attatchRobotSettings));
	items.push(new modV.MenuItem(detatchRobotSettings));

	return items;
};