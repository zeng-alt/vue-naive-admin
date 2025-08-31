<template>
  <!-- 表单基本信息 -->
  <NForm ref="formRef" :model="formData" :rules="rules" label-placement="top" size="small">
    <NFormItem label="表单类型">
      <NSelect v-model:value="formData.formType" :options="formTypeOptions" placeholder="选择表单类型" />
    </NFormItem>

    <NFormItem v-show="formData.formType !== 'generated'" label="表单名称" path="formName">
      <NSelect
        v-model:value="formData.formName"
        filterable
        clearable
        :options="[]"
        placeholder="选择表单名称"
      />
    </NFormItem>

    <!-- 表单字段配置 -->
    <NFormItem v-show="formData.formType === 'generated'" label="表单字段">
      <div class="form-fields">
        <div v-for="(field, index) in formData.fields" :key="field.id" class="field-item">
          <NCard size="small" :bordered="true">
            <template #header>
              <div class="field-header">
                <span>字段 {{ index + 1 }}</span>
                <NButton size="small" type="error" text @click="removeField(index)">
                  删除
                </NButton>
              </div>
            </template>

            <NSpace vertical>
              <NFormItem label="字段ID" :show-feedback="false">
                <NInput v-model:value="field.id" placeholder="字段唯一标识" size="small" @blur="updateElement" />
              </NFormItem>

              <NFormItem label="字段名称" :show-feedback="false">
                <NInput v-model:value="field.label" placeholder="字段显示名称" size="small" @blur="updateElement" />
              </NFormItem>

              <NFormItem label="字段类型" :show-feedback="false">
                <NSelect
                  v-model:value="field.type" :options="fieldTypeOptions" size="small"
                  @update:value="updateElement"
                />
              </NFormItem>

              <NFormItem label="默认值" :show-feedback="false">
                <NInput v-model:value="field.defaultValue" placeholder="字段默认值" size="small" @blur="updateElement" />
              </NFormItem>

              <NFormItem label="配置" :show-feedback="false">
                <NSpace>
                  <NCheckbox v-model:checked="field.required" @update:checked="updateElement">
                    必填
                  </NCheckbox>
                  <NCheckbox v-model:checked="field.readonly" @update:checked="updateElement">
                    只读
                  </NCheckbox>
                  <NCheckbox v-model:checked="field.hidden" @update:checked="updateElement">
                    隐藏
                  </NCheckbox>
                </NSpace>
              </NFormItem>

              <!-- 选项配置（用于select, radio, checkbox类型） -->
              <NFormItem
                v-if="['select', 'radio', 'checkbox'].includes(field.type)" label="选项配置"
                :show-feedback="false"
              >
                <div class="options-config">
                  <div v-for="(option, optionIndex) in field.options" :key="optionIndex" class="option-item">
                    <NInputGroup>
                      <NInput
                        v-model:value="option.value" placeholder="选项值" size="small" style="width: 40%"
                        @blur="updateElement"
                      />
                      <NInput
                        v-model:value="option.label" placeholder="选项标签" size="small" style="width: 40%"
                        @blur="updateElement"
                      />
                      <NButton size="small" type="error" @click="removeOption(field, optionIndex)">
                        删除
                      </NButton>
                    </NInputGroup>
                  </div>
                  <NButton size="small" block @click="addOption(field)">
                    添加选项
                  </NButton>
                </div>
              </NFormItem>
            </NSpace>
          </NCard>
        </div>

        <NButton block style="margin-top: 16px" @click="addField">
          添加字段
        </NButton>
      </div>
    </NFormItem>

    <!-- 表单验证规则 -->
    <!-- <n-form-item label="表单验证">
      <n-checkbox-group v-model:value="formData.validationRules" @update:value="updateElement">
        <n-space>
          <n-checkbox value="required">必填验证</n-checkbox>
          <n-checkbox value="email">邮箱验证</n-checkbox>
          <n-checkbox value="phone">手机验证</n-checkbox>
          <n-checkbox value="custom">自定义验证</n-checkbox>
        </n-space>
      </n-checkbox-group>
    </n-form-item> -->

    <!-- 表单提交配置 -->
    <!-- <n-collapse>
      <n-collapse-item title="高级配置" name="advanced">
        <n-form-item label="提交URL" :show-feedback="false">
          <n-input v-model:value="formData.submitUrl" placeholder="表单提交地址" @blur="updateElement" />
        </n-form-item>

        <n-form-item label="提交方法" :show-feedback="false">
          <n-select v-model:value="formData.submitMethod" :options="methodOptions" @update:value="updateElement" />
        </n-form-item>

        <n-form-item label="表单布局" :show-feedback="false">
          <n-radio-group v-model:value="formData.layout" @update:value="updateElement">
            <n-space>
              <n-radio value="vertical">垂直布局</n-radio>
              <n-radio value="horizontal">水平布局</n-radio>
              <n-radio value="inline">内联布局</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-collapse-item>
    </n-collapse> -->

    <!-- 操作按钮 -->
    <NSpace justify="end" style="margin-top: 24px">
      <NButton size="small" @click="resetForm">
        重置
      </NButton>
      <NButton type="primary" size="small" @click="saveForm">
        保存配置
      </NButton>
      <NButton v-show="formData.formType === 'generated'" type="info" size="small" @click="previewForm">
        预览表单
      </NButton>
      <NButton v-show="formData.formType === 'generated'" type="info" size="small" @click="previewForm">
        导入
      </NButton>
      <NButton v-show="formData.formType === 'generated'" type="info" size="small" @click="previewForm">
        导出
      </NButton>
    </NSpace>
  </NForm>

  <!-- 预览对话框 -->
  <NModal v-model:show="showPreview" size="small" preset="card" draggable :style="{ width: '80%', height: '80%' }">
    <NCard title="表单预览" :bordered="false" size="small">
      <div>
        <NForm :label-placement="formData.layout === 'horizontal' ? 'left' : 'top'">
          <div v-for="field in formData.fields" :key="field.id">
            <NFormItem v-if="!field.hidden" :label="field.label" :required="field.required">
              <!-- 根据字段类型渲染不同组件 -->
              <NInput
                v-if="field.type === 'text'" :value="field.defaultValue" :disabled="field.readonly"
                :placeholder="`请输入${field.label}`"
              />
              <NInput
                v-else-if="field.type === 'textarea'" type="textarea" :value="field.defaultValue"
                :disabled="field.readonly" :placeholder="`请输入${field.label}`"
              />
              <NInputNumber
                v-else-if="field.type === 'number'" :value="Number(field.defaultValue) || 0"
                :disabled="field.readonly"
              />
              <NDatePicker v-else-if="field.type === 'date'" :disabled="field.readonly" />
              <NSelect
                v-else-if="field.type === 'select'" :options="field.options || []" :disabled="field.readonly"
                :placeholder="`请选择${field.label}`"
              />
              <NRadioGroup v-else-if="field.type === 'radio'" :disabled="field.readonly">
                <NRadio v-for="option in field.options || []" :key="option.value" :value="option.value">
                  {{ option.label }}
                </NRadio>
              </NRadioGroup>
              <NCheckboxGroup v-else-if="field.type === 'checkbox'" :disabled="field.readonly">
                <NCheckbox v-for="option in field.options || []" :key="option.value" :value="option.value">
                  {{ option.label }}
                </NCheckbox>
              </NCheckboxGroup>
              <NSwitch
                v-else-if="field.type === 'boolean'" :value="field.defaultValue === 'true'"
                :disabled="field.readonly"
              />
            </NFormItem>
          </div>
        </NForm>
      </div>
    </NCard>
  </NModal>
