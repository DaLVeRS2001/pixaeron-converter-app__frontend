import { fixupPluginRules } from '@eslint/compat';
import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import pluginReact from 'eslint-plugin-react';
import eslintReactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { fsdConfig } from './eslint.fsd.config.mjs';

/** @type {import('eslint').Linter.Config[]} */

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    ignores: ['node_modules', 'build', 'src/shared/api/generated'],
  },
  {
    files: ['**/*.{ts,tsx,mjs,js}'],
  },
  {
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.jest },
    },
  },
  {
    plugins: {
      'react-hooks': fixupPluginRules(eslintReactHooks),
      '@stylistic': stylistic,
      'unused-imports': fixupPluginRules(unusedImports),
    },
  },
  {
    rules: {
      ...eslintReactHooks.configs.recommended.rules,
      'unused-imports/no-unused-imports': 2,
      '@typescript-eslint/no-unused-vars': 2,
      'react/react-in-jsx-scope': 0,
      'react/no-deprecated': 0,
      'react/prop-types': 0,
      'react/display-name': 0,
      'react/no-unescaped-entities': 0,
      '@stylistic/newline-per-chained-call': 2,
      '@stylistic/no-multiple-empty-lines': [2, { max: 1 }],
      // '@stylistic/indent': [2, 4],
      'no-useless-escape': 2,
      '@stylistic/max-len': [2, { code: 95, ignoreStrings: true, ignoreComments: true }],
    },
  },

  ...fsdConfig,
];
