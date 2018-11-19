# Audio Routing

To use modV as an audio visualiser you will need an audio source.

There are a number of ways to do this:

1. If your computer has a microphone built-in, you can use that
2. Use an audio source via a line-in jack
3. Route audio using software routing. See below for OS specific set-up.

### Windows
VB Cable is recommended to route audio to the browser, download that [here](http://vb-audio.pagesperso-orange.fr/Cable/).

#### Configuring VB Cable

* Set the system audio to route through VB Cable:
  * 1. Open the Sound Control Panel (`win + r` `control.exe /name Microsoft.Sound`)
    2. *In the Playback tab:* Set `CABLE Input` as the Default Device
* Listening to VB CABLE's output:
  * 1. _In the Recording tab:_ Right click `CABLE Output` and select `Properties`
    2. *In the Listen tab:* Check `Listen to the device` and select the Playback device to your speakers or headphones in the dropdown menu

### macOS
Soundflower is recommended to route audio to the browser, download that [here](https://github.com/mattingalls/Soundflower/releases/).

* Set the system audio to route through SoundFlower:
  * 1. Open "Audio MIDI Setup" in `/Applications/Utilities/` 
    2. Create a new "Multi-Output Device" with the `+` button in the bottom left
    3. Add "Soundflower 2ch" and any other device you'd like audio to output to (such as "Built-in Output" to listen to the audio)
    4. Select your new Multi-Output Device in "System Preferences > Sound" to be the output

### Linux

#### Pulse Audio

1. Download and install [Pulse Audio's](https://www.freedesktop.org/wiki/Software/PulseAudio/) Volume Control package
2. This [tutorial](https://www.kirsle.net/blog/entry/redirect-audio-out-to-mic-in-linux) shows how to setup the Input Devices to show your monitoring
3. When you start the modV application, your browser should appear as a recording device in the `Recording` tab

![Browser input device in pavucontrol](https://github.com/2xAA/modV/raw/master/docs/linux-audio/pavucontrol.png)