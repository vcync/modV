---
sidebarDepth: 2
---

# Writing a 2D Module

We're going to write a Module which works with the built-in `2d` Renderer.

To follow this guide, we'd recommend having some experience with:
* JavaScript (ES6+)
* Canvas2D
  * if you don't already have experience with Canvas2D then we recommend the MDN Docs as a reference: [https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D)

## 1. Create a new file

Save a blank JavaScript file in the [Media Manager's media directory](/guide/mediaManager.html#media-folder). Place your file in a `module` folder within a Project folder. e.g. `[media path]/[project]/module`.

By saving your Module here the Media Manager will compile your code and send it to modV on every file save. If your Module is within a Layer already, you'll need to remove it from said Layer and drag your Module in again from the Gallery to use the updated Module.

## 2. Export an Object

Let's get started by exporting an Object.

```JavaScript
export default {

};
```

## 3. Set up the Meta

Next up, we'll need to describe our Module with a meta Object block.
Let's define the Module type as `2d` and give our Module a name.

```JavaScript
export default {
  meta: {
    // this tells modV our Module should use the 2d renderer
    type: '2d',

    // our Module's name
    name: 'Circle',
  },
};
```

## 4. Draw

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

## 5. Props

So, a red circle is pretty cool, but how is this audio reactive?
Well, we should define some props (properties) to generate some Controls.

We've got two variables defined at the moment, `size` and `color`. Let's take these out of the draw function and create some props.

### 5.1 size

`size` is an integer and we've set it to `20`. Let's reflect that in our prop definition. We'll also give it some minimum and maximum boundaries.

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

### 5.2 color

`color` is a string at the moment, but we can use a specific Control type named `color` to specify this variable will receive a color string. Let's also set the default to `red`.

```JavaScript
props: {
  // size: { ... },
  color: {
    type: 'color',
    default: 'red',
  },
},
```

### 5.3 slight edit to `draw()`

Now we have our props defined, we'll need to edit our draw function.

Props get written to the Module's scope, so you can access any prop with `this[prop]`.

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

## 6. Putting everything together

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
Right click on your Module's `size` control - through the menu, you can attach audio "features" to the size of the circle. This makes any Module audio reactive without baking in features.
:::

So now we have a pretty bare-bones 2d Module, but that's enough to get you started.
