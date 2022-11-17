import { gql } from "@apollo/client";

export const CreateCollection = gql`
    mutation Mutation($data: CollectionCreateInput!) {
        createOneCollection(data: $data) {
            title
            id
        }
    }
`;

export const GetCollectionNames = gql`
    query GetCollectionNames {
        collections {
            id
            title
        }
    }
`;

export const GetCollection = gql`
    query Collection($where: CollectionWhereUniqueInput!, $orderBy: [RequestOrderByWithRelationInput!]) {
        collection(where: $where) {
            id
            title
            requests(orderBy: $orderBy) {
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
        }
    }
`;

export const UpdateRequest = gql`
    mutation Mutation(
        $data: RequestUpdateInput!
        $where: RequestWhereUniqueInput!
    ) {
        updateOneRequest(data: $data, where: $where) {
            headers
            id
            title
            body
            method
            collectionId
            assertions {
                id
                expected
                property
            }
        }
    }
`;

export const GetLastCollectionRun = gql`
    query Query($where: CollectionRunWhereInput, $orderBy: [CollectionRunOrderByWithRelationInput!], $take: Int) {
        collectionRuns(where: $where, orderBy: $orderBy, take: $take) {
            createdAt
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
                        id
                        comparison
                        expected
                        property
                    }
                }
            }
        }
    }
`;

export const GetMonitors = gql`
    query Monitors($where: CollectionWhereInput) {
        monitors {
            id
            enabled
            schedule
            contactInfo
            collections(where: $where) {
                id
                title
                monitorId
            }
        }
    }`;

export const GetMonitor = gql`
    query Query($where: MonitorWhereUniqueInput!, $orderBy: [CollectionRunOrderByWithRelationInput!], $take: Int) {
        monitor(where: $where) {
            id
            collections {
                id
                title
                collectionRuns(orderBy: $orderBy, take: $take) {
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
            }
        }
    }`;

export const GetEditMonitor = gql`
    query Query($where: MonitorWhereUniqueInput!) {
        monitor(where: $where) {
            id
            schedule
            contactInfo
        }
    }
`;

export const GetCollectionRuns = gql`
    query CollectionRuns($where: CollectionRunWhereInput, $orderBy: [CollectionRunOrderByWithRelationInput!]) {
        collectionRuns(where: $where, orderBy: $orderBy) {
            id
            createdAt
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
                        id
                        comparison
                        expected
                        property
                    }
                }
            }
        }
    }
`;

export const GetCollectionsWithoutMonitors = gql`
    query Query($where: CollectionWhereInput) {
        collections(where: $where) {
            id
            title
        }
    }
`;