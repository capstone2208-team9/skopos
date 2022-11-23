import {
  ApolloClient,
  InMemoryCache,
  from,
  HttpLink
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

const URI_PATH = process.env.REACT_APP_GRAPHQL_URL

const httpLink = new HttpLink({
  uri: URI_PATH
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});


const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Request: {
        fields: {
          headers: {
            read(value) { // make easier to work with formik
              if (Array.isArray(value)) return value
              return Object.entries(value)
            },
          }
        }
      },
      Query: {
        fields: {
          paginateCollectionRuns: {
            keyArgs: false,
            merge(existing = { items: []}, incoming) {
              return {
                ...incoming,
                items: [...existing.items, ...incoming.items],
              }
            },
          },
        },
      },
    },
  }),
});

export default client;
