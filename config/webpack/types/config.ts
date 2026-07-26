type BuildMode = 'production' | 'development';

interface IBuildPaths {
  entry: string;
  html: string;
  build: string;
  src: string;
  favicon: string;
  headers: string;
}

interface IBuildEnv {
  mode: BuildMode;
  port?: number;
  analyze?: boolean;
}

interface IBuildOptions {
  paths: IBuildPaths;
  mode: BuildMode;
  port: number;
  isDev: boolean;
  analyze: boolean;
}

export type { BuildMode, IBuildOptions, IBuildPaths, IBuildEnv };
