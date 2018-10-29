---
sidebarDepth: 2

---

# Writing a Shader Module

We're going to write a Module which works with the built-in `shader` Renderer.

To follow this guide, we'd recommend having some experience with:

- JavaScript (ES6+)
- GLSL
  - if you don't already have experience with GLSL then we recommend ???

We'll be stealing :grimacing: [a shader](https://github.com/AVGP/shaderpad/blob/gh-pages/interesting_shaders.md#spherical-with-concentric-circles-blend) from [Martin Splitt](https://twitter.com/g33konaut)'s [awesome shaderpad](https://github.com/AVGP/shaderpad) - so you won't need a bunch of GLSL experience to follow along. 

## 1. export an Object

Let's get started by exporting an Object. modV Modules are written out as a plain Object.

```JavaScript
export default {

};
```

## 2. Set up the meta

Next up, we'll need to describe our Module with a meta Object block.
Let's define the Module type as `shader` and give our Module a name.

```JavaScript
export default {
  meta: {
    // this tells modV our Module should be used with the shader renderer
    type: 'shader',

    // our Module's name
    name: 'Spherical',
  },
};
```

## 3. Define our Shaders

In `shader` type Modules, there are two properties on the Module body to define the Shaders we want to use:

* `fragmentShader`
* `vertexShader`

Both are optional and the `shader` Renderer automatically detects whether we're using `#version 300 es` or not.
Both of these variables accept Strings only.

If you have a larger shader or require syntax highlighting, you may import your shaders using:

```JavaScript
import fragmentShader from 'circles.frag';
import vertexShader from 'circles.vert';
```



We'll only be using the `fragmentShader` property in this guide:

```JavaScript
export default {
  // meta: { ... },
  
  fragmentShader: `
    precision mediump float;
    varying mediump vec2 uv;

    uniform float uA;
    uniform sampler2D u_modVCanvas;

    void main(void) {
      vec2 p = -1.0 + 2.0 * uv.xy;
      float r = sqrt(dot(p, p));

      float f = sqrt(1.0 - (r * r));
      bool toggle = mod(r, 0.1) > 0.05 ? true : false;
      if (f > 0.0 && toggle) 
        gl_FragColor = vec4(vec3(f), 1.0) * texture2D(u_modVCanvas, vec2(uv.x, uv.y));
      else 
        gl_FragColor = vec4(uv.x, uv.y, 1.0, 1.0);
    }
  `,
};
```

## 4. props and uniforms

### 4.1 uniforms

The `shader` Renderer defines the following Uniforms for you to consume within your Shader:

| name                                                         | type        | info                                                         |
| ------------------------------------------------------------ | ----------- | ------------------------------------------------------------ |
| `u_modVCanvas`, `iChannel0`, `iChannel1`, `iChannel2`, `iChannel3` | `texture2D` | The incoming frame                                           |
| `u_delta`, `iTime`, `iGlobalTime`                            | `float`     | Time in milliseconds                                         |
| `u_time`                                                     | `float`     | Time in seconds                                              |
| `iFrame`                                                     | `float`     | Frame count since modV's drawloop started                    |
| `iResolution`                                                | `vec3`      | The **width**, **height** and **pixel density** of the largest Output Window |
| `iMouse`                                                     | `vec4`      | `[0.0, 0.0, 0.0, 0.0]` **@todo make this an actual control** |

:::warning Shadertoy compatibility
The `shader` Renderer attempts to provide basic Shadertoy Uniform compatibility.  
**Currently it does not support passes/buffers or Audio shaders.**
:::

### 4.2 Defining props

With a `shader` Module, the props should match the uniforms in your shader.

Our shader above has a uniform named `uA` so we'll define the same in our props:

```JavaScript
props: {
  uA: {
    type: 'float',
    default: 1.0,
    min: 0.0,
    max: 2.0,
  },
},
```



## 5. Putting everything together

The following code puts together everything from above:

```JavaScript
export default {
  meta: {
    type: 'shader',
    name: 'Spherical',
  },
  
  props: {
    uA: {
      type: 'float',
      default: 1.0,
      min: 0.0,
      max: 2.0,
    },
  },

  fragmentShader: `
    precision mediump float;
    varying mediump vec2 uv;

    uniform float uA;
    uniform sampler2D u_modVCanvas;

    void main(void) {
      vec2 p = -1.0 + 2.0 * uv.xy;
      float r = sqrt(dot(p, p));

      float f = sqrt(1.0 - (r * r));
      bool toggle = mod(r, 0.1) > 0.05 ? true : false;
      if (f > 0.0 && toggle) 
        gl_FragColor = vec4(vec3(f), 1.0) * texture2D(u_modVCanvas, vec2(uv.x, uv.y));
      else 
        gl_FragColor = vec4(uv.x, uv.y, 1.0, 1.0);
    }
  `,
};
```

