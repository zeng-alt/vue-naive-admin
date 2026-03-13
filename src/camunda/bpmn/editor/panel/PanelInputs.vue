<template>
  <div>
    <NTabs type="line" size="medium">
      <!-- 输入映射 -->
      <NTabPane name="inputMappings" tab="输入映射">
        <div class="input-mappings">
          <div class="section-header">
            <span class="section-title">输入参数映射</span>
            <NButton size="small" type="primary" @click="addInputMapping">
              <template #icon>
                <NIcon>
                  <AddOutline />
                </NIcon>
              </template>
              添加映射
            </NButton>
          </div>

          <div v-if="inputData.inputMappings.length === 0" class="empty-state">
            <NEmpty description="暂无输入映射配置">
              <template #extra>
                <NButton size="small" @click="addInputMapping">
                  创建第一个输入映射
                </NButton>
              </template>
            </NEmpty>
          </div>

          <div v-for="(mapping, index) in inputData.inputMappings" :key="mapping.id" class="mapping-item">
            <NCard size="small" :bordered="true">
              <template #header>
                <div class="mapping-header">
                  <span>映射 {{ index + 1 }}</span>
                  <NButton size="small" type="error" text @click="removeInputMapping(index)">
                    <template #icon>
                      <NIcon>
                        <DeleteOutline />
                      </NIcon>
                    </template>
                  </NButton>
                </div>
              </template>

              <NSpace vertical>
                <NFormItem label="源变量" :show-feedback="false">
                  <NInputGroup>
                    <NSelect
                      v-model:value="mapping.sourceType" :options="sourceTypeOptions" style="width: 30%"
                      @update:value="updateElement"
                    />
                    <NInput
                      v-model:value="mapping.source" placeholder="输入源变量或表达式" style="width: 70%"
                      @blur="updateElement"
                    />
                  </NInputGroup>
                  <template #feedback>
                    <NText depth="3" style="font-size: 12px">
                      {{ getSourceTypeDescription(mapping.sourceType) }}
                    </NText>
                  </template>
                </NFormItem>

                <NFormItem label="目标参数" :show-feedback="false">
                  <NInput v-model:value="mapping.target" placeholder="输入目标参数名称" @blur="updateElement" />
                </NFormItem>

                <NFormItem label="数据类型" :show-feedback="false">
                  <NSelect
                    v-model:value="mapping.dataType" :options="dataTypeOptions" placeholder="选择数据类型"
                    @update:value="updateElement"
                  />
                </NFormItem>

                <NFormItem label="配置" :show-feedback="false">
                  <NSpace>
                    <NCheckbox v-model:checked="mapping.required" @update:checked="updateElement">
                      必需参数
                    </NCheckbox>
                    <NCheckbox v-model:checked="mapping.readOnly" @update:checked="updateElement">
                      只读
                    </NCheckbox>
                    <NCheckbox v-model:checked="mapping.local" @update:checked="updateElement">
                      本地变量
                    </NCheckbox>
                  </NSpace>
                </NFormItem>

                <!-- 默认值配置 -->
                <NFormItem label="默认值" :show-feedback="false">
                  <NInput
                    v-if="!['object', 'array'].includes(mapping.dataType)" v-model:value="mapping.defaultValue"
                    :placeholder="getDefaultValuePlaceholder(mapping.dataType)" @blur="updateElement"
                  />
                  <NInput
                    v-else v-model:value="mapping.defaultValue" type="textarea" placeholder="输入JSON格式的默认值"
                    :rows="3" @blur="updateElement"
                  />
                </NFormItem>

                <!-- 验证规则 -->
                <NCollapse>
                  <NCollapseItem title="验证规则" name="validation">
                    <NSpace vertical>
                      <NFormItem v-if="mapping.dataType === 'number'" label="最小值" :show-feedback="false">
                        <NInputNumber
                          v-model:value="mapping.validation.min" placeholder="最小值"
                          @blur="updateElement"
                        />
                      </NFormItem>

                      <NFormItem v-if="mapping.dataType === 'number'" label="最大值" :show-feedback="false">
                        <NInputNumber
                          v-model:value="mapping.validation.max" placeholder="最大值"
                          @blur="updateElement"
                        />
                      </NFormItem>

                      <NFormItem v-if="mapping.dataType === 'string'" label="最小长度" :show-feedback="false">
                        <NInputNumber
                          v-model:value="mapping.validation.minLength" placeholder="最小长度"
                          @blur="updateElement"
                        />
                      </NFormItem>

                      <NFormItem v-if="mapping.dataType === 'string'" label="最大长度" :show-feedback="false">
                        <NInputNumber
                          v-model:value="mapping.validation.maxLength" placeholder="最大长度"
                          @blur="updateElement"
                        />
                      </NFormItem>

                      <NFormItem v-if="mapping.dataType === 'string'" label="正则表达式" :show-feedback="false">
                        <NInput
                          v-model:value="mapping.validation.pattern" placeholder="输入正则表达式"
                          @blur="updateElement"
                        />
                      </NFormItem>

                      <NFormItem label="自定义验证" :show-feedback="false">
                        <NInput
                          v-model:value="mapping.validation.customExpression" placeholder="输入验证表达式"
                          @blur="updateElement"
                        />
                      </NFormItem>
                    </NSpace>
                  </NCollapseItem>
                </NCollapse>

                <!-- 描述信息 -->
                <NFormItem label="描述" :show-feedback="false">
                  <NInput
                    v-model:value="mapping.description" type="textarea" placeholder="输入参数描述信息" :rows="2"
                    @blur="updateElement"
                  />
                </NFormItem>
              </NSpace>
            </NCard>
          </div>
        </div>
      </NTabPane>

      <!-- 脚本变量 -->
      <NTabPane name="scriptVariables" tab="脚本变量">
        <div class="script-variables">
          <div class="section-header">
            <span class="section-title">脚本输入变量</span>
            <NButton size="small" type="primary" @click="addScriptVariable">
              <template #icon>
                <NIcon>
                  <AddOutline />
                </NIcon>
              </template>
              添加变量
            </NButton>
          </div>

          <div v-if="inputData.scriptVariables.length === 0" class="empty-state">
            <NEmpty description="暂无脚本变量配置" />
          </div>

          <div v-for="(variable, index) in inputData.scriptVariables" :key="variable.id" class="variable-item">
            <NCard size="small" :bordered="true">
              <template #header>
                <div class="variable-header">
                  <span>变量 {{ index + 1 }}</span>
                  <NButton size="small" type="error" text @click="removeScriptVariable(index)">
                    <template #icon>
                      <NIcon>
                        <DeleteOutline />
                      </NIcon>
                    </template>
                  </NButton>
                </div>
              </template>

              <NSpace vertical>
                <NFormItem label="变量名" :show-feedback="false">
                  <NInput v-model:value="variable.name" placeholder="输入变量名" @blur="updateElement" />
                </NFormItem>

                <NFormItem label="变量值" :show-feedback="false">
                  <NInputGroup>
                    <NSelect
                      v-model:value="variable.valueType" :options="valueTypeOptions" style="width: 25%"
                      @update:value="updateElement"
                    />
                    <NInput
                      v-if="variable.valueType !== 'script'" v-model:value="variable.value" placeholder="输入变量值"
                      style="width: 75%" @blur="updateElement"
                    />
                    <NInput
                      v-else v-model:value="variable.value" type="textarea" placeholder="输入脚本代码" :rows="3"
                      style="width: 75%" @blur="updateElement"
                    />
                  </NInputGroup>
                </NFormItem>

                <NFormItem v-if="variable.valueType === 'script'" label="脚本格式" :show-feedback="false">
                  <NSelect
                    v-model:value="variable.scriptFormat" :options="scriptFormatOptions"
                    @update:value="updateElement"
                  />
                </NFormItem>

                <NFormItem label="作用域" :show-feedback="false">
                  <NRadioGroup v-model:value="variable.scope" @update:value="updateElement">
                    <NSpace>
                      <NRadio value="global">
                        全局
                      </NRadio>
                      <NRadio value="local">
                        本地
                      </NRadio>
                      <NRadio value="task">
                        任务
                      </NRadio>
                    </NSpace>
                  </NRadioGroup>
                </NFormItem>
              </NSpace>
            </NCard>
          </div>
        </div>
      </NTabPane>

      <!-- 条件配置 -->
      <NTabPane name="conditions" tab="条件配置">
        <div class="conditions">
          <NForm>
            <NFormItem label="执行条件">
              <NInput
                v-model:value="inputData.executionCondition" type="textarea"
                placeholder="输入执行条件表达式，如：${variable > 10}" :rows="3" @blur="updateElement"
              />
              <template #feedback>
                <NText depth="3">
                  使用表达式语言定义节点执行条件
                </NText>
              </template>
            </NFormItem>

            <NFormItem label="跳过表达式">
              <NInput v-model:value="inputData.skipExpression" placeholder="输入跳过条件表达式" @blur="updateElement" />
              <template #feedback>
                <NText depth="3">
                  满足条件时跳过当前节点
                </NText>
              </template>
            </NFormItem>

            <NFormItem label="异步执行">
              <NSpace>
                <NCheckbox v-model:checked="inputData.asyncBefore" @update:checked="updateElement">
                  异步前置
                </NCheckbox>
                <NCheckbox v-model:checked="inputData.asyncAfter" @update:checked="updateElement">
                  异步后置
                </NCheckbox>
                <NCheckbox v-model:checked="inputData.exclusive" @update:checked="updateElement">
                  排他执行
                </NCheckbox>
              </NSpace>
            </NFormItem>

            <NFormItem v-if="inputData.asyncBefore || inputData.asyncAfter" label="重试配置">
              <NSpace vertical style="width: 100%">
                <NInputGroup>
                  <NInputGroupLabel style="width: 80px">
                    重试次数
                  </NInputGroupLabel>
                  <NInputNumber
                    v-model:value="inputData.retryTimeCycle.retries" :min="0" placeholder="重试次数"
                    @blur="updateElement"
                  />
                </NInputGroup>
                <NInputGroup>
                  <NInputGroupLabel style="width: 80px">
                    重试间隔
                  </NInputGroupLabel>
                  <NInput
                    v-model:value="inputData.retryTimeCycle.timeCycle" placeholder="如：PT1M（1分钟）"
                    @blur="updateElement"
                  />
                </NInputGroup>
              </NSpace>
            </NFormItem>
          </NForm>
        </div>
      </NTabPane>
    </NTabs>

    <!-- 操作按钮 -->
    <NSpace justify="end" style="margin-top: 24px">
      <NButton @click="resetInputs">
        重置
      </NButton>
      <NButton type="primary" @click="saveInputs">
        保存配置
      </NButton>
      <NButton type="info" @click="exportConfig">
        导出配置
      </NButton>
      <NButton type="warning" @click="validateInputs">
        验证配置
      </NButton>
    </NSpace>

    <!-- 导出配置对话框 -->
    <NModal v-model:show="showExportModal" title="导出配置" size="large" :mask-closable="false">
      <NCard title="输入参数配置JSON" :bordered="false">
        <NInput
          :value="exportedConfig" type="textarea" readonly :rows="20"
          style="font-family: 'Courier New', monospace"
        />
        <template #action>
          <NSpace justify="end">
            <NButton @click="showExportModal = false">
              关闭
            </NButton>
            <NButton type="primary" @click="copyConfig">
              复制配置
            </NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import {
  NButton,
  NCard,
  NCheckbox,
  NCollapse,
  NCollapseItem,
  NEmpty,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NInputNumber,
  NModal,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NTabPane,
  NTabs,
  NText,
  useMessage,
} from 'naive-ui'
import { computed, onMounted, reactive, ref, watch } from 'vue'

