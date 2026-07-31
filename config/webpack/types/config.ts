type BuildMode = 'production' | 'development';

interface IBuildPaths {
  entry: string;
  html: string;
  build: string;
  src: string;
  favicon: string;
  headers: string;
}

interface BuildEnvironment {
  port: number;
  gatewayApiUrl: string;
  graphqlApiUrl: string;
  googleClientId: string;
  turnstileSiteKey: string;
}

interface IBuildEnv {
  mode: BuildMode;
  analyze?: boolean;
}

interface IBuildOptions {
  paths: IBuildPaths;
  mode: BuildMode;
  environment: BuildEnvironment;
  isDev: boolean;
  analyze: boolean;
}

export type { BuildEnvironment, BuildMode, IBuildOptions, IBuildPaths, IBuildEnv };
