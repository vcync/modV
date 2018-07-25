// import { ModuleShader } from '../Modules';
// import wobbleFrag from './Wobble/wobble.frag';

// class Wobble extends ModuleShader {
//   constructor() {
//     super({
//       info: {
//         name: 'Wobble',
//         author: '2xAA',
//         version: 0.1,
//         previewWithOutput: true,
//         meyda: [], // returned variables passed to the shader individually as uniforms
//         uniforms: {
//           strength: {
//             type: 'f',
//             value: 0.001,
//           },
//           size: {
//             type: 'f',
//             value: 1.0,
//           },
//         }, // Three.JS style uniforms
//       },
//       fragmentShader: wobbleFrag,
//     });

//     this.add({
//       type: 'rangeControl',
//       variable: 'strength',
//       label: 'Strength',
//       varType: 'float',
//       min: 0.0,
//       max: 0.05,
//       step: 0.001,
//       default: 0.001,
//     });

//     this.add({
//       type: 'rangeControl',
//       variable: 'size',
//       label: 'Size',
//       varType: 'float',
//       min: 1,
//       max: 50,
//       step: 1.0,
//       default: 1.0,
//     });
//   }
// }

// export default Wobble;
