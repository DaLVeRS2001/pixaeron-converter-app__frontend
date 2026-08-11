import { routes } from './routeConfig';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  createBrowserRouter: jest.fn(() => ({})),
}));

describe('routeConfig', () => {
  it('keeps one-time token routes public even when another session is active', () => {
    const publicPaths = routes.flatMap((route) => (route.path ? [route.path] : []));
    const guestBoundary = routes.find((route) =>
      route.children?.some((child) => child.path === '/sign-in')
    );
    const guestPaths = guestBoundary?.children?.flatMap((route) =>
      route.path ? [route.path] : []
    );

    expect(publicPaths).toEqual(expect.arrayContaining(['/verify-email', '/reset-password']));
    expect(guestPaths).not.toEqual(
      expect.arrayContaining(['/verify-email', '/reset-password'])
    );
  });

  it('uses the application error boundary for the wildcard lazy route', () => {
    const wildcardRoute = routes.find((route) => route.path === '*');

    expect(wildcardRoute?.errorElement).toBeDefined();
  });
});
