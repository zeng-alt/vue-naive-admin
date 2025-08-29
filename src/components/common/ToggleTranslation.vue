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
  // 切换语言
  console.log('切换语言');
  
  locale.value = locale.value === 'zh_CN' ? 'en_US' : 'zh_CN'
}
</script>
