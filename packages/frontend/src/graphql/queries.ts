import {gql} from '@apollo/client'
import {CollectionRunResponses, RequestDefinitionFragment} from 'graphql/fragments'

export const GetCollectionNames = gql`
    query Collections($orderBy: [CollectionOrderByWithRelationInput!]) {
        collections(orderBy: $orderBy) {
            _count {
              requests
            }
            id
            title
        }
    }
`

export const GetCollection = gql`
    ${RequestDefinitionFragment}
    query Collection($where: CollectionWhereUniqueInput!, $orderBy: [RequestOrderByWithRelationInput!]) {
        collection(where: $where) {
            id
            title
            requests(orderBy: $orderBy) {
                ...RequestDefinitionFragment
            }
        }
    }
`

export const GetRequests = gql`
    query Requests($where: RequestWhereInput, $orderBy: [RequestOrderByWithRelationInput!]) {
        requests(where: $where, orderBy: $orderBy) {
            ...RequestDefinitionFragment
        }
    }
    ${RequestDefinitionFragment}
`

export const GetRequest = gql`
    ${RequestDefinitionFragment}
    query Query($where: RequestWhereUniqueInput!) {
        request(where: $where) {
            ...RequestDefinitionFragment
            collectionId
        }
    }
`

export const GetLastCollectionRun = gql`
    query Query($where: CollectionRunWhereInput,
        $orderBy: [CollectionRunOrderByWithRelationInput!],
        $take: Int) {
        collectionRuns(where: $where, orderBy: $orderBy, take: $take) {
            collection {
                id
                requests {
                    id
                }
            }
            ...CollectionRunResponses
        }
    }
    ${CollectionRunResponses}
`

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
            }
        }
    }`

export const PaginateCollectionRuns = gql`
    query Query($data: PaginateCollectionRunInput!) {
        paginateCollectionRuns(data: $data) {
            cursor
            hasMore
            items {
                id
                createdAt
                collection {
                    title
                    requests {
                        id
                    }
                }
                ...CollectionRunResponses
            }
        }
    }
    ${CollectionRunResponses}
`

export const GetMonitor = gql`
    query Query($where: MonitorWhereUniqueInput!, $orderBy: [CollectionOrderByWithRelationInput!]) {
        monitor(where: $where) {
            id
            collections(orderBy: $orderBy) {
                id
                title
            }
        }
    }`

export const GetEditMonitor = gql`
    query Query($where: MonitorWhereUniqueInput!) {
        monitor(where: $where) {
            id
            schedule
            contactInfo
        }
    }
`

export const GetCollectionRuns = gql`
    query CollectionRuns($where: CollectionRunWhereInput, $orderBy: [CollectionRunOrderByWithRelationInput!]) {
        ${CollectionRunResponses}
        collectionRuns(where: $where, orderBy: $orderBy) {
            id
            createdAt
            ...CollectionRunResponses
        }
    }
    ${CollectionRunResponses}
`

export const GetCollectionsWithoutMonitors = gql`
    query Query($where: CollectionWhereInput) {
        collections(where: $where) {
            id
            title
        }
    }
`