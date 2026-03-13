<!-- src/App.vue -->

<template>
  <VueformBuilder ref="builder$" :builder-locale="builderLocale" @save="handleSave" />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const builder$ = ref()

const builderLocale = ref(locale.value)

function changeLocale(locale) {
  builderLocale.value = locale
}

watch(locale, (newLocale, oldLocale) => {
  changeLocale(newLocale)
})

function handleSave(builderObject, history) {
  console.log(builderObject)
  console.log(history)
}

function save() {
  const builder = builder$.value.builder
  const history = builder$.value.History.history
  console.log(builder)
  console.log(history)
}
</script>