</template>

<script setup>
import {
  NButton,
  NCard,
  NCheckbox,
  NCheckboxGroup,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NInputNumber,
  NModal,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NSwitch,
} from 'naive-ui'
import { onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  element: null,
  modeler: null,
})

// Emits
const emit = defineEmits(['formUpdated'])

const formRef = ref()
const showPreview = ref(false)

// 表单数据
const formData = reactive({
  formId: '',
  formName: '',
  formType: 'embedded',
  fields: [],
  validationRules: [],
  submitUrl: '',
  submitMethod: 'POST',
  layout: 'vertical',
})

// 表单验证规则
const rules = {
  formId: {
    required: true,
    message: '请输入表单ID',
    trigger: 'blur',
  },
  formName: {
    required: true,
    message: '请输入表单名称',
    trigger: 'blur',
  },
}

// 选项配置
const formTypeOptions = [
  { label: '空', value: 'none' },
  { label: '嵌入式表单', value: 'embedded' },
  { label: '外部表单', value: 'external' },
  { label: '生成表单', value: 'generated' },
]

const fieldTypeOptions = [
  { label: '文本输入', value: 'text' },
  { label: '多行文本', value: 'textarea' },
  { label: '数字输入', value: 'number' },
  { label: '日期选择', value: 'date' },
  { label: '下拉选择', value: 'select' },
  { label: '单选按钮', value: 'radio' },
  { label: '复选框', value: 'checkbox' },
  { label: '开关', value: 'boolean' },
]

// 生成唯一ID
function generateId() {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
}

// 添加字段
function addField() {
  const newField = {
    id: generateId(),
    label: `字段${formData.fields.length + 1}`,
    type: 'text',
    defaultValue: '',
    required: false,
    readonly: false,
    hidden: false,
    options: [],
  }
  formData.fields.push(newField)
  updateElement()
}

// 删除字段
function removeField(index) {
  formData.fields.splice(index, 1)
  updateElement()
}

// 添加选项
function addOption(field) {
  if (!field.options) {
    field.options = []
  }
  field.options.push({
    value: `option_${field.options.length + 1}`,
    label: `选项${field.options.length + 1}`,
  })
  updateElement()
}

// 删除选项
function removeOption(field, optionIndex) {
  field.options.splice(optionIndex, 1)
  updateElement()
}

