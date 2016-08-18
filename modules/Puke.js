var Puke = new modVC.ModuleShader({
	info: {
		name: 'Puke',
		author: '2xAA',
		version: 0.1,
		meyda: [], // returned variables passed to the shader individually as uniforms
		controls: [], // variabled passed to the shader individually as uniforms
		uniforms: {
			red: {
				type: 'b',
				value: false
			},
			blue: {
				type: 'b',
				value: false
			},
			green: {
				type: 'b',
				value: false
			}
		} // Three.JS uniforms
	},
	shaderFile: "/Puke/shader.html" // path to HTML file within modules directory with shader script tags
});

Puke.add(new modVC.CheckboxControl({
	variable: 'red',
	label: 'Red',
	checked: false
}));

Puke.add(new modVC.CheckboxControl({
	variable: 'green',
	label: 'Green',
	checked: false
}));

Puke.add(new modVC.CheckboxControl({
	variable: 'blue',
	label: 'Blue',
	checked: false
}));

modVC.register(Puke);