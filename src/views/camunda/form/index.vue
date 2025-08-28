<!-- src/App.vue -->

<template>
  <div style="height: 100%;">
    <VueformBuilder ref="builder$" :builder-locale="builderLocale" @save="handleSave"/>
  </div>
</template>

<script setup>
import {NSpace, NButton } from 'naive-ui'
import { ref } from 'vue'

const builder$ = ref()

const builderLocale = ref('zh_CN')

const changeLocale = (locale) => {
  builderLocale.value = locale
}

const handleSave = (builderObject, history) => {
  console.log(builderObject);
  console.log(history);
}

function save() {
  const builder = builder$.value.builder
  const history = builder$.value.History.history
  console.log(builder);
  console.log(history);
}
</script>

