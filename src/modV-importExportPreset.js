(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	//modV.prototype.

	modV.prototype.saveToJSON = function(data, name) {
		var JSONBlob = new Blob([data], {
			type: 'application/json',
			encoding: 'UTF-8'
		});

		var downloadLink = document.createElement('a');
		downloadLink.download = name;
		downloadLink.innerHTML = 'file';
		downloadLink.href = window.webkitURL.createObjectURL(JSONBlob);
		downloadLink.click();
	};

	modV.prototype.loadFilesAsText = function() {
		var fileToLoad = document.getElementById('fileToLoad').files[0];

		var fileReader = new FileReader();

		fileReader.onload = function(fileLoadedEvent) {
			var textFromFileLoaded = fileLoadedEvent.target.result;
			document.getElementById('inputTextToSave').value = textFromFileLoaded;
		};

		fileReader.readAsText(fileToLoad, 'UTF-8');
	};

	modV.prototype.loadFromJSON = function(data) {
		
	};

})(module);