import { apolloClients } from '@/utils/graphql'
import gql from 'graphql-tag'

export const SAVE_PARAMETER = gql`
  mutation SaveParameter($parameterInput: ParameterInput) {
    saveParameter(parameterInput: $parameterInput) {
      id,
    }
  }
`

export const DELETE_PARAMETER = gql`
  mutation DeleteParameterIds($ids: [ID]) {
    deleteParameterIds(id: $ids)
  }
`

export const PAGE_PARAMETER = gql`
  query ConditionPageParameter($filter: ParameterCondition, $pageQuery: PageQuery) {
    conditionPageParameter(
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
          id
          parameterName
          parameterValue
          parameterType
          parameterKey
          createdDate
          remark
          tenantBy
        }
      }
    }
  }
`

export function saveParameter(data) {
  return apolloClients.main.mutate({
    mutation: SAVE_PARAMETER,
    variables: {
      parameterInput: data
    }
  })
}

export function deleteParameter(ids) {
  return apolloClients.main.mutate({
    mutation: DELETE_PARAMETER,
    variables: {
      ids,
    },
  })
}

