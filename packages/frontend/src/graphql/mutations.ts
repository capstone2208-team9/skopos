import {gql} from '@apollo/client'
import { RequestDefinitionFragment } from './fragments'

export const UpdateCollectionTitle = gql`
    mutation Mutation($data: CollectionUpdateInput!, $where: CollectionWhereUniqueInput!) {
        updateOneCollection(data: $data, where: $where) {
            id
            title
        }
    }
`

export const DeleteCollection = gql`
    mutation Mutation($where: CollectionWhereUniqueInput!) {
        deleteOneCollection(where: $where) {
            id
            title
        }
    }
`
export const CreateOneRequest = gql`
    mutation Mutation($data: RequestCreateInput!) {
        createOneRequest(data: $data) {
            title
            url
            method
            id
            headers
            body
            stepNumber
            collectionId
            assertions {
                id
                property
                comparison
                expected
            }
        }
    }
`

export const UpdateRequest = gql`
    ${RequestDefinitionFragment}
    mutation Mutation(
        $data: RequestUpdateInput!
        $where: RequestWhereUniqueInput!
    ) {
        updateOneRequest(data: $data, where: $where) {
            ...RequestDefinitionFragment
        }
    }
`


export const DeleteRequest = gql`
    mutation Mutation($data: DeleteRequestInput!) {
        deleteRequest(data: $data) {
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
`

export const ReorderRequests = gql`
    mutation ReorderRequests($data: ReorderRequestInput!) {
        reorderRequests(data: $data) {
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
`

export const RemoveRequestFromCollection = gql`
    mutation UpdateOneRequest($data: RequestUpdateInput!, $where: RequestWhereUniqueInput!) {
        updateOneRequest(data: $data, where: $where) {
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
`

export const DeleteManyAssertions = gql`
    mutation Mutation($where: AssertionWhereInput) {
        deleteManyAssertion(where: $where) {
            count
        }
    }
`

export const CreateOneMonitor = gql`
    mutation CreateOneMonitor($data: MonitorCreateInput!) {
        createOneMonitor(data: $data) {
            id
            schedule
            contactInfo
            enabled
            collections {
                id
                title
            }
        }
    }`

export const DeleteOneMonitor = gql`
    mutation DeleteOneMonitor($where: MonitorWhereUniqueInput!) {
        deleteOneMonitor(where: $where) {
            id
        }
    }
`

export const UpdateOneMonitor = gql`
    mutation UpdateOneMonitor($data: MonitorUpdateInput!, $where: MonitorWhereUniqueInput!) {
        updateOneMonitor(data: $data, where: $where) {
            id
            schedule
            contactInfo
        }
    }
`

export const UpdateStepNumber = gql`
    mutation UpdateStepNumber($data: RequestUpdateInput!, $where: RequestWhereUniqueInput!) {
        updateOneRequest(data: $data, where: $where) {
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
`

export const ToggleMonitorEnabled = gql`
    mutation ToggleMonitorEnabled($data: MonitorUpdateInput!, $where: MonitorWhereUniqueInput!) {
        updateOneMonitor(data: $data, where: $where) {
            id
            enabled
        }
    }
`