import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { MeDocument } from 'shared/api';
import type { MeQuery } from 'shared/api';

const DEFAULT_POST_LOGIN_PATH = '/app';

type PostLoginLocation = {
  pathname: string;
  search: string;
  hash: string;
};

const getSafePostLoginLocation = (state: unknown): PostLoginLocation | undefined => {
  if (!state || typeof state !== 'object') return undefined;

  const from = (state as { from?: unknown }).from;
  if (!from || typeof from !== 'object') return undefined;

  const { pathname, search, hash } = from as {
    pathname?: unknown;
    search?: unknown;
    hash?: unknown;
  };
  const hasSafePathname =
    typeof pathname === 'string' &&
    pathname.startsWith('/') &&
    !pathname.startsWith('//') &&
    !pathname.includes('\\');

  if (!hasSafePathname) return undefined;

  return {
    pathname,
    search: typeof search === 'string' && search.startsWith('?') ? search : '',
    hash: typeof hash === 'string' && hash.startsWith('#') ? hash : '',
  };
};

const getPostLoginPath = (state: unknown) => {
  const location = getSafePostLoginLocation(state);

  return location
    ? location.pathname + location.search + location.hash
    : DEFAULT_POST_LOGIN_PATH;
};

const useCompleteLogin = () => {
  const apolloClient = useApolloClient();
  const location = useLocation();
  const navigate = useNavigate();
  const postLoginPath = getPostLoginPath(location.state);

  return useCallback(
    (user: MeQuery['me']) => {
      apolloClient.writeQuery({ query: MeDocument, data: { me: user } });
      sessionStorage.removeItem('pendingVerificationEmail');
      navigate(postLoginPath, { replace: true });
    },
    [apolloClient, navigate, postLoginPath]
  );
};

export { getSafePostLoginLocation, useCompleteLogin };
