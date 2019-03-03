// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'prettier-standard/lib/base',
    'plugin:vue/recommended',
    'prettier',
    'prettier/standard',
    'prettier/vue'
  ],
  plugins: ['vue', 'prettier'],
  'settings': {
    'import/resolver': {
      'webpack': {
        'config': 'build/webpack.base.conf.js'
      }
    }
  },
  rules: {
    'prettier/prettier': 'error',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'max-len': [2, {code: 100, tabWidth: 2, ignoreUrls: true}]
  }
};
