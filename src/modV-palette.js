(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	var Palette = function(colours, timePeriod, callbacks) {
		
			var self = this;
	
			colours = colours || [];

			if('init' in callbacks) callbacks.init(colours);
			
			timePeriod = Math.round((timePeriod/1000) * 60);
			
			var currentColour = 0;
			var currentTime = 0;
			var controlsGenerated = false;
		   	
			// Modified from: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
			function hexToRgb(hex) {
				var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				return result ? [
					parseInt(result[1], 16),
					parseInt(result[2], 16),
					parseInt(result[3], 16)
				] : null;
			}
			
			self.addColour = function(colour) {
				var rgbFromHex;
				if(typeof colour === "string") {

					rgbFromHex = hexToRgb(colour);
					colours.push(rgbFromHex);
					
				} else if(colour.constructor === Array) {

					colours.push(rgbFromHex);

				} else return;

				if('add' in callbacks) callbacks.add(colours);
				return colours.length;
			};
			
			self.removeAtIndex = function(index) {
				var returnVal = colours.splice(index, 1);
				if('remove' in callbacks) callbacks.remove(colours);
				return returnVal;
			};
			
			self.getColours = function() {
				return colours;
			};
			
			function colourToRGBString(colour) {
				return 'rgb(' +
					colour[0] +
					', ' +
					colour[1] +
					', ' +
					colour[2] +
					')';
			}
			
			function calculateStep() {		
				var r1 = colours[currentColour][0];
				var g1 = colours[currentColour][1];
				var b1 = colours[currentColour][2];
				
				var nextColour = currentColour + 1;
				
				if(nextColour > colours.length-1) {
					nextColour = 0;
				}
				
				var r2 = colours[nextColour][0];
				var g2 = colours[nextColour][1];
				var b2 = colours[nextColour][2];
				
				var p = currentTime / (timePeriod - 1);
				var r = Math.round((1.0-p) * r1 + p * r2 + 0.5);
				var g = Math.round((1.0-p) * g1 + p * g2 + 0.5);
				var b = Math.round((1.0-p) * b1 + p * b2 + 0.5);
				
				return [r, g, b];
			}
			
			self.nextStep = function() {
				
				if(colours.length < 1) {
					// If there are no colours, return false
					return false;
				} else if(colours.length < 2) {
					// If there are less than two colours, just return the only colour
					return colourToRGBString(colours[0]);
				}
				
				currentTime++;
				if(currentTime >= timePeriod) {
					if(currentColour > colours.length-2) {
						currentColour = 0;
					} else {
						currentColour++;
					}
					currentTime = 0;
				}
				
				var returned = calculateStep();
				returned = colourToRGBString(returned);

				if('next' in callbacks) callbacks.next(returned);
				
				return returned;
			};
			
			self.setTimePeriod = function() {
				// TODO: sets time period and updates current time period if old is greater than new
			};
			
			function makeColourSwatch(colour) {
				var swatch = document.createElement('div');
				swatch.classList.add('swatch');
				swatch.style.backgroundColor = colourToRGBString(colour);
				swatch.addEventListener('click', function() {

					var nodeList = Array.prototype.slice.call(this.parentNode.children);
    				var idx = nodeList.indexOf(this);

    				console.log(idx);

					self.removeAtIndex(idx);
					this.remove();
				});
				return swatch;
			}
			
			self.generateControls = function() {
				var paletteDiv = document.createElement('div');
				paletteDiv.classList.add('palette');
				
				colours.forEach(function(colour, i) {
					var swatch = makeColourSwatch(colour);
					paletteDiv.appendChild(swatch);
				});
				
			   	var controlsDiv = document.createElement('div');
				
				var colourPicker = document.createElement('input');
				colourPicker.type = 'color';
				
				var addButton = document.createElement('button');
				addButton.textContent = '+';
				addButton.addEventListener('click', function() {
					var coloursLength = self.addColour(colourPicker.value);
					var swatch = makeColourSwatch(colours[coloursLength-1]);
					swatch.id = coloursLength-1;
					paletteDiv.appendChild(swatch);

				});
				
				controlsDiv.appendChild(paletteDiv);
				controlsDiv.appendChild(colourPicker);
				controlsDiv.appendChild(addButton);
				
				controlsGenerated = true;
				return controlsDiv;
			};

	};

	modV.prototype.Palette = function(colours, timePeriod, callbacks) {
		var self = this;
		
		var pal = new Palette(colours, timePeriod, callbacks);
		var idx = self.palettes.push(pal)-1;
		return self.palettes[idx];
	};

})(module);