import { Outlet, ScrollRestoration } from 'react-router-dom';

const RootLayout = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
);

export { RootLayout };
