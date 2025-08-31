<template>
  <NForm size="small">
    <NFormItem label="链接名称">
      <NInput v-model:value="linkName" placeholder="请输入链接名称" @blur="updateLinkName(linkName)" />
    </NFormItem>
  </NForm>
</template>

<script lang="ts" setup>
import {
  NForm,
  NFormItem,
  NInput,
} from 'naive-ui'
import { ref } from 'vue'

const props = defineProps({
  selectedElement: {
    type: Object,
    default: null,
  },
  bpmnModeler: {
    type: Object,
    default: null,
  },
  bo: {
    type: Object,
    default: null,
  },
})
const elementRegistry = props.bpmnModeler.get('elementRegistry')
const modeling = props.bpmnModeler.get('modeling')
const element = elementRegistry.get(props.selectedElement.id)
// 消息数据模型
const linkName = ref('')

linkName.value = props.bo.name

function updateLinkName(value: string) {
  modeling.updateModdleProperties(element, props.bo, {
    name: value,
  })
}
</script>
