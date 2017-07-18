/* globals nw */
const MediaManager = require('modv-media-manager');
const mm = new MediaManager(3132, true);

module.exports = {
	openMediaFolder: function() {
		nw.Shell.openItem(mm.mediaDirectoryPath);
	}
};