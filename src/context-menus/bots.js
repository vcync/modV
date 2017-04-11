module.exports = function(nw) {
	let modV = this;

	let attachRobotMenuItem = new nw.MenuItem({
		label: 'Attach Robot'
	});

	function getControlDataFromNode(node) {
		if(!node) return false;

		let parts = node.id.split('-');

		let variable = parts.pop();
		let moduleName = parts.join(' ');

		let Module = modV.activeModules[moduleName];
		let controlId = Module.info.controls[variable].id;

		return {
			moduleName,
			controlId,
			variable
		};
	}

	attachRobotMenuItem.on('click', function() {
		let data = getControlDataFromNode(modV.menus.contextMenuTarget);

		if(data.controlId in modV.bots) {
			modV.removeBot(data.moduleName, data.variable);
			this.label = 'Attach Robot';
		} else {
			modV.attachBot(data.moduleName, data.variable);
			this.label = 'Detatch Robot';
		}
	});

	this.menus.addHook({
		nodeType: ['input', 'button', 'select'],
		className: [
			'modv-button-control',
			'modv-color-control',
			'modv-composite-operation-control',
			'modv-image-control',
			'modv-range-control',
			'modv-select-control',
			'modv-text-control',
			'modv-video-control'
		],
		matchAnyClass: true,
		menuItems: [
			new nw.MenuItem({
				label: 'Robots',
				enabled: false
			}),
			attachRobotMenuItem
		],
		beforeShow: function() {
			let data = getControlDataFromNode(modV.menus.contextMenuTarget);

			if(data.controlId in modV.bots) {
				attachRobotMenuItem.label = 'Detatch Robot';
			} else {
				attachRobotMenuItem.label = 'Attach Robot';
			}
		}
	});
};