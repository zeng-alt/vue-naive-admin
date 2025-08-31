<template>
  <NForm :model="conditionData" size="small">
    <NFormItem label="条件类型" path="conditionType">
      <NSelect
        v-model:value="conditionData.conditionType"
        placeholder="选择条件类型"
        :options="conditionTypeOptions"
        @update:value="updateConditionType"
      />
    </NFormItem>

    <!-- 脚本语言选择 -->
    <NFormItem
      v-show="conditionData.conditionType === 'script'"
      label="脚本语言"
      path="scriptFormat"
    >
      <NSelect
        v-model:value="conditionData.scriptFormat"
        placeholder="选择脚本语言"
        :options="scriptFormatOptions"
        @update:value="updateCondition"
      />
    </NFormItem>

    <!-- 表达式/脚本条件 -->
    <NFormItem
      v-show="['expression', 'script'].includes(conditionData.conditionType)"
      :label="
        conditionData.conditionType === 'script' ? '脚本内容' : '条件表达式'
      "
      path="expression"
    >
      <NInput
        v-model:value="conditionData.expression"
        type="textarea"
        :placeholder="
          conditionData.conditionType === 'script'
            ? '请输入脚本内容'
            : '请输入条件表达式'
        "
        :rows="conditionData.conditionType === 'script' ? 5 : 3"
        @blur="updateCondition"
      />
      <template #feedback>
        {{
          conditionData.conditionType === "script"
            ? "编写返回布尔值的脚本代码"
            : "示例: ${amount > 1000} 或 ${status == 'approved'}"
        }}
      </template>
    </NFormItem>
  </NForm>
</template>

<script setup>
import { NForm, NFormItem, NInput, NSelect } from 'naive-ui'
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
})

const emit = defineEmits(['update:condition'])

// 提取公共变量
const elementRegistry = props.bpmnModeler.get('elementRegistry')
const modeling = props.bpmnModeler.get('modeling')
const moddle = props.bpmnModeler.get('moddle')
const element = elementRegistry.get(props.selectedElement.id)

// 条件数据模型
const conditionData = reactive({
  conditionType: 'none',
  expression: '',
  scriptFormat: 'javascript',
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
  modeling.updateProperties(element, {
    conditionExpression: condition,
  })
}

// 初始化条件数据
function initConditionData() {
  const condition = element.businessObject?.conditionExpression
  if (condition) {
    conditionData.conditionType = condition.language ? 'script' : 'expression'
    conditionData.expression = condition.body || ''
    if (condition.language) {
      conditionData.scriptFormat = condition.language
    }
  }
}

// 统一的条件更新方法
function updateCondition() {
  if (conditionData.conditionType === 'none') {
    emit('update:condition', false)
    return
  }
  emit('update:condition', true)
  const language
    = conditionData.conditionType === 'script'
      ? conditionData.scriptFormat
      : undefined
  const newCondition = createCondition(conditionData.expression, language)
  updateEventDefinitionCondition(newCondition)
}

// 更新条件类型
function updateConditionType(value) {
  conditionData.conditionType = value

  if (value === 'none') {
    resetConditionData()
    emit('update:condition', false)
    updateEventDefinitionCondition(undefined)
  }
  else {
    emit('update:condition', true)
    // 切换类型时更新条件
    updateCondition()
  }
}

function updateType(value) {
  conditionData.conditionType = value
}

// 初始化
initConditionData()

defineExpose({
  updateType,
})
</script>
