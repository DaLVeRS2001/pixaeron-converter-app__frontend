import { RuleSetRule } from 'webpack';

import { IBuildOptions } from '../types/config';
import { buildStyleLoader } from './buildStyleLoader';

export const sideEffectLoaders = [
  {
    test: /\.(js|jsx|ts|tsx)$/,
    sideEffects: false,
  },
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
        presets: ['@babel/preset-env'],
      },
    },
  };

  const tsLoader = {
    test: /\.tsx?$/,
    use: 'ts-loader',
    exclude: /node_modules/,
  };

  const styleLoader = buildStyleLoader(isDev);

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

  return [...sideEffectLoaders, babelLoader, tsLoader, styleLoader, ...assetLoaders];
}
