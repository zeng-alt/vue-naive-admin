import gql from 'graphql-tag'
import { apolloClients } from '@/utils/graphql'

export const DELETE_DICT_TYPE = gql`
mutation DeleteDictType($id: [ID]) {
  deleteDictTypeIds(id: $id)
}
`

export const DELETE_DICT_DATA = gql`
mutation DeleteDictData($id: [ID]) {
  deleteDictDataIds(id: $id)
}
`

export const SAVE_DICT_TYPE = gql`
mutation SaveDictType($dictTypeInput: DictTypeInput) {
  saveDictType(dictTypeInput: $dictTypeInput) {
    id
  }
}
`

export const SAVE_DICT_DATA = gql`
mutation SaveDictData($dictDataInput: DictDataInput) {
  saveDictData(dictDataInput: $dictDataInput) {
    id
  }
}
`

export const FUZZY_PAGE_DICT_DATA = gql`
query FuzzyPageDictData($filter: DictDataInput, $pageQuery: PageQuery) {
  fuzzyPageDictData(
    filter: $filter,
    pageQuery: $pageQuery,
    sort: {direction: ASC, property: "id"}
  ) {
    edges {
      node {
        cssClass
        dictLabel
        dictSort
        isDefault
        dictValue
        id
        listClass
        remark
        status
      }
    }
  }
}
`

export const CONDITION_PAGE_DICT_DATA = gql`
query ConditionPageDictData($filter: DictDataCondition, $pageQuery: PageQuery) {
  conditionPageDictData(
    filter: $filter,
    pageQuery: $pageQuery,
    sort: {direction: ASC, property: "id"}
  ) {
    edges {
      node {
        id
        dictCode
        dictTypeId
        dictValue
        dictLabel
      }
    }
  }
}
`

export const CONDITION_PAGE_DICT_TYPE = gql`
query ConditionPageDictType($filter: DictTypeCondition, $pageQuery: PageQuery) {
  conditionPageDictType(
    filter: $filter,
    pageQuery: $pageQuery,
    sort: {direction: ASC, property: "id"}
  ) {
    edges {
      node {
        id
        dictCode
        remark
        dictName
      }
    }
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
  }
}
`

export function deleteDictType(id) {
  return apolloClients.main.mutate({
    mutation: DELETE_DICT_TYPE,
    variables: {
      id,
    },
  })
}

export function saveDictType(data) {
  return apolloClients.main.mutate({
    mutation: SAVE_DICT_TYPE,
    variables: {
      dictTypeInput: data,
    },
  })
}

export function saveDictData(data) {
  debugger
  return apolloClients.main.mutate({
    mutation: SAVE_DICT_DATA,
    variables: {
      dictDataInput: data,
    },
  })
}

export function deleteDictData(id) {
  return apolloClients.main.mutate({
    mutation: DELETE_DICT_DATA,
    variables: {
      id,
    },
  })
}
