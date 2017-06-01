// https://www.shadertoy.com/view/4dX3DM

precision mediump float;

uniform sampler2D u_modVCanvas;
uniform vec3 iResolution;
varying vec2 fragCoord;
uniform int cellSize;

void main() {

	int CELL_SIZE = cellSize;
	float CELL_SIZE_FLOAT = float(CELL_SIZE);
	int RED_COLUMNS = int(CELL_SIZE_FLOAT/3.);
	int GREEN_COLUMNS = CELL_SIZE-RED_COLUMNS;


	vec2 p = floor(fragCoord.xy / CELL_SIZE_FLOAT) * CELL_SIZE_FLOAT;
	int offsetx = int(mod(fragCoord.x,CELL_SIZE_FLOAT));
	int offsety = int(mod(fragCoord.y,CELL_SIZE_FLOAT));

	vec4 sum = texture2D(u_modVCanvas, p / iResolution.xy);

	vec4 fragColor = vec4(0.,0.,0.,1.);
	if (offsety < CELL_SIZE-1) {
		if (offsetx < RED_COLUMNS) fragColor.r = sum.r;
		else if (offsetx < GREEN_COLUMNS) fragColor.g = sum.g;
		else fragColor.b = sum.b;
	}

	gl_FragColor = fragColor;
}