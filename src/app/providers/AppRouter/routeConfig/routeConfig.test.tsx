import { routes } from './routeConfig';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  createBrowserRouter: jest.fn(() => ({})),
}));

describe('routeConfig', () => {
  const [rootRoute] = routes;
  const topLevelRoutes = rootRoute.children ?? [];

  it('keeps one-time token routes public even when another session is active', () => {
    const publicPaths = topLevelRoutes.flatMap((route) => (route.path ? [route.path] : []));
    const guestBoundary = topLevelRoutes.find((route) =>
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

  it('covers every route, including the wildcard, with one root error boundary', () => {
    expect(rootRoute.path).toBeUndefined();
    expect(rootRoute.errorElement).toBeDefined();
    expect(rootRoute.hydrateFallbackElement).toBeDefined();
    expect(topLevelRoutes.some((route) => route.path === '*')).toBe(true);
  });
});
