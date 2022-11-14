import { gql } from "@apollo/client";

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

