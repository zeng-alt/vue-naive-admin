<script lang="js" setup>
import {
  NButton,
  NCard,
  NEmpty,
  NIcon,
  NInput,
  NList,
  NListItem,
  NPopconfirm,
  NSpace,
  NText,
} from 'naive-ui'
import { ref } from 'vue'

const props = defineProps({
  element: {
    type: Object,
    default: null,
  },
  bpmnModeler: {
    type: Object,
    default: null,
  },
})

const fields = ref([])

// 获取BPMN相关对象
const modeling = props.bpmnModeler?.get('modeling')
const moddle = props.bpmnModeler?.get('moddle')

// 获取或创建扩展元素
function getOrCreateExtensionElements() {
  if (!moddle || !props.element)
    return null

  let extensionElements = props.element.businessObject.extensionElements
  if (!extensionElements) {
    extensionElements = moddle.create('bpmn:ExtensionElements', { values: [] })
  }
  return extensionElements
}

// 获取或创建Camunda属性
function getOrCreateCamundaProperties(extensionElements) {
  if (!moddle || !extensionElements)
    return null

  let camundaProperties = extensionElements.values.find(v => v.$type === 'camunda:Properties')
  if (!camundaProperties) {
    camundaProperties = moddle.create('camunda:Properties', { values: [] })
    extensionElements.get('values').push(camundaProperties)
  }
  return camundaProperties
}

// 加载现有属性
function loadExistingProperties() {
  if (!props.element) {
    fields.value = []
    return
  }

  const extensionElements = props.element.businessObject.extensionElements
  if (!extensionElements) {
    fields.value = []
    return
  }

  const camundaProperties = extensionElements.values.find(v => v.$type === 'camunda:Properties')
  if (!camundaProperties) {
    fields.value = []
    return
  }

  // 转换为本地数据格式
  fields.value = camundaProperties.values.map(prop => ({
    name: prop.name || '',
    value: prop.value || '',
  }))
}

// 同步到BPMN模型
function syncToBpmn() {
  if (!modeling || !moddle || !props.element) {
    console.warn('BPMN modeler, moddle or element not available')
    return
  }

  try {
    const extensionElements = getOrCreateExtensionElements()
    const camundaProperties = getOrCreateCamundaProperties(extensionElements)

    if (!camundaProperties) {
      console.warn('Failed to create camunda properties')
      return
    }

    // 清空现有属性
    camundaProperties.values.length = 0

    // 添加新属性
    fields.value.forEach((field) => {
      if (field.name && field.name.trim()) {
        const property = moddle.create('camunda:Property', {
          name: field.name.trim(),
          value: field.value || '',
        })
        camundaProperties.get('values').push(property)
      }
    })

    // 更新元素
    modeling.updateProperties(props.element, {
      extensionElements,
    })
  }
  catch (error) {
    console.error('Error syncing properties to BPMN:', error)
    window.$error('同步属性到模型失败')
  }
}

// 添加字段
function addField() {
  const newField = {
    name: '',
    value: '',
  }

  fields.value.push(newField)
}

// 删除字段
function removeField(index) {
  if (index >= 0 && index < fields.value.length) {
    fields.value.splice(index, 1)
    syncToBpmn()
  }
}

// 验证字段名是否重复
function validateFieldName(name, currentIndex) {
  if (!name || !name.trim())
    return true // 空名称不参与验证

  return !fields.value.some((field, index) =>
    index !== currentIndex
    && field.name
    && field.name.trim().toLowerCase() === name.trim().toLowerCase(),
  )
}

// 获取字段名错误信息
function getFieldNameError(name, index) {
  if (!name || !name.trim()) {
    return '字段名不能为空'
  }
  if (!validateFieldName(name, index)) {
    return '字段名不能重复'
  }
  return ''
}

// 清空所有字段
function clearAllFields() {
  fields.value = []
  syncToBpmn()
}

loadExistingProperties()
</script>

<template>
  <NCard title="扩展属性" size="small">
    <!-- 头部操作 -->
    <template #header-extra>
      <NSpace size="small">
        <NButton size="small" type="primary" @click="addField">
          <template #icon>
            <NIcon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                />
              </svg>
            </NIcon>
          </template>
          添加字段
        </NButton>

        <NPopconfirm v-if="fields.length > 0" @positive-click="clearAllFields">
          <template #trigger>
            <NButton size="small" type="warning" secondary>
              <template #icon>
                <NIcon>
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"
                    />
                  </svg>
                </NIcon>
              </template>
              清空全部
            </NButton>
          </template>
          确定要清空所有字段吗？此操作不可撤销。
        </NPopconfirm>
      </NSpace>
    </template>

    <!-- 字段列表 -->
    <NList v-if="fields.length > 0" bordered>
      <NListItem
        v-for="(field, fieldIndex) in fields"
        :key="field.id || fieldIndex"
      >
        <div
          style="width: 100%; display: flex; gap: 12px; align-items: flex-start"
        >
          <!-- 字段名 -->
          <div style="flex: 1">
            <NInput
              v-model:value="field.name"
              placeholder="字段名称"
              size="small"
              :status="
                getFieldNameError(field.name, fieldIndex) ? 'error' : undefined
              "
              @blur="syncToBpmn()"
            />
            <NText
              v-if="getFieldNameError(field.name, fieldIndex)"
              depth="3"
              type="error"
              style="font-size: 12px; margin-top: 4px; display: block"
            >
              {{ getFieldNameError(field.name, fieldIndex) }}
            </NText>
          </div>

          <!-- 字段值 -->
          <div style="flex: 1">
            <NInput
              v-model:value="field.value"
              placeholder="字段值"
              size="small"
              @blur="syncToBpmn()"
            />
          </div>

          <!-- 删除按钮 -->
          <NPopconfirm @positive-click="removeField(fieldIndex)">
            <template #trigger>
              <NButton size="small" type="error" secondary>
                <template #icon>
                  <NIcon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      />
                    </svg>
                  </NIcon>
                </template>
              </NButton>
            </template>
            确定要删除字段 "{{ field.name || "未命名字段" }}" 吗？
          </NPopconfirm>
        </div>
      </NListItem>
    </NList>

    <!-- 空状态 -->
    <NEmpty v-else description="暂无字段" size="small" style="margin: 20px 0">
      <template #extra>
        <NText depth="3" style="font-size: 12px">
          点击上方按钮添加扩展属性字段
        </NText>
      </template>
    </NEmpty>
  </NCard>
</template>

<style scoped>
.n-list-item {
  padding: 12px 16px;
}

.n-input {
  transition: all 0.3s ease;
}

.n-input:focus-within {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.15);
}

.n-button {
  transition: all 0.2s ease;
}

.n-button:hover {
  transform: translateY(-1px);
}
</style>
