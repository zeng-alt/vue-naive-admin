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

export function queryRoleByEnable(enable) {
  return useQuery(QUERY_ROLE, { roleInput: { enable } })
};
