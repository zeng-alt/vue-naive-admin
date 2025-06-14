import { apolloClients } from '@/utils/graphql'
import gql from 'graphql-tag'


export const FUZZY_PAGE_PERMISSION_RULE  = gql`
query FuzzyPagePermissionRule($filter: PermissionRuleInput, $pageQuery: PageQuery) {
  fuzzyPagePermissionRule(
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
      node {
        code
        id
        name
        resourceType
      }
    }
  }
}
`

export const Find_POLICY_RULE = gql`
query FindPolicyRule($filter: PolicyRuleInput) {
  findPolicyRule(
    policyRuleInput: $filter
  ) {
    preAuth
    description
    condition
    id
    enable
  }
}
`


export const SAVE_POLICY_RULE = gql`
mutation SavePolicyRule($policyRuleInput: PolicyRuleInput) {
  savePolicyRule(
    policyRuleInput: $policyRuleInput
  ) {
    id
    enable
  }
}
`

export function findPolicyRule(permissionId, preAuth=true,  fetchPolicy = 'cache-first') {
  return apolloClients.main.query({
    query: Find_POLICY_RULE,
    variables: {
      filter: {preAuth: preAuth, permission: {id: permissionId}}
    },
    fetchPolicy
  })
}


export function savePolicyRule(data) {
  return apolloClients.main.mutate({
    mutation: SAVE_POLICY_RULE,
    variables: {
      policyRuleInput: data
    },
  })
}