import gql from 'graphql-tag'
import { apolloClients } from '@/utils/graphql'

export const SAVE_ROLE = gql`
  mutation SaveRole($roleInput: RoleInput) {
    saveRole(roleInput: $roleInput) {
      id,
    }
  }
`

export const DELETE_ROLE = gql`
  mutation DeleteRoleIds($ids: [ID]) {
    deleteRoleIds(id: $ids)
  }
`

export const PAGE_ROLE = gql`
query MyQuery($filter: RoleCondition, $pageQuery: PageQuery) {
  conditionPageRole(
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
        deleted
        enable
        id
        name
        rolePermissions {
          permission {
            id
          }
        }
      }
    }
  }
}
`

export function saveRole(data) {
  return apolloClients.main.mutate({
    mutation: SAVE_ROLE,
    variables: {
      roleInput: data,
    },
  })
}

export function deleteRole(ids) {
  return apolloClients.main.mutate({
    mutation: DELETE_ROLE,
    variables: {
      ids,
    },
  })
}
