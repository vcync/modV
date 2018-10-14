# Audio Routing

To use modV as an audio visualiser you will need an audio source.

There are a number of ways to do this:

1. If your computer has a microphone built-in, you can use that
2. Use an audio source via a line-in jack
3. Route audio using software routing. See below for OS specific set-up.

### Windows
- You must run either Command Prompt or PowerShell with administrative privileges for the media folder to be symlinked.
To do this, find either cmd or PowerShell in your start menu, right click and select 'Run as administrator.'.
- VB Cable is recommended to route audio to the browser, download that [here](http://vb-audio.pagesperso-orange.fr/Cable/)

### macOS
- SoundFlower is recommended to route audio to the browser, download that [here](https://github.com/mattingalls/Soundflower/releases/)

### Linux
- One way of routing audio to the browser is using [Pulse Audio's](https://www.freedesktop.org/wiki/Software/PulseAudio/) Volume Control package.
This [tutorial](https://www.kirsle.net/blog/entry/redirect-audio-out-to-mic-in-linux) shows how to setup the Input Devices to show your monitoring.
When you start the modV application, your browser should appear as a recording device in the "Recording" tab and you should not have to do any extra
to make it work.
![Browser input device in pavucontrol](https://github.com/2xAA/modV/raw/master/docs/linux-audio/pavucontrol.png)
