<template>
  <div class="flex flex-col">
    <n-input
      v-if="type === 'String'"
      type="text"
      :value="value"
      :placeholder="placeholder"
      :label-width="labelWidth"
      clearable
      @update:value="handleValueUpdate"
    />
    <n-input
      v-else-if="type === 'Number'"
      type="number"
      :value="value"
      :placeholder="placeholder"
      :label-width="labelWidth"
      clearable
      @update:value="handleValueUpdate"
    />
    <n-select
      v-else-if="type === 'Boolean'"
      :value="value"
      :options="[
        { label: '是', value: true },
        { label: '否', value: false },
      ]"
      :placeholder="placeholder"
      :label-width="labelWidth"
      clearable
      @update:value="handleValueUpdate"
    />
    <n-select
      v-else-if="type === 'Enum'"
      :value="value"
      :options="enumOptions"
      :placeholder="placeholder"
      :label-width="labelWidth"
      clearable
      @update:value="handleValueUpdate"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { fetchDictData } from '@/apollo'

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
    default: undefined,
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

const emit = defineEmits(['update:value'])

const enumOptions = ref([])

function handleValueUpdate(newValue) {
  emit('update:value', newValue)
}

async function loadDictData() {
  if (props.type === 'Enum' && props.dict) {
    try {
      const res = await fetchDictData(props.dict)
      enumOptions.value = res.data.map(item => ({
        label: item.label,
        value: item.value,
      }))
    }
    catch (error) {
      console.error('获取枚举数据失败:', error)
    }
  }
}

onMounted(() => {
  loadDictData()
})
</script>
