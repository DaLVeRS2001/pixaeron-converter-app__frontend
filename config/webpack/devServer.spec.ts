import { devServer } from './devServer';
import type { IBuildOptions } from './types/config';

describe('devServer', () => {
  it('proxies GraphQL directly to the local Gateway', () => {
    const config = devServer({
      environment: {
        port: 3000,
        gatewayApiUrl: 'http://127.0.0.1:4000',
      },
    } as IBuildOptions);

    expect(config.proxy).toEqual([
      {
        context: ['/graphql'],
        target: 'http://127.0.0.1:4000',
        changeOrigin: false,
      },
    ]);
  });
});
