import React from "react";
import Collections from "routes/Collections";
import { customRender, within, screen, waitForElementToBeRemoved} from "test-utils";


describe("Collections", function() {
  it("should render list of collection names", async () => {
    const renderPage = customRender(<Collections/>)
    renderPage()
    const collectionList = screen.getByRole('list', {name: /collections/i})
    await waitForElementToBeRemoved(screen.queryByText('Loading'))
    const {getAllByRole} = within(collectionList)
    const items = getAllByRole('listitem')
    expect(items.length).toBe(6)
  })
});