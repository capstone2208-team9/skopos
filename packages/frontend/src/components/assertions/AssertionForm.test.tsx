import { render, screen } from '@testing-library/react'
import userEvent from "@testing-library/user-event";
import AssertionList from "components/assertions/AssertionList";
describe("AssertionForm", function() {
  it("should have inputs for creating an assertion", async function() {
    const setAssertions = jest.fn()
    render(<AssertionList assertions={[]} setAssertions={setAssertions}/>)
    const status = screen.getByDisplayValue('Status') as HTMLSelectElement
    userEvent.selectOptions(status, 'Status')
    expect(status.value).toBe('status')
    const condition = screen.getByDisplayValue('is equal to') as HTMLSelectElement
    userEvent.selectOptions(condition, 'is equal to')
    expect(condition.value).toBe('is equal to')
    const expected = screen.getByPlaceholderText('expected value') as HTMLInputElement
    userEvent.type(expected, '200')
    expect(expected.value).toBe('200')
    const addButton = screen.getByRole('button', {name: /add/i})
    await userEvent.click(addButton)
    expect(setAssertions).toHaveBeenCalledTimes(1)
  });

  it("should disable the add button if inputs empty", function() {
    const setAssertions = jest.fn()
    render(<AssertionList assertions={[]} setAssertions={setAssertions}/>)
    const addButton = screen.getByRole('button', {name: /add/i})
    expect(addButton).toBeDisabled()
  });

  it("should toggle body input when body property toggled", async() => {
    const setAssertions = jest.fn()
    render(<AssertionList assertions={[]} setAssertions={setAssertions}/>)
    expect(screen.queryByDisplayValue('body.')).not.toBeInTheDocument()
    const propertySelect = screen.getByDisplayValue('Status') as HTMLSelectElement
    userEvent.selectOptions(propertySelect, 'Body')
    expect(screen.queryByDisplayValue('body.')).toBeInTheDocument()
    userEvent.selectOptions(propertySelect, 'Status')
    expect(screen.queryByDisplayValue('body.')).not.toBeInTheDocument()
  })
});