---
sidebarDepth: 2
---

# Control

modV can be extended with custom Controls which represent Module props.

```JavaScript
modV.use('control', {
  name: 'CheckboxControl',
  component: checkboxControl,
  types: ['bool'],
});
```

## name

* Type: `string`
* Default: `undefined`

Sets the name of the Control.

## component

* Type: `object`
* Default: `undefined`

A Vue.js component used to render the control.

### component.group

* Type: `int`
* Default: `undefined`

The Group number if this prop is part of a group.

### component.groupName

* Type: `string`
* Default: `undefined`

The Group name if this prop is part of a group.

### component.moduleName

* Type: `string`
* Default: `undefined`

The name of the Module this prop belongs to.

### component.inputId

* Type: `string`
* Default: `undefined`

A unique ID comprised of the Module name and Module prop.

### component.value

* Type: `any`
* Default: `undefined`

A readable and writable variable which represents the current value of this prop.

### component.variable

* Type: `any`
* Default: `undefined`

The name of the prop.

### component.label

* Type: `string`
* Default: `undefined`

The prop's label, if set.

### component.defaultValue

* Type: `any`
* Default: `undefined`

The prop's default value, if set.

## types

* Type: `array`
* Default: `undefined`

An Array of types this Control outputs.

A list of types can be found on the [Module props doc page](/api/module.html#props-varname-type).
