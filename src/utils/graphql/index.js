import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { createApolloProvider } from '@vue/apollo-option'
import { DefaultApolloClient } from '@vue/apollo-composable'
// import { useAuthStore } from '@/store'

// const { accessToken } = useAuthStore()

const defaultOptions = {
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  //wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || 'ws://localhost:4000/graphql',
  // LocalStorage token
  //tokenName: accessToken,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,
}
const cache = new InMemoryCache()
const clientMap = new Map();

// 把import.meta.env.VITE_GRAPHQL_BASE_URL list类型转成map类型
// const f = "['/tenant', '/main']"

// 把f转成array类型
const paths = (import.meta.env.VITE_GRAPHQL_BASE_URL).split(',')
// 把paths转成array
// paths.array = JSON.parse(paths.array)
paths.forEach(element => {
  clientMap.set(element.substring(1), new ApolloClient({
    cache,
    defaultOptions,
    uri: element,
  }))
});


// const apolloClient = new ApolloClient({
//   cache,
//   uri: import.meta.env.VITE_GRAPHQL_BASE_URL,
// })


export function createProvider (options = {}) {

  // clientMap

  const apolloProvider = createApolloProvider({
    defaultClient: import.meta.env.VITE_GRAPHQL_BASE_URL.array[0].substring(1),
    clients: clientMap
  })
  return apolloProvider
}

export const apolloProvider = createApolloProvider({})