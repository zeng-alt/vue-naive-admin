<script lang="js" setup>
import {
  NButton,
  NButtonGroup,
  NCard,
  NDivider,
  NEmpty,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NList,
  NListItem,
  NModal,
  NPopconfirm,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NTag,
  NText,
  NThing,
} from 'naive-ui'
import { computed, reactive, ref, watch } from 'vue'

// 执行监听器管理组件

const props = defineProps({
  element: {
    type: Object,
    default: null,
  },
  bpmnModeler: {
    type: Object,
    default: null,
  },
  eventOptions: {
    type: Array,
    default: () => [
      { label: '开始', value: 'start' },
      { label: '结束', value: 'end' },
    ],
  },
})

// 枚举定义
const EventType = {
  START: 'start',
  END: 'end',
  TAKE: 'take',
}

const ListenerType = {
  CLASS: 'class',
  EXPRESSION: 'expression',
  DELEGATE_EXPRESSION: 'delegateExpression',
  SCRIPT: 'script',
}

const ScriptFormat = {
  JAVASCRIPT: 'javascript',
  GROOVY: 'groovy',
  PYTHON: 'python',
}

const FieldType = {
  STRING: 'string',
  EXPRESSION: 'expression',
}

// 响应式数据
const showAddModal = ref(false)
const editingIndex = ref(-1)
const formRef = ref(null)
const loading = ref(false)

// 监听器列表
const listeners = ref([])

// 当前编辑的监听器
const currentListener = reactive({
  id: 0,
  event: props.eventOptions[0]?.value,
  type: ListenerType.CLASS,
  class: '',
  expression: '',
  delegateExpression: '',
  script: {
    format: '',
    value: '',
  },
  fields: [],
})

const scriptFormatOptions = [
  { label: 'JavaScript', value: ScriptFormat.JAVASCRIPT },
  { label: 'Groovy', value: ScriptFormat.GROOVY },
  { label: 'Python', value: ScriptFormat.PYTHON },
]

// 表单验证规则
const rules = {
  'event': {
    required: true,
    message: '请选择事件类型',
    trigger: ['change', 'blur'],
  },
  'type': {
    required: true,
    message: '请选择监听器类型',
    trigger: ['change', 'blur'],
  },
  'class': {
    required: true,
    message: '请输入类名',
    trigger: ['input', 'blur'],
  },
  'expression': {
    required: true,
    message: '请输入表达式',
    trigger: ['input', 'blur'],
  },
  'delegateExpression': {
    required: true,
    message: '请输入委托表达式',
    trigger: ['input', 'blur'],
  },
  'script.format': {
    required: true,
    message: '请选择脚本格式',
    trigger: ['change', 'blur'],
  },
  'script.value': {
    required: true,
    message: '请输入脚本内容',
    trigger: ['input', 'blur'],
  },
}

// 计算属性
const isEditing = computed(() => editingIndex.value !== -1)
const modalTitle = computed(() => isEditing.value ? '编辑执行监听器' : '添加执行监听器')

// 获取事件类型颜色
function getEventTypeColor(event) {
  const colorMap = {
    [EventType.START]: 'success',
    [EventType.END]: 'error',
  }
  return colorMap[event] || 'default'
}

// 获取监听器类型标签
function getListenerTypeLabel(type) {
  const labelMap = {
    [ListenerType.CLASS]: 'Java类',
    [ListenerType.EXPRESSION]: '表达式',
    [ListenerType.DELEGATE_EXPRESSION]: '委托表达式',
    [ListenerType.SCRIPT]: '脚本',
  }
  return labelMap[type] || type
}

// 获取字段值
function getFieldValue(field) {
  return field.type === FieldType.STRING ? field.value || '' : field.expression || ''
}

// 从BPMN元素加载现有监听器
function loadExistingListeners() {
  if (!props.element || !props.element.businessObject) {
    listeners.value = []
    return
  }

  const businessObject = props.element.businessObject
  const extensionElements = businessObject.extensionElements

  if (!extensionElements || !extensionElements.values) {
    listeners.value = []
    return
  }

  listeners.value = extensionElements.values
    .filter(element => element.$type === 'camunda:ExecutionListener')
    .map((listener, index) => ({
      id: Date.now() + index,
      event: listener.event || '',
      type: determineListenerType(listener),
      class: listener.class || '',
      expression: listener.expression || '',
      delegateExpression: listener.delegateExpression || '',
      script: listener.script
        ? {
            format: listener.script.scriptFormat || '',
            value: listener.script.value || '',
          }
        : { format: '', value: '' },
      fields: (listener.fields || []).map(field => ({
        name: field.name || '',
        type: field.string !== undefined ? FieldType.STRING : FieldType.EXPRESSION,
        value: field.string || field.expression || '',
        expression: field.expression || '',
      })),
    }))
}

