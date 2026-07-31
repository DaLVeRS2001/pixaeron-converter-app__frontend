import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { MeDocument } from 'shared/api';
import type { MeQuery } from 'shared/api';

const useCompleteLogin = () => {
  const apolloClient = useApolloClient();
  const navigate = useNavigate();

  return useCallback(
    (user: MeQuery['me']) => {
      apolloClient.writeQuery({ query: MeDocument, data: { me: user } });
      navigate('/app', { replace: true });
    },
    [apolloClient, navigate]
  );
};

export { useCompleteLogin };
