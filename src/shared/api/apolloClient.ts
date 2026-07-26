import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: __GRAPHQL_API_URL__,
    credentials: 'include',
  }),
});

export { apolloClient };
