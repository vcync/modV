---
sidebarDepth: 2
---

# Media Manager

## Ports

* `3132` - WebSocket connection
* `3133` - HTTP Fileserver

## Outbound WebSocket Messages

Messages sent from the Media Manager to modV.

### file-update-add
```json
{
  "type": "file-update-add",
  "data": {
    "type": "module", // palette | plugin | preset | video | image
    "name": "filename",
    "profile": "projectName",

    // if type is module, video, image
    "path": "http://localhost:3133/project/type/filename.ext",

    // if type is palette, plugin, preset
    "contents": "localhost:3133/project/type/filename.ext"
  }
}
```

### file-update-delete
```json
{
  "type": "profile-delete",
  "data": {
    "type": "palette", // preset | video | image
    "profile": "projectName",
    "name": "filename"
  }
}
```

### profile-add
```json
{
  "type": "profile-add",
  "data": {
    "profile": "projectName"
  }
}
```

### profile-delete
```json
{
  "type": "profile-delete",
  "data": {
    "profile": "projectName"
  }
}
```

## Inbound WebSocket Messages

Messages sent from modV to the Media Manager.

### update

### save-option

### set-folder

### make-profile

### save-preset

### save-palette

### save-plugin
