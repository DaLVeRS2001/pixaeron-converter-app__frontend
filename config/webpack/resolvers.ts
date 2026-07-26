import { ResolveOptions } from 'webpack';

import { IBuildOptions } from './types/config';

export function resolvers(options: IBuildOptions): ResolveOptions {
  const { paths } = options;
  return {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    preferAbsolute: true,
    modules: [paths.src, 'node_modules'],
    mainFiles: ['index'],
    alias: {},
  };
}
