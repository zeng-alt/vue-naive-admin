import gql from 'graphql-tag'
import { apolloClients } from '@/utils/graphql'

export const SAVE_GRAPHQL_RESOURCE = gql`
  mutation saveGraphqlResource($graphqlResourceInput: GraphqlResourceInput) {
    saveGraphqlResource(graphqlResourceInput: $graphqlResourceInput) {
      id,
    }
  }
`

export const DELETE_GRAPHQL_RESOURCE = gql`
  mutation deleteGraphqlResourceIds($ids: [ID]) {
    deleteGraphqlResourceIds(id: $ids)
  }
`

export const PAGE_GRAPHQL_RESOURCE = gql`
  query conditionPageGraphqlResource($filter: GraphqlResourceCondition, $pageQuery: PageQuery) {
    conditionPageGraphqlResource(
      filter: $filter,
      pageQuery: $pageQuery,
      sort: {direction: ASC, property: "id"}
    ) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        cursor
        node {
          code
          functionName
          id
          name
          operation
          resourceType
          uri
        }
      }
    }
  }
`

export function saveGraphqlResource(data) {
  return apolloClients.main.mutate({
    mutation: SAVE_GRAPHQL_RESOURCE,
    variables: {
      graphqlResourceInput: data,
    },
  })
}

export function deleteGraphqlResource(ids) {
  return apolloClients.main.mutate({
    mutation: DELETE_GRAPHQL_RESOURCE,
    variables: {
      ids,
    },
  })
}
