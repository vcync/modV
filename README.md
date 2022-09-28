<h1 align="center">modV</h1>
<p align="center"><img alt="modV logo" src="https://github.com/vcync/modV/raw/main/build/icon.png" width="256" /></p>

<p align="center">
  <a href="https://github.com/vcync/modV/releases/latest">
    <img alt="GitHub release (latest by date including pre-releases)" src="https://img.shields.io/github/v/release/vcync/modV?color=blue&include_prereleases" />
  </a>
  <a href="https://modv.vcync.gl/" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-living-blue.svg" />
  </a>
  <a href="https://github.com/vcync/modV/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/vcync/modV/blob/main/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/vcync/modV" />
  </a>
  <a href="https://twitter.com/_modV_" target="_blank">
    <img alt="Twitter: @_modV_" src="https://img.shields.io/twitter/follow/_modV_.svg?style=social" />
  </a>
</p>
<p align="center">
modV is a modular audio visualisation environment built upon web technologies.
</p>


## Download

Find the latest modV binaries available for download in the releases section.

https://github.com/vcync/modV/releases/latest



## Project development setup

```
yarn
```

### Compiles and hot-reloads for development

```
yarn electron:serve
```

### Builds for release

```
yarn electron:build
```

### Caveats

#### Removing a package

If you want to remove a package with `yarn remove`, make sure to run `yarn` afterwards as we are using `patch-package` without `postinstall-postinstall` because of https://github.com/vcync/modV/issues/554.



## Platform specifics for building and development

### Windows

#### Shell

CMD or PowerShell is required as native binaries need to be compiled or fetched for Windows. WSL (Windows Subsystem for Linux) or WSL2 are not supported as they will try to compile those binaries for Ubuntu.

#### Dependancies

Visual Studio Tools and Python are required by node-gyp, which build native node modules.
Since Node.js 16, the official Windows installer can install them.

If you're using nvm-windows or another headless Node.js install, you can easily install the required packages with [Chocolatey](https://chocolatey.org/install):

```
choco install python visualstudio2022-workload-vctools
```

#### 'vue-cli-service' is not recognized

Please see issue 122 ([vcync/modv-3/issues/122#issuecomment-640100114](https://github.com/vcync/modv-3/issues/122#issuecomment-640100114)) on how to resolve this.

### Ubuntu/Debian

libndi is required for NDI sources and must be installed for modV to build. You can find that available to download here: [Palakis/obs-ndi/releases](https://github.com/Palakis/obs-ndi/releases)

Last successful build was with `libndi4_4.5.1-1_amd64.deb`.

### Other Linux flavours

Untested. NDI is provided by grandiose, our fork is here: [vcync/grandiose](https://github.com/vcync/grandiose/) This fork of grandiose has other libndi supported platforms, however even on Ubuntu we needed the above libndi package to be installed.

Let us know how you get on (good or bad) and we'll update the repo and docs accordingly.



## Contributing

Contributions, issues and feature requests are welcome!
Feel free to check [issues page](https://github.com/vcync/modV/issues).



## Show your support

Give a ⭐️  if this project helped you!



## Acknowledgements

Thank you to:

- [Tim Pietrusky](https://nerddis.co/) for his continued support, help, mentorship and kindness
- [Live:JS](http://livejs.network/) for inspiration, motivation and advice
- Hugh Rawlinson, Nevo Segal and Jakub Fiala for the incredible audio analysis engine, [meyda](https://github.com/hughrawlinson/meyda)
- [Dario Villanueva](http://alolo.co/) for his advice and introduction to live visuals which inspired this whole project



## License

Copyright © 2022 [vcync](https://github.com/vcync).
This project is [MIT](https://github.com/vcync/modV/blob/main/LICENSE) licensed.
