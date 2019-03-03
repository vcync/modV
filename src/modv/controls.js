import checkboxControl from '@/components/Controls/CheckboxControl'
import colorControl from '@/components/Controls/ColorControl'
import imageControl from '@/components/Controls/ImageControl'
import paletteControl from '@/components/Controls/PaletteControl'
import rangeControl from '@/components/Controls/RangeControl'
import selectControl from '@/components/Controls/SelectControl'
import textControl from '@/components/Controls/TextControl'
import twoDPointControl from '@/components/Controls/TwoDPointControl'

const CheckboxControl = {
  name: 'CheckboxControl',
  component: checkboxControl,
  types: ['bool']
}

const ColorControl = {
  name: 'ColorControl',
  component: colorControl,
  types: ['color', 'vec3', 'vec4']
}

const ImageControl = {
  name: 'ImageControl',
  component: imageControl,
  types: ['texture']
}

const PaletteControl = {
  name: 'PaletteControl',
  component: paletteControl
}

const RangeControl = {
  name: 'RangeControl',
  component: rangeControl,
  types: ['int', 'float']
}

const SelectControl = {
  name: 'SelectControl',
  component: selectControl,
  types: ['enum']
}

const TextControl = {
  name: 'TextControl',
  component: textControl,
  types: ['string']
}

const TwoDPointControl = {
  name: 'TwoDPointControl',
  component: twoDPointControl,
  types: ['vec2']
}

export {
  CheckboxControl,
  ColorControl,
  ImageControl,
  PaletteControl,
  RangeControl,
  SelectControl,
  TextControl,
  TwoDPointControl
}
