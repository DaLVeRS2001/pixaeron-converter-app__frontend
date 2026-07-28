import { Configuration as DevServerConfig } from 'webpack-dev-server';

import { IBuildOptions } from './types/config';

export function devServer(options: IBuildOptions): DevServerConfig {
  const { environment } = options;

  return {
    port: environment.port,
    open: false,
    historyApiFallback: true,
    hot: true,
    proxy: [
      {
        context: ['/graphql'],
        target: environment.authApiUrl,
        changeOrigin: false,
        pathRewrite: { '^/graphql': '/auth' },
      },
    ],
  };
}
