import { Navigate, createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import { PageLoader } from 'shared/ui/PageLoader';

import { RequireAuth } from '../guards/RequireAuth';
import { RequireGuest } from '../guards/RequireGuest';
import { Layout } from '../ui/Layout/Layout';
import { RouteErrorBoundary } from '../ui/RouteErrorBoundary';

const routes: RouteObject[] = [
  {
    path: '/',
    hydrateFallbackElement: <PageLoader />,
    errorElement: <RouteErrorBoundary />,
    lazy: { Component: async () => (await import('pages/LandingPage')).LandingPage },
  },
  {
    path: '/privacy',
    hydrateFallbackElement: <PageLoader />,
    errorElement: <RouteErrorBoundary />,
    lazy: { Component: async () => (await import('pages/PrivacyPage')).PrivacyPage },
  },
  {
    path: '/terms',
    hydrateFallbackElement: <PageLoader />,
    errorElement: <RouteErrorBoundary />,
    lazy: { Component: async () => (await import('pages/TermsPage')).TermsPage },
  },
  {
    path: '/verify-email',
    hydrateFallbackElement: <PageLoader />,
    errorElement: <RouteErrorBoundary />,
    lazy: {
      Component: async () =>
        (await import('pages/EmailConfirmationPage')).EmailConfirmationPage,
    },
  },
  {
    path: '/reset-password',
    hydrateFallbackElement: <PageLoader />,
    errorElement: <RouteErrorBoundary />,
    lazy: {
      Component: async () => (await import('pages/ResetPasswordPage')).ResetPasswordPage,
    },
  },
  {
    element: <RequireGuest />,
    hydrateFallbackElement: <PageLoader />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/sign-in',
        lazy: { Component: async () => (await import('pages/SignInPage')).SignInPage },
      },
      {
        path: '/sign-up',
        lazy: { Component: async () => (await import('pages/SignUpPage')).SignUpPage },
      },

      {
        path: '/forgot-password',
        lazy: {
          Component: async () => (await import('pages/ForgotPasswordPage')).ForgotPasswordPage,
        },
      },

      { path: '/login', element: <Navigate to="/sign-in" replace /> },
    ],
  },
  {
    element: <RequireAuth />,
    hydrateFallbackElement: <PageLoader />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/app',
        element: <Layout />,
        children: [
          {
            index: true,
            lazy: { Component: async () => (await import('pages/MainPage')).MainPage },
          },
        ],
      },
    ],
  },
  {
    path: '*',
    hydrateFallbackElement: <PageLoader />,
    errorElement: <RouteErrorBoundary />,
    lazy: { Component: async () => (await import('pages/NotFoundPage')).NotFoundPage },
  },
];

const router = createBrowserRouter(routes);

export { router, routes };
