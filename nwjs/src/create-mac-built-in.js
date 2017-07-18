module.exports = function(proto) {

	proto.createMacBuiltin = function (app_name, options) {
		var appleMenu = new nw.Menu({type:'menubar'}),
		options = options || {};

		appleMenu.append(new nw.MenuItem({
			label: nw.Menu.getNSStringFWithFixup("IDS_ABOUT_MAC", app_name),
			selector: "orderFrontStandardAboutPanel:",
			click: function() {
				if('aboutClick' in options) options.aboutClick();
			}
		}));

		appleMenu.append(new nw.MenuItem({
			type: "separator"
		}));

		appleMenu.append(new nw.MenuItem({
			label: nw.Menu.getNSStringFWithFixup("IDS_HIDE_APP_MAC", app_name),
			selector: "hide:",
			modifiers: "cmd",
			key: "h"
		}));

		appleMenu.append(new nw.MenuItem({
			label: nw.Menu.getNSStringWithFixup("IDS_HIDE_OTHERS_MAC"),
			selector: "hideOtherApplications:",
			key: "h",
			modifiers: "cmd-alt"
		}));

		appleMenu.append(new nw.MenuItem({
			label: nw.Menu.getNSStringWithFixup("IDS_SHOW_ALL_MAC"),
			selector: "unhideAllApplications:",
		}));

		appleMenu.append(new nw.MenuItem({
			type: "separator"
		}));

		appleMenu.append(new nw.MenuItem({
			label: nw.Menu.getNSStringFWithFixup("IDS_EXIT_MAC", app_name),
			selector: "closeAllWindowsQuit:",
			modifiers: "cmd",
			key: "q"
		}));

		this.append(new nw.MenuItem({ label:'', submenu: appleMenu}));

		if (!options.hideEdit) {
			var editMenu = new nw.Menu({type:'menubar'});

			editMenu.append(new nw.MenuItem({
				label: nw.Menu.getNSStringWithFixup("IDS_EDIT_UNDO_MAC"),
				selector: "undo:",
				modifiers: "cmd",
				key: "z"
			}));

			editMenu.append(new nw.MenuItem({
				label: nw.Menu.getNSStringWithFixup("IDS_EDIT_REDO_MAC"),
				selector: "redo:",
				key: "z",
				modifiers: "cmd-shift"
			}));

			editMenu.append(new nw.MenuItem({
				type: "separator"
			}));

			editMenu.append(new nw.MenuItem({
				label: nw.Menu.getNSStringWithFixup("IDS_CUT_MAC"),
				selector: "cut:",
				modifiers: "cmd",
				key: "x"
			}));

			editMenu.append(new nw.MenuItem({
				label: nw.Menu.getNSStringWithFixup("IDS_COPY_MAC"),
				selector: "copy:",
				modifiers: "cmd",
				key: "c"
			}));

			editMenu.append(new nw.MenuItem({
				label: nw.Menu.getNSStringWithFixup("IDS_PASTE_MAC"),
				selector: "paste:",
				modifiers: "cmd",
				key: "v"
			}));

			editMenu.append(new nw.MenuItem({
				label: nw.Menu.getNSStringWithFixup("IDS_EDIT_DELETE_MAC"),
				selector: "delete:",
				key: ""
			}));

			editMenu.append(new nw.MenuItem({
				label: nw.Menu.getNSStringWithFixup("IDS_EDIT_SELECT_ALL_MAC"),
				selector: "selectAll:",
				modifiers: "cmd",
				key: "a"
			}));

			this.append(new nw.MenuItem({ label: nw.Menu.getNSStringWithFixup("IDS_EDIT_MENU_MAC"),
				submenu: editMenu}));
		}

		if (!options.hideWindow) {
			var winMenu = new nw.Menu({type:'menubar'});

			winMenu.append(new nw.MenuItem({
				label: nw.Menu.getNSStringWithFixup("IDS_MINIMIZE_WINDOW_MAC"),
				selector: "performMiniaturize:",
				modifiers: "cmd",
				key: "m"
			}));

			winMenu.append(new nw.MenuItem({
				label: nw.Menu.getNSStringWithFixup("IDS_CLOSE_WINDOW_MAC"),
				selector: "performClose:",
				modifiers: "cmd",
				key: "w"
			}));

			winMenu.append(new nw.MenuItem({
				type: "separator"
			}));

			winMenu.append(new nw.MenuItem({
				label: nw.Menu.getNSStringWithFixup("IDS_ALL_WINDOWS_FRONT_MAC"),
				selector: "arrangeInFront:",
			}));

			this.append(new nw.MenuItem({ label: nw.Menu.getNSStringWithFixup("IDS_WINDOW_MENU_MAC"),
				submenu: winMenu}));
		}
	};
};