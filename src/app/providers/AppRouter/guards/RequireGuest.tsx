import { Navigate, Outlet } from 'react-router-dom';

import { useCurrentUser } from 'entities/user';

import { PageLoader } from 'shared/ui/PageLoader';

import { SessionUnavailable } from './SessionUnavailable';

const RequireGuest = () => {
  const session = useCurrentUser();

  if (session.status === 'loading') return <PageLoader />;
  if (session.status === 'unavailable') {
    return <SessionUnavailable retry={() => void session.refresh()} />;
  }
  if (session.status === 'authenticated') return <Navigate to="/app" replace />;

  return <Outlet />;
};

export { RequireGuest };
