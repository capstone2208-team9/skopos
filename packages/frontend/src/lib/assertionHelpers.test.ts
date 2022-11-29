import {assertionToAssertionInput} from 'lib/assertionHelpers'
import {Assertion} from 'types'

test('it handles nested paths', () => {
  const assertion = {property: 'body.country[0].country_id', comparison: 'is equal to', expected: 'foo'}
  const actual = assertionToAssertionInput(assertion as Assertion)
  expect(actual.path).toBe('body.country[0].country_id')
  expect(actual.property).toBe('body')
})


test('it handles square bracket body properties', () => {
  const assertion = {property: 'body[0].country_id', comparison: 'is equal to', expected: 'foo'}
  const actual = assertionToAssertionInput(assertion as Assertion)
  expect(actual.path).toBe('body[0].country_id')
  expect(actual.property).toBe('body')
})

test('it handles header properties', () => {
  const assertion = {property: "headers['content-type']", comparison: 'is equal to', expected: 'foo'}
  const actual = assertionToAssertionInput(assertion as Assertion)
  expect(actual.path).toBe("headers['content-type']")
  expect(actual.property).toBe('headers')
})


test('it handles status property', () => {
  const assertion = {property: "status", comparison: 'is equal to', expected: 'foo'}
  const actual = assertionToAssertionInput(assertion as Assertion)
  expect(actual.path).toBeUndefined()
  expect(actual.property).toBe('status')
})

test('it handles latency property', () => {
  const assertion = {property: "latency", comparison: 'is equal to', expected: 'foo'}
  const actual = assertionToAssertionInput(assertion as Assertion)
  expect(actual.path).toBeUndefined()
  expect(actual.property).toBe('latency')
})
