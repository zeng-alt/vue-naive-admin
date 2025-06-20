import { useAuthStore } from '@/store'
import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
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
  const authStore = useAuthStore()
  const accessToken = authStore.accessToken
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  }
})

// 移除 mutation variables 中的 __typename
const removeTypename = (obj) => {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeTypename(item))
  }

  if (typeof obj === 'object') {
    const newObj = {}
    for (const key in obj) {
      if (key !== '__typename') {
        const value = obj[key]
        // 递归处理对象类型的字段
        newObj[key] = removeTypename(value)
      }
    }
    return newObj
  }

  // 处理基本类型（string, number, boolean 等）
  return obj
}

// 创建转换链接
const transformLink = new ApolloLink((operation, forward) => {
  if (operation.query.definitions[0].operation.startsWith('mutation')) {
    operation.variables = removeTypename(operation.variables)
  }
  return forward(operation)
})


let isConfirming = false

// ——— 3. 网络错误拦截：拿到 HTTP status ———
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  // console.warn(`[GraphQL Error Link] Operation: ${operation.operationName}`)

  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Code: ${extensions?.code}`,
      )

      // Example: Handle specific errors globally
      if (extensions?.classification === 'UNAUTHENTICATED' || extensions?.classification === 'FORBIDDEN') {
        // Maybe clear auth state and redirect to login
        console.warn(`[GraphQL Error Link] Unauthorized/Forbidden access detected for ${operation.operationName}.`)
        $message.error(`[GraphQL Error Link] Unauthorized/Forbidden ${message}`)
      } else if (extensions?.classification === 'NOT_FOUND') {
        console.warn(`[GraphQL Error Link] Not found access detected for ${operation.operationName}.`)
      } else if (extensions?.classification === 'BAD_REQUEST') {
        console.warn(`${operation.operationName} - ${message}`)
        window.$notification?.warning({
          title: 'Error',
          content: message,
        })
      } else if (extensions?.classification === 'INTERNAL_ERROR') {
        window.$message?.error('服务器发生异常: ' + message)
      }


      // You could potentially retry based on the error type here using forward(operation)
      const obs = forward(operation)
      if (!obs) {
        // 如果 forward 返回了 null/undefined，可以按需处理或直接返回
        return obs
      }
      return obs.map((response) => {
        // —— 在这里拦截所有响应 —— //
        // console.warn(
        //   `[GQL:${operation.operationName}]`,
        //   `${Date.now() - startTime}ms`,
        //   response,
        // )

        if (response.errors && response.errors.length) {
          // 全局错误处理，例如：
          // yourToast.error(response.errors[0].message)
        }

        return response
      })
    })
    return
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}. Operation: ${operation.operationName}`)
    // const { code, message, needTip } = resolveResError(networkError.statusCode, networkError.message)
    let message = networkError.message
    switch (networkError.statusCode) {
      case 401:
        if (isConfirming)
          return
        isConfirming = true
        $dialog.confirm({
          title: '提示',
          type: 'info',
          content: '登录已过期，是否重新登录？',
          confirm() {
            useAuthStore().logout()
            window.$message?.success('已退出登录')
            isConfirming = false
          },
          cancel() {
            isConfirming = false
          },
        })
        return
      case 403:
        message = `${operation.operationName} 请求被拒绝`
        break
      case 404:
        message = `${operation.operationName} 请求资源或接口不存在`
        break
      case 500:
        message = '服务器发生异常'
        break
      default:
        message = message ?? `【${code}】: 未知异常!`
        break
    }
    window.$message?.error(message)
  }
})

// 4. 响应拦截器
// const responseInterceptorLink = new ApolloLink((operation, forward) => {
//   const startTime = Date.now()
//   const obs = forward(operation)
//   if (!obs) {
//     // 如果 forward 返回了 null/undefined，可以按需处理或直接返回
//     return obs
//   }
//   return obs.map((response) => {
//     // —— 在这里拦截所有响应 —— //
//     console.log(
//       `[GQL:${operation.operationName}]`,
//       `${Date.now() - startTime}ms`,
//       response,
//     )

//     if (response.errors && response.errors.length) {
//       // 全局错误处理，例如：
//       // yourToast.error(response.errors[0].message)
//     }

//     return response
//   })
// })

function createApolloClient(name) {
  const httpLink = createLink(`/${name}`)

  // 按执行顺序依次是：认证 → 响应拦截 → HTTP 请求
  const link = ApolloLink.from([
    authLink,
    transformLink,  // 添加转换链接
    errorLink,
    // responseInterceptorLink,
    httpLink,
  ])

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
    name,
  })

  // return new ApolloClient({
  //   link: authLink.concat(createLink(`/${name}`)),
  //   cache: new InMemoryCache(),
  //   name,
  // })
}

export const apolloClients = {
  main: createApolloClient('main'),
  tenant: createApolloClient('tenant'),
}

// 创建 Vue 插件
export function createApolloProvider() {
  return {
    install(app) {
      // 设置默认客户端（例如使用用户服务作为默认）
      const defaultClient = apolloClients.main
      app.provide(DefaultApolloClient, defaultClient)

      // 提供其他服务的客户端
      app.provide(ApolloClients, {
        default: defaultClient,
        tenant: apolloClients.tenant,
      })
    },
  }
}
