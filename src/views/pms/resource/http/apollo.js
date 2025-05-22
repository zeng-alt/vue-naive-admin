import gql from 'graphql-tag'
import { apolloClients } from '@/utils/graphql'

export const SAVE_MENU_RESOURCE = gql`
mutation SaveMenuResource($menuResourceInput: MenuResourceInput) {
  saveMenuResource(menuResourceInput: $menuResourceInput) {
    id,
    type
  }
}
`

export const DELETE_MENU_RESOURCE = gql`
  mutation DeleteMenuResourceIds($ids: [Long]) {
    deleteMenuResourceIds(id: $ids)
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

export function deleteMenuResource(ids) {
  return apolloClients.main.mutate({
    mutation: DELETE_MENU_RESOURCE,
    variables: {
      ids
    }
  })
}

