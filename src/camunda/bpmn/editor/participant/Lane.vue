<template>
  <div style="display: flex; align-items: center;">
    <NIcon size="30">
      <span class="bpmn-icon-lane" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">泳道</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <NTabs type="bar" animated>
    <NTabPane name="base" tab="常规">
      <NForm size="small" :model="formData">
        <NFormItem path="name" label="名称">
          <NInput
            v-model:value="name"
            size="small"
          />
        </NFormItem>
        <NFormItem label="ID" path="id">
          <NInput id="id" :value="formData.id" size="small" @update:value="updateId" />
        </NFormItem>

        <NFormItem label="文档" path="documentation">
          <NInput id="documentation" type="textarea" :value="formData.documentation" size="small" @blur="updateDocumentation(formData.documentation)" />
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
import { reactive, ref, watch } from 'vue'
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
// 用响应式变量保存最新的name，供模板或其他逻辑使用
const name = ref(element.businessObject.name)

function updateId(val) {
  const commandStack = props.bpmnModeler.get('commandStack')

  commandStack.execute('element.updateProperties', {
    element,
    properties: { id: val },
  })

  formData.id = val
}

function updateDocumentation(val) {
  if (val) {
    const newDocumentation = moddle.create('bpmn:Documentation', {
      text: val,
    })

    // 使用 modeling 更新元素的 documentation
    modeling.updateProperties(element, {
      documentation: [newDocumentation],
    })
  }
  else {
    modeling.updateProperties(element, {
      documentation: [],
    })
  }
}

watch(() => name.value, (newName) => {
  modeling.updateProperties(element, {
    name: newName,
  })
})

function initializeData() {
  formData.id = element.businessObject.id
  formData.documentation = element.businessObject.documentation?.[0]?.text || ''
}

initializeData()
</script>
