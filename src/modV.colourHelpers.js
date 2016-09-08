(function() {
	'use strict';

	function rgbToString(rgb) {
		
		if(!rgb) return undefined;
		
		return 'rgb(' + rgb.toString() + ')';
	}

	function rgbaToString(rgba) {
		
		if(!rgba) return undefined;

		var alpha = rgba.splice(3, 1);
		alpha = Math.map(alpha, 0, 255, 0, 1);

		return 'rgb(' + rgba.toString() + ',' + alpha + ')';
	}


	function hslToRgb(hue, sat, light) {
		// Copied from here: https://drafts.csswg.org/css-color-4/#hsl-to-rgb
		var t2;
		if( light <= 0.5 ) {
			t2 = light * (sat + 1);
		} else {
			t2 = light + sat - (light * sat);
		}
		var t1 = light * 2 - t2;
		var r = hueToRgb(t1, t2, hue + 2);
		var g = hueToRgb(t1, t2, hue);
		var b = hueToRgb(t1, t2, hue - 2);

		return [r,g,b];
	}

	function hueToRgb(t1, t2, hue) {
		// Copied from here: https://drafts.csswg.org/css-color-4/#hsl-to-rgb
		if(hue < 0) hue += 6;
		if(hue >= 6) hue -= 6;

		if(hue < 1) return (t2 - t1) * hue + t1;
		else if(hue < 3) return t2;
		else if(hue < 4) return (t2 - t1) * (4 - hue) + t1;
		else return t1;
	}

	window.rgbToString = rgbToString;
	window.rgbaToString = rgbaToString;
	window.hslToRgb = hslToRgb;

})();