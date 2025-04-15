import gql from 'graphql-tag'

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
  query GetTenants {
    queryTenant(tenantInput: {}) {
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
