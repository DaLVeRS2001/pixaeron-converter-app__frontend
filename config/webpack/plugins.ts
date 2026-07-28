import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { IBuildOptions } from './types/config';

export function plugins(options: IBuildOptions): webpack.WebpackPluginInstance[] {
  const { paths, isDev, analyze, environment } = options;

  return [
    new HTMLWebpackPlugin({
      title: 'Pixaeron',
      template: paths.html,
      favicon: paths.favicon,
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: paths.headers, to: '[name][ext]' }],
    }),
    new webpack.ProgressPlugin(),
    ...(analyze
      ? [
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-report.html',
          }),
        ]
      : []),
    ...(isDev ? [new ReactRefreshWebpackPlugin()] : []),
    ...(!isDev
      ? [
          new MiniCssExtractPlugin({
            chunkFilename: 'css/[name].[contenthash:8].css',
            filename: 'css/[name].[contenthash:8].css',
          }),
        ]
      : []),
    new webpack.DefinePlugin({
      __IS_DEV__: JSON.stringify(isDev),
      __GRAPHQL_API_URL__: JSON.stringify(environment.graphqlApiUrl),
      __TURNSTILE_SITE_KEY__: JSON.stringify(environment.turnstileSiteKey),
      __GOOGLE_CLIENT_ID__: JSON.stringify(environment.googleClientId),
    }),
  ];
}
