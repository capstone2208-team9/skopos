import {act, customRender, fireEvent, screen} from 'test-utils'
import CollectionForm from './CollectionForm'
import userEvent from '@testing-library/user-event'
import collections from 'mocks/mock_data/collections'

describe('CollectionForm', function () {
  it('should have input to update a title', async function () {
    const collection = collections[0]
    customRender(<CollectionForm show={true} onClose={jest.fn()} collection={collection}/>)()
    const titleInput = screen.getByLabelText(/title/i)
    expect(titleInput).toHaveValue(collection.title)
    await act(async() => {
      userEvent.clear(titleInput)
      userEvent.type(titleInput, 'My Collection')
    })
    expect(titleInput).toHaveValue('My Collection')
    expect(screen.getByRole('button', {name: /save/i})).toBeEnabled()
  })

  it('should show error message if title not valid', async function () {
    const collection = collections[0]
    customRender(<CollectionForm show={true} onClose={jest.fn()} collection={collection}/>)()
    const titleInput = screen.getByLabelText(/title/i)
    await act(async() => {
      userEvent.clear(titleInput)
      userEvent.type(titleInput, '      ')
      fireEvent.blur(titleInput)
    })
    expect(await screen.findByText(/title must be at least/)).toBeInTheDocument()
  })

  it('should disable save button if title not valid', async function () {
    const collection = collections[0]
    customRender(<CollectionForm show={true} onClose={jest.fn()} collection={collection}/>)()
    const titleInput = screen.getByLabelText(/title/i)
    await act(async() => {
      userEvent.clear(titleInput)
      userEvent.type(titleInput, '      ')
    })
    expect(screen.getByRole('button', {name: /save/i})).toBeDisabled()
  })

  it('should have a cancel button and it should clear input', async () => {
    customRender(<CollectionForm show={true} onClose={jest.fn()} collection={null}/>)()
    const titleInput = screen.getByLabelText(/title/i)
    await act(async() => {
      userEvent.type(titleInput, 'foo')
    })
    expect(titleInput).toHaveValue('foo')
    userEvent.click(screen.getByRole('button', {name: /cancel/i}))
    await act(async() => {
      expect(titleInput).toHaveValue('')
    })
  })
})