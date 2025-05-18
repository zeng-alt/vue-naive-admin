<template>

  <div class="flex flex-col">
    <n-input
      v-if="type === 'String'"
      type="text"
      :value="value"
      @update:value="handleValueUpdate"
      :placeholder="placeholder"
      :label-width="labelWidth"
      clearable
    />
    <n-input
      v-else-if="type === 'Number'"
      type="number"
      :value="value"
      @update:value="handleValueUpdate"
      :placeholder="placeholder"
      :label-width="labelWidth"
      clearable
    />
    <n-select
      v-else-if="type === 'Boolean'"
      :value="value"
      @update:value="handleValueUpdate"
      :options="[
        { label: '是', value: true },
        { label: '否', value: false },
      ]"
      :placeholder="placeholder"
      :label-width="labelWidth"
      clearable
    />
    <n-select
      v-else-if="type === 'Enum'"
      :value="value"
      @update:value="handleValueUpdate"
      :options="enumOptions"
      :placeholder="placeholder"
      :label-width="labelWidth"
      clearable
    />

  </div>

</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue'
import { fetchDictData } from '@/apollo'

const emit = defineEmits(['update:value'])

const props = defineProps({
  /**
   * @remote true: 后端分页  false： 前端分页
   */
  type: {
    type: String,
    default: 'String',
  },
  dict: {
    type: String,
    default: undefined
  },
  placeholder: {
    type: String,
    default: undefined,
  },
  labelWidth: {
    type: String,
    default: undefined,
  },
  value: {
    type: Object,
    default: undefined,
  },
})

const enumOptions = ref([])

const handleValueUpdate = (newValue) => {
  emit('update:value', newValue)
}

const loadDictData = async () => {
  if (props.type === 'Enum' && props.dict) {
    try {
      const res = await fetchDictData(props.dict)
      enumOptions.value = res.data.map(item => ({
        label: item.label,
        value: item.value
      }))
    } catch (error) {
      console.error('获取枚举数据失败:', error)
    }
  }
}

onMounted(() => {
  loadDictData()
})
</script>