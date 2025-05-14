import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export const SAVE_PARAMETER = gql`
  mutation SaveParameter($parameterInput: ParameterInput) {
    saveParameter(parameterInput: $parameterInput) {
      id,
    }
  }
`

export const DELETE_PARAMETER = gql`
  mutation DeleteParameters($ids: [Long]) {
    deleteParameters(id: $ids) {
      id,
    }
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

export const { mutate: save } = data => useMutation(SAVE_PARAMETER, {
  variables: {
    parameterInput: data,
  },
})

export function saveParameter(data) {
  const { mutate } = useMutation(SAVE_PARAMETER)

  return mutate
}

export const { mutate: remove } = ids => useMutation(DELETE_PARAMETER, {
  variables: {
    ids,
  },
})
