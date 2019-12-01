module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "@vue/prettier"],
  plugins: ["no-for-each"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-for-each/no-for-each": 2,
    "no-for-each/no-for-of": 2,
    "no-for-each/no-for-in": 2,
    "prefer-const": [
      "error",
      {
        destructuring: "any",
        ignoreReadBeforeAssign: false
      }
    ]
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};
