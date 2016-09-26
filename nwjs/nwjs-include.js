//jshint node:true
//globals nw
var gui = require('nw.gui');

var mb = new gui.Menu({type:"menubar"});
if(process.platform === "darwin") mb.createMacBuiltin("modV");

var submenu = new nw.Menu();

submenu.append(new nw.MenuItem({
	label: 'Spawn new output Window',
	click: function() {
		modV.createWindows();
	}
}));

submenu.append(new nw.MenuItem({
	label: 'Open Media folder',
	click: function() {
		process.mainModule.exports.openMediaFolder();
	}
}));

// the menu item appended should have a submenu
mb.append(new nw.MenuItem({
  label: 'Options',
  submenu: submenu
}));

gui.Window.get().menu = mb;