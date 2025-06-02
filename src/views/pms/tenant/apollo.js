import { apolloClients } from '@/utils/graphql'
import gql from 'graphql-tag'


export const FUZZY_PAGE_TENANT  = gql`
query fuzzyPageTenant($filter: TenantInput, $pageQuery: PageQuery) {
  fuzzyPageTenant(
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
        accountCount
        address
        companyName
        contactPhone
        contactUserName
        domain
        expireTime
        id
        intro
        licenseNumber
        remark
        status
        tenantKey
        tenantDataSource {
          db
          enabled
          id
          mode
          password
          schema
        }
      }
    }
  }
}
`

export const DELETE_TENANT = gql`
  mutation DeleteTenantIds($ids: [Long]) {
    deleteTenantIds(id: $ids)
  }
`

export const SAVE_TENANT = gql`
  mutation SaveTenant($tenantInput: TenantInput) {
    saveTenant(tenantInput: $tenantInput) {
      id,
    }
  }
`

export function saveTenant(data) {
  return apolloClients.tenant.mutate({
    mutation: SAVE_TENANT,
    variables: {
      tenantInput: data
    }
  })
}

export function deleteTenant(ids) {
  return apolloClients.tenant.mutate({
    mutation: DELETE_TENANT,
    variables: {
      ids,
    },
  })
}
