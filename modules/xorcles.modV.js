var xorcles = function() {
    this.info = {
        name: 'xorcles',
        author: '2xAA',
        version: 0.1,
        meyda: ['rms'],
        controls: [
            {type: 'range', variable: 'circles', min: 1, max: 100, varType: 'int', label: 'Circles'},
            {type: 'range', variable: 'size', min: 1, max: 500, varType: 'int', label: 'Size'},
            {type: 'range', variable: 'spread', min: 1, max: 2000, varType: 'int', label: 'Spread'},
            {type: 'color', variable: 'colour', label: 'Colour', varType: 'string'}
        ]
    };

    this.circles = 20;
    this.size = 50;
    this.colour = '#fff';
    this.spread = 50;

    var mCanvas = document.createElement('canvas');
    var mCtx = mCanvas.getContext('2d');

    this.init = function(canvas, ctx) {
        mCanvas.width = canvas.width;
        mCanvas.height = canvas.height;
    };
    
    this.draw = function(canvas, ctx, amplitudeArray, video, meyda, delta) {
        
        mCtx.fillStyle = this.colour;

        mCtx.globalCompositeOperation = 'xor';

        
        
        for(var i=0; i < this.circles; i++) {
            
            mCtx.beginPath();
            mCtx.arc(canvas.width/2 - this.spread/2 * Math.sin(((i / this.circles) * 360) * Math.PI / 180)/* + (Math.sin(delta/200+i) * 80)*/,
                    canvas.height/2 - this.spread/2 * Math.cos(((i / this.circles) * 360) * Math.PI / 180)/* + (Math.cos(delta/500+i) * 80)*/,
                    this.size + Math.sin(delta/700) * this.size + meyda.rms*300,
                    0,
                    2*Math.PI);
            
            mCtx.fill();
        }

        ctx.drawImage(mCanvas, 0, 0);
        mCtx.clearRect(0, 0, mCanvas.width, mCanvas.height);

    };
};