// Props
interface Props {
  element?: any // BPMN元素
  modeler?: any // BPMN建模器实例
}

const props = withDefaults(defineProps<Props>(), {
  element: null,
  modeler: null,
})

// Emits
const emit = defineEmits<{
  'inputs-updated': [inputData: any]
}>()

const message = useMessage()
const showExportModal = ref(false)

// 输入数据
const inputData = reactive({
  inputMappings: [] as any[],
  scriptVariables: [] as any[],
  executionCondition: '',
  skipExpression: '',
  asyncBefore: false,
  asyncAfter: false,
  exclusive: true,
  retryTimeCycle: {
    retries: 3,
    timeCycle: 'PT1M',
  },
})

// 配置选项
const sourceTypeOptions = [
  { label: '变量', value: 'variable' },
  { label: '表达式', value: 'expression' },
  { label: '常量', value: 'constant' },
  { label: '脚本', value: 'script' },
]

const dataTypeOptions = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔值', value: 'boolean' },
  { label: '日期', value: 'date' },
  { label: '对象', value: 'object' },
  { label: '数组', value: 'array' },
  { label: '文件', value: 'file' },
]

const valueTypeOptions = [
  { label: '字符串', value: 'string' },
  { label: '表达式', value: 'expression' },
  { label: '脚本', value: 'script' },
]

const scriptFormatOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Groovy', value: 'groovy' },
  { label: 'Python', value: 'python' },
  { label: 'JUEL', value: 'juel' },
]

// 生成唯一ID
function generateId() {
  return `input_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
}

// 获取源类型描述
function getSourceTypeDescription(sourceType: string) {
  const descriptions: Record<string, string> = {
    variable: '引用流程变量，如：myVariable',
    expression: '使用表达式，如：${variable + 10}',
    constant: '使用常量值，如：固定的字符串或数字',
    script: '执行脚本代码返回值',
  }
  return descriptions[sourceType] || ''
}

// 获取默认值占位符
function getDefaultValuePlaceholder(dataType: string) {
  const placeholders: Record<string, string> = {
    string: '输入字符串默认值',
    number: '输入数字默认值',
    boolean: 'true 或 false',
    date: '输入日期格式，如：2023-12-01',
  }
  return placeholders[dataType] || '输入默认值'
}

// 添加输入映射
function addInputMapping() {
  const newMapping = {
    id: generateId(),
    source: '',
    sourceType: 'variable',
    target: '',
    dataType: 'string',
    required: false,
    readOnly: false,
    local: false,
    defaultValue: '',
    validation: {
      min: null,
      max: null,
      minLength: null,
      maxLength: null,
      pattern: '',
      customExpression: '',
    },
    description: '',
  }
  inputData.inputMappings.push(newMapping)
  updateElement()
}

// 删除输入映射
function removeInputMapping(index: number) {
  inputData.inputMappings.splice(index, 1)
  updateElement()
}

// 添加脚本变量
function addScriptVariable() {
  const newVariable = {
    id: generateId(),
    name: '',
    value: '',
    valueType: 'string',
    scriptFormat: 'javascript',
    scope: 'local',
  }
  inputData.scriptVariables.push(newVariable)
  updateElement()
}

// 删除脚本变量
function removeScriptVariable(index: number) {
  inputData.scriptVariables.splice(index, 1)
  updateElement()
}

// 更新BPMN元素
function updateElement() {
  if (!props.element || !props.modeler)
    return

  const modeling = props.modeler.get('modeling')
  const moddle = props.modeler.get('moddle')

  // 更新基本属性
  modeling.updateProperties(props.element, {
    'camunda:asyncBefore': inputData.asyncBefore,
    'camunda:asyncAfter': inputData.asyncAfter,
    'camunda:exclusive': inputData.exclusive,
  })

  // 创建或更新扩展元素
  let extensionElements = props.element.businessObject.extensionElements
  if (!extensionElements) {
    extensionElements = moddle.create('bpmn:ExtensionElements')
  }

  // 清除现有的输入相关配置
  extensionElements.values = extensionElements.values?.filter((element: any) =>
    !['camunda:InputOutput', 'camunda:Script', 'camunda:ExecutionListener'].includes(element.$type),
  ) || []

  // 添加输入输出映射
  if (inputData.inputMappings.length > 0) {
    const inputOutput = moddle.create('camunda:InputOutput')

    inputOutput.inputParameters = inputData.inputMappings.map((mapping: any) => {
      const inputParameter = moddle.create('camunda:InputParameter')
      inputParameter.name = mapping.target

      if (mapping.sourceType === 'script') {
        const script = moddle.create('camunda:Script')
        script.scriptFormat = 'javascript'
        script.value = mapping.source
        inputParameter.definition = script
      }
      else {
        inputParameter.value = mapping.source
      }

      return inputParameter
    })

    extensionElements.values.push(inputOutput)
  }

  // 添加脚本变量
  if (inputData.scriptVariables.length > 0) {
    inputData.scriptVariables.forEach((variable: any) => {
      if (variable.valueType === 'script') {
        const script = moddle.create('camunda:Script')
        script.scriptFormat = variable.scriptFormat
        script.value = variable.value

        const executionListener = moddle.create('camunda:ExecutionListener')
        executionListener.event = 'start'
        executionListener.script = script

        extensionElements.values.push(executionListener)
      }
    })
  }

  // 添加条件配置
  if (inputData.executionCondition) {
    const conditionExpression = moddle.create('bpmn:FormalExpression')
    conditionExpression.body = inputData.executionCondition

    modeling.updateProperties(props.element, {
      conditionExpression,
    })
  }

  // 更新扩展元素
  modeling.updateProperties(props.element, {
    extensionElements: extensionElements.values.length > 0 ? extensionElements : undefined,
  })

  emit('inputs-updated', { ...inputData })
}

// 重置输入配置
function resetInputs() {
  Object.assign(inputData, {
    inputMappings: [],
    scriptVariables: [],
    executionCondition: '',
    skipExpression: '',
    asyncBefore: false,
    asyncAfter: false,
    exclusive: true,
    retryTimeCycle: {
      retries: 3,
      timeCycle: 'PT1M',
    },
  })
  updateElement()
  message.success('输入配置已重置')
}

// 保存输入配置
function saveInputs() {
  updateElement()
  message.success('输入配置已保存')
}

// 验证输入配置
function validateInputs() {
  const errors: string[] = []

  // 验证输入映射
  inputData.inputMappings.forEach((mapping, index) => {
    if (!mapping.source) {
      errors.push(`输入映射 ${index + 1}: 源变量不能为空`)
    }
    if (!mapping.target) {
      errors.push(`输入映射 ${index + 1}: 目标参数不能为空`)
    }
  })

  // 验证脚本变量
  inputData.scriptVariables.forEach((variable, index) => {
    if (!variable.name) {
      errors.push(`脚本变量 ${index + 1}: 变量名不能为空`)
    }
    if (!variable.value) {
      errors.push(`脚本变量 ${index + 1}: 变量值不能为空`)
    }
  })

  if (errors.length > 0) {
    message.error(`配置验证失败：\n${errors.join('\n')}`)
  }
  else {
    message.success('配置验证通过')
  }
}

// 导出配置
const exportedConfig = computed(() => {
  return JSON.stringify(inputData, null, 2)
})

function exportConfig() {
  showExportModal.value = true
}

// 复制配置
async function copyConfig() {
  try {
    await navigator.clipboard.writeText(exportedConfig.value)
    message.success('配置已复制到剪贴板')
  }
  catch (error) {
    message.error('复制失败，请手动复制')
  }
}

// 加载现有配置
function loadInputData() {
  if (!props.element)
    return

  const businessObject = props.element.businessObject

  // 加载基本属性
  inputData.asyncBefore = businessObject.get('camunda:asyncBefore') || false
  inputData.asyncAfter = businessObject.get('camunda:asyncAfter') || false
  inputData.exclusive = businessObject.get('camunda:exclusive') !== false

  // 加载扩展元素
  const extensionElements = businessObject.extensionElements
  if (extensionElements) {
    // 加载输入映射
    const inputOutput = extensionElements.values?.find(
      (element: any) => element.$type === 'camunda:InputOutput',
    )

    if (inputOutput && inputOutput.inputParameters) {
      inputData.inputMappings = inputOutput.inputParameters.map((param: any) => {
        const mapping: any = {
          id: generateId(),
          target: param.name,
          source: param.value || '',
          sourceType: 'variable',
          dataType: 'string',
          required: false,
          readOnly: false,
          local: false,
          defaultValue: '',
          validation: {
            min: null,
            max: null,
            minLength: null,
            maxLength: null,
            pattern: '',
            customExpression: '',
          },
          description: '',
        }

        // 检查是否为脚本类型
        if (param.definition && param.definition.$type === 'camunda:Script') {
          mapping.sourceType = 'script'
          mapping.source = param.definition.value
        }

        return mapping
      })
    }

    // 加载脚本变量（从执行监听器中）
    const executionListeners = extensionElements.values?.filter(
      (element: any) => element.$type === 'camunda:ExecutionListener',
    ) || []

    inputData.scriptVariables = executionListeners
      .filter((listener: any) => listener.script)
      .map((listener: any) => ({
        id: generateId(),
        name: `scriptVar_${Date.now()}`,
        value: listener.script.value,
        valueType: 'script',
        scriptFormat: listener.script.scriptFormat || 'javascript',
        scope: 'local',
      }))
  }

  // 加载条件表达式
  if (businessObject.conditionExpression) {
    inputData.executionCondition = businessObject.conditionExpression.body || ''
  }
}

// 监听元素变化
watch(() => props.element, () => {
  if (props.element) {
    loadInputData()
  }
}, { immediate: true })

onMounted(() => {
  if (props.element) {
    loadInputData()
  }
})
</script>
