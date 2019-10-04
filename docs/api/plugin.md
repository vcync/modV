---
sidebarDepth: 2
---

# Plugin

modV implements a plugin system, similar to that of Vue.js.

Example Plugins can be found [here](https://github.com/2xAA/modV/tree/2.0-drawloop/src/extra).

**@todo: allow Plugins to be different types? Custom controls *could* be registered through Plugins**

## Lifecycle

* Plugin added using `modV.use('plugin', Plugin)`
  * Plugin's `store` is registered with Vuex
  * `galleryTabComponent` is registered with Vue
  * `controlPanelComponent` is registered with Vue
  * `Plugin.install()` is called

* Plugin is disabled from Plugin Gallery
  * `Plugin.off()` is called
  * Plugin state updated (mutation: `plugins/setEnabled`)

* Plugin is enabled from Plugin Gallery
  * `Plugin.on()` is called
  * Plugin state updated (mutation: `plugins/setEnabled`)

* Plugin data saved from Plugin Gallery
  * `Plugin.pluginData.save()` is called
  * Plugin data sent to Media Manager (request: `save-plugin`)

* Plugin data loaded from switching Project
  * `Plugin.pluginData.load()` is called

## name

* Type: `string`
* Default: `undefined`

Sets the Plugin name.

## galleryTabComponent
(optional)

* Type: `Vue Component`
* Default: `undefined`

A Gallery component.

## controlPanelComponent
(optional)

* Type: `Vue Component`
* Default: `undefined`

Component to display in the Plugin Gallery.

## store
(optional)

* Type: `Vuex Store Module`
* Default: `undefined`

A Vuex store for your plugin.

## storeName
(optional)

* Type: `string`
* Default: `undefined`

The Vuex Store Module name. If not set, the Plugin name will be used instead, converted to camelCase.

## on
(optional)

* Type: `function`
* Default: `undefined`

Called when the Plugin is enabled.

## off
(optional)

* Type: `function`
* Default: `undefined`

Called when the Plugin is disabled.

## presetData
(optional)

* Type: `object`
* Default: `undefined`

Object to define load and save methods onto.

### presetData.save
(optional, required if `presetData` exists on the Plugin)

* Type: `function`
* Default: `undefined`

Method which returns data to save into a Preset when a Preset is saved.

### presetData.load
(optional, required if `presetData` exists on the Plugin)

* Type: `function`
* Default: `undefined`

Method called when relevant Plugin data is loaded from a Preset.

```js
/**
 * @param{any} data - the previously saved data
 */
load(data) {

},
```

## pluginData
(optional)

* Type: `object`
* Default: `undefined`

Object to define load and save methods onto.

### pluginData.save
(optional, required if `pluginData` exists on the Plugin)

* Type: `function`
* Default: `undefined`

Method which returns data to save into a Plugin settings file in a Project when a Plugin's settings are saved.

### pluginData.load
(optional, required if `pluginData` exists on the Plugin)

* Type: `function`
* Default: `undefined`

Method called when relevant Plugin data is loaded from a Project.

```js
/**
 * @param{any} data - the previously saved data
 */
load(data) {

},
```

## resize
(optional)

* Type: `function`
* Default: `undefined`

Method called when the largest Output Window is resized.

```js
/**
 * @param{Object} canvas - The modV output canvas
 */
resize(canvas) {

},
```

## install
(optional)

* Type: `function`
* Default: `undefined`

Method called when the Plugin is called to modV. The `install` method can be used to subscribe to Vuex store events or interact with the Vue instance. e.g.:

```js
install(Vue, store) {
  store.subscribe((mutation) => {
    if (mutation.type === 'windows/setSize') {
      console.log('mutated windows/setSize', mutation.payload);
    }
  });
},
```

## process
(optional)

* Type: `function`
* Default: `undefined`

Method called once every frame. The `process` method can be used to process data which has less or no concern with interacting with modV.

**(@todo: is this method really neccessary, can't we just use `processFrame` with an `async` function?)**

```js
/**
 * @param{DOMHighResTimeStamp} delta - rAF time returned from performance.now()
 */
process({ delta }) {

},
```

## processValue
(optional)

* Type: `function`
* Default: `undefined`

Method called every time a Control value is updated in modV. Plugins can use this method to modify Control values by returning a value.

```js
/**
 * @param{DOMHighResTimeStamp} delta  - rAF time returned from performance.now()
 * @param{any} currentValue           - the Control's current value
 * @param{string} moduleName          - the name of the Module this Control value
 *                                      update belongs to
 * @param{string} controlVariable     - the name of the variable on the Module's
 *                                      scope which is being written to
 */
processValue({ delta, currentValue, moduleName, controlVariable }) {

},
```

## processFrame
(optional)

* Type: `function`
* Default: `undefined`

Method called once every frame. Allows access of each frame drawn to the screen.

```js
/**
 * @param{HTMLCanvas} canvas - The modV output canvas
 */
processValue({ canvas }) {

},
```

## Store Reference

This reference documents the Plugin store module used within modV.

The Plugin store's structure:

```js
{
  plugins: {
    // pluginName1: {
    //   plugin: { ... },
    //   enabled: true/false,
    // },
    // pluginName2: { ... },
  },
}
```

## Getters
### plugins/allPlugins
* Returns: `array`

All Plugins registered with modV.

### plugins/enabledPlugins
* Returns: `array`

All Plugins currently enabled.

### plugins/pluginsWithGalleryTab
* Returns: `object`

All Plugins with a Gallery Component.

## Actions
### plugins.presetData()
* Returns: `object`

Generates data for Preset saving.

### plugins.save()
* Returns: `undefined`

|argument (object)|type|default|info|
|---|---|---|---|
|args.pluginName|`string`|`undefined`|The Plugin name|
|args.enabled|`boolean`|`undefined`|Whether the Plugin should be enabled or not|

### plugins.load()
* Returns: `undefined`

|argument (object)|type|default|info|
|---|---|---|---|
|args.pluginName|`string`|`undefined`|The Plugin name|
|args.data|`any`|`undefined`|The data to pass to the Plugin's `pluginData.load` function|
|args.enabled|`boolean`|`true`|Whether the Plugin should be enabled or not|

### plugins.setEnabled()
* Returns: `undefined`

|argument (object)|type|default|info|
|---|---|---|---|
|args.pluginName|`string`|`undefined`|The Plugin name|
|args.enabled|`boolean`|`undefined`|Whether the Plugin should be enabled or not|

## Mutations
::: warning
Using Mutations directly should be avoided for performance reasons. They are documented for reference only.
:::

### plugins.addPlugin()
* Returns: `undefined`

|argument (object)|type|default|info|
|---|---|---|---|
|args.plugin|`object`|`undefined`|A Plugin|

### plugins.setEnabled()
* Returns: `undefined`

|argument (object)|type|default|info|
|---|---|---|---|
|args.pluginName|`string`|`undefined`|The Plugin name|
|args.enabled|`boolean`|`undefined`|Whether the Plugin should be enabled or not|

