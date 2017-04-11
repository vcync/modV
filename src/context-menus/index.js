const Menu = require('../../libraries/menu.js');

module.exports = function initContextMenus() {
	if(!window.nw) {
		var nw = {};
		nw.Menu = Menu.Menu;
		nw.MenuItem = Menu.MenuItem;
	} else {
		var nw = window.nw;
	}

	require('./bots').bind(this)(nw);
	require('./copy-paste').bind(this)(nw);
	require('./midi').bind(this)(nw);
};