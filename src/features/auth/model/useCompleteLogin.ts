import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { MeDocument } from 'shared/api';
import type { MeQuery } from 'shared/api';

const useCompleteLogin = () => {
  const apolloClient = useApolloClient();
  const location = useLocation();
  const navigate = useNavigate();
  const from = (
    location.state as {
      from?: { pathname?: unknown; search?: unknown; hash?: unknown };
    } | null
  )?.from;
  const pathname = from?.pathname;
  const hasSafePathname =
    typeof pathname === 'string' &&
    pathname.startsWith('/') &&
    !pathname.startsWith('//') &&
    !pathname.includes('\\');
  const search =
    typeof from?.search === 'string' && from.search.startsWith('?') ? from.search : '';
  const hash = typeof from?.hash === 'string' && from.hash.startsWith('#') ? from.hash : '';
  const postLoginPath = hasSafePathname ? pathname + search + hash : '/app';

  return useCallback(
    (user: MeQuery['me']) => {
      apolloClient.writeQuery({ query: MeDocument, data: { me: user } });
      apolloClient.cache.evict({ fieldName: 'conversionEntitlement' });
      apolloClient.cache.evict({ fieldName: 'myConversionFiles' });
      apolloClient.cache.gc();
      sessionStorage.removeItem('pendingVerificationEmail');
      navigate(postLoginPath, { replace: true });
    },
    [apolloClient, navigate, postLoginPath]
  );
};

export { useCompleteLogin };
