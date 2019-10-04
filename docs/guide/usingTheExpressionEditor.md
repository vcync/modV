---
sidebarDepth: 2
---

# Using the Expression Editor

This guide explains what the Experience Editor is and how to use it.

## What is the Expression Editor?

The Expression Editor allows you to write a math or logic expression to alter the default behavior of the Module's prop.

## How to use Expressions

modV's Expression Editor is opened on most Module Controls by right-clicking a Control and selecting **Edit Expression**.

### Math Example

A Module with a prop spanning 0-1 may be too linear. You could adjust this by writing:

```js
0.5 + sin((value * 360) * (PI / 180)) / 2
```

This expression creates a smooth sinusoidal curve between 0 and 1.

### Logic Example

You may need to constrain a value between a certain range based on a calculation.
The Expression Editor supports logcal expressions also:

```js
((0.5 - value) < 0) ? 0 : (0.5 - value)
```

This expression constrains the value between 0 and 0.5 by using a [ternary operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator).

## Scope items

Scope items are presently broken. Documentation to follow when fixed.
