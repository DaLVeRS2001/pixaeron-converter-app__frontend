import { Configuration as DevServerConfig } from 'webpack-dev-server';

import { IBuildOptions } from './types/config';

export function devServer(options: IBuildOptions): DevServerConfig {
  const { port } = options;
  return {
    port,
    open: false,
    historyApiFallback: true,
    hot: true,
    proxy: [
      {
        context: ['/graphql'],
        target: process.env.AUTH_API_URL ?? 'http://127.0.0.1:3001',
        changeOrigin: false,
        pathRewrite: { '^/graphql': '/auth' },
      },
    ],
  };
}
