import gql from 'graphql-tag'
import { apolloClients } from '@/utils/graphql'

export const CONDITION_PAGE_HTTP_RESOURCE = gql`
query ConditionPageHttpResource($pageQuery: PageQuery, $filter: HttpResourceCondition) {
  conditionPageHttpResource(
    pageQuery: $pageQuery,
    filter: $filter,
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
          code
          enable
          id
          menuId
          method
          name
          path
          redirect
        }
      }
    }
}
`

export const CONDITION_PAGE_GRAPHQL_RESOURCE = gql`
query ConditionPageGraphqlResource($pageQuery: PageQuery, $filter: GraphqlResourceCondition) {
  conditionPageGraphqlResource(
    pageQuery: $pageQuery,
    filter: $filter,
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
          code
          functionName
          id
          menuId
          name
          operation
          uri
        }
      }
    }
}
`

export const SAVE_MENU_RESOURCE = gql`
mutation SaveMenuResource($menuResourceInput: MenuResourceInput) {
  saveMenuResource(menuResourceInput: $menuResourceInput) {
    id,
    type
  }
}
`

export const SAVE_HTTP_RESOURCE = gql`
mutation SaveHttpResource($httpResourceInput: HttpResourceInput, $ignoringNull: Boolean = true) {
  saveHttpResource(httpResourceInput: $httpResourceInput, ignoringNull: $ignoringNull) {
    id,
    method,
  }
}
`

export const SAVE_GRAPHQL_RESOURCE = gql`
mutation SaveGraphqlResource($graphqlResourceInput: GraphqlResourceInput, $ignoringNull: Boolean = true) {
  saveGraphqlResource(graphqlResourceInput: $graphqlResourceInput, ignoringNull: $ignoringNull) {
    id,
  }
}
`

export const SAVE_ALL_HTTP_RESOURCE = gql`
mutation SaveAllHttpResource($httpResourceInput: [HttpResourceInput], $ignoringNull: Boolean = true) {
  saveAllHttpResource(httpResourceInput: $httpResourceInput, ignoringNull: $ignoringNull) {
    id,
    method,
  }
}
`

export const SAVE_ALL_GRAPHQL_RESOURCE = gql`
mutation SaveAllGraphqlResource($graphqlResourceInput: [GraphqlResourceInput], $ignoringNull: Boolean = true) {
  saveAllGraphqlResource(graphqlResourceInput: $graphqlResourceInput, ignoringNull: $ignoringNull) {
    id,
  }
}
`

export const DELETE_MENU_RESOURCE = gql`
  mutation DeleteMenuResourceIds($ids: [ID]) {
    deleteMenuResourceIds(id: $ids)
  }
`


export const DELETE_PERMISSION = gql`
  mutation DeletePermissionIds($ids: [ID]) {
    deletePermissionIds(id: $ids)
  }
`

export function saveMenuResource(data) {
  return apolloClients.main.mutate({
    mutation: SAVE_MENU_RESOURCE,
    variables: {
      menuResourceInput: data
    }
  })
}

export function saveHttpResource(data) {
  return apolloClients.main.mutate({
    mutation: SAVE_HTTP_RESOURCE,
    variables: {
      httpResourceInput: data
    }
  })
}

export function handleHttpDisconnect(data) {
  return apolloClients.main.mutate({
    mutation: SAVE_HTTP_RESOURCE,
    variables: {
      httpResourceInput: data,
      ignoringNull: false
    }
  })
}

export function handleGraphqlDisconnect(data) {
  return apolloClients.main.mutate({
    mutation: SAVE_GRAPHQL_RESOURCE,
    variables: {
      graphqlResourceInput: data,
      ignoringNull: false
    }
  })
}

export function saveGraphqlResource(data) {
  return apolloClients.main.mutate({
    mutation: SAVE_GRAPHQL_RESOURCE,
    variables: {
      graphqlResourceInput: data
    }
  })
}

export function saveAllHttpResource(data = []) {
  return apolloClients.main.mutate({
    mutation: SAVE_ALL_HTTP_RESOURCE,
    variables: {
      httpResourceInput: data
    }
  })
}

export function saveAllGraphqlResource(data = []) {
  return apolloClients.main.mutate({
    mutation: SAVE_ALL_GRAPHQL_RESOURCE,
    variables: {
      graphqlResourceInput: data
    }
  })
}

export function deleteMenuResource(ids) {
  return apolloClients.main.mutate({
    mutation: DELETE_MENU_RESOURCE,
    variables: {
      ids
    }
  })
}


export function deletePermission(ids) {
  return apolloClients.main.mutate({
    mutation: DELETE_PERMISSION,
    variables: {
      ids
    }
  })
}

