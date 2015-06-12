var spazulator5000 = function() {
	this.info = {
		name: 'spazulator5000',
		author: '2xAA vs SPAZRAMMER',
		version: 0.1,
		controls: [
			{type: 'video', variable: 'video', label: 'Drag a vid here, bae'},
			{type: 'range', variable: 'playbackRate', label: 'Playback Rate', min: -1.0, max: 2.0, varType: 'float', step: 0.1},
			{type: 'range', variable: 'spazRate', label: 'Spaz Rate', min: 0, max: 100, varType: 'int', step: 1},
			{type: 'range', variable: 'cutoffStart', label: 'Cutoff Start', min: 0, max: 100, varType: 'float', step: 0.5}, //cutoff start
			{type: 'range', variable: 'cutoffEnd', label: 'Cutoff End', min: 0, max: 100, varType: 'float', step: 0.5} //cutoff end
		]
	};
	
	this.video = document.createElement('video');
	this.video.src = 'test.mp4';
	this.video.muted = true;
	this.video.loop = true;
	this.playbackRate = 1.0;
	this.spazRate = 100;
	this.cutoffStart = 0;
	this.cutoffEnd = 100;
	var frame = 0;

	function randomIntFromInterval(min, max) {
		return Math.floor(Math.random() * ( max - min + 1 ) + min);
	}
	
	this.draw = function(canvas, ctx, audio, video) {
		try{
			this.video.playbackRate = this.playbackRate;
			
			//if(this.video.currentTime > ((this.cutoffEnd / 100) * this.video.duration)) this.video.currentTime = ((this.cutoffStart / 100) * this.video.duration);

			if(frame % this.spazRate === 0) {

				this.video.currentTime = randomIntFromInterval(((this.cutoffStart / 100) * this.video.duration), ((this.cutoffEnd / 100) * this.video.duration));
			}

		} catch(e) {
			
		}
		frame++;

		ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height); 
	};
};