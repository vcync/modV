module.exports = {
  presets: [
    "@vue/app",
    {
      exclude: ["transform-regenerator"]
    }
  ],
  plugins: [
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-optional-chaining"
  ]
};
