<template>
  <div>
    <div v-if="type === 'bpmn:StartEvent'" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-none" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">开始事件 </span>
        <span>{{ name }}</span>
      </div>
    </div>
    <div v-if="type === 'bpmn:MessageEventDefinition' && isInterrupting" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-message" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">消息开始事件</span>
        <span>{{ name }}</span>
      </div>
    </div>
    <div v-if="type === 'bpmn:MessageEventDefinition' && !isInterrupting" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-non-interrupting-message" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">消息开始事件(非中断)</span>
        <span>{{ name }}</span>
      </div>
    </div>
    <div v-if="type === 'bpmn:TimerEventDefinition' && isInterrupting" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-timer" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">定时开始事件</span>
        <span>{{ name }}</span>
      </div>
    </div>
    <div v-if="type === 'bpmn:TimerEventDefinition' && !isInterrupting" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-non-interrupting-timer" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">定时开始事件(非中断)</span>
        <span>{{ name }}</span>
      </div>
    </div>
    <div v-if="type === 'bpmn:SignalEventDefinition' && isInterrupting" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-signal" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">信号开始事件</span>
        <span>{{ name }}</span>
      </div>
    </div>
    <div v-if="type === 'bpmn:SignalEventDefinition' && !isInterrupting" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-non-interrupting-signal" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">信号开始事件(非中断)</span>
        <span>{{ name }}</span>
      </div>
    </div>
    <div v-if="type === 'bpmn:ConditionalEventDefinition' && isInterrupting" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-condition" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">条件开始事件</span>
        <span>{{ name }}</span>
      </div>
    </div>
    <div v-if="type === 'bpmn:ConditionalEventDefinition' && !isInterrupting" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-non-interrupting-condition" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">条件开始事件(非中断)</span>
        <span>{{ name }}</span>
      </div>
    </div>
    <div v-if="type === 'bpmn:EscalationEventDefinition' && isInterrupting" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-escalation" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">升级开始事件</span>
        <span>{{ name }}</span>
      </div>
    </div>
    <div v-if="type === 'bpmn:EscalationEventDefinition' && !isInterrupting" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-non-interrupting-escalation" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">升级开始事件(非中断)</span>
        <span>{{ name }}</span>
      </div>
    </div>
    <div v-if="type === 'bpmn:CompensateEventDefinition'" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-compensation" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">补偿开始事件</span>
        <span>{{ name }}</span>
      </div>
    </div>
    <div v-if="type === 'bpmn:ErrorEventDefinition'" style="display: flex; align-items: center;">
      <NIcon size="30">
        <span class="bpmn-icon-start-event-error" />
      </NIcon>
      <div style="display: flex; flex-direction: column; margin-left: 8px;">
        <span style="font-size: 12px">错误开始事件</span>
        <span>{{ name }}</span>
      </div>
    </div>
    <NTabs type="bar" animated>
      <NTabPane name="base" tab="常规">
        <PanelGeneral :element="element" :bpmn-modeler="bpmnModeler" @update-name="onUpdateName" />
        <NFormItem label="发起人">
          <NSelect
            v-model:value="bo.initiator"
            filterable
            placeholder="选择发起人"
            :options="[
              {
                label: 'Drive My Car',
                value: 'song1',
              },
              {
                label: 'Norwegian Wood',
                value: 'song2',
              }]"
          />
        </NFormItem>
        <AsyncContinuations
          :element="selectedElement"
          :bpmn-modeler="bpmnModeler"
          :show-job="type === 'bpmn:TimerEventDefinition'"
        />
      </NTabPane>
      <NTabPane v-if="type === 'bpmn:MessageEventDefinition'" name="message" tab="消息">
        <MessagePanel :bo="extensionElement" :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
      </NTabPane>
      <NTabPane v-if="type === 'bpmn:ErrorEventDefinition'" name="error" tab="错误">
        <ErrorPanel :bo="extensionElement" :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
      </NTabPane>
      <NTabPane v-if="type === 'bpmn:TimerEventDefinition'" name="time" tab="定时">
        <TimerPanel :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
      </NTabPane>
      <NTabPane v-if="type === 'bpmn:SignalEventDefinition'" name="signal" tab="信号量">
        <SignalPanel :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
      </NTabPane>
      <NTabPane v-if="type === 'bpmn:ConditionalEventDefinition'" name="condition" tab="条件">
        <ConditionPanel :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
      </NTabPane>
      <NTabPane v-if="type === 'bpmn:EscalationEventDefinition'" name="escalation" tab="升级">
        <EscalationPanel :bo="extensionElement" :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
      </NTabPane>
      <NTabPane name="form" tab="表单">
        <NScrollbar style="max-height: 600px">
          <PanelForm :element="element" :modeler="bpmnModeler" />
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
    </NTabs>
  </div>
</template>

<script setup>
import {
  NFormItem,
  NIcon,
  NScrollbar,
  NSelect,
  NTabPane,
  NTabs,
} from 'naive-ui'
import { ref } from 'vue'
import AsyncContinuations from '../panel/AsyncContinuations.vue'
import ExecutionListeners from '../panel/ExecutionListeners.vue'
import ExtensionProperties from '../panel/ExtensionProperties.vue'
import PanelForm from '../panel/PanelForm.vue'
import PanelGeneral from '../panel/PanelGeneral.vue'
import ConditionPanel from './ConditionPanel.vue'
import ErrorPanel from './ErrorPanel.vue'
import EscalationPanel from './EscalationPanel.vue'
import MessagePanel from './MessagePanel.vue'
import SignalPanel from './SignalPanel.vue'
import TimerPanel from './TimerPanel.vue'

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
const type = ref('bpmn:StartEvent')
const extensionElement = ref(undefined)
const bo = element.businessObject
// 用响应式变量保存最新的name，供模板或其他逻辑使用
const name = ref(element.businessObject.name)
const isInterrupting = ref(true)

if (bo.eventDefinitions && bo.eventDefinitions.length > 0) {
  type.value = bo.eventDefinitions[0].$type
  extensionElement.value = bo.eventDefinitions[0]
  isInterrupting.value = bo.isInterrupting ?? true
}

const eventBus = props.bpmnModeler.get('eventBus')

eventBus.on('commandStack.element.updateProperties.postExecute', (event) => {
  const { context } = event
  const e = context.element
  if (e.type === 'bpmn:StartEvent' && e.id === props.selectedElement.id) {
    type.value = e.type
    if (e.businessObject?.eventDefinitions && e.businessObject?.eventDefinitions.length > 0) {
      type.value = e.businessObject.eventDefinitions[0].$type
      extensionElement.value = e.businessObject.eventDefinitions[0]
      isInterrupting.value = e.businessObject.isInterrupting ?? true
    }
  }
})

function onUpdateName(newName) {
  name.value = newName
}
</script>
