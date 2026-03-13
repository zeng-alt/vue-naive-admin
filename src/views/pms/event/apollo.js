import gql from 'graphql-tag'
import { apolloClients } from '@/utils/graphql'

export const CONDITION_PAGE_HTTP_RESOURCE = gql`
query ConditionPageHttpResource($pageQuery: PageQuery, $filter: HttpResourceCondition) {
  conditionPageHttpResource(
    pageQuery: $pageQuery,
    filter: $filter,
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
          enable
          id
          menuId
          method
          name
          path
          redirect
        }
      }
    }
}
`

export const SAVE_HTTP_RESOURCE = gql`
mutation SaveHttpResource($httpResourceInput: HttpResourceInput, $ignoringNull: Boolean = true) {
  saveHttpResource(httpResourceInput: $httpResourceInput, ignoringNull: $ignoringNull) {
    id,
    method,
  }
}
`

export const DELETE_PERMISSION = gql`
  mutation DeletePermissionIds($ids: [Long]) {
    deletePermissionIds(id: $ids)
  }
`

export function saveHttpResource(data) {
  return apolloClients.main.mutate({
    mutation: SAVE_HTTP_RESOURCE,
    variables: {
      httpResourceInput: data,
    },
  })
}

export function deletePermission(ids) {
  return apolloClients.main.mutate({
    mutation: DELETE_PERMISSION,
    variables: {
      ids,
    },
  })
}