// 确定监听器类型
function determineListenerType(listener) {
  if (listener.class)
    return ListenerType.CLASS
  if (listener.expression)
    return ListenerType.EXPRESSION
  if (listener.delegateExpression)
    return ListenerType.DELEGATE_EXPRESSION
  if (listener.script)
    return ListenerType.SCRIPT
  return ListenerType.CLASS
}

// 重置表单
function resetForm() {
  Object.assign(currentListener, {
    id: 0,
    event: props.eventOptions[0]?.value,
    type: ListenerType.CLASS,
    class: '',
    expression: '',
    delegateExpression: '',
    script: { format: '', value: '' },
    fields: [],
  })
}

// 关闭模态框
function closeModal() {
  showAddModal.value = false
  editingIndex.value = -1
  resetForm()
}

// 打开添加模态框
function openAddModal() {
  resetForm()
  editingIndex.value = -1
  showAddModal.value = true
}

// 添加字段
function addField() {
  currentListener.fields.push({
    name: '',
    type: FieldType.STRING,
    value: '',
    expression: '',
  })
}

// 移除字段
function removeField(index) {
  currentListener.fields.splice(index, 1)
}

// 验证必填字段
function validateRequiredFields() {
  switch (currentListener.type) {
    case ListenerType.CLASS:
      return !!currentListener.class?.trim()
    case ListenerType.EXPRESSION:
      return !!currentListener.expression?.trim()
    case ListenerType.DELEGATE_EXPRESSION:
      return !!currentListener.delegateExpression?.trim()
    case ListenerType.SCRIPT:
      return !!(currentListener.script?.format && currentListener.script?.value?.trim())
    default:
      return false
  }
}

// 保存到BPMN模型
async function saveToBPMNModel(listener) {
  if (!props.bpmnModeler || !props.element) {
    console.warn('BPMN modeler或元素不可用')
    return
  }

  try {
    const moddle = props.bpmnModeler.get('moddle')
    const modeling = props.bpmnModeler.get('modeling')
    const businessObject = props.element.businessObject

    // 创建执行监听器
    const executionListener = moddle.create('camunda:ExecutionListener', {
      event: listener.event,
    })

    // 根据类型设置监听器实现
    switch (listener.type) {
      case ListenerType.CLASS:
        executionListener.class = listener.class
        break
      case ListenerType.EXPRESSION:
        executionListener.expression = listener.expression
        break
      case ListenerType.DELEGATE_EXPRESSION:
        executionListener.delegateExpression = listener.delegateExpression
        break
      case ListenerType.SCRIPT:
        if (listener.script?.format && listener.script?.value) {
          executionListener.script = moddle.create('camunda:Script', {
            scriptFormat: listener.script.format,
            value: listener.script.value,
          })
        }
        break
    }

    // 添加字段
    if (listener.fields && listener.fields.length > 0) {
      executionListener.fields = listener.fields
        .filter(field => field.name?.trim())
        .map((field) => {
          const fieldElement = moddle.create('camunda:Field', {
            name: field.name,
          })

          if (field.type === FieldType.STRING) {
            fieldElement.string = field.value
          }
          else {
            fieldElement.expression = field.value
          }

          return fieldElement
        })
    }

    // 确保扩展元素存在
    if (!businessObject.extensionElements) {
      businessObject.extensionElements = moddle.create('bpmn:ExtensionElements', {
        values: [],
      })
    }

    // 如果是编辑，先移除旧的监听器
    if (editingIndex.value !== -1) {
      const existingListeners = businessObject.extensionElements.values.filter(
        el => el.$type === 'camunda:ExecutionListener',
      )

      if (existingListeners[editingIndex.value]) {
        const allValues = businessObject.extensionElements.values
        const globalIndex = allValues.indexOf(existingListeners[editingIndex.value])
        if (globalIndex !== -1) {
          allValues.splice(globalIndex, 1)
        }
      }
    }

    // 添加新监听器
    businessObject.extensionElements.values.push(executionListener)

    // 更新属性
    modeling.updateProperties(props.element, {
      extensionElements: businessObject.extensionElements,
    })
  }
  catch (error) {
    console.error('保存到BPMN模型失败:', error)
    throw error
  }
}

