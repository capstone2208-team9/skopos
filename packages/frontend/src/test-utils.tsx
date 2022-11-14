import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { render} from "@testing-library/react";
import { ToastProvider } from "hooks/ToastProvider";
import { server } from "mocks/server";
import { GraphQLHandler, GraphQLRequest } from "msw";
import React from "react";
import { BrowserRouter } from "react-router-dom";

export const customRender = (children: React.ReactNode) =>
  (responseOverride?: GraphQLHandler<GraphQLRequest<never>>) => {
    if (responseOverride) {
      server.use(responseOverride)
    }
    const client = new ApolloClient({
      uri: "http://localhost:3001/graphql",
      cache: new InMemoryCache()})
    render(<ApolloProvider client={client}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ApolloProvider>, {wrapper: BrowserRouter})
  }

export * from '@testing-library/react'
export {customRender as render}