var MattiasCRT = new modVC.ModuleShader({
	info: {
		name: 'MattiasCRT',
		author: 'Mattias',
		version: 0.1,
		meyda: [], // returned variables passed to the shader individually as uniforms
		controls: [], // variabled passed to the shader individually as uniforms
		uniforms: {
			/*amount: {
				type: 'f',
				value: 0.5
			},
			centerX: {
				type: 'f',
				value: 0.5
			},
			centerY: {
				type: 'f',
				value: 0.5
			}*/
		} // Three.JS uniforms
	},
	shaderFile: "/MattiasCRT/shader.html" // path to HTML file within modules directory with shader script tags
});

modVC.register(MattiasCRT);