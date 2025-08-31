<template>
  <div v-if="!isCondition && !isDefault" style="display: flex; align-items: center">
    <NIcon size="30">
      <span class="bpmn-icon-connection" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px">
      <span style="font-size: 12px">顺序流</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <div v-if="isCondition" style="display: flex; align-items: center">
    <NIcon size="30">
      <span class="bpmn-icon-conditional-flow" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px">
      <span style="font-size: 12px">条件流</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <div v-if="isDefault && !isCondition" style="display: flex; align-items: center">
    <NIcon size="30">
      <span class="bpmn-icon-default-flow" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px">
      <span style="font-size: 12px">默认流</span>
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
      <FlowConditionPanel v-if="showCondition" ref="flowRef" v-model:condition="isCondition" :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
    </NTabPane>
    <NTabPane name="executionListeners" tab="执行监听器">
      <NScrollbar style="max-height: 600px">
        <ExecutionListeners
          :element="element"
          :bpmn-modeler="bpmnModeler"
          :event-options="[
            { label: '采取', value: 'take' },
          ]"
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
import ExecutionListeners from '../panel/ExecutionListeners.vue'
import ExtensionProperties from '../panel/ExtensionProperties.vue'
import PanelGeneral from '../panel/PanelGeneral.vue'
import FlowConditionPanel from './FlowConditionPanel.vue'

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
const flowRef = ref(null)
const elementRegistry = props.bpmnModeler.get('elementRegistry')
const element = elementRegistry.get(props.selectedElement.id)
const bo = element.businessObject
// 用响应式变量保存最新的name，供模板或其他逻辑使用
const name = ref(element.businessObject.name)
const isCondition = ref(needsConditionExpression(element))
const showCondition = showConditionExpression(element)
const isDefault = ref(isDefaultFlow(element))
function onUpdateName(newName) {
  name.value = newName
}

const eventBus = props.bpmnModeler.get('eventBus')

eventBus.on('commandStack.element.updateProperties.postExecute', (event) => {
  const { context } = event
  const e = context.element
  if (e.type === 'bpmn:SequenceFlow' && e.id === props.selectedElement.id) {
    isDefault.value = isDefaultFlow(e)
    isCondition.value = needsConditionExpression(e)
    if (isDefault.value) {
      flowRef.value?.updateType('none')
    }
    if (isCondition.value) {
      flowRef.value?.updateType('expression')
    }
  }
})

function showConditionExpression(sequenceFlow) {
  if (!sequenceFlow || sequenceFlow.type !== 'bpmn:SequenceFlow') {
    return false
  }

  const source = sequenceFlow.source
  if (!source) {
    return false
  }

  return source.type !== 'bpmn:ParallelGateway'
    && source.type !== 'bpmn:IntermediateThrowEvent'
    && source.type !== 'bpmn:StartEvent'
    && source.type !== 'bpmn:IntermediateCatchEvent'
}

/**
 * 判断顺序流是否需要添加条件表达式
 * @param {object} sequenceFlow - BPMN顺序流元素
 * @returns {boolean} 是否需要条件
 */
function needsConditionExpression(sequenceFlow) {
  if (!sequenceFlow || sequenceFlow.type !== 'bpmn:SequenceFlow') {
    return false
  }

  const source = sequenceFlow.source
  if (!source) {
    return false
  }

  return bo.conditionExpression !== undefined && bo.conditionExpression != null

  // const sourceType = source.type;
  // const outgoing = source.outgoing || [];

  // // 只有一条出边，不需要条件
  // if (outgoing.length <= 1) {
  //     return false;
  // }

  // // 根据源节点类型判断
  // switch (sourceType) {
  //     // 网关类型
  //     case 'bpmn:ExclusiveGateway':
  //     case 'bpmn:InclusiveGateway':
  //     case 'bpmn:ComplexGateway':
  //         return true;

  //     case 'bpmn:ParallelGateway':
  //     case 'bpmn:EventBasedGateway':
  //         return false;

  //     // 任务节点类型
  //     case 'bpmn:Task':
  //     case 'bpmn:UserTask':
  //     case 'bpmn:ServiceTask':
  //     case 'bpmn:ScriptTask':
  //     case 'bpmn:BusinessRuleTask':
  //     case 'bpmn:SendTask':
  //     case 'bpmn:ReceiveTask':
  //     case 'bpmn:ManualTask':
  //         return true;

  //     // 子流程类型
  //     case 'bpmn:SubProcess':
  //     case 'bpmn:CallActivity':
  //     case 'bpmn:AdHocSubProcess':
  //     case 'bpmn:Transaction':
  //         return true;

  //     // 其他类型默认不需要条件
  //     default:
  //         return false;
  // }
}

/**
 * 检查顺序流是否为默认流
 * @param {object} sequenceFlow - BPMN顺序流元素
 * @returns {boolean} 是否为默认流
 */
function isDefaultFlow(sequenceFlow) {
  const source = sequenceFlow.source
  if (!source) {
    return false
  }

  const businessObject = source.businessObject
  return businessObject.default
    && businessObject.default.id === sequenceFlow.id
}
</script>
