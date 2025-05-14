import { useQuery } from '@vue/apollo-composable'
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
        status
        tenantBy
        username,
        userRoles {
          role {
            name
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
