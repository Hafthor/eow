module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: 'airbnb',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-param-reassign': 0,
  },
  settings: {
    react: {
      version: '999.999.999',
    },
  },
};