// 保存监听器
async function saveListener() {
  if (!currentListener.event) {
    window.$error('请选择事件类型')
    return
  }

  if (!validateRequiredFields()) {
    window.$error('请填写所有必填字段')
    return
  }

  loading.value = true
  // 清理不需要的字段
  switch (currentListener.type) {
    case ListenerType.CLASS:
      delete currentListener.expression
      delete currentListener.delegateExpression
      delete currentListener.script
      break
    case ListenerType.EXPRESSION:
      delete currentListener.class
      delete currentListener.delegateExpression
      delete currentListener.script
      break
    case ListenerType.DELEGATE_EXPRESSION:
      delete currentListener.class
      delete currentListener.expression
      delete currentListener.script
      break
    case ListenerType.SCRIPT:
      delete currentListener.class
      delete currentListener.expression
      delete currentListener.delegateExpression
      break
  }

  try {
    // 创建监听器数据副本
    const listenerData = {
      ...currentListener,
      script: currentListener.script ? { ...currentListener.script } : { format: '', value: '' },
      fields: currentListener.fields.map(field => ({ ...field })),
    }

    // 保存到BPMN模型
    await saveToBPMNModel(listenerData)

    // 更新本地监听器数组
    if (editingIndex.value === -1) {
      listenerData.id = Date.now()
      listeners.value.push(listenerData)
      window.$success('执行监听器添加成功')
    }
    else {
      listeners.value[editingIndex.value] = {
        ...listeners.value[editingIndex.value],
        ...listenerData,
      }
      window.$success('执行监听器更新成功')
    }

    closeModal()
  }
  catch (error) {
    window.$error(`保存失败: ${error.message}`)
  }
  finally {
    loading.value = false
  }
}

// 编辑监听器
function editListener(index) {
  editingIndex.value = index
  const listener = listeners.value[index]

  // 深拷贝监听器数据
  Object.assign(currentListener, {
    ...listener,
    script: listener.script ? { ...listener.script } : { format: '', value: '' },
    fields: listener.fields ? listener.fields.map(f => ({ ...f })) : [],
  })

  showAddModal.value = true
}

// 删除监听器
async function deleteListener(index) {
  if (!props.bpmnModeler || !props.element) {
    window.$error('BPMN modeler或元素不可用')
    return
  }

  try {
    const businessObject = props.element.businessObject
    const modeling = props.bpmnModeler.get('modeling')

    if (businessObject.extensionElements && businessObject.extensionElements.values) {
      const existingListeners = businessObject.extensionElements.values.filter(
        el => el.$type === 'camunda:ExecutionListener',
      )

      if (existingListeners[index]) {
        const allValues = businessObject.extensionElements.values
        const globalIndex = allValues.indexOf(existingListeners[index])
        if (globalIndex !== -1) {
          allValues.splice(globalIndex, 1)
        }

        // 更新属性
        modeling.updateProperties(props.element, {
          extensionElements: businessObject.extensionElements,
        })
      }
    }

    // 更新本地数组
    listeners.value.splice(index, 1)
    window.$success('执行监听器删除成功')
  }
  catch (error) {
    window.$error(`删除失败: ${error.message}`)
  }
}

// 获取监听器摘要
function getListenerSummary(listener) {
  switch (listener.type) {
    case ListenerType.CLASS:
      return `类: ${listener.class}`
    case ListenerType.EXPRESSION:
      return `表达式: ${listener.expression}`
    case ListenerType.DELEGATE_EXPRESSION:
      return `委托: ${listener.delegateExpression}`
    case ListenerType.SCRIPT:
      return `脚本 (${listener.script?.format}): ${listener.script?.value?.substring(0, 30)}...`
    default:
      return ''
  }
}

// 监听props变化，重新加载数据
watch(() => props.element, () => {
  loadExistingListeners()
}, { immediate: true })

