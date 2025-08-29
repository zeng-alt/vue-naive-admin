/**********************************
 * @Description: 入口文件
 * @FilePath: main.js
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/04 22:41:32
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { createApp } from 'vue'
import App from './App.vue'
import { setupDirectives } from './directives'

import { setupRouter } from './router'
import { setupStore } from './store'
import { createApolloProvider, setupNaiveDiscreteApi } from './utils'
import '@/styles/reset.css'
import '@/styles/global.css'
import 'uno.css'

import Vueform from '@vueform/vueform'
import vueformConfig from './camunda/form/vueform.config.js'
import Builder from '@vueform/builder'
import builderConfig from './camunda/form/builder.config.js'

import { install as VueMonacoEditorPlugin, loader } from '@guolao/vue-monaco-editor'

import { createI18n } from 'vue-i18n'
const messages = {
  en_US: {
    hello: 'Hello World',
    switch: 'Switch Language',
    dynamicForm: 'dynamicForm'
  },
  zh_CN: {
    hello: '你好，世界',
    switch: '切换语言',
    dynamicForm: '动态表单'
  }
}

const i18n = createI18n({
  legacy: false, // Vue3 推荐使用 composition API，所以设为 false
  locale: 'zh_CN',  // 默认语言
  fallbackLocale: 'en_US', // 兜底语言
  messages,
  missing: (locale, key) => key, // 找不到就返回 key
  warnHtmlInMessage: 'off',
  warnFallBack: false // ⚠️ 关键
})

async function bootstrap() {
  const app = createApp(App)
  app.use(i18n)
  app.use(VueMonacoEditorPlugin)
  setupStore(app)
  setupDirectives(app)
  await setupRouter(app)
  app.mount('#app')
  setupNaiveDiscreteApi()
  app.use(createApolloProvider())
  app.use(Vueform, vueformConfig)
  app.use(Builder, builderConfig)
}

bootstrap()




import * as monaco from "monaco-editor"
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker"
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker"
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker"
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker()
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker()
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker()
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

loader.config({ monaco })
