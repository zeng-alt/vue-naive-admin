<template>
  <NForm size="small" :model="completion">
    <NFormItem label="取消剩余实例" path="cancelRemainingInstances">
      <NSwitch
        v-model:value="completion.cancelRemainingInstances"
        @update:value="updateCancelRemainingInstances"
      />
    </NFormItem>
    <NFormItem label="完成条件" path="completionCondition">
      <NInput
        v-model:value="completion.completionCondition"
        placeholder="请选择定向补偿活动"
        clearable
        @blur="updateCompletionCondition(completion.completionCondition)"
      />
    </NFormItem>
  </NForm>
</template>

<script setup>
import { NForm, NFormItem, NInput, NSwitch } from 'naive-ui'
import { reactive } from 'vue'

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
const modeling = props.bpmnModeler.get('modeling')
const moddle = props.bpmnModeler.get('moddle')
const element = elementRegistry.get(props.selectedElement.id)

// 补偿数据模型
const completion = reactive({
  cancelRemainingInstances: true,
  completionCondition: '',
})

// 初始化数据
function initializeData() {
  if (props.bo) {
    // 从业务对象中读取现有的补偿配置
    completion.cancelRemainingInstances = props.bo.cancelRemainingInstances !== false // 默认为true
  }
  if (props.bo.completionCondition) {
    completion.completionCondition = props.bo.completionCondition.body
  }
}

function updateCancelRemainingInstances(value) {
  if (value) {
    modeling.updateProperties(element, {
      cancelRemainingInstances: undefined,
    })
  }
  else {
    modeling.updateProperties(element, {
      cancelRemainingInstances: value,
    })
  }
}

function updateCompletionCondition(value) {
  if (props.bo.completionCondition) {
    modeling.updateModdleProperties(
      element,
      props.bo.completionCondition,
      { body: value },
    )
  }
  else {
    // 如果还不存在，就创建一个新的 FormalExpression
    const formalExpression = moddle.create('bpmn:FormalExpression', {
      body: value,
    })

    modeling.updateProperties(element, {
      completionCondition: formalExpression,
    })
  }
}

// 组件挂载时初始化
initializeData()
</script>
