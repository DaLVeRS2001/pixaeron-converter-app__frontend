import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { RuleSetRule } from 'webpack';

import { IBuildOptions } from './types/config';

const sideEffectLoaders = [
  {
    test: /\.s?css$/,
    sideEffects: true,
  },
];

export function loaders(options: IBuildOptions): RuleSetRule[] {
  const { isDev } = options;

  const babelLoader = {
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        plugins: isDev ? ['react-refresh/babel'] : [],
      },
    },
  };

  const styleLoader = {
    test: /\.s[ac]ss$/i,
    use: [
      isDev ? 'style-loader' : MiniCssExtractPlugin.loader,

      {
        loader: 'css-loader',
        options: {
          sourceMap: isDev,
        },
      },

      {
        loader: 'postcss-loader',
        options: {
          sourceMap: isDev,
        },
      },

      {
        loader: 'sass-loader',
        options: {
          sourceMap: isDev,
        },
      },
    ],
  };

  const assetLoaders = [
    {
      test: /\.(png|jpe?g|gif|webp)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'assets/images/[name].[hash:8][ext]',
      },
    },
    {
      test: /\.(woff(2)?|ttf|eot)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'assets/fonts/[name].[hash:8][ext]',
      },
    },
    {
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    },
  ];

  return [...sideEffectLoaders, babelLoader, styleLoader, ...assetLoaders];
}
