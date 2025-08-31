<template>
  <div style="display: flex; align-items: center;">
    <NIcon size="30">
      <span class="bpmn-icon-text-annotation" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">文本注释</span>
      <span>{{ formData.name }}</span>
    </div>
  </div>
  <NTabs type="bar" animated>
    <NTabPane name="base" tab="常规">
      <NForm size="small" :model="formData">
        <NFormItem label="名称" path="name">
          <NInput id="name" type="textarea" :rows="2" :value="formData.name" size="small" @update:value="updateName" />
        </NFormItem>
        <NFormItem label="ID" path="id">
          <NInput id="id" :value="formData.id" size="small" @update:value="updateId" />
        </NFormItem>

        <NFormItem label="文档" path="documentation">
          <NInput id="documentation" type="textarea" :value="formData.documentation" size="small" @update:value="updateDocumentation" />
        </NFormItem>
      </NForm>
    </NTabPane>
    <NTabPane name="extensionProperties" tab="扩展属性">
      <NScrollbar style="max-height: 600px">
        <ExtensionProperties :element="element" :bpmn-modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
  </NTabs>
</template>

<script setup>
import {
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NScrollbar,
  NTabPane,
  NTabs,
} from 'naive-ui'
import { reactive } from 'vue'
import ExtensionProperties from '../panel/ExtensionProperties.vue'

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

const formData = reactive({
  name: '',
  id: '',
  documentation: '',
})

const elementRegistry = props.bpmnModeler.get('elementRegistry')
const moddle = props.bpmnModeler.get('moddle')
const modeling = props.bpmnModeler.get('modeling')
const element = elementRegistry.get(props.selectedElement.id)

function updateId(val) {
  const commandStack = props.bpmnModeler.get('commandStack')

  commandStack.execute('element.updateProperties', {
    element,
    properties: { id: val },
  })

  formData.id = val
}

function updateDocumentation(val) {
  const newDocumentation = moddle.create('bpmn:Documentation', {
    text: val,
  })

  // 使用 modeling 更新元素的 documentation
  modeling.updateProperties(element, {
    documentation: [newDocumentation],
  })
  formData.documentation = val
}

function updateName(val) {
  formData.name = val
  modeling.updateProperties(element, {
    text: val,
  })
}

function initializeData() {
  formData.id = element.businessObject.id
  formData.name = element.businessObject.text
  formData.documentation = element.businessObject.documentation?.[0]?.text || ''
}
initializeData()
</script>
