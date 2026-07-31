import { z } from 'zod';

import { BuildEnvironment, BuildMode } from './types/config';

const DEFAULT_PORT = 3000;
const DEFAULT_GATEWAY_API_URL = 'http://127.0.0.1:4000';

const httpUrl = z.url({ protocol: /^https?$/ });
const googleClientId = z
  .string()
  .regex(/^[0-9]+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/);
const turnstileSiteKey = z.string().regex(/^\S{20,}$/);
// prettier-ignore
const port = z.coerce.number()
  .int()
  .min(1)
  .max(65_535);

const commonEnvironment = {
  PORT: port.default(DEFAULT_PORT),
  GATEWAY_API_URL: httpUrl.default(DEFAULT_GATEWAY_API_URL),
};

const developmentEnvironmentSchema = z.object({
  ...commonEnvironment,
  GRAPHQL_API_URL: z.union([z.literal('/graphql'), httpUrl]).default('/graphql'),
  GOOGLE_CLIENT_ID: z.union([z.literal(''), googleClientId]).default(''),
  TURNSTILE_SITE_KEY: z.union([z.literal(''), turnstileSiteKey]).default(''),
});

const productionEnvironmentSchema = z.object({
  ...commonEnvironment,
  GRAPHQL_API_URL: z.url({ protocol: /^https$/ }),
  GOOGLE_CLIENT_ID: googleClientId,
  TURNSTILE_SITE_KEY: turnstileSiteKey,
});

export function readBuildEnvironment(
  mode: BuildMode,
  source: NodeJS.ProcessEnv = process.env
): BuildEnvironment {
  const schema =
    mode === 'production' ? productionEnvironmentSchema : developmentEnvironmentSchema;
  const input =
    mode === 'production'
      ? {
          GRAPHQL_API_URL: source.GRAPHQL_API_URL,
          GOOGLE_CLIENT_ID: source.GOOGLE_CLIENT_ID,
          TURNSTILE_SITE_KEY: source.TURNSTILE_SITE_KEY,
        }
      : source;
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new Error(`Invalid frontend build environment:\n${z.prettifyError(result.error)}`);
  }

  return {
    port: result.data.PORT,
    gatewayApiUrl: result.data.GATEWAY_API_URL,
    graphqlApiUrl: result.data.GRAPHQL_API_URL,
    googleClientId: result.data.GOOGLE_CLIENT_ID,
    turnstileSiteKey: result.data.TURNSTILE_SITE_KEY,
  };
}
