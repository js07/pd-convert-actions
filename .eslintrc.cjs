module.exports = {
  "env": {
    "jest": true,
    "node": true,
    "commonjs": true,
    "es6": true,
    "es2022": true
  },
  "extends": "eslint:recommended",
  "parser": "@babel/eslint-parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "requireConfigFile": false,
    "babelOptions": {
      "plugins": [ "@babel/plugin-syntax-import-assertions" ]
    }
  },
  "ignorePatterns": [
    "test/data/**",
    "test/output/**",
    "examples/**",
  ],
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "double"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-unused-vars": ["off", ],
    "array-bracket-newline": [
      "error",
      { "multiline": true }
    ],
    "array-element-newline": [
      "error",
      "consistent"
    ],
    "space-before-blocks": [
      "error",
      "always"
    ],
    "object-curly-spacing": [
      "error",
      "always"
    ],
    "object-curly-newline": [
      "error",
      {
        "multiline": true,
        "consistent": true
      }
    ],
    "object-property-newline": [
      "error",
      {
        "allowAllPropertiesOnSameLine": true
      }
    ],
    "key-spacing": "error",
    "keyword-spacing": "error",
    "comma-spacing": "error",
    "max-len": [
      "error",
      {
        "code": 100,
        "tabWidth": 2,
        "ignoreTrailingComments": true,
        "ignoreUrls": true,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true,
        "ignoreRegExpLiterals": true
      }
    ],
  }
};
