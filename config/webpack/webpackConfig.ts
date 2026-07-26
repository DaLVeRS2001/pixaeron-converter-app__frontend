import webpack from 'webpack';

import { devServer } from './devServer';
import { loaders } from './loaders';
import { optimization } from './optimization';
import { plugins } from './plugins';
import { resolvers } from './resolvers';
import { IBuildOptions } from './types/config';

export function webpackConfig(options: IBuildOptions): webpack.Configuration {
  const { mode, paths, isDev } = options;
  return {
    mode,
    entry: paths.entry,
    output: {
      path: paths.build,
      filename: '[name].[contenthash].bundle.js',
      chunkFilename: '[name].[contenthash].chunk.js',
      publicPath: '/',
      clean: true,
    },
    plugins: plugins(options),
    optimization: optimization(options),

    performance: {
      hints: isDev ? false : 'warning',
      maxAssetSize: 700 * 1024,
      maxEntrypointSize: 700 * 1024,
    },
    resolve: resolvers(options),
    module: {
      rules: loaders(options),
    },
    devtool: isDev ? 'source-map' : undefined,
    devServer: isDev ? devServer(options) : undefined,
  };
}
