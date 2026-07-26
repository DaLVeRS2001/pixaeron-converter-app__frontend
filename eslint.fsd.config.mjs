const fsdModuleFiles = [
  'src/app/**/*.{ts,tsx}',
  'src/pages/**/*.{ts,tsx}',
  'src/widgets/**/*.{ts,tsx}',
  'src/features/**/*.{ts,tsx}',
  'src/entities/**/*.{ts,tsx}',
  'src/shared/**/*.{ts,tsx}',
];

const publicApiOnlyPatterns = [
  {
    group: ['pages/*/**', 'widgets/*/**', 'features/*/**', 'entities/*/**'],
    message:
      'Import from slice public API only. Example: import from "widgets/TodoList", not "widgets/TodoList/ui/TodoList".',
  },
  {
    group: ['shared/ui/*/**', 'shared/lib/*/**', 'shared/api/*/**', 'shared/config/*/**'],
    message:
      'Import from shared module public API only. Example: import from "shared/ui/Button", not "shared/ui/Button/Button".',
  },
];

const createRestrictedImportsRule = (extraPatterns = []) => [
  'error',
  {
    patterns: [...publicApiOnlyPatterns, ...extraPatterns],
  },
];

const exportStyleRules = {
  'no-restricted-syntax': [
    'error',
    {
      selector: 'ExportNamedDeclaration[declaration]',
      message: 'Do not use inline exports. Declare first, then export at the end of the file.',
    },
    {
      selector: 'ExportDefaultDeclaration',
      message: 'Do not use default exports. Use named exports at the end of the file.',
    },
    {
      selector: 'ExportAllDeclaration',
      message: 'Do not use export *. Export explicit names from public API.',
    },
  ],
};

export const fsdConfig = [
  {
    files: fsdModuleFiles,
    ignores: ['src/**/*.d.ts'],
    rules: {
      ...exportStyleRules,
      'no-restricted-imports': createRestrictedImportsRule(),
    },
  },

  {
    files: ['src/pages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': createRestrictedImportsRule([
        {
          group: ['app/**', 'pages/**'],
          message:
            'Pages cannot import app or other pages. Compose pages only from widgets, features, entities, and shared.',
        },
      ]),
    },
  },

  {
    files: ['src/widgets/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': createRestrictedImportsRule([
        {
          group: ['app/**', 'pages/**', 'widgets/**'],
          message:
            'Widgets cannot import app, pages, or other widgets. Use features, entities, and shared.',
        },
      ]),
    },
  },

  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': createRestrictedImportsRule([
        {
          group: ['app/**', 'pages/**', 'widgets/**', 'features/**'],
          message:
            'Features cannot import app, pages, widgets, or other features. Compose features higher, in widgets or pages.',
        },
      ]),
    },
  },

  {
    files: ['src/entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': createRestrictedImportsRule([
        {
          group: ['app/**', 'pages/**', 'widgets/**', 'features/**', 'entities/**'],
          message:
            'Entities cannot import upper layers or other entities. Use shared, or create an explicit public cross-import API if needed.',
        },
      ]),
    },
  },

  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': createRestrictedImportsRule([
        {
          group: ['app/**', 'pages/**', 'widgets/**', 'features/**', 'entities/**'],
          message: 'Shared cannot import app, pages, widgets, features, or entities.',
        },
      ]),
    },
  },

  // {
  //   files: ['src/**/*.{ts,tsx}'],
  //   rules: {
  //     'no-restricted-imports': createRestrictedImportsRule(),

  //     'no-restricted-syntax': [
  //       'error',

  //       {
  //         selector: 'FunctionDeclaration[params.length>2]',
  //         message:
  //           'Function has more than 2 parameters. Use one options object instead. It makes call sites readable, avoids argument order bugs, and scales better when new options are added.',
  //       },

  //       {
  //         selector: 'FunctionExpression[params.length>2]',
  //         message:
  //           'Function has more than 2 parameters. Use one options object instead. It makes call sites readable, avoids argument order bugs, and scales better when new options are added.',
  //       },

  //       {
  //         selector: 'ArrowFunctionExpression[params.length>2]',
  //         message:
  //           'Function has more than 2 parameters. Use one options object instead. It makes call sites readable, avoids argument order bugs, and scales better when new options are added.',
  //       },
  //     ],
  //   },
  // },
];
