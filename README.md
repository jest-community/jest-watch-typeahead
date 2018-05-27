[![Build Status](https://travis-ci.org/rogeliog/jest-plugin-filename.svg?branch=master)](https://travis-ci.org/rogeliog/jest-plugin-filename) [![npm version](https://badge.fury.io/js/jest-plugin-filename.svg)](https://badge.fury.io/js/jest-runner-eslint)

<div align="center">
  <!-- replace with accurate logo e.g from https://worldvectorlogo.com/ -->
  <a href="https://facebook.github.io/jest/">
    <img width="150" height="150" vspace="" hspace="25" src="https://cdn.worldvectorlogo.com/logos/jest.svg">
  </a>
  <h1>jest-plugin-filename</h1>
  <p>Filter your tests by filename</p>
</div>

![watch](https://user-images.githubusercontent.com/574806/40588608-daf320f4-6194-11e8-99c4-dd1f63903208.gif)

## Usage

### Install

Install `jest`_(it needs Jest 23+)_ and `jest-plugin-filename`

```bash
yarn add --dev jest jest-plugin-filename

# or with NPM

npm install --save-dev jest jest-plugin-filename
```

### Add it to your Jest config

In your `package.json`

```json
{
  "jest": {
    "watchPlugins": ["jest-plugin-filename"]
  }
}
```

Or in `jest.config.js`

```js
module.exports = {
  watchPlugins: ['jest-plugin-filename'],
};
```

### Run Jest

```bash
yarn jest
```
