import { gql } from "graphql-tag";

export const CollectionRunsFragment = gql`
    fragment CollectionRunResponses on CollectionRun {
        responses {
            id
            status
            headers
            body
            latency
            request {
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