// 初始化加载
loadExistingListeners()
</script>

<template>
  <NCard title="执行监听器" size="small">
    <!-- 头部操作 -->
    <template #header-extra>
      <NButton type="primary" size="small" @click="openAddModal">
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
        添加监听器
      </NButton>
    </template>

    <!-- 监听器列表 -->
    <NList v-if="listeners.length > 0" bordered>
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px">
          <NIcon size="18">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          </NIcon>
          <span style="font-weight: 600">已配置的监听器 ({{ listeners.length }})</span>
        </div>
      </template>

      <NListItem
        v-for="(listener, index) in listeners"
        :key="listener.id"
        class="listener-item"
      >
        <NThing>
          <template #header>
            <div
              style="
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 8px;
              "
            >
              <NTag
                :type="getEventTypeColor(listener.event)"
                size="small"
                round
              >
                {{ listener.event ? listener.event.toUpperCase() : "未设置" }}
              </NTag>
              <NTag type="info" size="small">
                {{ getListenerTypeLabel(listener.type) }}
              </NTag>
            </div>
          </template>

          <template #description>
            <div>
              <!-- 监听器值 -->
              <div style="margin-bottom: 12px">
                <NText depth="2" style="font-size: 14px">
                  {{ getListenerSummary(listener) }}
                </NText>
              </div>

              <!-- 字段信息 -->
              <div
                v-if="listener.fields && listener.fields.length > 0"
                style="margin-bottom: 8px"
              >
                <NText depth="3" style="font-size: 12px; font-weight: 500">
                  字段:
                </NText>
                <div class="tag-group">
                  <NTag
                    v-for="field in listener.fields"
                    :key="field.name"
                    size="small"
                    type="default"
                  >
                    {{ field.name }}: {{ getFieldValue(field) }}
                  </NTag>
                </div>
              </div>

              <!-- 脚本信息 -->
              <div
                v-if="
                  listener.script
                    && (listener.script.format || listener.script.value)
                "
                style="margin-bottom: 8px"
              >
                <NText depth="3" style="font-size: 12px; font-weight: 500">
                  脚本:
                </NText>
                <div class="tag-group">
                  <NTag size="small" type="warning">
                    {{ listener.script.format }} -
                    {{ listener.script.value?.substring(0, 50) }}...
                  </NTag>
                </div>
              </div>
            </div>
          </template>

          <template #action>
            <NButtonGroup size="tiny">
              <NButton @click="editListener(index)">
                <template #icon>
                  <NIcon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                      />
                    </svg>
                  </NIcon>
                </template>
                编辑
              </NButton>
              <NPopconfirm @positive-click="deleteListener(index)">
                <template #trigger>
                  <NButton type="error">
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
                    删除
                  </NButton>
                </template>
                确定要删除这个监听器吗？
              </NPopconfirm>
            </NButtonGroup>
          </template>
        </NThing>
      </NListItem>
    </NList>

    <!-- 空状态 -->
    <NEmpty v-else description="暂无执行监听器" style="margin: 40px 0">
      <template #extra>
        <NButton @click="openAddModal">
          添加第一个监听器
        </NButton>
      </template>
    </NEmpty>

    <!-- 添加/编辑监听器模态框 -->
    <NModal
      v-model:show="showAddModal"
      :mask-closable="false"
      style="width: 700px"
    >
      <NCard
        :title="modalTitle"
        :bordered="false"
        size="small"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <NButton quaternary circle @click="closeModal">
            <template #icon>
              <NIcon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  />
                </svg>
              </NIcon>
            </template>
          </NButton>
        </template>

        <NForm
          ref="formRef"
          :model="currentListener"
          :rules="rules"
          label-placement="top"
        >
          <!-- 基本信息 -->
          <div class="form-section">
            <NGrid cols="2" x-gap="16">
              <NGridItem>
                <NFormItem label="事件类型" path="event">
                  <NSelect
                    v-model:value="currentListener.event"
                    :options="eventOptions"
                    placeholder="选择事件类型"
                  />
                </NFormItem>
              </NGridItem>
            </NGrid>
          </div>

          <!-- 监听器类型 -->
          <div class="form-section">
            <NFormItem label="监听器类型" path="type">
              <NRadioGroup v-model:value="currentListener.type">
                <NSpace>
                  <NRadio :value="ListenerType.CLASS">
                    Java类
                  </NRadio>
                  <NRadio :value="ListenerType.EXPRESSION">
                    表达式
                  </NRadio>
                  <NRadio :value="ListenerType.DELEGATE_EXPRESSION">
                    委托表达式
                  </NRadio>
                  <NRadio :value="ListenerType.SCRIPT">
                    脚本
                  </NRadio>
                </NSpace>
              </NRadioGroup>
            </NFormItem>
          </div>

          <!-- Java类 -->
          <div
            v-if="currentListener.type === ListenerType.CLASS"
            class="form-section"
          >
            <NFormItem label="类名" path="class">
              <NInput
                v-model:value="currentListener.class"
                placeholder="com.example.MyExecutionListener"
              />
            </NFormItem>
          </div>

          <!-- 表达式 -->
          <div
            v-if="currentListener.type === ListenerType.EXPRESSION"
            class="form-section"
          >
            <NFormItem label="表达式" path="expression">
              <NInput
                v-model:value="currentListener.expression"
                placeholder="${myBean.execute(execution)}"
              />
            </NFormItem>
          </div>

          <!-- 委托表达式 -->
          <div
            v-if="currentListener.type === ListenerType.DELEGATE_EXPRESSION"
            class="form-section"
          >
            <NFormItem label="委托表达式" path="delegateExpression">
              <NInput
                v-model:value="currentListener.delegateExpression"
                placeholder="${myExecutionListener}"
              />
            </NFormItem>
          </div>

          <!-- 脚本 -->
          <div
            v-if="currentListener.type === ListenerType.SCRIPT"
            class="form-section"
          >
            <NFormItem label="脚本格式" path="script.format">
              <NSelect
                v-model:value="currentListener.script.format"
                :options="scriptFormatOptions"
                placeholder="选择脚本格式"
              />
            </NFormItem>
            <NFormItem label="脚本内容" path="script.value">
              <NInput
                v-model:value="currentListener.script.value"
                type="textarea"
                placeholder="execution.setVariable('result', 'success');"
                :autosize="{ minRows: 3, maxRows: 8 }"
              />
            </NFormItem>
          </div>

          <NDivider />

          <!-- 字段注入 -->
          <div class="form-section">
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
              "
            >
              <NText style="font-weight: 500; font-size: 14px">
                字段注入
              </NText>
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
            </div>
            <NList v-if="currentListener.fields.length > 0" bordered>
              <NListItem
                v-for="(field, fieldIndex) in currentListener.fields"
                :key="fieldIndex"
              >
                <div
                  style="
                    width: 100%;
                    display: flex;
                    gap: 12px;
                    align-items: center;
                  "
                >
                  <NInput
                    v-model:value="field.name"
                    placeholder="字段名称"
                    style="flex: 1"
                    size="small"
                  />
                  <NRadioGroup v-model:value="field.type" size="small">
                    <NRadio :value="FieldType.STRING">
                      字符串
                    </NRadio>
                    <NRadio :value="FieldType.EXPRESSION">
                      表达式
                    </NRadio>
                  </NRadioGroup>
                  <NInput
                    v-model:value="field.value"
                    :placeholder="
                      field.type === FieldType.STRING
                        ? '字符串值'
                        : '${expression}'
                    "
                    style="flex: 1"
                    size="small"
                  />
                  <NButton
                    size="small"
                    type="error"
                    secondary
                    @click="removeField(fieldIndex)"
                  >
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
                </div>
              </NListItem>
            </NList>

            <NEmpty
              v-else
              description="暂无字段"
              size="small"
              style="margin: 20px 0"
            >
              <template #extra>
                <NText depth="3" style="font-size: 12px">
                  点击上方按钮添加字段注入
                </NText>
              </template>
            </NEmpty>
          </div>
        </NForm>

        <template #footer>
          <div style="display: flex; justify-content: flex-end; gap: 12px">
            <NButton :disabled="loading" @click="closeModal">
              取消
            </NButton>
            <NButton type="primary" :loading="loading" @click="saveListener">
              {{ isEditing ? "更新" : "添加" }}
            </NButton>
          </div>
        </template>
      </NCard>
    </NModal>
  </NCard>
</template>

<style scoped></style>
