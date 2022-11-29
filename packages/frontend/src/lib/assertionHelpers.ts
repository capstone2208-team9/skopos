import {Assertion, AssertionInput, Request} from 'types'

export function assertionToAssertionInput(assertion: Assertion): AssertionInput {
  const [property, ...path] = assertion.property.split('.')
  if (path === undefined) return assertion
  return {
    ...assertion,
    property,
    path: `${property}.${path.join('.')}` || '',
  }
}

export type RequestInput = Omit<Request, 'assertions'> & {
  assertions: AssertionInput[]
}


export function requestToRequestInput(request: Request): RequestInput {
  return {
    ...request,
    assertions: request.assertions.map(assertionToAssertionInput)
  }
}