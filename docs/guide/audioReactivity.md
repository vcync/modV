---
sidebarDepth: 2
---

# Audio Reactivity

This guide explains audio reactivity within modV and how to assign audio features to module props.

## Introduction

Audio reactivity in modV is provided using [Meyda](https://meyda.js.org/), an advanced audio analysis library.

In other live visual applications, you are usually presented with the raw FFT and it's mainly up to the user to isolate certain "active" frequencies to assign to parameters.

modV takes a slightly different approach to offer the user more advanced audio analysis in the form of "Features".

## What is an Audio Feature?

Often, observing and analysing an audio signal as a waveform doesn’t provide us a lot of information about its contents. An audio feature is a measurement of a particular characteristic of an audio signal, and it gives us insight into what the signal contains. Audio features can be measured by running an algorithm on an audio signal that will return a number, or a set of numbers that quantify the characteristic that the specific algorithm is intended to measure. Meyda implements a selection of standardized audio features that are used widely across a variety of music computing scenarios. (taken from the Meyda website)

[Meyda's documentation](https://meyda.js.org/audio-features) provides detailed notes on the values return from and what each audio feature does.

## How to use Audio Features

### Assigning

To assign a Feature to a Module's property, right-click a Control and hover over **Features**.
The sub-menu lists features that may be assigned to a Module property, to assign, choose a Feature from the menu.

### Adjusting

A Feature's value may be too "loud" for the property. In this case you can modify the intensity of the incoming value with the [Expression Editor](./usingTheExpressionEditor.md) like so:

```js
value / 500
```

### Removing

To remove an assigned Audio Feature, right-click the control, hover over **Features** and click **Remove Assignment**.