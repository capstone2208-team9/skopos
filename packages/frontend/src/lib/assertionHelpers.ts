import {Assertion, AssertionInput, Request} from 'types'

export function assertionToAssertionInput(assertion: Assertion): AssertionInput {
  const property = assertion.property.startsWith('headers')
    ? 'headers'
    : assertion.property.startsWith('body')
      ? 'body'
      : assertion.property
  const path = assertion.property.replace(/^(body|headers)/, '')
  if (path === property) return assertion
  return {
    ...assertion,
    property,
    path: property + path,
  }
}

export function getProperty({path, property}: AssertionInput) {
  return ['status', 'latency'].includes(property) ? property : path
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