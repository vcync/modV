class FractalZoom extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Fractal Zoom',
				author: '2xAA',
				version: 0.1,
				meyda: ['rms'], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					
				} // Three.JS style uniforms
			},
			shaderFile: "/FractalZoom/shader.html" // path to HTML file within modules directory with shader script tags
		});
	}
}

modV.register(FractalZoom);