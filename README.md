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
Windows Platform tools are required. Install them with:
```bash
npm install --global --production windows-build-tools
```



#### 'vue-cli-service' is not recognized

Please see issue 122 (https://github.com/vcync/modv-3/issues/122#issuecomment-640100114) on how to resolve this.

### Ubuntu/Debian

libndi is required for NDI sources and must be installed for modV to build. You can find that available to download here:
[https://github.com/Palakis/obs-ndi/releases](https://github.com/Palakis/obs-ndi/releases)

Last successful build was with `libndi4_4.5.1-1_amd64.deb`.

### Other Linux flavours
Untested. NDI is provided by grandiose, our fork is here: [https://github.com/vcync/grandiose/](https://github.com/vcync/grandiose/)
This fork of grandiose has other libndi supported platforms, however even on Ubuntu we needed the above libndi package to be installed.

Let us know how you get on (good or bad) and we'll update the repo and docs accordingly.