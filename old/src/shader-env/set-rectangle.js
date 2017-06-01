module.exports = (gl) => {
	
	return function setRectangle(x, y, width, height, buffer) {
		var x1 = x;
		var x2 = x + width;
		var y1 = y;
		var y2 = y + height;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			 x1, y1,
			 x2, y1,
			 x1, y2,
			 x1, y2,
			 x2, y1,
			 x2, y2]), gl.DYNAMIC_DRAW // using dynamic draw to allow resolution updates
		);
	};
};