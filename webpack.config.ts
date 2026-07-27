import { readBuildEnvironment } from './config/webpack/environment';
import { BuildMode, IBuildEnv, IBuildPaths } from './config/webpack/types/config';
import { webpackConfig } from './config/webpack/webpackConfig';
import dotenv from 'dotenv';
import path from 'path';
import webpack from 'webpack';

dotenv.config();

const paths: IBuildPaths = {
  build: path.resolve(__dirname, 'build'),
  entry: path.resolve(__dirname, 'src', 'index.tsx'),
  html: path.resolve(__dirname, 'public', 'index.html'),
  favicon: path.resolve(__dirname, 'public', 'favicon.webp'),
  headers: path.resolve(__dirname, 'public', '_headers'),
  src: path.resolve(__dirname, 'src'),
};

export default (env: IBuildEnv) => {
  const mode: BuildMode = env.mode || 'development';
  const environment = readBuildEnvironment(mode);
  const isDev = mode === 'development';
  const analyze = Boolean(env.analyze);

  const config: webpack.Configuration = webpackConfig({
    mode,
    paths,
    environment,
    isDev,
    analyze,
  });

  return config;
};
