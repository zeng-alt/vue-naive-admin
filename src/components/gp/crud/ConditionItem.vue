<template>
  <div class="flex items-center gap-2">
    <label v-if="label || label === 0" class="flex-shrink-0" :style="{ width: `${labelWidth}px` }">
      {{ label }}
    </label>
    <div class="flex items-center border rounded transition-colors hover:border-primary" :style="{ width: `${contentWidth}px` }">
      <!-- 操作符选择器 -->
      <div class="flex items-center border-r px-2">
        <NDropdown
          trigger="click"
          :options="operatorOptions"
          @select="handleOperatorSelect"
        >
          <NButton text class="px-2">
            <i :class="getOperatorIcon(selectedOperator)" class="text-16" />
          </NButton>
        </NDropdown>
      </div>

      <!-- 输入区域 -->
      <div class="flex flex-1 items-center">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { NButton, NDropdown } from 'naive-ui'
import { computed, h, onMounted, ref, watch } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  labelWidth: {
    type: Number,
    default: 80,
  },
  contentWidth: {
    type: Number,
    default: 220,
  },
  placeholder: {
    type: String,
    default: '请输入',
  },
  type: {
    type: String,
    default: 'string', // string | number | date
  },
  value: {
    type: Object,
    default: () => ({
      operator: 'EQ',
      value: null,
    }),
  },
})

const emit = defineEmits(['update:value'])

const selectedOperator = ref(props.value?.operator || 'EQ')

// 根据字段类型，动态给出可选条件
const operatorOptions = computed(() => {
  if (props.type === 'string') {
    return [
      {
        label: () => h('div', { class: 'flex items-center gap-2' }, [
          h('i', { class: 'i-fa:startWith text-16' }),
          '左包含',
        ]),
        key: 'LEFT_LIKE',
      },
      {
        label: () => h('div', { class: 'flex items-center gap-2' }, [
          h('i', { class: 'i-fa:endWith text-16' }),
          '右包含',
        ]),
        key: 'RIGHT_LIKE',
      },
      {
        label: () => h('div', { class: 'flex items-center gap-2' }, [
          h('i', { class: 'i-fa:contain text-16' }),
          '包含',
        ]),
        key: 'LIKE',
      },
      {
        label: () => h('div', { class: 'flex items-center gap-2' }, [
          h('i', { class: 'i-fa:equals text-16' }),
          '等于',
        ]),
        key: 'EQ',
      },
      {
        label: () => h('div', { class: 'flex items-center gap-2' }, [
          h('i', { class: 'i-fa:not-equal text-16' }),
          '不等于',
        ]),
        key: 'NE',
      },
    ]
  }
  if (props.type === 'number' || props.type === 'date') {
    return [
      {
        label: () => h('div', { class: 'flex items-center gap-2' }, [
          h('i', { class: 'i-fa:equals text-16' }),
          '等于',
        ]),
        key: 'EQ',
      },
      {
        label: () => h('div', { class: 'flex items-center gap-2' }, [
          h('i', { class: 'i-fa:not-equal text-16' }),
          '不等于',
        ]),
        key: 'NE',
      },
      {
        label: () => h('div', { class: 'flex items-center gap-2' }, [
          h('i', { class: 'i-fa:chevron-right text-16' }),
          '大于',
        ]),
        key: 'GT',
      },
      {
        label: () => h('div', { class: 'flex items-center gap-2' }, [
          h('i', { class: 'i-fa:chevron-left text-16' }),
          '小于',
        ]),
        key: 'LT',
      },
    ]
  }
  return []
})

// 获取操作符的图标
function getOperatorIcon(operator) {
  const option = operatorOptions.value.find(opt => opt.key === operator)
  if (!option)
    return 'i-fa:equals'

  if (operator === 'EQ')
    return 'i-fa:equals'
  if (operator === 'NE')
    return 'i-fa:not-equal'
  if (operator === 'GT')
    return 'i-fa:chevron-right'
  if (operator === 'LT')
    return 'i-fa:chevron-left'
  if (operator === 'LEFT_LIKE')
    return 'i-fa:startWith'
  if (operator === 'RIGHT_LIKE')
    return 'i-fa:endWith'
  if (operator === 'LIKE')
    return 'i-fa:contain'
  return 'i-fa:equals'
}

// 处理操作符选择
function handleOperatorSelect(key) {
  selectedOperator.value = key
  emitUpdate()
}

// 双向同步
watch(() => props.value, (val) => {
  if (val) {
    selectedOperator.value = val.option || 'EQ'
  }
}, { deep: true, immediate: true })

// 统一抛出更新
function emitUpdate() {
  emit('update:value', {
    ...props.value,
    option: selectedOperator.value,
  })
}

// 组件挂载时确保有初始值
onMounted(() => {
  if (!selectedOperator.value) {
    selectedOperator.value = 'EQ'
  }
})
</script>

<style scoped>
.n-button {
  --n-height: 28px;
  --n-padding: 0 8px;
}

:deep(.n-dropdown-menu) {
  min-width: 100px !important;
}
</style>
