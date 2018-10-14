---
sidebarDepth: 2
---

# Media Manager

Media Manager handles filesystem operations, such as saving Project and Preset data, serving Modules, Plugins, Palettes, Images, Videos and GIFs to modV.

It is a node.js application which runs in the background, which only runs when modV is running.

## Media Folder

The Media Folder is where the Media Manager will scan for your Project files.

### Location

#### Mac

`~/Library/Application Support/modV/media/`

#### Linux

`~/.config/modV/media/`

#### Windows

`%appdata%\modV\media\`

### Structure

The Media Manager's folder structure is important as it is how it keeps track of assets relating to your Projects.

Projects are the top-level folders, e.g. the `default` Project is at `media/default/`.

```
.
├─ default
│  ├─ image
│  │  ├─ cat.jpg
│  │  ├─ dog.png
│  │  └─ dance.gif
│  ├─ module
│  │  └─ Waveform.js
│  ├─ palette
│  │  └─ rainbow.json
│  ├─ plugin
│  │  └─ SlimUI.json
│  ├─ preset
│  │  └─ the matrix.json
│  └─ video
│  │  └─ youtube_rip.mp4
├─ customProject
└─ anotherProject
```

### GIF and Video processing

Videos and GIFs will automatically be processed by [ffmpeg](https://www.ffmpeg.org/) to make sure they can be used within modV - your original files will not be processed, but copied and then processed.

**@todo: Create a mechanism to avoid automatic processing**

