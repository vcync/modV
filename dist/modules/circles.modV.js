var circles = function() {

	this.info = {
		name: 'circles',
		author: '2xAA',
		version: 0.1,
		meyda: ['zcr', 'rms', 'energy']
	};
	
	var x;
	var y;
	var deg = 0;
	var deg2 = 0;
	var down = true;
	var down2 = true;

	this.draw = function(canvas, ctx, audio, video, meyda) {
		
		var x = Math.cos(deg) * meyda['rms']*50;
		var y = -Math.sin(deg2) * meyda['rms']*50;
		
		ctx.translate(x, y);
		
		ctx.strokeStyle = ctx.fillStyle = 'rgb(255,255,0)';
		
		ctx.beginPath();
		ctx.arc(canvas.width/2, canvas.height/2, meyda['zcr']/2, 0, 2*Math.PI);
		ctx.stroke();
		ctx.closePath();
		
		ctx.strokeStyle = ctx.fillStyle = 'rgb(255,0,255)';
		
		ctx.beginPath();
		ctx.arc(canvas.width/2, canvas.height/2, meyda['rms']*100, 0, 2*Math.PI);
		ctx.stroke();
		ctx.closePath();
		
		ctx.strokeStyle = ctx.fillStyle = 'rgb(0,255,255)';
		
		ctx.beginPath();
		ctx.arc(canvas.width/2, canvas.height/2, meyda['energy'], 0, 2*Math.PI);
		ctx.stroke();
		ctx.closePath();
		
		ctx.translate(-x, -y);
		
		if(deg >= 90) down = true;
		else if(deg <= -90) down = false;
		
		if(down) deg -= 0.01;
		else deg += 0.01;
		
		if(deg2 >= 90) down2 = true;
		else if(deg <= -90) down2 = false;
		
		if(down2) deg2 -= 0.01/2;
		else deg2 += 0.01/2;
	};
};