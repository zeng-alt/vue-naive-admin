/**********************************
 * @Description: 入口文件
 * @FilePath: main.js
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/04 22:41:32
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { createApp, provide } from 'vue'
import App from './App.vue'
import { setupDirectives } from './directives'

import { setupRouter } from './router'
import { setupStore, useAuthStore } from './store'
import { setupNaiveDiscreteApi, apolloProvider } from './utils'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import '@/styles/reset.css'
import '@/styles/global.css'
import 'uno.css'

const cache = new InMemoryCache()


const { accessToken } = useAuthStore()

const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: "/api/main/graphql",
  headers: {
    Authorization: "Bearer " + "12356",
  },
  // credentials: 'include'
})

const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})

async function bootstrap() {
  const app = createApp(App)
  setupStore(app)
  setupDirectives(app)
  await setupRouter(app)
  app.mount('#app')
  setupNaiveDiscreteApi()
  app.provide(DefaultApolloClient, apolloClient)
  // app.use(apolloProvider)
}

bootstrap()
