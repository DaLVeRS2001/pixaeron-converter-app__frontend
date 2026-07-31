import { readBuildEnvironment } from './environment';

const productionEnvironment = {
  GRAPHQL_API_URL: 'https://api.pixaeron.com/graphql',
  GOOGLE_CLIENT_ID: '123456-example.apps.googleusercontent.com',
  TURNSTILE_SITE_KEY: '1x0000000000000000000000000000000AA',
};

const expectedProductionEnvironment = {
  port: 3000,
  gatewayApiUrl: 'http://127.0.0.1:4000',
  graphqlApiUrl: productionEnvironment.GRAPHQL_API_URL,
  googleClientId: productionEnvironment.GOOGLE_CLIENT_ID,
  turnstileSiteKey: productionEnvironment.TURNSTILE_SITE_KEY,
};

describe('readBuildEnvironment', () => {
  it('uses safe local defaults', () => {
    expect(readBuildEnvironment('development', {})).toEqual({
      port: 3000,
      gatewayApiUrl: 'http://127.0.0.1:4000',
      graphqlApiUrl: '/graphql',
      googleClientId: '',
      turnstileSiteKey: '',
    });
  });

  it('parses configured development values', () => {
    expect(
      readBuildEnvironment('development', {
        PORT: '3100',
        GATEWAY_API_URL: 'http://localhost:4000',
        GRAPHQL_API_URL: 'http://localhost:4000/graphql',
        GOOGLE_CLIENT_ID: productionEnvironment.GOOGLE_CLIENT_ID,
        TURNSTILE_SITE_KEY: productionEnvironment.TURNSTILE_SITE_KEY,
      })
    ).toEqual({
      port: 3100,
      gatewayApiUrl: 'http://localhost:4000',
      graphqlApiUrl: 'http://localhost:4000/graphql',
      googleClientId: productionEnvironment.GOOGLE_CLIENT_ID,
      turnstileSiteKey: productionEnvironment.TURNSTILE_SITE_KEY,
    });
  });

  it('requires the public production configuration', () => {
    expect(readBuildEnvironment('production', productionEnvironment)).toEqual(
      expectedProductionEnvironment
    );
  });

  it('ignores development-only settings in production', () => {
    expect(
      readBuildEnvironment('production', {
        ...productionEnvironment,
        PORT: '0',
        GATEWAY_API_URL: 'not-a-url',
      })
    ).toEqual(expectedProductionEnvironment);
  });

  it('reports every invalid public production value', () => {
    let message = '';

    try {
      readBuildEnvironment('production', {
        GRAPHQL_API_URL: 'http://api.pixaeron.com/graphql',
        GOOGLE_CLIENT_ID: ` ${productionEnvironment.GOOGLE_CLIENT_ID}`,
        TURNSTILE_SITE_KEY: `${productionEnvironment.TURNSTILE_SITE_KEY} `,
      });
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain('GRAPHQL_API_URL');
    expect(message).toContain('GOOGLE_CLIENT_ID');
    expect(message).toContain('TURNSTILE_SITE_KEY');
  });
});
