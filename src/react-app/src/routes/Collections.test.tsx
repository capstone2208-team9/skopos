import React from "react";
import userEvent from '@testing-library/user-event'
import Collections from "routes/Collections";
import { customRender, within, screen} from "test-utils";


describe("Collections", function() {
  it("should render list of collection names", async () => {
    const renderPage = customRender(<Collections/>)
    renderPage()
    const collectionList = await screen.findByRole('list', {name: /collections/i})
    const {getAllByRole} = within(collectionList)
    const items = getAllByRole('listitem')
    expect(items.length).toBe(20 * 3) // 1 for top level 2 for each dropdown
  })

  it('should render a form to edit collections when list item clicked', async function () {
    const renderPage = customRender(<Collections/>)
    renderPage()
    await screen.findByRole('list', {name: /collections/i})
    const dropdown = screen.getAllByRole('listbox')[0]
    userEvent.click(dropdown)
    const editButton = screen.getAllByText('Edit')[0]
    userEvent.click(editButton)
    expect(await screen.findByTestId('edit-collection-form')).toBeInTheDocument()
  })
});