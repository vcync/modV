// import { Module2D } from '../Modules';

// class SolidColor extends Module2D {
//   constructor() {
//     super({
//       info: {
//         name: 'Solid Colour',
//         author: '2xAA',
//         version: 0.1,
//       },
//     });

//     this.add({
//       type: 'colorControl',
//       variable: 'color',
//       label: 'Color',
//       returnFormat: 'hexString',
//     });
//   }

//   init() {
//     this.color = '#e9967a'; // dark salmon
//   }

//   draw({ canvas, context }) {
//     context.fillStyle = this.color;
//     context.fillRect(0, 0, canvas.width, canvas.height);
//   }
// }

// export default SolidColor;
