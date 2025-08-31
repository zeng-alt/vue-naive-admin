<template>
  <div style="display: flex; align-items: center">
    <NIcon v-if="isExpanded" size="30">
      <span class="bpmn-icon-subprocess-expanded" />
    </NIcon>
    <NIcon v-else-if="!isExpanded" size="30">
      <span class="bpmn-icon-subprocess-collapsed" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px">
      <span style="font-size: 12px">临时子流程({{ isExpanded ? '展开' : '折叠' }})</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <NTabs type="bar" animated>
    <NTabPane name="base" tab="常规">
      <PanelGeneral
        :element="element"
        :bpmn-modeler="bpmnModeler"
        @update-name="onUpdateName"
      />
      <AsyncContinuations
        :element="selectedElement"
        :bpmn-modeler="bpmnModeler"
        :show-job="false"
      />
    </NTabPane>
    <NTabPane name="completion" tab="完成">
      <CompletionPanel :selected-element="element" :bpmn-modeler="bpmnModeler" :bo="bo" />
    </NTabPane>
    <NTabPane name="inputs" tab="输入参数">
      <NScrollbar style="max-height: 600px">
        <Inputs :element="element" :modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
    <NTabPane name="Onputs" tab="输出参数">
      <NScrollbar style="max-height: 600px">
        <Outputs :element="element" :modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
    <NTabPane name="executionListeners" tab="执行监听器">
      <NScrollbar style="max-height: 600px">
        <ExecutionListeners
          :element="element"
          :bpmn-modeler="bpmnModeler"
        />
      </NScrollbar>
    </NTabPane>
    <NTabPane name="extensionProperties" tab="扩展属性">
      <NScrollbar style="max-height: 600px">
        <ExtensionProperties
          :element="element"
          :bpmn-modeler="bpmnModeler"
        />
      </NScrollbar>
    </NTabPane>
  </NTabs>
</template>

<script setup>
import { NIcon, NScrollbar, NTabPane, NTabs } from 'naive-ui'
import { ref } from 'vue'
import AsyncContinuations from '../panel/AsyncContinuations.vue'
import ExecutionListeners from '../panel/ExecutionListeners.vue'
import ExtensionProperties from '../panel/ExtensionProperties.vue'
import Inputs from '../panel/Inputs.vue'
import Outputs from '../panel/Outputs.vue'
import PanelGeneral from '../panel/PanelGeneral.vue'
import CompletionPanel from './CompletionPanel.vue'

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
const element = elementRegistry.get(props.selectedElement.id)
const triggeredByEvent = ref(element.businessObject.triggeredByEvent)
const bo = element.businessObject
// 用响应式变量保存最新的name，供模板或其他逻辑使用
const name = ref(element.businessObject.name)
const isExpanded = ref<boolean>(isExpandedFunc())

function onUpdateName(newName) {
  name.value = newName
}

const eventBus = props.bpmnModeler.get('eventBus')

function isExpandedFunc() {
  if (!props.selectedElement || !props.bpmnModeler)
    return false

  // 通过DI图形信息检查isExpanded属性
  const definitions = props.bpmnModeler.getDefinitions()
  let isExpanded = false

  if (definitions.diagrams) {
    definitions.diagrams.forEach((diagram) => {
      if (diagram.plane && diagram.plane.planeElement) {
        diagram.plane.planeElement.forEach((shape) => {
          if (shape.bpmnElement && shape.bpmnElement.id === props.selectedElement.id) {
            isExpanded = shape.isExpanded === true
          }
        })
      }
    })
  }

  return isExpanded
};

eventBus.on('commandStack.element.updateProperties.postExecute', (event) => {
  const { context } = event
  const e = context.element
  if (e.type === 'bpmn:AdHocSubProcess' && e.id === props.selectedElement.id) {
    triggeredByEvent.value = e.businessObject.triggeredByEvent || false
  }
})
</script>
