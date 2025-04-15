import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { ApolloClients, DefaultApolloClient } from '@vue/apollo-composable'

// 基础网关地址
const GATEWAY_URL = import.meta.env.VITE_AXIOS_BASE_URL

// 创建 HTTP 链接工厂函数
function createLink(path) {
  return createHttpLink({
    uri: `${GATEWAY_URL}${path}/graphql`,
    credentials: 'include',
  })
}

// 创建认证链接
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

function createApolloClient(name) {
  return new ApolloClient({
    link: authLink.concat(createLink(`/${name}`)),
    cache: new InMemoryCache(),
    name,
  })
}

// 创建 Vue 插件
export function createApolloProvider() {
  return {
    install(app) {
      // 设置默认客户端（例如使用用户服务作为默认）
      const defaultClient = createApolloClient('main')
      app.provide(DefaultApolloClient, defaultClient)

      // 提供其他服务的客户端
      app.provide(ApolloClients, {
        default: defaultClient,
        tenant: createApolloClient('tenant'),
      })
    },
  }
}
