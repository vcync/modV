//jshint node:true
//globals nw
var gui = require('nw.gui');

var mb = new gui.Menu({type:"menubar"});
if(process.platform === "darwin") mb.createMacBuiltin("modV");

var submenu = new nw.Menu();

submenu.append(new nw.MenuItem({
	label: 'Spawn new output Window',
	click: function() {
		modV.createWindow();
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

var menu = new gui.Menu();
let submenu2 = new nw.Menu();

submenu2.append(new gui.MenuItem({
	label: 'Create output window',
	click: function() {
		modV.createWindow();
	}
}));

let submenuContainer = new gui.MenuItem({
	label: 'Submenu',
	submenu: submenu2
});

menu.append(submenuContainer);

menu.append(new gui.MenuItem({
	type: 'separator'
}));
menu.append(new gui.MenuItem({
	label: 'Line2',
	click: function() {
		alert('Hi!');
	}
}));

document.body.addEventListener('contextmenu', function(ev) {
	ev.preventDefault();
	menu.popup(ev.x, ev.y);
	return false;
});