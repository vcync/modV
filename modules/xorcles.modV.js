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
            {type: 'range', variable: 'rmsIntensity', min: 1, max: 2000, varType: 'int', label: 'RMS intensity'},
            {type: 'palette', variable: 'colour', colours: [
                [122,121,120],
                [135,203,172],
                [144,255,220],
                [141,228,255],
                [138,196,255]
            ], timePeriod: 500}
        ]
    };

    this.circles = 20;
    this.size = 50;
    this.colour = '#fff';
    this.spread = 50;
    this.rmsIntensity = 300;

    var mCanvas = document.createElement('canvas');
    var mCtx = mCanvas.getContext('2d');

    this.init = function(canvas, ctx) {
        mCanvas.width = canvas.width;
        mCanvas.height = canvas.height;
    };
    
    this.draw = function(canvas, ctx, video, features, meyda, delta, bpm) {
        
        mCtx.fillStyle = this.colour;

        mCtx.globalCompositeOperation = 'xor';

        
        
        for(var i=0; i < this.circles; i++) {
            
            mCtx.beginPath();
            mCtx.arc(canvas.width/2 - this.spread/2 * Math.sin(((i / this.circles) * 360) * Math.PI / 180)/* + (Math.sin(delta/200+i) * 80)*/,
                    canvas.height/2 - this.spread/2 * Math.cos(((i / this.circles) * 360) * Math.PI / 180)/* + (Math.cos(delta/500+i) * 80)*/,
                    Math.abs(this.size + (Math.sin(delta/700) * features.rms* this.rmsIntensity)),
                    0,
                    2*Math.PI);
            
            mCtx.fill();
        }

        ctx.drawImage(mCanvas, 0, 0);
        mCtx.clearRect(0, 0, mCanvas.width, mCanvas.height);

    };
};