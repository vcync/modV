# modV 3.0

modV 3.0 is a complete rewrite of modV 2.0 with a focus on performance and a standardised API.


## Project setup
```bash
yarn
```

### Compiles and hot-reloads for development
```bash
yarn run electron:serve
```

### Builds for release
```bash
yarn run electron:build
```

## Platform specifics for building

### Windows
#### Shell

CMD or PowerShell is required as native binaries need to be compiled or fetched for Windows. WSL (Windows Subsystem for Linux) or WSL2 are not supported as they will try to compile those binaries for Ubuntu.

#### Dependancies

Windows Platform tools are required for building native binaries.
You can install them in a shell opened as administrator with the following snippet:

```bash
npm install --global --production windows-build-tools
```

**Note: This will take some time and you don't get much feedback of what is happening, so please wait until you get confirmation the installation process has finished otherwise painful Visual Studio things will need to be fixed!**



### Ubuntu/Debian

libndi is required for NDI sources and must be installed for modV to build. You can find that available to download here:
[https://github.com/Palakis/obs-ndi/releases](https://github.com/Palakis/obs-ndi/releases)

Last successful build was with `libndi4_4.5.1-1_amd64.deb`.



### Other Linux flavours

Untested. NDI is provided by grandiose, our fork is here: [https://github.com/vcync/grandiose/](https://github.com/vcync/grandiose/)
This fork of grandiose has other libndi supported platforms, however even on Ubuntu we needed the above libndi package to be installed.

Let us know how you get on (good or bad) and we'll update the repo and docs accordingly.