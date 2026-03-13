// vueform.config.(js|ts)

import builder from '@vueform/builder/plugin'
import { defineConfig } from '@vueform/vueform'
import vueform from '@vueform/vueform/dist/vueform'
import en from '@vueform/vueform/locales/en'
import ja from '@vueform/vueform/locales/ja'
import nl from '@vueform/vueform/locales/nl'
import zh_CN from '@vueform/vueform/locales/zh_CN'

import '@vueform/vueform/dist/vueform.css'

export default defineConfig({
  theme: vueform,
  locales: { en, zh_CN, ja, nl },
  locale: 'zh_CN',
  language: 'zh_CN',
  apiKey: '6ymf-gwy6-uqjr-zpk6-bkz1',
  plugins: [
    builder,
  ],
})
