import { useQuery } from '@apollo/client/react';
import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';

import { MeDocument, getGraphQLErrorDetails } from 'shared/api';
import type { MeQuery } from 'shared/api';

type CurrentUser = MeQuery['me'];
type CurrentUserState =
  | { status: 'loading'; user: undefined }
  | { status: 'guest'; user: undefined }
  | { status: 'unavailable'; user: undefined }
  | { status: 'authenticated'; user: CurrentUser };

type CurrentUserContextValue = CurrentUserState & { refresh: () => Promise<unknown> };
const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

const CurrentUserProvider = ({ children }: PropsWithChildren) => {
  const { data, error, loading, refetch } = useQuery(MeDocument, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });
  const refresh = () => refetch();
  let value: CurrentUserContextValue;

  if (loading) value = { status: 'loading', user: undefined, refresh };
  else if (data?.me) value = { status: 'authenticated', user: data.me, refresh };
  else if (!error || getGraphQLErrorDetails(error).code === 'UNAUTHENTICATED') {
    value = { status: 'guest', user: undefined, refresh };
  } else value = { status: 'unavailable', user: undefined, refresh };

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
};

const useCurrentUser = () => {
  const value = useContext(CurrentUserContext);
  if (!value) throw new Error('useCurrentUser must be used inside CurrentUserProvider');
  return value;
};

export { CurrentUserProvider, useCurrentUser };
export type { CurrentUser, CurrentUserState };
