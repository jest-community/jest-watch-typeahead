import { readFileSync } from 'fs';
import semver from 'semver';

let pkg = readFileSync('./package.json', 'utf8');

pkg = JSON.parse(pkg);

const supportedNodeVersion = semver.minVersion(pkg.engines.node).version;

export default {
  ignore: ['**/__mocks__/**'],
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: { node: supportedNodeVersion },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins:
    process.env.NODE_ENV === 'test'
      ? []
      : ['babel-plugin-add-import-extension'],
};
