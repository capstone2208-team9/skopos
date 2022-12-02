import MonitorListItem from 'components/monitors/MonitorListItem'
import collectionData from 'mocks/mock_data/collections'
import monitors from 'mocks/mock_data/monitors'
import {customRender, screen} from 'test-utils'
import userEvent from '@testing-library/user-event'

describe('MonitorListItem', function () {
  it('can delete the monitor provided as props', async () => {
    const monitor = monitors[0]
    monitor.collections = collectionData.slice(0, 2)
    const render= customRender(<table>
      <tbody>
        <MonitorListItem {...monitor}/>
      </tbody>
    </table>)
    render()
    screen.getByText(/1 hour/)
    userEvent.click(screen.getByRole('button', {name: /delete/i}))
    const confirmDelete = screen.getByTestId('confirm-delete')
    userEvent.click(confirmDelete)
    await screen.findByText(/monitor deleted/i)
  })

  it('should render a link to edit the monitor', async function () {
    const monitor = monitors[0]
    monitor.collections = collectionData.slice(0, 2)
    const render= customRender(<table>
      <tbody>
      <MonitorListItem {...monitor}/>
      </tbody>
    </table>)
    render()
    const link = screen.getByRole('link', {name: /edit/i})
    expect(link.closest('a')).toHaveAttribute('href', `/monitors/${monitor.id}/edit`)
  })

  it('should render the contact info', async function () {
    const monitor = monitors[0]
    monitor.contactInfo = {
      email: 'test@example.com',
      slack: 'https://example.com',
      pagerDuty: 'https://example.com',
    }
    monitor.collections = collectionData.slice(0, 2)
    const render= customRender(<table>
      <tbody>
      <MonitorListItem {...monitor}/>
      </tbody>
    </table>)
    render()
    expect(screen.getByText(/email, slack, pagerDuty/i)).toBeInTheDocument()
  })

  it('should render the number of collections being monitored', function () {
    const monitor = monitors[0]
    monitor.collections = collectionData.slice(0, 2)
    const render= customRender(<table>
      <tbody>
      <MonitorListItem {...monitor}/>
      </tbody>
    </table>)
    render()
    expect(screen.getByText(/2 collections/i)).toBeInTheDocument()
  })
})