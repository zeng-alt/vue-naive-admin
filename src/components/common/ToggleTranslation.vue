<template>
  <i
    id="toggleTheme"
    class="i-fe:TranslationOutlined mr-16 cursor-pointer"

    @click="switchLang"
  />
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { setI18nLanguage } from '@/locales'

const i18n = useI18n()
const { locale } = i18n

async function switchLang() {
  const newLocale = locale.value === 'zh_CN' ? 'en_US' : 'zh_CN'
  await setI18nLanguage(i18n, newLocale)
  window.$message.success(newLocale === 'zh_CN' ? '切换语言成功' : 'Switch language successfully')
}
</script>
