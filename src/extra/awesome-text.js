// originally from here, made modifications for the line height http://stackoverflow.com/a/37192581/1539303
function awesomeText(ctx, text, x, y, lineHeight, maxWidth, textAlign = 'center') {
  ctx.textAlign = textAlign;
  const words = text.split(' ');
  const lines = [];
  let sliceFrom = 0;

  for(let i = 0; i < words.length; i += 1) {
    const chunk = words.slice(sliceFrom, i).join(' ');
    const last = i === words.length - 1;
    const bigger = ctx.measureText(chunk).width > maxWidth;
    if(bigger) {
      lines.push(words.slice(sliceFrom, i).join(' '));
      sliceFrom = i;
    }
    if(last) {
      lines.push(words.slice(sliceFrom, words.length).join(' '));
      sliceFrom = i;
    }
  }

  let offsetX = 0;
  let offsetY = 0;

  if(textAlign === 'center') offsetX = maxWidth / 2;

  offsetY -= (lines.length - 1) * (lineHeight / 2);

  for(let i = 0; i < lines.length; i += 1) {
    ctx.fillText(lines[i], x + offsetX, y + offsetY);
    offsetY += lineHeight;
  }
}

export default awesomeText;