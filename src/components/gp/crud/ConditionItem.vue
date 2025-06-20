<template>
  <div class="flex items-center gap-2" :class="sizeClass">
    <label v-if="label || label === 0" class="flex-shrink-0" :style="{ width: `${labelWidth}px` }">
      {{ label }}
    </label>
    <div class="flex items-center border rounded transition-colors hover:border-primary" :style="{ width: `${contentWidth}px` }">
      <div class="flex items-center px-2 shadow-[1px_0_0_0_rgb(229,231,235)]">
        <n-dropdown
          trigger="hover"
          :options="operatorOptions"
          @select="handleOperatorSelect"
        >
          <i :class="[getOperatorIcon(selectedOperator), iconSizeClass]" />
        </n-dropdown>
      </div>

      <div class="flex flex-1 items-center">
        <slot :size="size" />
      </div>
    </div>
  </div>
</template>

<script setup>
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
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['tiny', 'small', 'medium', 'large'].includes(value)
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

const sizeClassMap = {
  tiny: 'text-xs',
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
}

const iconSizeClassMap = {
  tiny: 'text-14',
  small: 'text-16',
  medium: 'text-18',
  large: 'text-20',
}

const sizeClass = computed(() => sizeClassMap[props.size])
const iconSizeClass = computed(() => iconSizeClassMap[props.size])

/**
 * 操作符选项
 */
const operatorMap = {
  string: [
    { label: '左包含', key: 'LEFT_LIKE', icon: 'i-fa:TextCaseTitle20Filled' },
    { label: '右包含', key: 'RIGHT_LIKE', icon: 'i-fa:TextChangeCase16Filled' },
    { label: '包含', key: 'LIKE', icon: 'i-fa:TextCaseUppercase20Filled' },
    { label: '等于', key: 'EQ', icon: 'i-fa:equals' },
    { label: '不等于', key: 'NE', icon: 'i-fa:not-equal' },
  ],
  number: [
    { label: '等于', key: 'EQ', icon: 'i-fa:equals' },
    { label: '不等于', key: 'NE', icon: 'i-fa:not-equal' },
    { label: '大于', key: 'GT', icon: 'i-fa:chevron-right' },
    { label: '小于', key: 'LT', icon: 'i-fa:chevron-left' },
  ],
  date: [
    { label: '等于', key: 'EQ', icon: 'i-fa:equals' },
    { label: '不等于', key: 'NE', icon: 'i-fa:not-equal' },
    { label: '大于', key: 'GT', icon: 'i-fa:chevron-right' },
    { label: '小于', key: 'LT', icon: 'i-fa:chevron-left' },
  ],
}

const operatorOptions = computed(() => {
  return (operatorMap[props.type] || []).map(({ label, key, icon }) => ({
    key,
    label: () =>
      h('div', { class: 'flex items-center gap-2' }, [
        h('i', { class: `${icon} text-16` }),
        label,
      ]),
  }))
})

/**
 * 获取 icon class
 */
const getOperatorIcon = (key) => {
  const flat = [...(operatorMap[props.type] || [])]
  return flat.find((item) => item.key === key)?.icon || 'i-fa:equals'
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

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-14 {
  font-size: 14px;
}

.text-16 {
  font-size: 16px;
}

.text-18 {
  font-size: 18px;
}

.text-20 {
  font-size: 20px;
}

.input-wrapper :deep(.n-input),
.input-wrapper :deep(.n-select),
.input-wrapper :deep(.n-date-picker),
.input-wrapper :deep(input),
.input-wrapper :deep(textarea) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}
</style>
