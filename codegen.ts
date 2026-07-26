import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'graphql/schema.graphql',
  documents: ['src/**/*.graphql'],
  generates: {
    'src/shared/api/generated/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
  ignoreNoDocuments: false,
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
};

export default config;
