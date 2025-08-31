<template>
  <NForm :model="escalationData" size="small">
    <NFormItem label="升级引用" path="escalationRef">
      <NSelect
        v-model:value="escalationData.escalationRef" placeholder="选择或创建升级引用" filterable tag
        :options="escalationRefOptions" @update:value="updateEscalationRef"
      />
    </NFormItem>
    <NFormItem v-show="escalationData.escalationRef !== 'none'" label="升级名称" path="name">
      <NInput v-model:value="escalationData.name" placeholder="请输入升级名称" @blur="updateEscalationName(escalationData.name)" />
    </NFormItem>
    <NFormItem v-show="escalationData.escalationRef !== 'none'" label="升级代码" path="escalationCode">
      <NInput v-model:value="escalationData.escalationCode" placeholder="请输入升级代码" @blur="updateEscalationCode(escalationData.escalationCode)" />
    </NFormItem>
    <NFormItem v-if="showVariable" v-show="escalationData.escalationRef !== 'none'" label="代码变量" path="codeVariable">
      <NInput v-model:value="escalationData.codeVariable" placeholder="请输入代码变量" @blur="updateCodeVariable(escalationData.codeVariable)" />
      <template #feedback>
        触发时把升级代码写入流程变量(代码变量)
      </template>
    </NFormItem>
  </NForm>
</template>

<script setup>
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
} from 'naive-ui'
import { reactive, ref } from 'vue'

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
  showVariable: {
    type: Boolean,
    default: true,
  },
})

const elementRegistry = props.bpmnModeler.get('elementRegistry')
const definitions = props.bpmnModeler.getDefinitions()
const modeling = props.bpmnModeler.get('modeling')
const bpmnFactory = props.bpmnModeler.get('bpmnFactory')
const element = elementRegistry.get(props.selectedElement.id)

// 升级数据模型
const escalationData = reactive({
  name: '',
  escalationCode: '',
  codeVariable: '',
  escalationRef: 'none',
})

// 初始化数据
escalationData.name = props.bo.escalationRef?.name || ''
escalationData.escalationCode = props.bo.escalationRef?.escalationCode || ''
escalationData.codeVariable = props.bo.escalationCodeVariable || ''
escalationData.escalationRef = props.bo.escalationRef?.id || 'none'

function getAllEscalations() {
  const definitions = props.bpmnModeler.getDefinitions()
  return definitions.rootElements
    .filter(el => el.$type === 'bpmn:Escalation')
    .map(escalation => ({
      label: escalation.name || escalation.id, // 如果没有 name，就用 id
      value: escalation.id,
    }))
}

// 升级引用选项
const escalationRefOptions = ref([
  { label: 'none', value: 'none' },
  { label: '创建升级', value: 'createEscalation' },
  ...getAllEscalations(),
])

// 更新升级引用
function updateEscalationRef(value) {
  if (value === 'none') {
    escalationData.name = ''
    escalationData.escalationCode = ''
    escalationData.codeVariable = ''
    // 清除升级引用
    modeling.updateModdleProperties(element, props.bo, {
      escalationRef: null,
    })
  }
  else if (value === 'createEscalation') {
    const newEscalation = bpmnFactory.create('bpmn:Escalation')
    escalationData.name = newEscalation.id
    escalationData.escalationCode = ''
    escalationData.codeVariable = ''
    escalationData.escalationRef = newEscalation.id
    newEscalation.name = newEscalation.id
    definitions.get('rootElements').push(newEscalation)
    modeling.updateModdleProperties(element, props.bo, {
      escalationRef: newEscalation,
    })
    escalationRefOptions.value.push({ value: newEscalation.id, label: newEscalation.id })
  }
  else {
    // 选择已存在的升级
    const existingEscalation = definitions.rootElements.find(el =>
      el.$type === 'bpmn:Escalation' && el.id === value,
    )
    if (existingEscalation) {
      escalationData.name = existingEscalation.name || existingEscalation.id
      escalationData.escalationCode = existingEscalation.escalationCode || ''
      escalationData.codeVariable = existingEscalation.codeVariable || ''
      escalationData.escalationRef = value
      modeling.updateModdleProperties(element, props.bo, {
        escalationRef: existingEscalation,
      })
    }
  }
}

// 更新升级名称
function updateEscalationName(value) {
  const escalationRef = props.bo.escalationRef
  if (escalationRef) {
    escalationData.name = value
    modeling.updateModdleProperties(element, escalationRef, {
      name: value,
    })
    // 更新选项列表中的显示名称
    const optionIndex = escalationRefOptions.value.findIndex(opt => opt.value === escalationRef.id)
    if (optionIndex !== -1) {
      escalationRefOptions.value[optionIndex].label = value || escalationRef.id
    }
  }
}

// 更新升级代码
function updateEscalationCode(value) {
  const escalationRef = props.bo.escalationRef
  if (escalationRef) {
    escalationData.escalationCode = value
    modeling.updateModdleProperties(element, escalationRef, {
      escalationCode: value,
    })
  }
}

// 更新代码变量
function updateCodeVariable(value) {
  escalationData.codeVariable = value
  modeling.updateModdleProperties(element, props.bo, {
    'camunda:escalationCodeVariable': value,
  })
}
</script>
