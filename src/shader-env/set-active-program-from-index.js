module.exports = (gl) => {

	return function setActiveProgramFromIndex(program) {
		if(this.activeProgram === program) return;
		this.activeProgram = program;
		gl.useProgram(this.programs[program]);
	};
};