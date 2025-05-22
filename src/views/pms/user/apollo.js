import { useQuery } from '@vue/apollo-composable'
import { apolloClients } from '@/utils/graphql'
import gql from 'graphql-tag'

export const QUERY_ROLE = gql`
  query MyQuery($roleInput: RoleInput) {
    queryRole(roleInput: $roleInput) {
      code
      enable
      id
      name
    }
  }
`

export const SAVE_USER = gql`
  mutation SaveUser($userInput: UserInput) {
    saveUser(userInput: $userInput) {
      id,
    }
  }
`

export const DELETE_USER = gql`
  mutation DeleteUserIds($ids: [Long]) {
    deleteUserIds(id: $ids)
  }
`

export const PAGE_USER = gql`
query MyQuery($filter: UserCondition, $pageQuery: PageQuery) {
  conditionPageUser(
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
        avatar
        createdBy
        createdDate
        email
        gender
        lastModifiedBy
        lastModifiedDate
        deleted
        id
        nickName
        password
        phoneNumber
        enable
        tenantBy
        username,
        userRoles {
          role {
            name
            id
          }
        }
      }
    }
  }
}
`

export function queryRoleByEnable(enable) {
  return useQuery(QUERY_ROLE, { roleInput: { enable } })
};

export function saveUser(data) {
  return apolloClients.main.mutate({
    mutation: SAVE_USER,
    variables: {
      userInput: data
    }
  })
}

export function deleteUser(ids) {
  return apolloClients.main.mutate({
    mutation: DELETE_USER,
    variables: {
      ids,
    },
  })
}