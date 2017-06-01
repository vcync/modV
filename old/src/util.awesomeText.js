// originally from here, made modifications for the line height http://stackoverflow.com/a/37192581/1539303
var awesomeText = function(ctx, text, x, y, lineHeight, maxWidth, textAlign) {
	if(!textAlign) textAlign = 'center';
	ctx.textAlign = textAlign;
	var words = text.split(' ');
	var lines = [];
	var sliceFrom = 0;
	for(let i = 0; i < words.length; i++) {
		var chunk = words.slice(sliceFrom, i).join(' ');
		var last = i === words.length - 1;
		var bigger = ctx.measureText(chunk).width > maxWidth;
		if(bigger) {
			lines.push(words.slice(sliceFrom, i).join(' '));
			sliceFrom = i;
		}
		if(last) {
			lines.push(words.slice(sliceFrom, words.length).join(' '));
			sliceFrom = i;
		}
	}
	
	var offsetX = 0;
	var offsetY = 0;

	if(textAlign === 'center') offsetX = maxWidth / 2;

	offsetY -= (lines.length-1) * (lineHeight/2);

	for(let i = 0; i < lines.length; i++) {
		ctx.fillText(lines[i], x + offsetX, y + offsetY);
		offsetY = offsetY + lineHeight;
	}
};

window.awesomeText = awesomeText;