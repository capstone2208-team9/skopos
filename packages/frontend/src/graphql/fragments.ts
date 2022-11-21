import { gql } from "graphql-tag";

export const CollectionRunResponses = gql`
    fragment CollectionRunResponses on CollectionRun {
        responses {
            id
            status
            headers
            body
            latency
            request {
                id
                title
            }
            assertionResults {
                id
                pass
                actual
                assertion {
                    comparison
                    expected
                    property
                }
            }
        }
    }
`

export const RequestDefinitionFragment = gql`
    fragment RequestDefinitionFragment on Request {
        id
        title
        body
        url
        method
        headers
        stepNumber
        assertions {
            id
            expected
            property
            comparison
        }
    }
`

export const CollectionRunFragment = gql`
    fragment CollectionRunFragment on CollectionRun {
        id
        createdAt
        responses {
            id
            status
            headers
            body
            latency
            request {
                id
                title
            }
            assertionResults {
                id
                pass
                actual
                assertion {
                    id
                    comparison
                    expected
                    property
                }
            }
        }
    }
`