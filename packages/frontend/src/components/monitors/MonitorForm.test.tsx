import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {BrowserRouter} from 'react-router-dom'
import MonitorForm from 'components/monitors/MonitorForm'
import selectEvent from 'react-select-event'

describe('MonitorForm', function () {
  it('should allow filling fields to create monitor for a single collection', async function () {
    const onSave = jest.fn()
  render(<MonitorForm onSave={onSave} availableCollections={[{title: 'Collection One', id: 1}, {title: 'Collection Two', id: 2}]} loading={false}/>, {wrapper: BrowserRouter})
    let input = screen.getByLabelText(/run every/i)

    // need to await all field changes due to formik validation
    await waitFor(async() => {
      userEvent.clear(input)
      userEvent.type(input, '2')
    })

    input = screen.getByLabelText(/units/i)
    selectEvent.openMenu(input)
    await waitFor(() => {
      selectEvent.select(input,'HOUR')
    })

    input = screen.getByLabelText(/collections/i)
    selectEvent.openMenu(input)
    await waitFor(() => {
      selectEvent.select(input, 'Collection Two')
    })

    expect(screen.getByText('HOUR')).toBeInTheDocument()
    expect(screen.getByText('Collection Two')).toBeInTheDocument()

    const saveBtn = screen.getByRole('button', {name: /save/i})
    userEvent.click(saveBtn)
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })
  })

  it('should allow selecting more than one collection', async function () {
    render(<MonitorForm availableCollections={[{title: 'Collection One', id: 1}, {title: 'Collection Two', id: 2}]} loading={false}/>, {wrapper: BrowserRouter})
    const input = screen.getByLabelText(/collections/i)
    selectEvent.openMenu(input)
    await waitFor(() => {
      selectEvent.select(input, ['Collection One', 'Collection Two'])
    })
    expect(screen.getByText('Collection One')).toBeInTheDocument()
    expect(screen.getByText('Collection Two')).toBeInTheDocument()
  })

  it('should submit contact info', async function () {
    const onSave = jest.fn();
    render(<MonitorForm
      onSave={onSave}
      availableCollections={[{title: 'Collection One', id: 1}, {title: 'Collection Two', id: 2}]}
      loading={false}/>, {wrapper: BrowserRouter})

    const units = screen.getByLabelText(/units/i)
    selectEvent.openMenu(units)
    await waitFor(() => {
      selectEvent.select(units,'HOUR')
    })

    const collections = screen.getByLabelText(/collections/i)
    selectEvent.openMenu(collections)
    await waitFor(() => {
      selectEvent.select(collections, 'Collection Two')
    })

    userEvent.click(screen.getByLabelText(/toggle email/i))
    const email = screen.getByLabelText('EMAIL')
    await waitFor(() => {
      userEvent.type(email, 'john@example.com')
    })
    userEvent.click(screen.getByLabelText(/toggle slack/i))
    const slack = screen.getByLabelText('SLACK')
    await waitFor(() => {
      userEvent.type(slack, 'https://slackexample.com')
    })
    userEvent.click(screen.getByLabelText(/toggle pagerduty/i))
    const pagerDuty = screen.getByLabelText('PAGERDUTY')
    await waitFor(() => {
      userEvent.type(pagerDuty, 'https://pagerdutyexample.com')
    })

    expect(email).toHaveValue('john@example.com')
    expect(slack).toHaveValue('https://slackexample.com')
    expect(pagerDuty).toHaveValue('https://pagerdutyexample.com')
    const button = screen.getByRole('button', {name: /save/i})
    expect(button).not.toBeDisabled()
    userEvent.click(button)
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        collections: [1, 2],
        value: 1,
        units: 'hour',
        contactInfo: {
          email: 'john@example.com',
          slack: 'https://slackexample.com',
          pagerDuty: 'https://pagerdutyexample.com',
        },
        id: undefined
      })
    })
  })
})