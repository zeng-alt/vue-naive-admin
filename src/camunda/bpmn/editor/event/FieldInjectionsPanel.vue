<template>
  <NButton size="small" @click="addField">
    添加字段
  </NButton>
  <NForm :model="fieldData" size="small">
    <NFormItem path="fields">
      <NDynamicInput v-model:value="fieldData.fields" :on-create="createField" @remove="removeField">
        <template #default="{ value, index }">
          <NCard size="small" :title="`字段 ${index + 1}`" closable @close="removeField(index)">
            <NForm :model="value" size="small">
              <NFormItem label="字段名称" path="name">
                <NInput v-model:value="value.name" placeholder="请输入字段名称" @blur="updateField(index)" />
              </NFormItem>

              <NFormItem label="值类型" path="type">
                <NSelect
                  v-model:value="value.type" :options="fieldTypeOptions"
                  @update:value="updateFieldType(index, $event)"
                />
              </NFormItem>

              <NFormItem label="值内容" path="value">
                <NInput
                  v-model:value="value.value" type="textarea" :rows="2" :placeholder="getPlaceholder(value.type)"
                  @blur="updateField(index)"
                />
                <template #feedback>
                  {{ getFieldDescription(value.type) }}
                </template>
              </NFormItem>
            </NForm>
          </NCard>
        </template>

        <template #action>
          <div style="display: flex; align-items: center;">
            <!-- <n-button size="small" @click="create(index)" style="margin-right: 8px;">
              添加字段
            </n-button> -->
            <!-- <n-button size="small" type="error" @click="remove(index)" v-if="fieldData.fields.length > 1">
              删除
            </n-button> -->
          </div>
        </template>
      </NDynamicInput>
    </NFormItem>
  </NForm>
</template>

<script setup>
import {
  NButton,
  NCard,
  NDynamicInput,
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
})

// 提取公共变量
const elementRegistry = props.bpmnModeler.get('elementRegistry')
const modeling = props.bpmnModeler.get('modeling')
const moddle = props.bpmnModeler.get('moddle')
const bpmnFactory = props.bpmnModeler.get('bpmnFactory')
const element = elementRegistry.get(props.selectedElement.id)

// 字段数据模型
const fieldData = reactive({
  fields: [],
})

// 字段类型选项
const fieldTypeOptions = ref([
  { label: '字符串值 (String)', value: 'string' },
  { label: '表达式值 (Expression)', value: 'expression' },
])

// 获取占位符文本
function getPlaceholder(type) {
  return type === 'expression' ? '请输入表达式，如: ${variableName}' : '请输入字符串值'
}

// 获取字段描述
function getFieldDescription(type) {
  return type === 'expression'
    ? '表达式将在运行时计算，可以引用流程变量'
    : '静态字符串值，将直接注入到字段中'
}

// 创建新字段
function createField() {
  return {
    name: '',
    type: 'string',
    value: '',
  }
}

// 添加字段
function addField() {
  fieldData.fields.push(createField())
}

// 移除字段
function removeField(index) {
  fieldData.fields.splice(index, 1)
  updateExtensionElements()
}

// 更新字段类型
function updateFieldType(index, type) {
  fieldData.fields[index].type = type
  fieldData.fields[index].value = '' // 清空值，因为类型变了
  updateField(index)
}

// 获取或创建扩展元素
function getOrCreateExtensionElements() {
  let extensionElements = props.selectedElement.extensionElements

  if (!extensionElements) {
    extensionElements = moddle.create('bpmn:ExtensionElements')
    modeling.updateModdleProperties(element, props.selectedElement, {
      extensionElements,
    })
  }

  return extensionElements
}

// 创建Camunda字段对象
function createCamundaField(fieldItem) {
  // 创建 field
  const field = bpmnFactory.create('camunda:Field', {
    name: fieldItem.name,
  })

  // 创建值元素
  if (fieldItem.type === 'string') {
    field.string = fieldItem.value // 直接赋值，不需要再创建 camunda:string
  }
  else {
    field.expression = fieldItem.value // 直接赋值，不需要再创建 camunda:expression
  }

  return field
}

// 更新单个字段
function updateField() {
  updateExtensionElements()
}

// 更新扩展元素
function updateExtensionElements() {
  const extensionElements = getOrCreateExtensionElements()

  // 移除现有的camunda:field元素
  const existingFields = extensionElements.values?.filter(val => val.$type === 'camunda:Field') || []
  existingFields.forEach((field) => {
    const fieldIndex = extensionElements.values.indexOf(field)
    if (fieldIndex > -1) {
      extensionElements.values.splice(fieldIndex, 1)
    }
  })

  // 添加新的字段
  const newFields = fieldData.fields
    .filter(field => field.name.trim()) // 只处理有名称的字段
    .map(field => createCamundaField(field))

  if (!extensionElements.values) {
    extensionElements.values = []
  }

  extensionElements.values.push(...newFields)

  // 如果没有任何扩展元素，移除整个extensionElements
  if (extensionElements.values.length === 0) {
    modeling.updateModdleProperties(element, props.selectedElement, {
      extensionElements: undefined,
    })
  }
}

// 初始化字段数据
function initFieldData() {
  const extensionElements = props.selectedElement.extensionElements

  if (extensionElements?.values) {
    const camundaFields = extensionElements.values.filter(val => val.$type === 'camunda:Field')

    fieldData.fields = camundaFields.map((field) => {
      const fieldItem = {
        name: field.name || '',
        type: 'string',
        value: '',
      }

      if (field.string) {
        fieldItem.type = 'string'
        fieldItem.value = field.string || ''
      }
      else if (field.expression) {
        fieldItem.type = 'expression'
        fieldItem.value = field.expression || ''
      }

      return fieldItem
    })
  }
}

// 初始化
initFieldData()
</script>
