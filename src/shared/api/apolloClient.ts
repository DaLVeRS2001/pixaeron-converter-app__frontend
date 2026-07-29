import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import { ErrorLink } from '@apollo/client/link/error';
import { Observable } from 'rxjs';

import { RefreshSessionDocument } from './generated/graphql';

let refreshPromise: Promise<void> | undefined;
let cacheResetPromise: Promise<void> | undefined;

const isUnauthenticated = (error: unknown) =>
  CombinedGraphQLErrors.is(error)
    ? error.errors.some(({ extensions }) => extensions?.code === 'UNAUTHENTICATED')
    : ServerError.is(error) && error.statusCode === 401;

const resetAuthCache = (client: ApolloClient): Promise<void> => {
  if (!cacheResetPromise) {
    cacheResetPromise = client.cache
      .reset({ discardWatches: false })
      .catch(() => undefined)
      .finally(() => {
        cacheResetPromise = undefined;
      });
  }

  return cacheResetPromise;
};

const refreshSession = (client: ApolloClient): Promise<void> => {
  if (!refreshPromise) {
    refreshPromise = client
      .mutate({
        mutation: RefreshSessionDocument,
        fetchPolicy: 'no-cache',
        errorPolicy: 'none',
      })
      .then(() => undefined)
      .catch(async (error: unknown) => {
        if (isUnauthenticated(error)) {
          await resetAuthCache(client);
        }
        throw error;
      })
      .finally(() => {
        refreshPromise = undefined;
      });
  }

  return refreshPromise;
};

const authErrorLink = new ErrorLink(({ error, operation, forward }) => {
  const retryableGraphQLError =
    (operation.operationType === 'query' || operation.operationType === 'mutation') &&
    CombinedGraphQLErrors.is(error) &&
    isUnauthenticated(error);
  const retryableNetworkError =
    operation.operationType === 'query' && ServerError.is(error) && isUnauthenticated(error);

  if (
    operation.operationName === 'RefreshSession' ||
    (!retryableGraphQLError && !retryableNetworkError)
  )
    return;

  return new Observable((observer) => {
    let active = true;
    let retrySubscription: { unsubscribe: () => void } | undefined;

    void refreshSession(operation.client)
      .then(() => {
        if (!active) return;

        const subscription = forward(operation).subscribe({
          next: (result) => {
            if (
              result.errors?.some(({ extensions }) => extensions?.code === 'UNAUTHENTICATED')
            )
              void resetAuthCache(operation.client);
            observer.next(result);
          },
          error: (retryError: unknown) => {
            if (isUnauthenticated(retryError)) void resetAuthCache(operation.client);
            observer.error(retryError);
          },
          complete: () => observer.complete(),
        });
        retrySubscription = subscription;
        if (!active) subscription.unsubscribe();
      })
      .catch((refreshError: unknown) => {
        if (active) observer.error(refreshError);
      });

    return () => {
      active = false;
      retrySubscription?.unsubscribe();
    };
  });
});

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    authErrorLink,
    new HttpLink({
      uri: __GRAPHQL_API_URL__,
      credentials: 'include',
    }),
  ]),
});

export { apolloClient, authErrorLink };
