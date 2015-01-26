var video = function() {
	this.info = {
		name: 'video',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'video', variable: 'video', label: 'Drag a vid here, bae'},
			{type: 'range', variable: 'playbackRate', label: 'Playback Rate', min: -1.0, max: 2.0, varType: 'float', step: 0.1}
		]
	};
	
	this.video = document.createElement('video');
	this.video.src = 'test.mp4';
	this.video.muted = true;
	this.video.loop = true;
	this.playbackRate = 1.0;
	
	this.draw = function(canvas, ctx, audio, video) {
		this.video.playbackRate = this.playbackRate;
		ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height); 
	};
};