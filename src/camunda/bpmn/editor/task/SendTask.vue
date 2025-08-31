<template>
  <div style="display: flex; align-items: center;">
    <NIcon size="30">
      <span class="bpmn-icon-send-task" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">发送任务节点</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <NTabs type="line" animated size="small">
    <NTabPane name="base" tab="常规">
      <PanelGeneral :element="element" :bpmn-modeler="bpmnModeler" @update-name="onUpdateName" />
      <AsyncContinuations :element="selectedElement" :bpmn-modeler="bpmnModeler" :show-job="false" />
    </NTabPane>
    <NTabPane name="implementation" tab="实现者">
      <ImplementationPanel
        :bo="bo" :selected-element="selectedElement" :bpmn-modeler="bpmnModeler"
        :implementation-type-options="[
          { label: '无实现', value: 'none' },
          { label: 'Java类', value: 'class' },
          { label: '表达式', value: 'expression' },
          { label: '委托表达式', value: 'delegateExpression' },
          { label: '外部任务', value: 'external' },
          { label: '连接器', value: 'connector' },
        ]"
      />
    </NTabPane>
    <NTabPane name="taskListeners" tab="任务监听器">
      <NScrollbar style="max-height: 600px">
        <TaskListeners :element="element" :modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
    <NTabPane name="executionListeners" tab="执行监听器">
      <NScrollbar style="max-height: 600px">
        <ExecutionListeners :element="element" :bpmn-modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
    <NTabPane name="extensionProperties" tab="扩展属性">
      <NScrollbar style="max-height: 600px">
        <ExtensionProperties :element="element" :bpmn-modeler="bpmnModeler" />
      </NScrollbar>
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
    <NTabPane name="field" tab="扩展字段">
      <NScrollbar style="max-height: 600px">
        <FieldInjectionsPanel :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
  </NTabs>
</template>

<script setup>
import {
  NIcon,
  NScrollbar,
  NTabPane,
  NTabs,
} from 'naive-ui'
import { ref } from 'vue'
import FieldInjectionsPanel from '../event/FieldInjectionsPanel.vue'
import ImplementationPanel from '../event/ImplementationPanel.vue'
import AsyncContinuations from '../panel/AsyncContinuations.vue'
import ExecutionListeners from '../panel/ExecutionListeners.vue'
import ExtensionProperties from '../panel/ExtensionProperties.vue'
import Inputs from '../panel/Inputs.vue'
import Outputs from '../panel/Outputs.vue'
import PanelGeneral from '../panel/PanelGeneral.vue'
import TaskListeners from './TaskListeners.vue'

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
// 用响应式变量保存最新的name，供模板或其他逻辑使用
const name = ref(element.businessObject.name)
const bo = element.businessObject
function onUpdateName(newName) {
  name.value = newName
}
</script>
