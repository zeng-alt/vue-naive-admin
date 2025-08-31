<template>
  <NForm size="small" :model="compensateData">
    <NFormItem label="是否等待子流程完成" path="waitForCompletion">
      <NSwitch
        v-model:value="compensateData.waitForCompletion"
        @update:value="updateWaitForCompletion"
      />
    </NFormItem>
    <NFormItem label="定向补偿id" path="activityRef">
      <NSelect
        v-model:value="compensateData.activityRef"
        placeholder="请选择定向补偿活动"
        :options="activityOptions"
        clearable
        filterable
        @update:value="updateActivityRef"
      />
    </NFormItem>
  </NForm>
</template>

<script setup>
import { NForm, NFormItem, NSelect, NSwitch } from 'naive-ui'
import { computed, reactive } from 'vue'

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
const element = elementRegistry.get(props.selectedElement.id)

// 补偿数据模型
const compensateData = reactive({
  activityRef: 'none',
  waitForCompletion: true,
})

// 获取可用的活动选项
const activityOptions = computed(() => {
  const options = [
    {
      label: '补偿所有已完成活动',
      value: 'none',
    },
  ]
  const rootElements = definitions.rootElements

  rootElements.forEach((rootElement) => {
    if (rootElement.flowElements) {
      rootElement.flowElements.forEach((flowElement) => {
        // 只显示可以作为补偿目标的活动（任务、子流程等）
        if (isCompensatableActivity(flowElement)) {
          options.push({
            label: flowElement.name || flowElement.id,
            value: flowElement.id,
          })
        }
      })
    }
  })

  return options
})

// 判断是否为可补偿的活动
function isCompensatableActivity(element) {
  const compensatableTypes = [
    'bpmn:Task',
    'bpmn:UserTask',
    'bpmn:ServiceTask',
    'bpmn:ScriptTask',
    'bpmn:BusinessRuleTask',
    'bpmn:SendTask',
    'bpmn:ReceiveTask',
    'bpmn:ManualTask',
    'bpmn:SubProcess',
    'bpmn:CallActivity',
  ]

  return compensatableTypes.includes(element.$type) && element.id !== props.selectedElement.id
}

// 初始化数据
function initializeData() {
  if (props.bo) {
    // 从业务对象中读取现有的补偿配置
    compensateData.waitForCompletion = props.bo.waitForCompletion !== false // 默认为true
    compensateData.activityRef = props.bo.activityRef || 'none'
  }
}

// 更新等待完成标志
function updateWaitForCompletion(value) {
  if (value) {
    modeling.updateModdleProperties(element, props.bo, {
      waitForCompletion: undefined,
    })
  }
  else {
    modeling.updateModdleProperties(element, props.bo, {
      waitForCompletion: value,
    })
  }
}

// 更新活动引用
function updateActivityRef(value) {
  const properties = {}

  if (value !== 'none') {
    properties.activityRef = elementRegistry.get(value)?.businessObject
  }
  else {
    // 清除引用
    properties.activityRef = undefined
  }

  modeling.updateModdleProperties(element, props.bo, properties)
}

// 组件挂载时初始化
initializeData()
</script>
