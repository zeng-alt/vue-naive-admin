<template>
  <NForm :model="conditionData" size="small">
    <!-- 条件名称 -->
    <NFormItem label="条件名称" path="name">
      <NInput
        v-model:value="conditionData.name" placeholder="请输入条件名称(可选)"
        @blur="updateConditionName(conditionData.name)"
      />
    </NFormItem>
    <NFormItem v-if="showEvent" label="条件事件" path="event">
      <NSelect
        v-model:value="conditionData.event" multiple :options="[
          {
            label: '创建',
            value: 'create',
          },
          {
            label: '更新',
            value: 'update',
          },
          {
            label: '删除',
            value: 'delete',
          },
        ]" @update-value="updateConditionEvent"
      />
    </NFormItem>
    <NFormItem label="条件类型" path="conditionType">
      <NSelect
        v-model:value="conditionData.conditionType" placeholder="选择条件类型"
        :options="conditionTypeOptions" @update:value="updateConditionType"
      />
    </NFormItem>

    <!-- 脚本语言选择 -->
    <NFormItem v-show="conditionData.conditionType === 'script'" label="脚本语言" path="scriptFormat">
      <NSelect
        v-model:value="conditionData.scriptFormat" placeholder="选择脚本语言"
        :options="scriptFormatOptions" @update:value="updateCondition"
      />
    </NFormItem>

    <!-- 表达式/脚本条件 -->
    <NFormItem
      v-show="['expression', 'script'].includes(conditionData.conditionType)"
      :label="conditionData.conditionType === 'script' ? '脚本内容' : '条件表达式'"
      path="expression"
    >
      <NInput
        v-model:value="conditionData.expression" type="textarea"
        :placeholder="conditionData.conditionType === 'script' ? '请输入脚本内容' : '请输入条件表达式'"
        :rows="conditionData.conditionType === 'script' ? 5 : 3"
        @blur="updateCondition"
      />
      <template #feedback>
        {{ conditionData.conditionType === 'script' ? '编写返回布尔值的脚本代码' : '示例: ${amount > 1000} 或 ${status == \'approved\'}' }}
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
  showEvent: {
    type: Boolean,
    default: false,
  },
})

// 提取公共变量
const elementRegistry = props.bpmnModeler.get('elementRegistry')
const modeling = props.bpmnModeler.get('modeling')
const moddle = props.bpmnModeler.get('moddle')
const element = elementRegistry.get(props.selectedElement.id)

// 计算属性：获取当前事件定义
const currentEventDefinition = props.selectedElement.eventDefinitions?.[0]

// 条件数据模型
const conditionData = reactive({
  conditionType: 'none',
  expression: '',
  scriptFormat: 'javascript',
  name: '',
  event: [],
})

// 常量配置
const conditionTypeOptions = ref([
  { label: '无条件', value: 'none' },
  { label: '表达式条件', value: 'expression' },
  { label: '脚本条件', value: 'script' },
])

const scriptFormatOptions = ref([
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Groovy', value: 'groovy' },
  { label: 'JUEL', value: 'juel' },
])

// 提取公共方法：重置数据
function resetConditionData() {
  conditionData.expression = ''
  conditionData.name = ''
}

// 提取公共方法：创建条件对象
function createCondition(body, language) {
  const conditionConfig = { body }
  if (language) {
    conditionConfig.language = language
  }
  return moddle.create('bpmn:FormalExpression', conditionConfig)
}

// 提取公共方法：更新事件定义的条件
function updateEventDefinitionCondition(condition) {
  if (currentEventDefinition) {
    modeling.updateModdleProperties(element, currentEventDefinition, {
      condition,
    })
  }
}

// 初始化条件数据
function initConditionData() {
  if (currentEventDefinition?.condition) {
    const condition = currentEventDefinition.condition
    const condDef = element.businessObject.eventDefinitions[0]

    conditionData.name = condDef.get('camunda:variableName') || condDef.$attrs['camunda:variableName'] || ''
    conditionData.event = condDef.get('camunda:variableEvents') || condDef.$attrs['camunda:variableEvents'] || []
    conditionData.expression = condition.body || ''

    // 判断条件类型
    conditionData.conditionType = condition.language ? 'script' : 'expression'
    if (condition.language) {
      conditionData.scriptFormat = condition.language
    }
  }
}

// 统一的条件更新方法
function updateCondition() {
  if (conditionData.conditionType === 'none')
    return

  const language = conditionData.conditionType === 'script' ? conditionData.scriptFormat : undefined
  const newCondition = createCondition(conditionData.expression, language)
  updateEventDefinitionCondition(newCondition)
}

// 更新条件类型
function updateConditionType(value) {
  conditionData.conditionType = value

  if (value === 'none') {
    resetConditionData()
    updateEventDefinitionCondition(undefined)
  }
  else {
    // 切换类型时更新条件
    updateCondition()
  }
}

// 更新条件名称
function updateConditionName(value) {
  if (currentEventDefinition) {
    modeling.updateModdleProperties(element, currentEventDefinition, {
      'camunda:variableName': value,
    })
  }
}

function updateConditionEvent(value) {
  if (currentEventDefinition) {
    modeling.updateModdleProperties(element, currentEventDefinition, {
      'camunda:variableEvents': value,
    })
  }
}

// 初始化
initConditionData()
</script>
