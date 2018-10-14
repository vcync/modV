---
sidebarDepth: 2
---

# Context Menu

modV exposes a context menu API.

**@todo: re-think the context menu api. It's super clunky.**

## Component Integration

### v-context-menu

To allow Context Menus on Components within modV, a directive needs to be applied.

The directive takes in an object to configure the Context Menu.

|argument (object)|type|default|info|
|---|---|---|---|
|args.match|`array`|`undefined`|Array of hooks to match|
|args.menuItems|`array`|`undefined`|Array of nwjs-menu-browser/MenuItem which are default to this component|

```vue
<template>
  <div v-context-menu="menuOptions">
    <!-- ... -->
  </div>
</template>

<script>
export default {
  name: 'someControl',
  data() {
    return {
      menuOptions: {
        match: ['rangeControl'],
        menuItems: [],
      },
    };
  },
};
</script>
```

## Plugin Integration

See the [MIDI Assignment](https://github.com/2xAA/modV/blob/2.0-drawloop/src/extra/midi-assignment/index.js#L127) and [LFO](https://github.com/2xAA/modV/blob/2.0-drawloop/src/extra/lfo/index.js#L34) Plugins for examples of Plugin integration.

### modV.addContextMenuHook()

|argument (object)|type|default|info|
|---|---|---|---|
|args.hook|`string`|`undefined`|The menu hook to listen for when a right click event occurs|
|args.buildMenuItem|`function`|`undefined`|Callback which should return nwjs-menu-browser/MenuItem|

Example:

```js
function buildMenuItem(moduleName, controlVariable, internal) {
  function click() {
    console.log('Menu item was clicked!');
  }

  return new MenuItem({
    label: 'Click me :)',
    click,
  });
}

modV.addContextMenuHook({
  hook: 'rangeControl',
  buildMenuItem,
});
```
