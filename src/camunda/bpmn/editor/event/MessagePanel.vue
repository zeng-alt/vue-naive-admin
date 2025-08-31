<template>
  <NForm :model="messageData" size="small">
    <NFormItem label="消息引用" path="messageRef">
      <NSelect
        v-model:value="messageData.messageRef" placeholder="选择或创建消息引用" filterable tag
        :options="messageRefOptions" @update:value="updateMessageRef"
      />
    </NFormItem>
    <NFormItem v-show="messageData.messageRef !== 'none'" label="消息名称" path="name">
      <NInput v-model:value="messageData.name" placeholder="请输入消息名称" @blur="updateMessageName(messageData.name)" />
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
  bo: {
    type: Object,
    default: null,
  },
})
const elementRegistry = props.bpmnModeler.get('elementRegistry')
const definitions = props.bpmnModeler.getDefinitions()
const modeling = props.bpmnModeler.get('modeling')
const bpmnFactory = props.bpmnModeler.get('bpmnFactory')
const element = elementRegistry.get(props.selectedElement.id)
// 消息数据模型
const messageData = reactive({
  name: '',
  messageRef: 'none',
})

messageData.name = props.bo.messageRef?.name
messageData.messageRef = props.bo.messageRef?.name ?? 'none'

// 消息引用选项
const messageRefOptions = ref([
  { label: 'none', value: 'none' },
  { label: '创建消息', value: 'createMessage' },
])

function loadMessages() {
  const definitions = props.bpmnModeler.getDefinitions()
  messageRefOptions.value = [
    { label: 'none', value: 'none' },
    { label: '创建消息', value: 'createMessage' },
  ]
  if (definitions.rootElements) {
    definitions.rootElements.forEach((rootElement) => {
      if (rootElement.$type === 'bpmn:Message') {
        messageRefOptions.value.push({
          label: `${rootElement.name || rootElement.id}`,
          value: rootElement.id,
        })
      }
    })
  }
}

loadMessages()

// 更新消息引用
function updateMessageRef(value, option) {
  if (value === 'none') {
    messageData.name = ''
    modeling.updateModdleProperties(element, props.bo, {
      messageRef: undefined,
    })
  }
  else if (value === 'createMessage') {
    const newMessage = bpmnFactory.create('bpmn:Message')
    messageData.name = newMessage.id
    messageData.messageRef = newMessage.id
    newMessage.name = newMessage.id
    definitions.get('rootElements').push(newMessage)
    modeling.updateModdleProperties(element, props.bo, {
      messageRef: newMessage,
    })
    messageRefOptions.value.push({ value: newMessage.id, label: newMessage.id })
    loadMessages()
  }
  else {
    messageData.name = String(option.label)
    modeling.updateModdleProperties(element, props.bo, {
      messageRef: getMessages(value),
    })
  }
}

function updateMessageName(value) {
  const messageRef = props.bo.messageRef

  modeling.updateModdleProperties(element, messageRef, {
    name: value,
  })
  loadMessages()
}

function getMessages(id) {
  const definitions = props.bpmnModeler.getDefinitions()
  const messages = definitions.rootElements.filter(e => e.$type === 'bpmn:Message')
  return messages.find(m => m.id === id)
}
</script>
