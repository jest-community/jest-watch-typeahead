import { globalIgnores } from 'eslint/config';
import jest from 'eslint-plugin-jest';
import { importX } from 'eslint-plugin-import-x';
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  globalIgnores(['**/build/', '**/coverage/']),
  eslint.configs.recommended,
  // eslint-disable-next-line import-x/no-named-as-default-member
  tseslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...jest.environments.globals.globals,
      },
    },
    rules: {
      'no-underscore-dangle': 'off',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/__tests__/**/*',
            'src/test_utils/pluginTester.ts',
            'eslint.config.mjs',
            'babel.config.js',
          ],
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: false,
          fixStyle: 'inline-type-imports',
        },
      ],
    },
  },
);
