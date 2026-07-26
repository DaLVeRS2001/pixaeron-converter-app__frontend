import webpack from 'webpack';

import { IBuildOptions } from './types/config';

export function optimization(options: IBuildOptions): webpack.Configuration['optimization'] {
  const { isDev } = options;

  if (isDev) return undefined;

  return {
    runtimeChunk: 'single',

    splitChunks: {
      chunks: 'all',

      cacheGroups: {
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          name: 'react-vendor',
          chunks: 'all',
          priority: 30,
          enforce: true,
        },

        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
  };
}
