---
sidebarDepth: 2

---

# Writing an ISF Module

We're going to write a Module which works with the built-in `isf` Renderer.

To follow this guide, we'd recommend having some experience with:

- JavaScript (ES6+)
- GLSL
  - if you don't already have experience with GLSL then we recommend ???
- Interactive Shader Format

## What is ISF?

The **I**nteractive **S**hader **F**ormat is a GLSL format which provides helpful method, common uniforms and also includes a JSON block at the top of the file, defining inputs which can be parsed to create user editable controls.

ISF's JSON block also defines the author, description of the shader and render passes. You can learn more about the Interactive Shader Format specification on their website: [https://www.interactiveshaderformat.com/spec](https://www.interactiveshaderformat.com/spec)

## 1. Create a new file

Save a blank JavaScript file in the [Media Manager's media directory](/guide/mediaManager.html#media-folder). This will need to be placed in a `module` folder within a Project folder. e.g. `[media path]/[project]/module`.

By saving your Module here the Media Manager will compile your code and send it to modV on every file save. If you've placed your Module within a Layer already, you'll need to remove it from the Layer and drag your Module in again from the Gallery to use the updated Module.

## 2. Export an Object

Let's get started by exporting an Object. modV Modules are written out as a plain Object.

```JavaScript
export default {

};
```

## 3. Set up the Meta

Next up, we'll need to describe our Module with a meta Object block.
Let's define the Module type as `isf` and give our Module a name.

```JavaScript
export default {
  meta: {
    // this tells modV our Module should be used with the isf renderer
    type: 'isf',

    // our Module's name
    name: 'Echo Trace',
  },
};
```

## 4. Define our Shaders

In `isf` type Modules, there are two properties on the Module body to define the Shaders we want to use:

* `fragmentShader`
* `vertexShader`

The `fragmentShader` is required, but the `vertexShader` is optional. Both variables only accept Strings.

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
    /*{
      "DESCRIPTION": "Pixel with brightness levels below the threshold do not update.",
      "CREDIT": "by VIDVOX",
      "CATEGORIES": [
        "Glitch"
      ],
      "INPUTS": [
        {
          "NAME": "inputImage",
          "TYPE": "image"
        },
        {
          "NAME": "thresh",
          "LABEL": "Threshold",
          "TYPE": "float",
          "MIN": 0,
          "MAX": 1,
          "DEFAULT": 0.25
        },
        {
          "NAME": "gain",
          "LABEL": "Gain",
          "TYPE": "float",
          "MIN": 0,
          "MAX": 2,
          "DEFAULT": 1
        },
        {
          "NAME": "hardCutoff",
          "LABEL": "Hard Cutoff",
          "TYPE": "bool",
          "DEFAULT": true
        },
        {
          "NAME": "invert",
          "LABEL": "Invert",
          "TYPE": "bool",
          "DEFAULT": false
        }
      ],
      "PASSES": [
        {
          "TARGET": "bufferVariableNameA",
          "persistent": true
        },
        {}
      ]
    }*/

    void main() {
        vec4 freshPixel = IMG_PIXEL(inputImage,gl_FragCoord.xy);
        vec4 stalePixel = IMG_PIXEL(bufferVariableNameA,gl_FragCoord.xy);
        float brightLevel = (freshPixel.r + freshPixel.b + freshPixel.g) / 3.0;
        if (invert) {
		  brightLevel = 1.0 - brightLevel;
        }
        brightLevel = brightLevel * gain;
        if (hardCutoff)	{
          if (brightLevel < thresh) {
            brightLevel = 1.0;
          } else {
           brightLevel = 0.0;
          }
        }
        gl_FragColor = mix(freshPixel,stalePixel, brightLevel);
    }
  `,
};
```

## 5. Props

`isf` Modules' props are primarily auto-generated from the JSON block at the top of the file. However, if custom controls are required, props may be defined with the same uniform name as in the shader.

Please refer to section 4 of Writing A Shader Module for prop syntax. 

## 6. Putting everything together

The following code puts together everything from above:

```JavaScript
export default {
  meta: {
    type: 'isf',
    name: 'Echo Trace',
  },
  
  fragmentShader: `
    /*{
      "DESCRIPTION": "Pixel with brightness levels below the threshold do not update.",
      "CREDIT": "by VIDVOX",
      "CATEGORIES": [
        "Glitch"
      ],
      "INPUTS": [
        {
          "NAME": "inputImage",
          "TYPE": "image"
        },
        {
          "NAME": "thresh",
          "LABEL": "Threshold",
          "TYPE": "float",
          "MIN": 0,
          "MAX": 1,
          "DEFAULT": 0.25
        },
        {
          "NAME": "gain",
          "LABEL": "Gain",
          "TYPE": "float",
          "MIN": 0,
          "MAX": 2,
          "DEFAULT": 1
        },
        {
          "NAME": "hardCutoff",
          "LABEL": "Hard Cutoff",
          "TYPE": "bool",
          "DEFAULT": true
        },
        {
          "NAME": "invert",
          "LABEL": "Invert",
          "TYPE": "bool",
          "DEFAULT": false
        }
      ],
      "PASSES": [
        {
          "TARGET": "bufferVariableNameA",
          "persistent": true
        },
        {}
      ]
    }*/

    void main() {
        vec4 freshPixel = IMG_PIXEL(inputImage,gl_FragCoord.xy);
        vec4 stalePixel = IMG_PIXEL(bufferVariableNameA,gl_FragCoord.xy);
        float brightLevel = (freshPixel.r + freshPixel.b + freshPixel.g) / 3.0;
        if (invert) {
		  brightLevel = 1.0 - brightLevel;
        }
        brightLevel = brightLevel * gain;
        if (hardCutoff)	{
          if (brightLevel < thresh) {
            brightLevel = 1.0;
          } else {
           brightLevel = 0.0;
          }
        }
        gl_FragColor = mix(freshPixel,stalePixel, brightLevel);
    }
  `,
};
```

