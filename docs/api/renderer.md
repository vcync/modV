---
sidebarDepth: 2
---

# Renderer

modV's rendering capabilities can be extended with custom renderers.
Renderers define the Module types which can be used.

The default renderers in modV are
`2d`, `shader` and `isf`.

```JavaScript
modV.use('renderer', {
  name: 'isf',
  render: function() {},
  setup: function() {},
});
```

## name

* Type: `string`
* Default: `undefined`

Sets the name of the Renderer. This name is also used when defining a Module's type.

## render

* Type: `function`
* Default: `undefined`

Function that renders the Module to the given Canvas. Accepts a [RenderContext](/api/renderer.html#rendercontext) Object as the only argument.

e.g.

```JavaScript
function render(RenderContext) {
  const { canvas: { width, height }, context } = RenderContext;
  // …some render code

  context.drawImage(renderedImage, 0, 0, width, height);
}
```

### RenderContext

|key|type|info|
|---|---|---|---|
|RenderContext.Module|`object`|The current Module instance being rendered|
|RenderContext.canvas|`HTMLCanvas`|The Canvas element to draw to|
|RenderContext.context|`CanvasRenderingContext2D`|The 2D Context of `RenderContext.canvas`|
|RenderContext.pipeline|`boolean`|`true` if the current Layer in Pipline mode|
|RenderContext.video|`HTMLVideo`|Video Element playing the Webcam stream|
|RenderContext.features|`object`|Object containing key-value pairs of the requested audio features|
|RenderContext.meyda|`Meyda`|The Meyda instance, for Meyda.windowing or other Meyda utilities|
|RenderContext.delta|`DOMHighResTimeStamp`|The Deltatime returned by modV's main requestAnimationFrame loop|
|RenderContext.bpm|`number`|The current BPM|
|RenderContext.kick|`boolean`|`true` if BeatDetektor _heard_ a kick, `false` otherwise|

## setup
* Type: `function`
* Default: `undefined`

Function which sets up a Module when initialising a new instance. Accepts a Module Object as the only argument.

e.g.

```JavaScript
function setup(Module) {
  const fragmentShader = Module.fragmentShader;
  const vertexShader = Module.vertexShader;

  // …build a WebGL program and append it to a store or the Module
  // (or other setup code, depending on your renderer's needs)

  return Module;
}
```
