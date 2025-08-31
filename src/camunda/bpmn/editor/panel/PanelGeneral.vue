<script setup>
import {
  NForm,
  NFormItem,
  NInput,
} from 'naive-ui'
import { reactive } from 'vue'

const props = defineProps({
  element: Object,
  bpmnModeler: Object,
})

const emit = defineEmits(['updateName'])

const modeling = props.bpmnModeler.get('modeling')
const moddle = props.bpmnModeler.get('moddle')
const elementRegistry = props.bpmnModeler.get('elementRegistry')

const currentElement = elementRegistry.get(props.element.id)
const bo = currentElement.businessObject

// 表单数据
const formData = reactive({
  name: '',
  id: '',
  documentation: '',
})

function updateDocumentation(val) {
  if (val) {
    const newDocumentation = moddle.create('bpmn:Documentation', {
      text: val,
    })

    // 使用 modeling 更新元素的 documentation
    modeling.updateProperties(props.element, {
      documentation: [newDocumentation],
    })
  }
  else {
    // 使用 modeling 删除元素的 documentation
    modeling.updateProperties(props.element, {
      documentation: [],
    })
  }
}

function updateName(val) {
  modeling.updateLabel(props.element, val)
  formData.name = val
  emit('updateName', val)
}

function updateId(val) {
  const commandStack = props.bpmnModeler.get('commandStack')

  commandStack.execute('element.updateProperties', {
    element: props.element,
    properties: { id: val },
  })

  formData.id = val
}

function initializeData() {
  formData.id = bo.id
  formData.name = bo.name || ''
  formData.documentation = bo.documentation?.[0]?.text || ''
}

initializeData()
</script>

<template>
  <NForm size="small" :model="formData">
    <NFormItem label="名称" path="name">
      <NInput id="name" type="textarea" :rows="1" :value="formData.name" size="small" @update:value="updateName" />
    </NFormItem>

    <NFormItem label="ID" path="id">
      <NInput id="id" :value="formData.id" size="small" @update:value="updateId" />
    </NFormItem>

    <NFormItem label="文档" path="documentation">
      <NInput
        id="documentation" v-model:value="formData.documentation" type="textarea" size="small"
        @blur="updateDocumentation(formData.documentation)"
      />
    </NFormItem>
  </NForm>
</template>
