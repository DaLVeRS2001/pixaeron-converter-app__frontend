import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useCurrentUser } from 'entities/user';

import { PageLoader } from 'shared/ui/PageLoader';

import { SessionUnavailable } from './SessionUnavailable';

const RequireAuth = () => {
  const location = useLocation();
  const session = useCurrentUser();

  if (session.status === 'loading') return <PageLoader />;
  if (session.status === 'unavailable') {
    return <SessionUnavailable retry={() => void session.refresh()} />;
  }
  if (session.status === 'guest') {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export { RequireAuth };
