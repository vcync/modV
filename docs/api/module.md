---
sidebarDepth: 2
---

# Module

modV defines its own module structure.

There are currently three types of module: `2d`, `shader` and `isf`.

## Lifecycle

* Module registered using `modV.register()`
  * Gallery item for the registered Module is created
* Gallery Item is dragged from the Gallery to a Layer
  * An active Module is created (mutation: `modVModules/createActiveModule`)
* Active Module is dragged from a Layer back to the Gallery
  * Active Module is removed (mutation: `modVModules/removeActiveModule`)

## meta

* Applies to: `2d`, `shader`, `isf`

Describes the Module.

### meta.type

* Type: `string`
* Default: `undefined`

Describes the Module type.<br>
Valid types are `2d | shader |isf`.

### meta.name

* Type: `string`
* Default: `undefined`

Sets the Module name.

### meta.author

* Type: `string`
* Default: `undefined`

Sets the Module author.

::: warning
`isf` type Modules will ignore this value if defined in the ISF JSON block
:::

### meta.version

* Type: `string`
* Default: `undefined`

Sets the Module version.

::: tip
Module versions are saved into Preset data. modV will check and warn the user of differing Module versions when loading Preset data
:::

### meta.previewWithOutput
(optional)

* Type: `boolean`
* Default: `undefined`

If `true` the gallery preview will pass the current output of modV into the Module's `draw` Function.

### meta.audioFeatures
(optional)

* Type: `array`
* Default: `undefined`

