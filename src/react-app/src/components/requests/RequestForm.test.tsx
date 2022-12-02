import userEvent from '@testing-library/user-event'
import requests from 'mocks/mock_data/requests'
import {act} from 'react-dom/test-utils'
import selectEvent from 'react-select-event'
import {customRender, fireEvent, screen, waitFor} from 'test-utils'
import RequestForm from './RequestForm'

describe('RequestForm', () => {
  it('should have disabled save button when first rendered', function () {
    const renderPage = customRender(<RequestForm stepNumber={1}/>)
    renderPage()
    expect(screen.getByRole('button', {name: /save/i})).toBeDisabled()
  })

  it('should render inputs to create request with empty values when no request provided', async function () {
    const renderPage = customRender(<RequestForm stepNumber={1}/>)
    renderPage()
    const titleInput = screen.getByPlaceholderText(/add a title/i)
    expect(titleInput).toHaveValue('')
    screen.getByLabelText(/get/i)
    const urlInput = screen.getByPlaceholderText(/https:\/\/example.com/)
    expect(urlInput).toHaveValue('')
    expect(screen.getByRole('button', {name: /add a header/i})).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', {name: /assertions/i}))
    expect(screen.getByRole('button', {name: /add assertion/i})).toBeInTheDocument()
  })

  it('should render inputs to create request with request values when request provided', function () {
    const request = requests[0]
    const renderPage = customRender(<RequestForm request={request} stepNumber={1}/>)
    renderPage()
    const titleInput = screen.getByPlaceholderText(/add a title/i)
    expect(titleInput).toHaveValue(request.title)
    const urlInput = screen.getByPlaceholderText(/https:\/\/example.com/)
    expect(urlInput).toHaveValue(request.url)
    request.headers?.forEach(([key, value]) => {
      expect(screen.getByDisplayValue(key)).toBeInTheDocument()
      expect(screen.getByDisplayValue(value)).toBeInTheDocument()
    })
  })

  it('should display assertions for request if provided', async function () {
    const request = requests[0]
    request.assertions.push({
      property: 'body.id',
      expected: 100,
      comparison: 'is equal to',
      id: 1,
    })
    const renderPage = customRender(<RequestForm request={request} stepNumber={1}/>)
    renderPage()
    await userEvent.click(screen.getByRole('tab', {name: /assertions/i}))
    expect(await screen.findByDisplayValue('body.id')).toBeInTheDocument()
  })

  it('should display body for request if provided', async function () {
    const request = requests[0]
    const renderPage = customRender(<RequestForm request={request} stepNumber={1}/>)
    renderPage()
    await userEvent.click(screen.getByRole('tab', {name: /body/i}))
    const bodyEditor = screen.getByPlaceholderText('{}')
    expect(bodyEditor).toHaveValue(request.body)
  })

  it('should not throw an error when trying to input body text', async function () {
    const renderPage = customRender(<RequestForm stepNumber={1}/>)
    renderPage()
    await userEvent.click(screen.getByRole('tab', {name: /body/i}))
    const bodyEditor = screen.getByLabelText(/body/i)
    const jsonText = '{"id":100,"title":"foo"}'
    await act(async () => {
      // userEvent.type not working here, not sure why?
      fireEvent.change(bodyEditor, {target: {value: jsonText}})
    })
    expect(bodyEditor).toHaveValue(jsonText) // this fails
    expect(screen.getByDisplayValue(jsonText)).toBeInTheDocument() // this fails
  })

  it('should prefix assertion body input with "body"', async function () {
    const renderPage = customRender(<RequestForm stepNumber={1}/>)
    renderPage()
    await userEvent.click(screen.getByRole('tab', {name: /assertions/i}))

    await act(async() => {
      await userEvent.click(screen.getByRole('button', {name: /add assertion/i}))
    })
    const propertySelect = screen.getByLabelText(/property/i)
    selectEvent.openMenu(propertySelect)
    await waitFor(async () => {
      await selectEvent.select(propertySelect, 'Body')
    })
    await act(async() => {
      await userEvent.type(screen.getByLabelText(/path/i), '.title')
    })
    expect(screen.getByLabelText(/path/i)).toHaveValue('body.title')
  })

  it('should prefix assertion header input with "headers"', async function () {
    const renderPage = customRender(<RequestForm stepNumber={1}/>)
    renderPage()
    await userEvent.click(screen.getByRole('tab', {name: /assertions/i}))

    await act(async() => {
      await userEvent.click(screen.getByRole('button', {name: /add assertion/i}))
    })
    const propertySelect = screen.getByLabelText(/property/i)
    selectEvent.openMenu(propertySelect)
    await waitFor(async () => {
      await selectEvent.select(propertySelect, 'Headers')
    })
    await act(async() => {
      await userEvent.type(screen.getByLabelText(/path/i), '.Content-Type')
    })
    expect(screen.getByLabelText(/path/i)).toHaveValue('headers.Content-Type')
  })

  it('should submit correct values', async () => {
    const renderPage = customRender(<RequestForm stepNumber={1}/>)
    renderPage()
    const titleInput = screen.getByPlaceholderText(/add a title/i)
    await waitFor(async () => {
      await userEvent.type(titleInput, 'My Request')
    })

    const urlInput = screen.getByPlaceholderText(/https:\/\/example.com/i)
    await waitFor(async () => {
      await userEvent.type(urlInput, 'https://example.com')
    })
    await userEvent.click(screen.getByRole('tab', {name: /assertions/i}))
    await userEvent.click(screen.getByRole('button', {name: /add assertion/i}))
    await waitFor(async () => {
      await userEvent.type(screen.getByLabelText(/expected/i), '200')
    })
    const saveButton = await screen.findByRole('button', {name: /save/i})
    expect(saveButton).not.toBeDisabled()
    await userEvent.click(saveButton)
    // TODO: fix this test
    // const toast = await screen.findByTestId('toast')
    // expect(toast).toHaveTextContent('Request created')
  })

  // validation
  it('should have validation error if title not provided', async function () {
    const renderPage = customRender(<RequestForm stepNumber={1}/>)
    renderPage()
    const titleInput = screen.getByPlaceholderText(/add a title/i)
    fireEvent.blur(titleInput)
    expect(await screen.findByTestId('errors-title')).toBeInTheDocument()
  })

  it('should have validation valid url not provided', async function () {
    const renderPage = customRender(<RequestForm stepNumber={1}/>)
    renderPage()
    const titleInput = screen.getByPlaceholderText(/https:\/\/example.com/i)
    fireEvent.blur(titleInput)
    expect(await screen.findByTestId('errors-url')).toBeInTheDocument()
  })

  it('should have validation error if url is not provided', async function () {
    const renderPage = customRender(<RequestForm stepNumber={1}/>)
    renderPage()
    const urlInput = screen.getByPlaceholderText(/https:\/\/example.com/i)
    fireEvent.blur(urlInput)
    expect(await screen.findByTestId('errors-url')).toBeInTheDocument()
  })

  it('should allow adding variables in the url', async function () {
    customRender(<RequestForm stepNumber={1}/>)()
    const urlInput = screen.getByPlaceholderText(/https:\/\/example.com/i)
    await act(async () => {
      await userEvent.type(urlInput, '@{{step1.body.url}}')
      fireEvent.blur(urlInput)
    })
    expect(screen.queryByTestId('errors-url')).not.toBeInTheDocument()
  })

  it('should not show error if valid url provided', async function () {
    customRender(<RequestForm stepNumber={1}/>)()
    const urlInput = screen.getByPlaceholderText(/https:\/\/example.com/i)
    await act(async () => {
      await userEvent.type(urlInput, 'https://example.com')
      fireEvent.blur(urlInput)
    })
    expect(screen.queryByTestId('errors-url')).not.toBeInTheDocument()
  })

  it('should show error if not url and no variables provided', async function () {
    customRender(<RequestForm stepNumber={1}/>)()
    const urlInput = screen.getByPlaceholderText(/https:\/\/example.com/i)
    await act(async () => {
      await userEvent.type(urlInput, 'foo')
      fireEvent.blur(urlInput)
    })
    expect(screen.queryByTestId('errors-url')).toBeInTheDocument()
  })
})