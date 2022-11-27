import CollectionNav from 'components/collections/CollectionNav'
import {customRender, screen, within} from 'test-utils'
import userEvent from '@testing-library/user-event'
import collections from 'mocks/mock_data/collections'

describe('CollectionNav', function () {
  it('should call onSelect with selected collection', function () {
    const collections1 = collections.slice(0, 3).map(({id, title}) => ({id, title}))
    const onSelect = jest.fn()
    const renderPage = customRender(
      <CollectionNav collections={collections1} onSelect={onSelect} loading={false}/>
    )
    renderPage()
    const dropdown = screen.getAllByRole('listbox')[0]
    userEvent.click(dropdown)
    const editButton = screen.getAllByText('Edit')[0]
    userEvent.click(editButton)
    expect(onSelect).toHaveBeenCalledWith(collections1[0])
  })

  it('should not show collections undefined', function () {
    const renderPage = customRender(
      <>
        <h2 id='collection-heading' className='text-xl font-medium'>Collections</h2>
        <CollectionNav onSelect={jest.fn()} loading={false}/>
      </>
    )
    renderPage()
    const collectionList = screen.getByRole('list', {name: /collections/i})
    const {queryAllByRole} = within(collectionList)
    const items = queryAllByRole('listitem')
    expect(items).toHaveLength(0)
  })

  it('should show a loader when loading is true', function () {
    const renderPage = customRender(
      <CollectionNav onSelect={jest.fn()} loading={true}/>
    )
    renderPage()
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })
})