Audio features to be returned from Meyda. Please see [Meyda's Wiki for a list of available audio features](https://github.com/meyda/meyda/wiki/audio-features) and their descriptions.

### Example meta block

```js
export default {
  meta: {
    type: '', // 2d, shader, isf
    name: 'Sample module',
    author: 'Author name',
    version: '0.0.1',
    previewWithOutput: true, // optional
    audioFeatures: ['energy'], // optional
  },
};
```

## props

* Applies to: `2d`, `shader`, `isf`

The props Object describes the Controls modV will render for the Module.

The `isf` Module type automatically generates Controls for its uniforms, however they can be overridden with definitions on the props Object.

### props[varname]

* Type: `object`
* Default: `undefined`

The variable on the Module's scope to write to, e.g.
```js
export default {
  // meta: ...

  props: {
    varname: {

    },
  },
};
```

::: tip Quirk
For Module types `shader` and `isf`, the `varname` maps directly to the uniform name.
:::

### props[varname].type

* Type: `string`
* Default: `undefined`

Describes the variable type.<br>
Valid types are `int | float | bool | color | vec2 | vec3 | vec4`.

* `int | float` will generate a Range Control
* `bool` will generate a Checkbox Control
* `color` will generate a Color Control
* `vec2 | vec3 | vec4` ???

The default control generation can be overridden by setting the `props[varname].control` property.

### props[varname].label
(optional)

* Type: `string`
* Default: `undefined`

The Control's label. If not set, the prop's `varname` will be used.

### props[varname].default
(optional)

* Type: `any`
* Default: `undefined`

Default value for the Control and variable on the Module's scope.

### props[varname].random

(optional)

* Type: `boolean`
* Default: `undefined`

If set and `default` is an Array, a random value from the Array will be used on the Module's creation.

### props[varname].min

(optional)

* Type: `number`
* Default: `undefined`
* Applies to types: `int | float | vec2 | vec3 | vec4`

Sets the Control's minimum value.

### props[varname].max
(optional)

* Type: `number`
* Default: `undefined`
* Applies to types: `int | float | vec2 | vec3 | vec4`

Sets the Control's maximum value.

### props[varname].strict
(optional)

* Type: `boolean`
* Default: `undefined`
* Applies to types: `int | float | vec2 | vec3 | vec4`

Constrains the Control between the `min` and `max` values if set.

### props[varname].abs
(optional)

* Type: `boolean`
* Default: `undefined`
* Applies to types: `int | float | vec2 | vec3 | vec4`

Applies `Math.abs` to the value(s) to keep the value positive.

### Example props block

```js
export default {
  // meta: ...

  props: {
    energyIntensity: {
      label: 'Energy Intensity',
      type: 'float',
      min: 0,
      max: 5,
      default: 1,
      strict: true,
    },
  },
};
```

## Grouped props

To create grouped props, use the `group` type.

### props[value].props

* Type: `object`
* Default: `undefined`
* Applies to types: `group`

### props[value].default

* Type: `number`
* Default: `undefined`
* Applies to types: `group`

### Example grouped props block

```js
export default {
  // meta: ...

  props: {
    ball: {
      type: 'group',
      default: 10,
      props: {
        size: {
          type: 'float',
          default: 4,
        },
        color: {
          type: 'color',
          default: 'pink',
        },
      },
    },
  },
};
```

## Defining a specific control

It is possible to override an inbuilt control for a Module prop. To do this, add the `control` key onto the prop definition.

### props[varname].control
(optional)

* Type: `object`
* Default: `undefined`

Sets a custom control type for the prop.

### props[varname].control.type

* Type: `string`
* Default: `undefined`

The name of the Control's component.
Built-in types are: `paletteControl`.

### props[varname].control.options

* Type: `object`
* Default: `undefined`

Options passed to the Control.<br>
Refer to the Control's documentation for a list of properties.

## data

* Applies to: `2d`

The data Object defines default values on the Module's scope.

Essentially it's shorthand instead using the `init` Function, i.e.

```js
export default {
  // meta: ...
  // props: ...

  data: {
    hue: 0,
  },

  init() {
    this.hue = 0; // this is the same thing, just a little more markup
  },
};
```


## init

* Applies to: `2d`

Init is called when the Module is registered with modV.

This can be used to set up the Module. An example of this can be found in [Ball.js](https://github.com/2xAA/modV/blob/2.0-drawloop/src/modv/sample-modules/Ball-2.0.js#L96).

```js
export default {
  // meta: ...
  // props: ...
  // data: ...

  init({ canvas }) {
    this.internalCanvas.width = canvas.width;
    this.internalCanvas.height = canvas.height;
  },
};
```

## resize

* Applies to: `2d`

Resize is called when the largest Output Window is resized.

```js
export default {
  // meta: ...
  // props: ...
  // data: ...
  // init() { ... }

  resize({ canvas }) {
    this.internalCanvas.width = canvas.width;
    this.internalCanvas.height = canvas.height;
  },
};
```

## draw

* Applies to: `2d`

```js
export default {
  // meta: ...
  // props: ...
  // data: ...
  // init() { ... }
  // resize() { ... }

  draw({
    canvas, // the current canvas
    context, // the current context
    video, // HTMLVideoElement displaying a webcam feed
    features, // object containing features requested from meta.audioFeatures
    meyda, // the Meyda instance
    delta, // the rAF deltatime
    bpm, // the current BPM
    kick, // boolean bass drum/kick detection
  }) {
    /* some draw code... */
  },
};
```

## Store Reference

This reference documents the Module store module used within modV.

The Module store's structure:

```js
{
  registry: {},
  active: {},
  activePropQueue: {},
  activeMetaQueue: {},
  focusedModule: null,
  currentDragged: null,
}
```

## Getters
### modvModules/focusedModule
* Returns: `object`

The current focused Module in the Layer view.

### modvModules/focusedModuleName
* Returns: `string`

The name of the current focused Module in the Layer view.

### modvModules/registry
* Returns: `object`

All Modules registered with modV.

### modvModules/active
* Returns: `object`

All Modules currently active within with modV. (i.e. being used in a layer or in the Gallery)

::: tip Quirk (outer store)
Vuex cannot handle complex data structs such as HTMLCanvas or classes. The *"outer store"* contains synchronised information about the Module, yet can handle these complex datum without being a drain on performance or even crashing the browser entirely.

Essentially with the Module store, the `active` and `registry` objects are simplified ghosts to the real `outer` store.
:::

::: warning
You should never attempt to modify data on the outer or inner stores directly as this can break the syncronisation. Use the `updateProp` and `updateMeta` actions defined on the Module store.
:::

### modvModules/outerRegistry
* Returns: `object`

All Modules registered with modV.

### modvModules/outerActive
* Returns: `object`

All Modules currently active within with modV. (i.e. being used in a layer or in the Gallery)

## Actions
### modvModules.register()
* Returns: `undefined`

Register a module with modV.

|argument|type|default|info|
|---|---|---|---|
|data|`object`|`undefined`|The Module to register|

### modvModules.createActiveModule()
* Returns: `object` - the active module from `outerActive`

|argument (object)|type|default|info|
|---|---|---|---|
|args.moduleName|`string`|`undefined`|The Module name|
|args.appendToName|`string`|`undefined`|A string to append to the Module name|
|args.skipInit|`boolean`|`undefined`|Whether the Module should skip the call to `init` and `resize`|
|args.enabled|`boolean`|`undefined`|Whether the Module should be enabled or not|

### modvModules.removeActiveModule()
* Returns: `undefined`

|argument (object)|type|default|info|
|---|---|---|---|
|args.moduleName|`string`|`undefined`|The Module name|

### modvModules.resizeActive()
* Returns: `undefined`

Calls the resize function of all active modules.

### modvModules.updateProp()
* Returns: `undefined`

Queues a prop update for a Module.

|argument (object)|type|default|info|
|---|---|---|---|
|args.name|`string`|`undefined`|The Module name|
|args.prop|`string`|`undefined`|The prop key|
|args.data|`any`|`undefined`|The data to write to the prop|

### modVModules.syncPropQueue()
* Returns: `undefined`

Syncs props waiting in the queue. Called once a frame.

::: warning
modV automatically calls this action once a frame. It is unnecessary for this to be called manually.
:::

### modvModules.updateMeta()
* Returns: `undefined`

Queues a value update for a Module's meta block.

|argument (object)|type|default|info|
|---|---|---|---|
|args.name|`string`|`undefined`|The Module name|
|args.metaKey|`string`|`undefined`|The meta key|
|args.data|`any`|`undefined`|The data to write to the meta key|

### modVModules.syncMetaQueue()
* Returns: `undefined`

Syncs meta waiting in the queue. Called once a frame.

::: warning
modV automatically calls this action once a frame. It is unnecessary for this to be called manually.
:::

### modVModules.syncQueues()
* Returns: `undefined`

Syncs all queues.

::: warning
modV automatically calls this action once a frame. It is unnecessary for this to be called manually.
:::

### modVModules.presetData()
* Returns: `object`

Generates data for Preset saving.


## Mutations
::: warning
Using Mutations directly should be avoided for performance reasons. They are documented for reference only.
:::

**@todo: Document mutations**
