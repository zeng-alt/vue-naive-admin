import { useMutation } from '@vue/apollo-composable'
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
  mutation DeleteParameterIds($ids: [Long]) {
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

export const { mutate: save } = data => useMutation(SAVE_PARAMETER, {
  variables: {
    parameterInput: data,
  },
})

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

export const { mutate: remove } = ids => useMutation(DELETE_PARAMETER, {
  variables: {
    ids,
  },
})
