import gql from 'graphql-tag'
import { apolloClients } from '@/utils/graphql'

// 获取系统参数配置
export const GET_PARAMETER = gql`
  query GetParameter($parameterInput: ParameterInput!) {
    findParameter(parameterInput: $parameterInput) {
      parameterName
      parameterType
      parameterKey
      parameterValue
    }
  }
`

// 获取租户列表
export const GET_TENANTS = gql`
  query GetTenants($tenantInput: TenantInput) {
    queryTenant(tenantInput: $tenantInput) {
      accountCount
      address
      companyName
      contactPhone
      contactUserName
      createdBy
      createdDate
      domain
      expireTime
      id
      intro
      lastModifiedBy
      lastModifiedDate
      licenseNumber
      remark
      tenantKey
    }
  }
`

export const GET_DICT_DATA = `
queryDictData(dictDataInput: $dictDataInput) {
  dictLabel
  dictValue
  isDefault
  listClass
  status
}
`

export function getTenants(data) {
  return apolloClients.tenant.query({
    query: GET_TENANTS,
    variables: {
      tenantInput: data
    }
  })
}


export function getParameter(data) {
  return apolloClients.main.query({
    query: GET_PARAMETER,
    variables: {
      parameterInput: data
    }
  })
}


// 获取枚举列表
export async function fetchDictData(dictCode) {
  return apolloClients.main.query({
    query: gql`
      query GetDictData($dictDataInput: DictDataInput) {
        ${GET_DICT_DATA}
      }
    `,
    variables: {
      dictDataInput: {dictType: {dictCode}}
    }
  })
}