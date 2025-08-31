/**********************************
 * @Description: 入口文件
 * @FilePath: main.js
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/04 22:41:32
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { loader, install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor'
import Builder from '@vueform/builder'
import Vueform from '@vueform/vueform'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import builderConfig from './camunda/form/builder.config.js'
import vueformConfig from './camunda/form/vueform.config.js'
import { setupDirectives } from './directives'
import { setupBpmn } from './camunda/bpmn/index'

import { setupRouter } from './router'
import { setupStore } from './store'
import { createApolloProvider, setupNaiveDiscreteApi } from './utils'
import { loadLocaleMessages } from './utils/common.js'
import '@/styles/reset.css'
import '@/styles/global.css'

import 'uno.css'

const en_US = await loadLocaleMessages('en_US')
const zh_CN = await loadLocaleMessages('zh_CN')
const messages = {
  en_US,
  zh_CN,
}

const savedLocale = localStorage.getItem('locale') || 'en_US'

const i18n = createI18n({
  legacy: false, // Vue3 推荐使用 composition API，所以设为 false
  locale: savedLocale, // 默认语言
  fallbackLocale: 'en_US', // 兜底语言
  messages,
  missing: (locale, key) => key, // 找不到就返回 key
  warnHtmlInMessage: 'off',
  missingWarn: false, // <== 禁用缺失 key 警告
  fallbackWarn: false, // <== 禁用 fallback 警告
})

async function bootstrap() {
  const app = createApp(App)
  app.use(i18n)
  app.use(VueMonacoEditorPlugin)
  setupStore(app)
  setupDirectives(app)
  setupBpmn(app)
  await setupRouter(app)
  app.mount('#app')
  setupNaiveDiscreteApi()
  app.use(createApolloProvider())
  app.use(Vueform, vueformConfig)
  app.use(Builder, builderConfig)
}

bootstrap()

import * as monaco from 'monaco-editor'
// import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
// import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
// import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
// import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// self.MonacoEnvironment = {
//   getWorker(_, label) {
//     if (label === 'json') {
//       return new jsonWorker()
//     }
//     if (label === 'css' || label === 'scss' || label === 'less') {
//       return new cssWorker()
//     }
//     if (label === 'html' || label === 'handlebars' || label === 'razor') {
//       return new htmlWorker()
//     }
//     if (label === 'typescript' || label === 'javascript') {
//       return new tsWorker()
//     }
//     return new editorWorker()
//   },
// }

loader.config({ monaco })
