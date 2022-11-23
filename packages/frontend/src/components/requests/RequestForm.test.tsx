import {customRender, screen} from 'test-utils'
import userEvent from '@testing-library/user-event'
import RequestForm from './RequestForm'
import requests from 'mocks/mock_data/requests'

describe('RequestForm', () => {
  it('should have disabled save button when first rendered', function () {
    const renderPage = customRender(<RequestForm stepNumber={1}/>)
    renderPage()
    expect(screen.getByRole('button',{name: /save/i})).toBeDisabled()
  })

  it('should render inputs to create request with empty values when no request provided', function () {
    const renderPage = customRender(<RequestForm stepNumber={1}/>)
    renderPage()
    const titleInput = screen.getByPlaceholderText('request name')
    expect(titleInput).toHaveValue('')
    expect(screen.getByDisplayValue('GET')).toHaveValue('GET')
    const urlInput = screen.getByPlaceholderText('endpoint url')
    expect(urlInput).toHaveValue('')
    expect(screen.getByRole('button', {name: /add a header/i})).toBeInTheDocument()
    userEvent.click(screen.getByRole('tab', {name: /assertions/i}))
    expect(screen.getByRole('button', {name: /add assertion/i})).toBeInTheDocument()
  })

  it('should render inputs to create request with request values when request provided', function () {
    const request = requests[0]
    const renderPage = customRender(<RequestForm request={request} stepNumber={1}/>)
    renderPage()
    const titleInput = screen.getByPlaceholderText('request name')
    expect(titleInput).toHaveValue(request.title)
    const urlInput = screen.getByPlaceholderText('endpoint url')
    expect(urlInput).toHaveValue(request.url)
    request.headers?.forEach(([key, value]) => {
      expect(screen.getByDisplayValue(key)).toBeInTheDocument()
      expect(screen.getByDisplayValue(value)).toBeInTheDocument()
    })
  })

  it('should display assertions for request if provided', function () {
    const request = requests[0]
    request.assertions.push({
      property: 'body.id',
      expected: 100,
      comparison: 'is equal to',
      id: 1,
    })
    const renderPage = customRender(<RequestForm request={request} stepNumber={1}/>)
    renderPage()
    userEvent.click(screen.getByRole('tab', {name: /assertions/i}))
    expect(screen.getByText('body.id')).toBeInTheDocument()
  })

  it('should display body for request if provided', function () {
    const request = requests[0]
    const renderPage = customRender(<RequestForm request={request} stepNumber={1}/>)
    renderPage()
    userEvent.click(screen.getByRole('tab', {name: /body/i}))
    const bodyEditor = screen.getByPlaceholderText('{}')
    expect(bodyEditor).toHaveValue(request.body)
  })

  it.skip('should be disabled if no assertions entered', async function () {
    expect(true).toBeTrue()
    const renderPage = customRender(<RequestForm stepNumber={1}/>)
    renderPage()
    const saveButton = await screen.findByRole('button',{name: /save/i})
    const titleInput = screen.getByPlaceholderText('request name')
    userEvent.type(titleInput, 'My Collection')
    const urlInput = screen.getByPlaceholderText('endpoint url')
    userEvent.type(urlInput, 'https://jsonplaceholdertypicode.com')
    expect(saveButton).toBeDisabled()

    userEvent.click(screen.getByRole('tab', {name: /assertions/i}))
    userEvent.type(screen.getByPlaceholderText(/expected value/i), '200')
    expect(saveButton).not.toBeDisabled()
  })
})