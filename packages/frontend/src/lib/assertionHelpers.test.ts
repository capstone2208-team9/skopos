import {assertionToAssertionInput} from 'lib/assertionHelpers'
import {Assertion} from 'types'

test('it handles nested paths', () => {
  const assertion = {property: 'body.country[0].country_id', comparison: 'is equal to', expected: 'foo'}
  const actual = assertionToAssertionInput(assertion as Assertion)
  expect(actual.path).toBe('body.country[0].country_id')
  expect(actual.property).toBe('body')
})
