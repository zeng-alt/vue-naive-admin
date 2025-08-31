<template>
  <div v-if="type === 'bpmn:IntermediateThrowEvent'" style="display: flex; align-items: center;">
    <NIcon size="30">
      <span class="bpmn-icon-intermediate-event-none" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">中间抛出事件</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <div v-if="type === 'bpmn:MessageEventDefinition'" style="display: flex; align-items: center;">
    <NIcon size="30">
      <span class="bpmn-icon-intermediate-event-throw-message" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">消息中间抛出事件</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <div v-if="type === 'bpmn:EscalationEventDefinition'" style="display: flex; align-items: center;">
    <NIcon size="30">
      <span class="bpmn-icon-intermediate-event-throw-escalation" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">升级中间抛出事件</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <div v-if="type === 'bpmn:LinkEventDefinition'" style="display: flex; align-items: center;">
    <NIcon size="30">
      <span class="bpmn-icon-intermediate-event-throw-link" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">链接中间抛出事件</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <div v-if="type === 'bpmn:CompensateEventDefinition'" style="display: flex; align-items: center;">
    <NIcon size="30">
      <span class="bpmn-icon-intermediate-event-throw-compensation" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">补偿中间抛出事件</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <div v-if="type === 'bpmn:SignalEventDefinition'" style="display: flex; align-items: center;">
    <NIcon size="30">
      <span class="bpmn-icon-intermediate-event-throw-signal" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">信号中间抛出事件</span>
      <span>{{ name }}</span>
    </div>
  </div>

  <NTabs type="bar" animated>
    <NTabPane name="base" tab="常规">
      <PanelGeneral :element="element" :bpmn-modeler="bpmnModeler" @update-name="onUpdateName" />
      <AsyncContinuations :element="selectedElement" :bpmn-modeler="bpmnModeler" :show-job="false" />
    </NTabPane>
    <NTabPane v-if="type === 'bpmn:MessageEventDefinition'" name="implementation" tab="实现者">
      <ImplementationPanel
        :bo="extensionElement" :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" :implementation-type-options="[
          { label: '无实现', value: 'none' },
          { label: 'Java类', value: 'class' },
          { label: '表达式', value: 'expression' },
          { label: '委托表达式', value: 'delegateExpression' },
          { label: '外部任务', value: 'external' },
          { label: '连接器', value: 'connector' },
        ]"
      />
    </NTabPane>
    <NTabPane v-if="type === 'bpmn:LinkEventDefinition'" name="link" tab="链接">
      <LinkPanel :bo="extensionElement" :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
    </NTabPane>
    <NTabPane v-if="type === 'bpmn:SignalEventDefinition'" name="signal" tab="信号量">
      <SignalPanel :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
    </NTabPane>
    <NTabPane v-if="type === 'bpmn:CompensateEventDefinition'" name="compensate" tab="补偿">
      <CompensatePanel :bo="extensionElement" :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
    </NTabPane>
    <NTabPane v-if="type === 'bpmn:EscalationEventDefinition'" name="escalation" tab="升级">
      <EscalationPanel :bo="extensionElement" :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" :show-variable="false" />
    </NTabPane>
    <NTabPane v-if="type === 'bpmn:MessageEventDefinition'" name="message" tab="消息">
      <MessagePanel :bo="extensionElement" :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
    </NTabPane>
    <NTabPane name="inputs" tab="输入参数">
      <NScrollbar style="max-height: 600px">
        <Inputs :element="element" :modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
    <NTabPane name="outputs" tab="输出参数">
      <NScrollbar style="max-height: 600px">
        <Outputs :element="element" :modeler="bpmnModeler" />
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
    <NTabPane v-if="type === 'bpmn:MessageEventDefinition'" name="field" tab="扩展字段">
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
import AsyncContinuations from '../panel/AsyncContinuations.vue'
import ExecutionListeners from '../panel/ExecutionListeners.vue'
import ExtensionProperties from '../panel/ExtensionProperties.vue'
import Inputs from '../panel/Inputs.vue'
import Outputs from '../panel/Outputs.vue'
import PanelGeneral from '../panel/PanelGeneral.vue'
import CompensatePanel from './CompensatePanel.vue'
import EscalationPanel from './EscalationPanel.vue'
import FieldInjectionsPanel from './FieldInjectionsPanel.vue'
import ImplementationPanel from './ImplementationPanel.vue'
import LinkPanel from './LinkPanel.vue'
import MessagePanel from './MessagePanel.vue'
import SignalPanel from './SignalPanel.vue'

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
const type = ref('bpmn:IntermediateThrowEvent')
const extensionElement = ref(undefined)

if (bo.eventDefinitions && bo.eventDefinitions.length > 0) {
  type.value = bo.eventDefinitions[0].$type
  extensionElement.value = bo.eventDefinitions[0]
}

const eventBus = props.bpmnModeler.get('eventBus')

eventBus.on('commandStack.element.updateProperties.postExecute', (event) => {
  const { context } = event
  const e = context.element
  if (e.type === 'bpmn:IntermediateThrowEvent' && e.id === props.selectedElement.id) {
    type.value = e.type
    if (e.businessObject?.eventDefinitions && e.businessObject?.eventDefinitions.length > 0) {
      type.value = e.businessObject.eventDefinitions[0].$type
      extensionElement.value = e.businessObject.eventDefinitions[0]
    }
  }
})

function onUpdateName(newName) {
  name.value = newName
}
</script>
