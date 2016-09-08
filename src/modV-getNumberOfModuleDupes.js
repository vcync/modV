(function() {
	'use strict';
	/*jslint browser: true */

	function replaceAll(string, operator, replacement) {
		return string.split(operator).join(replacement);
	}

	modV.prototype.getNumberOfModuleDupes = function(moduleName) {
		var list = document.getElementsByClassName('active-list')[0];
		moduleName = replaceAll(moduleName, ' ', '-');
		
		var dupes = list.querySelectorAll('.active-item[data-module-name|="' + moduleName + '"]');

		return dupes;
	};

})();