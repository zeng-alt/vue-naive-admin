<template>
  <div class="security-editor-demo">
    <h2>Spring Security SPEL 编辑器</h2>
    <div class="controls">
      <label>
        <input v-model="securityEnabled" type="checkbox">
        启用Spring Security提示
      </label>
    </div>
    <SpelEditor
      v-model="securityExpression"
      height="400px"
      :security-enabled="securityEnabled"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { SpelEditor } from '@/components'

const securityExpression = ref('hasRole(\'ADMIN\') and isFullyAuthenticated()')
const securityEnabled = ref(true)

function insertExample(example) {
  securityExpression.value = example
}
</script>

<style>
</style>
