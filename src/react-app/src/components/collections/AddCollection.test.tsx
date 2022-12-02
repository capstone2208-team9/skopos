import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddCollection from "components/collections/AddCollection";
import { ToastProvider } from "hooks/ToastProvider";
import { BrowserRouter } from "react-router-dom";

describe("AddCollection", function() {
  it("should render a button to add collections", async function() {
    const client = new ApolloClient({
      cache: new InMemoryCache()
    })
    render(<ApolloProvider client={client}>
      <ToastProvider>
        <AddCollection/>
      </ToastProvider>
    </ApolloProvider>, {wrapper: BrowserRouter})
    const button = screen.getByRole('button', {name: /add collection/i})
    await userEvent.click(button)
    expect(screen.getByRole('heading', {name: /add collection/i})).toBeInTheDocument()
  });

  it("should have input for user to enter a collection title", async function() {
    const client = new ApolloClient({
      cache: new InMemoryCache()
    })
    render(<ApolloProvider client={client}>
      <ToastProvider>
        <AddCollection/>
      </ToastProvider>
    </ApolloProvider>, {wrapper: BrowserRouter})
    const button = screen.getByRole('button', {name: /add collection/i})
    await userEvent.click(button)
    const input = screen.getByPlaceholderText('Collection Name') as HTMLInputElement
    await userEvent.type(input, 'My Collection')
    expect(input.value).toBe('My Collection')
  });

  it("should disable save button when no title", async function() {
    const client = new ApolloClient({
      cache: new InMemoryCache()
    })
    render(<ApolloProvider client={client}>
      <ToastProvider>
        <AddCollection/>
      </ToastProvider>
    </ApolloProvider>, {wrapper: BrowserRouter})
    const button = screen.getByRole('button', {name: /add collection/i})
    await userEvent.click(button)
    const save = screen.getByRole('button', {name: /save/i})
    expect(save).toBeDisabled()
    const input = screen.getByPlaceholderText('Collection Name') as HTMLInputElement
    await userEvent.type(input, 'My Collection')
    expect(save).not.toBeDisabled()
  });

  it("should hide modal when cancel clicked", async function() {
    const client = new ApolloClient({
      cache: new InMemoryCache()
    })
    render(<ApolloProvider client={client}>
      <ToastProvider>
        <AddCollection/>
      </ToastProvider>
    </ApolloProvider>, {wrapper: BrowserRouter})
    const button = screen.getByRole('button', {name: /add collection/i})
    await userEvent.click(button)
    const cancel = screen.getByRole('button', {name: /cancel/i})
    await userEvent.click(cancel)
    expect(screen.queryByRole('heading', {name: /add collection/i})).not.toBeInTheDocument()
  });
});