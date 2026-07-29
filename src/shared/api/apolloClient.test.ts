import { ApolloClient, ApolloLink, InMemoryCache, gql } from '@apollo/client';
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import { Observable } from 'rxjs';

import { authErrorLink } from './apolloClient';

const viewerQuery = gql`
  query Viewer {
    viewer
  }
`;
const updateViewerMutation = gql`
  mutation UpdateViewer {
    updateViewer
  }
`;
const unauthorizedResult = {
  data: null,
  errors: [
    {
      message: 'Unauthorized',
      extensions: { code: 'UNAUTHENTICATED' },
    },
  ],
};
const invalidCredentialsResult = {
  data: null,
  errors: [
    {
      message: 'Invalid email or password',
      extensions: { code: 'INVALID_CREDENTIALS' },
    },
  ],
};
const clients: ApolloClient[] = [];

const createClient = (transport: ApolloLink) => {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: authErrorLink.concat(transport),
    queryDeduplication: false,
  });
  clients.push(client);
  return client;
};

afterEach(() => {
  clients.splice(0).forEach((client) => client.stop());
});

describe('Apollo session refresh', () => {
  it('uses one refresh request for concurrent failed queries and retries both', async () => {
    let queryAttempts = 0;
    let refreshAttempts = 0;
    let completeRefresh: (() => void) | undefined;
    const transport = new ApolloLink(
      (operation) =>
        new Observable<ApolloLink.Result>((observer) => {
          if (operation.operationName === 'RefreshSession') {
            refreshAttempts += 1;
            completeRefresh = () => {
              observer.next({ data: { refreshSession: true } });
              observer.complete();
            };
            return;
          }

          queryAttempts += 1;
          observer.next(
            queryAttempts <= 2 ? unauthorizedResult : { data: { viewer: 'ready' } }
          );
          observer.complete();
        })
    );
    const client = createClient(transport);

    const first = client.query<{ viewer: string }>({
      query: viewerQuery,
      fetchPolicy: 'no-cache',
    });
    const second = client.query<{ viewer: string }>({
      query: viewerQuery,
      fetchPolicy: 'no-cache',
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(refreshAttempts).toBe(1);
    completeRefresh?.();

    await expect(Promise.all([first, second])).resolves.toEqual([
      expect.objectContaining({ data: { viewer: 'ready' } }),
      expect.objectContaining({ data: { viewer: 'ready' } }),
    ]);
    expect(queryAttempts).toBe(4);
  });

  it('refreshes once and retries a protected mutation', async () => {
    let mutationAttempts = 0;
    let refreshAttempts = 0;
    const transport = new ApolloLink(
      (operation) =>
        new Observable<ApolloLink.Result>((observer) => {
          if (operation.operationName === 'RefreshSession') {
            refreshAttempts += 1;
            observer.next({ data: { refreshSession: true } });
          } else {
            mutationAttempts += 1;
            observer.next(
              mutationAttempts === 1 ? unauthorizedResult : { data: { updateViewer: true } }
            );
          }
          observer.complete();
        })
    );
    const client = createClient(transport);

    await expect(client.mutate({ mutation: updateViewerMutation })).resolves.toMatchObject({
      data: { updateViewer: true },
    });
    expect(refreshAttempts).toBe(1);
    expect(mutationAttempts).toBe(2);
  });

  it('refreshes and retries a query after an HTTP 401', async () => {
    let queryAttempts = 0;
    let refreshAttempts = 0;
    const transport = new ApolloLink(
      (operation) =>
        new Observable<ApolloLink.Result>((observer) => {
          if (operation.operationName === 'RefreshSession') {
            refreshAttempts += 1;
            observer.next({ data: { refreshSession: true } });
            observer.complete();
            return;
          }

          queryAttempts += 1;
          if (queryAttempts === 1) {
            observer.error(
              new ServerError('Unauthorized', {
                response: { status: 401 } as Response,
                bodyText: '',
              })
            );
            return;
          }

          observer.next({ data: { viewer: 'ready' } });
          observer.complete();
        })
    );
    const client = createClient(transport);

    await expect(
      client.query<{ viewer: string }>({ query: viewerQuery, fetchPolicy: 'no-cache' })
    ).resolves.toMatchObject({ data: { viewer: 'ready' } });
    expect(refreshAttempts).toBe(1);
    expect(queryAttempts).toBe(2);
  });

  it('does not retry a mutation after an HTTP 401', async () => {
    let mutationAttempts = 0;
    let refreshAttempts = 0;
    const transport = new ApolloLink(
      (operation) =>
        new Observable<ApolloLink.Result>((observer) => {
          if (operation.operationName === 'RefreshSession') refreshAttempts += 1;
          mutationAttempts += 1;
          observer.error(
            new ServerError('Unauthorized', {
              response: { status: 401 } as Response,
              bodyText: '',
            })
          );
        })
    );
    const client = createClient(transport);

    await expect(client.mutate({ mutation: updateViewerMutation })).rejects.toBeInstanceOf(
      ServerError
    );
    expect(refreshAttempts).toBe(0);
    expect(mutationAttempts).toBe(1);
  });

  it('does not refresh a public mutation with invalid credentials', async () => {
    let refreshAttempts = 0;
    const transport = new ApolloLink(
      (operation) =>
        new Observable<ApolloLink.Result>((observer) => {
          if (operation.operationName === 'RefreshSession') refreshAttempts += 1;
          observer.next(invalidCredentialsResult);
          observer.complete();
        })
    );
    const client = createClient(transport);

    await expect(client.mutate({ mutation: updateViewerMutation })).rejects.toBeInstanceOf(
      CombinedGraphQLErrors
    );
    expect(refreshAttempts).toBe(0);
  });

  it('resets the cache once when concurrent retries stay unauthenticated', async () => {
    let queryAttempts = 0;
    let completeRefresh: (() => void) | undefined;
    const transport = new ApolloLink(
      (operation) =>
        new Observable<ApolloLink.Result>((observer) => {
          if (operation.operationName === 'RefreshSession') {
            completeRefresh = () => {
              observer.next({ data: { refreshSession: true } });
              observer.complete();
            };
            return;
          }

          queryAttempts += 1;
          observer.next(unauthorizedResult);
          observer.complete();
        })
    );
    const client = createClient(transport);
    const resetCache = jest.spyOn(client.cache, 'reset');
    const requests = [
      client.query({ query: viewerQuery, fetchPolicy: 'no-cache' }),
      client.query({ query: viewerQuery, fetchPolicy: 'no-cache' }),
    ];
    await new Promise((resolve) => setTimeout(resolve, 0));

    completeRefresh?.();
    const results = await Promise.allSettled(requests);

    expect(queryAttempts).toBe(4);
    expect(resetCache).toHaveBeenCalledTimes(1);
    expect(resetCache).toHaveBeenCalledWith({ discardWatches: false });
    expect(
      results.every(
        (result) => result.status === 'rejected' && CombinedGraphQLErrors.is(result.reason)
      )
    ).toBe(true);
  });

  it('resets the cache once and preserves auth errors when refresh is rejected', async () => {
    let refreshAttempts = 0;
    const transport = new ApolloLink(
      (operation) =>
        new Observable<ApolloLink.Result>((observer) => {
          if (operation.operationName === 'RefreshSession') refreshAttempts += 1;
          observer.next(unauthorizedResult);
          observer.complete();
        })
    );
    const client = createClient(transport);
    const resetCache = jest.spyOn(client.cache, 'reset');

    const results = await Promise.allSettled([
      client.query({ query: viewerQuery, fetchPolicy: 'no-cache' }),
      client.query({ query: viewerQuery, fetchPolicy: 'no-cache' }),
    ]);

    expect(refreshAttempts).toBe(1);
    expect(resetCache).toHaveBeenCalledTimes(1);
    expect(resetCache).toHaveBeenCalledWith({ discardWatches: false });
    expect(
      results.every(
        (result) => result.status === 'rejected' && CombinedGraphQLErrors.is(result.reason)
      )
    ).toBe(true);
  });
});