// 更新BPMN元素
function updateElement() {
  if (!props.element || !props.modeler)
    return

  const modeling = props.modeler.get('modeling')

  // 更新表单相关属性
  modeling.updateProperties(props.element, {
    'camunda:formRef': formData.formId,
    'camunda:formName': formData.formName,
    'camunda:formType': formData.formType,
  })

  // 更新表单字段信息（作为扩展属性保存）
  const extensionElements = props.element.businessObject.extensionElements
    || props.modeler.get('moddle').create('bpmn:ExtensionElements')

  // 清除现有的表单配置
  extensionElements.values = extensionElements.values?.filter(
    element => element.$type !== 'camunda:FormData',
  ) || []

  // 创建新的表单配置
  if (formData.fields.length > 0) {
    const formDataElement = props.modeler.get('moddle').create('camunda:FormData')
    formDataElement.fields = formData.fields.map((field) => {
      const formField = props.modeler.get('moddle').create('camunda:FormField')
      formField.id = field.id
      formField.label = field.label
      formField.type = field.type
      formField.defaultValue = field.defaultValue

      // 添加字段属性
      const properties = []
      if (field.required) {
        const prop = props.modeler.get('moddle').create('camunda:Property')
        prop.id = 'required'
        prop.value = 'true'
        properties.push(prop)
      }
      if (field.readonly) {
        const prop = props.modeler.get('moddle').create('camunda:Property')
        prop.id = 'readonly'
        prop.value = 'true'
        properties.push(prop)
      }
      if (field.hidden) {
        const prop = props.modeler.get('moddle').create('camunda:Property')
        prop.id = 'hidden'
        prop.value = 'true'
        properties.push(prop)
      }

      if (properties.length > 0) {
        formField.properties = props.modeler.get('moddle').create('camunda:Properties')
        formField.properties.values = properties
      }

      // 添加选项
      if (field.options && field.options.length > 0) {
        formField.values = field.options.map((option) => {
          const enumValue = props.modeler.get('moddle').create('camunda:Value')
          enumValue.id = option.value
          enumValue.name = option.label
          return enumValue
        })
      }

      return formField
    })

    extensionElements.values.push(formDataElement)
  }

  modeling.updateProperties(props.element, {
    extensionElements,
  })

  emit('formUpdated', { ...formData })
}

// 重置表单
function resetForm() {
  Object.assign(formData, {
    formId: '',
    formName: '',
    formType: 'embedded',
    fields: [],
    validationRules: [],
    submitUrl: '',
    submitMethod: 'POST',
    layout: 'vertical',
  })
  updateElement()
  window.$success('表单已重置')
}

// 保存表单
async function saveForm() {
  try {
    await formRef.value?.validate()
    updateElement()
    window.$success('表单配置已保存')
  }
  catch (error) {
    window.$error('请检查表单输入')
    throw error
  }
}

// 预览表单
function previewForm() {
  if (formData.fields.length === 0) {
    window.$warning('请先添加表单字段')
    return
  }
  showPreview.value = true
}

// 加载现有表单配置
function loadFormData() {
  if (!props.element)
    return

  const businessObject = props.element.businessObject

  // 加载基本信息
  formData.formId = businessObject.get('camunda:formKey') || ''
  formData.formName = businessObject.get('camunda:formName') || ''
  formData.formType = businessObject.get('camunda:formType') || 'embedded'

  // 加载字段信息
  const extensionElements = businessObject.extensionElements
  if (extensionElements) {
    const formDataElement = extensionElements.values?.find(
      element => element.$type === 'camunda:FormData',
    )

    if (formDataElement && formDataElement.fields) {
      formData.fields = formDataElement.fields.map((field) => {
        const fieldConfig = {
          id: field.id,
          label: field.label,
          type: field.type,
          defaultValue: field.defaultValue || '',
          required: false,
          readonly: false,
          hidden: false,
          options: [],
        }

        // 加载字段属性
        if (field.properties && field.properties.values) {
          field.properties.values.forEach((prop) => {
            if (prop.id === 'required' && prop.value === 'true') {
              fieldConfig.required = true
            }
            if (prop.id === 'readonly' && prop.value === 'true') {
              fieldConfig.readonly = true
            }
            if (prop.id === 'hidden' && prop.value === 'true') {
              fieldConfig.hidden = true
            }
          })
        }

        // 加载选项
        if (field.values) {
          fieldConfig.options = field.values.map(value => ({
            value: value.id,
            label: value.name,
          }))
        }

        return fieldConfig
      })
    }
  }
}

// 监听元素变化
watch(() => props.element, () => {
  if (props.element) {
    loadFormData()
  }
}, { immediate: true })

onMounted(() => {
  if (props.element) {
    loadFormData()
  }
})
</script>

<style scoped>
.forms-panel {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.field-item {
  margin-bottom: 16px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-fields {
  width: 100%;
}

.options-config {
  width: 100%;
}

.option-item {
  margin-bottom: 8px;
}

.form-preview {
  padding: 16px;
}

.preview-field {
  margin-bottom: 16px;
}

:deep(.n-form-item-label) {
  font-weight: 500;
}

:deep(.n-card) {
  margin-bottom: 0;
}

:deep(.n-collapse-item__header-main) {
  font-weight: 500;
}
</style>
