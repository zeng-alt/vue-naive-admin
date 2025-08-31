<template>
  <div style="display: flex; align-items: center;">
    <NIcon size="30">
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 72 72">
        <g fill="#FCEA2B">
          <circle cx="21" cy="17" r="3" />
          <circle cx="55.992" cy="26.324" r="3" />
          <circle cx="29.993" cy="47.008" r="3" />
          <path d="m15.437 27.104l3.081-2.714l4.834-.198l2.969 2.827l.684 3.98l-12.081-.008zm35.054 9.326l3.082-2.714l4.834-.198l2.968 2.827l.685 3.98l-12.082-.007zM24.485 57.112l3.081-2.714l4.835-.198l2.968 2.827l.684 3.98l-12.081-.008z" />
        </g>
        <g fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="2">
          <circle cx="21" cy="17" r="3" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 30s1-4.311 3-5.311s4-1 6 0S27 30 27 30" />
          <circle cx="55.992" cy="26.324" r="3" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M49.992 39.324s1-4.311 3-5.311s4-1 6 0s3 5.31 3 5.31" />
          <circle cx="29.993" cy="47.008" r="3" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M23.993 60.008s1-4.311 3-5.311s4-1 6 0s3 5.31 3 5.31m16.559-39.871C48.333 15.159 42.035 12 35 12c-2.77 0-5.424.49-7.883 1.387m12.316 44.186c8.213-1.604 14.862-7.577 17.427-15.402m-44.773-9.183A23.274 23.274 0 0 0 12 35c0 7.974 4.058 15 10.222 19.127" />
        </g>
      </svg>
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">协作</span>
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
