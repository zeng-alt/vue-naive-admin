<template>
  <n-tag
    v-if="item"
    :type="item.listClass"
    :disabled="item.disabled"
    :round="true"
    :size="size"
  >
    {{ item.label }}
  </n-tag>
  <span v-else>{{ defaultText }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  dictData: {
    type: Array,
    required: true,
  },
  dictKey: {
    type: [String, Number],
    required: true,
  },
  size: {
    type: String,
    default: 'small', // native-ui 支持 'small' | 'medium' | 'large'
  },
  defaultText: {
    type: String,
    default: '-', // 当找不到对应项时显示
  },
})

const item = computed(() =>
  props.dictData.find(el => el.value === props.dictKey),
)
</script>
