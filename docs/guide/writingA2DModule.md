---
sidebarDepth: 2
---

# Writing a 2D Module

We're going to write a Module which works with the built-in `2d` Renderer.

To follow this guide, we'd recommend having some experience with:
* JavaScript (ES6+)
* Canvas2D
  * if you don't already have experience with Canvas2D then we recommend the MDN Docs as a reference: [https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D)

## 1. Export an Object

Let's get started by exporting an Object. modV Modules are written out as a plain Object.

```JavaScript
export default {

};
```

## 2. Set up the Meta

Next up, we'll need to describe our Module with a meta Object block.
Let's define the Module type as `2d` and give our Module a name.

```JavaScript
export default {
  meta: {
    // this tells modV our Module should be used with the 2d renderer
    type: '2d',

    // our Module's name
    name: 'Circle',
  },
};
```

## 3. Draw

The draw function is where we put our Canvas2D code in `2d` Modules.

The code below will draw a filled red circle in the middle of the screen.

```JavaScript
export default {
  // meta: { ... },

  // using destructuring we can get the width and height of the canvas
  draw({ canvas: { width, height }, context }) {
    const size = 20;
    const color = 'red';

    context.fillStyle = color;
    context.beginPath();
    context.arc(
      // x, y, radius, startAngle, endAngle
      (width / 2) - (size / 2),
      (height / 2) - (size / 2),
      size,
      0,
      Math.PI * 2,
    );
    context.fill();
  },
};
```

## 4. Props

So, a red circle is pretty cool, but how is this audio reactive?
Well we should define some properties (props for short) so that some Controls are generated, then we can interact with our Module.

We've got two variables defined at the moment, `size` and `color`. Let's take these out of the draw function and create some props.

### 4.1 size

`size` is an integer and we've set it to `20`. Let's reflect that in our prop definition and also give it some minimum and maximum boundaries.

We'll also use `abs: true` which will keep the value a positive integer. Canvas2D doesn't allow negative radii for `.arc()`.

```JavaScript
props: {
  size: {
    type: 'int',
    default: 20,
    min: 0,
    max: 100,
    abs: true,
  },
},
```

### 4.2 color

`color` is a string at the moment, but we can use a special Control type named `color` to specify this variable will receive a color string. Let's also set the default to `red`.

```JavaScript
props: {
  // size: { ... },
  color: {
    type: 'color',
    default: 'red',
  },
},
```

### 4.3 slight edit to `draw()`

Now we have our props defined, we'll need to edit our draw function.

Props are written to the Module's scope, so you can access any prop with `this[prop]`.

In our case it'll be `this.size` and `this.color`.

```JavaScript
export default {
  // meta: { ... },
  // props: { ... },

  draw({ canvas: { width, height }, context }) {
    // we can access our props through destructuring
    const { color, size } = this;

    context.fillStyle = color;
    context.beginPath();
    context.arc(
      (width / 2) - (size / 2),
      (height / 2) - (size / 2),
      size,
      0,
      Math.PI * 2,
    );
    context.fill();
  },
};
```

## 5. Putting everything together

The following code puts together everything from above:

```JavaScript
export default {
  meta: {
    type: '2d',
    name: 'Circle',
  },

  props: {
    size: {
      type: 'int',
      default: 20,
      min: 0,
      max: 100,
      abs: true,
    },

    color: {
      type: 'color',
      default: 'red',
    },
  },

  draw({ canvas: { width, height }, context }) {
    const { color, size } = this;

    context.fillStyle = color;
    context.beginPath();
    context.arc(
      (width / 2) - (size / 2),
      (height / 2) - (size / 2),
      size,
      0,
      Math.PI * 2,
    );
    context.fill();
  },
};
```

:::tip Adding audio reactivity
Right clicking on your Module's `size` control will allow you to attach audio "features" to the size of the circle, making your Module audio reactive.
:::

So now we have a pretty bare-bones 2d Module, but hopefully that's enough to get you started.
