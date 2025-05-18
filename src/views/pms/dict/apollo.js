import gql from 'graphql-tag'


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