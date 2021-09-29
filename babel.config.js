// eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-extraneous-dependencies
const semver = require('semver');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('./package.json');

const supportedNodeVersion = semver.minVersion(pkg.engines.node).version;

module.exports = {
  ignore: ['**/__mocks__/**'],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: supportedNodeVersion },
      },
    ],
    '@babel/preset-typescript',
  ],
};
