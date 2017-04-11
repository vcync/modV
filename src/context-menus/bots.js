module.exports = function(nw) {
	let modV = this;

	let attachRobotMenuItem = new nw.MenuItem({
		label: 'Attach Robot'
	});

	attachRobotMenuItem.on('click', function() {
		let node = modV.menus.contextMenuTarget;
		let parts = node.id.split('-');
		let Module = modV.activeModules[parts[0]];
		let controlID = Module.info.controls[parts[1]].id;

		if(controlID in modV.bots) {
			modV.removeBot(Module.info.name, parts[1]);
			this.label = 'Attach Robot';
		} else {
			modV.attachBot(Module.info.name, parts[1]);
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
			let node = modV.menus.contextMenuTarget;
			let parts = node.id.split('-');
			let Module = modV.activeModules[parts[0]];
			let controlID = Module.info.controls[parts[1]].id;

			if(controlID in modV.bots) {
				attachRobotMenuItem.label = 'Detatch Robot';
			} else {
				attachRobotMenuItem.label = 'Attach Robot';
			}
		}
	});
};