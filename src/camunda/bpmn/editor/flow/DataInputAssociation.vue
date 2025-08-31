<template>
  <div style="display: flex; align-items: center;">
    <NIcon size="30">
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 2048 2048">
        <path
          d="M1866.407 206.692s-585.454 298.724-882.844 438.406c63.707 58.178 122.963 120.927 184.437 181.407c-302.353 306.387-604.71 612.769-907.062 919.156c22.172 21.16 44.327 42.309 66.5 63.469c302.352-306.388 604.71-612.738 907.062-919.125c61.588 61.37 122.828 123.086 184.438 184.437c158.845-312.83 447.469-867.75 447.469-867.75z"
          fill="none"
          stroke="currentColor"
          stroke-width="20"
          stroke-dasharray="20,10"
        />
      </svg>
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">数据输入关联</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <NTabs type="bar" animated>
    <NTabPane name="base" tab="常规">
      <NForm size="small" :model="formData">
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
import { reactive, ref } from 'vue'
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
  const newDocumentation = moddle.create('bpmn:Documentation', {
    text: val,
  })

  // 使用 modeling 更新元素的 documentation
  modeling.updateProperties(element, {
    documentation: [newDocumentation],
  })
  formData.documentation = val
}

function initializeData() {
  formData.id = element.businessObject.id
  formData.documentation = element.businessObject.documentation?.[0]?.text || ''
}

initializeData()
</script>
