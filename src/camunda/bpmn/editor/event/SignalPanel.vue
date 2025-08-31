<template>
  <NForm :model="signalData" size="small">
    <NFormItem label="信号引用" path="signalRef">
      <NSelect
        v-model:value="signalData.signalRef" placeholder="选择或创建信号引用" filterable tag :options="signalRefOptions"
        @update:value="updateSignalRef"
      />
    </NFormItem>
    <NFormItem v-show="signalData.signalRef !== 'none'" label="信号名称" path="name">
      <NInput v-model:value="signalData.name" placeholder="请输入信号名称" @blur="updateSignalName(signalData.name)" />
    </NFormItem>
  </NForm>
</template>

<script setup>
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
} from 'naive-ui'
import { reactive, ref } from 'vue'

const props = defineProps({
  selectedElement: {
    type: Object,
    default: null,
  },
  bpmnModeler: {
    type: Object,
    default: null,
  },
})

const elementRegistry = props.bpmnModeler.get('elementRegistry')
const definitions = props.bpmnModeler.getDefinitions()
const modeling = props.bpmnModeler.get('modeling')
const bpmnFactory = props.bpmnModeler.get('bpmnFactory')
const element = elementRegistry.get(props.selectedElement.id)

// 信号数据模型
const signalData = reactive({
  name: '',
  signalRef: 'none',
})

// 初始化信号数据
signalData.name = props.selectedElement.eventDefinitions?.[0]?.signalRef?.name || ''
signalData.signalRef = props.selectedElement.eventDefinitions?.[0]?.signalRef?.id || 'none'

// 信号引用选项
const signalRefOptions = ref([
  { label: 'none', value: 'none' },
  { label: '创建信号', value: 'createSignal' },
])

function loadSignals() {
  const definitions = props.bpmnModeler.getDefinitions()
  signalRefOptions.value = [
    { label: 'none', value: 'none' },
    { label: '创建信号', value: 'createSignal' },
  ]
  if (definitions.rootElements) {
    definitions.rootElements.forEach((rootElement) => {
      if (rootElement.$type === 'bpmn:Signal') {
        signalRefOptions.value.push({
          label: `${rootElement.name || rootElement.id}`,
          value: rootElement.id,
        })
      }
    })
  }
}

loadSignals()

// 更新信号引用
function updateSignalRef(value, option) {
  if (value === 'none') {
    signalData.name = ''
    modeling.updateModdleProperties(element, props.selectedElement.eventDefinitions?.[0], {
      signalRef: undefined,
    })
  }
  else if (value === 'createSignal') {
    const newSignal = bpmnFactory.create('bpmn:Signal')

    newSignal.name = newSignal.id
    signalData.name = newSignal.name
    signalData.signalRef = newSignal.id

    definitions.get('rootElements').push(newSignal)

    // 创建或更新信号事件定义
    const signalEventDefinition = props.selectedElement.eventDefinitions?.[0]

    modeling.updateModdleProperties(element, signalEventDefinition, {
      signalRef: newSignal,
    })

    signalRefOptions.value.push({ value: newSignal.id, label: newSignal.name })
    loadSignals()
  }
  else {
    // 选择已存在的信号

    signalData.name = String(option.label)
    modeling.updateModdleProperties(element, props.selectedElement.eventDefinitions?.[0], {
      signalRef: getSignal(value),
    })
  }
}

// 更新信号名称
function updateSignalName(value) {
  if (signalData.signalRef !== 'none') {
    const signalRef = props.selectedElement.eventDefinitions?.[0]?.signalRef
    if (signalRef) {
      modeling.updateModdleProperties(element, signalRef, {
        name: value,
      })
      loadSignals()
    }
  }
}

function getSignal(id) {
  const definitions = props.bpmnModeler.getDefinitions()
  const messages = definitions.rootElements.filter(e => e.$type === 'bpmn:Signal')
  return messages.find(m => m.id === id)
}
</script>
