module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:prettier/recommended',
    'prettier/flowtype',
    'prettier/standard',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [],
  rules: {
    'linebreak-style': 0,
    'prettier/prettier': ['error', { singleQuote: true, parser: 'flow' }],
    'no-console': 'off',
  },
};
