<template>
  <i
    id="toggleTheme"
    class="mr-16 cursor-pointer"
    :class="'i-fe:TranslationOutlined'"
    @click="switchLang"
  />
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()

function switchLang() {
  locale.value = locale.value === 'zh_CN' ? 'en_US' : 'zh_CN'
  localStorage.setItem('locale', locale.value)
  window.$message.success(locale.value === 'zh_CN' ? '切换语言成功' : 'Switch language successfully')
}
</script>
