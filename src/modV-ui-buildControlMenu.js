module.exports = function(Control, Module, modV) {
	var items = [];

	var attatchRobotSettings = {
		title: 'Attach Robot',
		enabled: true,
		callback: function() {
			modV.attachBot(Module.info.name, Control.variable);
		}
	};

	var detatchRobotSettings = {
		title: 'Detatch Robot',
		enabled: true,
		callback: function() {
			modV.removeBot(Module.info.name, Control.variable);
		}
	};

	if(modV.bots[Control.getID()]) {
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