<template>
  <div>
    <n-tabs type="line" size="medium">
      <!-- 输入映射 -->
      <n-tab-pane name="inputMappings" tab="输入映射">
        <div class="input-mappings">
          <div class="section-header">
            <span class="section-title">输入参数映射</span>
            <n-button size="small" type="primary" @click="addInputMapping">
              <template #icon>
                <n-icon>
                  <AddOutline />
                </n-icon>
              </template>
              添加映射
            </n-button>
          </div>

          <div v-if="inputData.inputMappings.length === 0" class="empty-state">
            <n-empty description="暂无输入映射配置">
              <template #extra>
                <n-button size="small" @click="addInputMapping">
                  创建第一个输入映射
                </n-button>
              </template>
            </n-empty>
          </div>

          <div v-for="(mapping, index) in inputData.inputMappings" :key="mapping.id" class="mapping-item">
            <n-card size="small" :bordered="true">
              <template #header>
                <div class="mapping-header">
                  <span>映射 {{ index + 1 }}</span>
                  <n-button size="small" type="error" text @click="removeInputMapping(index)">
                    <template #icon>
                      <n-icon>
                        <DeleteOutline />
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </template>

              <n-space vertical>
                <n-form-item label="源变量" :show-feedback="false">
                  <n-input-group>
                    <n-select v-model:value="mapping.sourceType" :options="sourceTypeOptions" style="width: 30%"
                      @update:value="updateElement" />
                    <n-input v-model:value="mapping.source" placeholder="输入源变量或表达式" style="width: 70%"
                      @blur="updateElement" />
                  </n-input-group>
                  <template #feedback>
                    <n-text depth="3" style="font-size: 12px">
                      {{ getSourceTypeDescription(mapping.sourceType) }}
                    </n-text>
                  </template>
                </n-form-item>

                <n-form-item label="目标参数" :show-feedback="false">
                  <n-input v-model:value="mapping.target" placeholder="输入目标参数名称" @blur="updateElement" />
                </n-form-item>

                <n-form-item label="数据类型" :show-feedback="false">
                  <n-select v-model:value="mapping.dataType" :options="dataTypeOptions" placeholder="选择数据类型"
                    @update:value="updateElement" />
                </n-form-item>

                <n-form-item label="配置" :show-feedback="false">
                  <n-space>
                    <n-checkbox v-model:checked="mapping.required" @update:checked="updateElement">
                      必需参数
                    </n-checkbox>
                    <n-checkbox v-model:checked="mapping.readOnly" @update:checked="updateElement">
                      只读
                    </n-checkbox>
                    <n-checkbox v-model:checked="mapping.local" @update:checked="updateElement">
                      本地变量
                    </n-checkbox>
                  </n-space>
                </n-form-item>

                <!-- 默认值配置 -->
                <n-form-item label="默认值" :show-feedback="false">
                  <n-input v-if="!['object', 'array'].includes(mapping.dataType)" v-model:value="mapping.defaultValue"
                    :placeholder="getDefaultValuePlaceholder(mapping.dataType)" @blur="updateElement" />
                  <n-input v-else v-model:value="mapping.defaultValue" type="textarea" placeholder="输入JSON格式的默认值"
                    :rows="3" @blur="updateElement" />
                </n-form-item>

                <!-- 验证规则 -->
                <n-collapse>
                  <n-collapse-item title="验证规则" name="validation">
                    <n-space vertical>
                      <n-form-item label="最小值" :show-feedback="false" v-if="mapping.dataType === 'number'">
                        <n-input-number v-model:value="mapping.validation.min" placeholder="最小值"
                          @blur="updateElement" />
                      </n-form-item>

                      <n-form-item label="最大值" :show-feedback="false" v-if="mapping.dataType === 'number'">
                        <n-input-number v-model:value="mapping.validation.max" placeholder="最大值"
                          @blur="updateElement" />
                      </n-form-item>

                      <n-form-item label="最小长度" :show-feedback="false" v-if="mapping.dataType === 'string'">
                        <n-input-number v-model:value="mapping.validation.minLength" placeholder="最小长度"
                          @blur="updateElement" />
                      </n-form-item>

                      <n-form-item label="最大长度" :show-feedback="false" v-if="mapping.dataType === 'string'">
                        <n-input-number v-model:value="mapping.validation.maxLength" placeholder="最大长度"
                          @blur="updateElement" />
                      </n-form-item>

                      <n-form-item label="正则表达式" :show-feedback="false" v-if="mapping.dataType === 'string'">
                        <n-input v-model:value="mapping.validation.pattern" placeholder="输入正则表达式"
                          @blur="updateElement" />
                      </n-form-item>

                      <n-form-item label="自定义验证" :show-feedback="false">
                        <n-input v-model:value="mapping.validation.customExpression" placeholder="输入验证表达式"
                          @blur="updateElement" />
                      </n-form-item>
                    </n-space>
                  </n-collapse-item>
                </n-collapse>

                <!-- 描述信息 -->
                <n-form-item label="描述" :show-feedback="false">
                  <n-input v-model:value="mapping.description" type="textarea" placeholder="输入参数描述信息" :rows="2"
                    @blur="updateElement" />
                </n-form-item>
              </n-space>
            </n-card>
          </div>
        </div>
      </n-tab-pane>

      <!-- 脚本变量 -->
      <n-tab-pane name="scriptVariables" tab="脚本变量">
        <div class="script-variables">
          <div class="section-header">
            <span class="section-title">脚本输入变量</span>
            <n-button size="small" type="primary" @click="addScriptVariable">
              <template #icon>
                <n-icon>
                  <AddOutline />
                </n-icon>
              </template>
              添加变量
            </n-button>
          </div>

          <div v-if="inputData.scriptVariables.length === 0" class="empty-state">
            <n-empty description="暂无脚本变量配置" />
          </div>

          <div v-for="(variable, index) in inputData.scriptVariables" :key="variable.id" class="variable-item">
            <n-card size="small" :bordered="true">
              <template #header>
                <div class="variable-header">
                  <span>变量 {{ index + 1 }}</span>
                  <n-button size="small" type="error" text @click="removeScriptVariable(index)">
                    <template #icon>
                      <n-icon>
                        <DeleteOutline />
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </template>

              <n-space vertical>
                <n-form-item label="变量名" :show-feedback="false">
                  <n-input v-model:value="variable.name" placeholder="输入变量名" @blur="updateElement" />
                </n-form-item>

                <n-form-item label="变量值" :show-feedback="false">
                  <n-input-group>
                    <n-select v-model:value="variable.valueType" :options="valueTypeOptions" style="width: 25%"
                      @update:value="updateElement" />
                    <n-input v-if="variable.valueType !== 'script'" v-model:value="variable.value" placeholder="输入变量值"
                      style="width: 75%" @blur="updateElement" />
                    <n-input v-else v-model:value="variable.value" type="textarea" placeholder="输入脚本代码" :rows="3"
                      style="width: 75%" @blur="updateElement" />
                  </n-input-group>
                </n-form-item>

                <n-form-item label="脚本格式" :show-feedback="false" v-if="variable.valueType === 'script'">
                  <n-select v-model:value="variable.scriptFormat" :options="scriptFormatOptions"
                    @update:value="updateElement" />
                </n-form-item>

                <n-form-item label="作用域" :show-feedback="false">
                  <n-radio-group v-model:value="variable.scope" @update:value="updateElement">
                    <n-space>
                      <n-radio value="global">全局</n-radio>
                      <n-radio value="local">本地</n-radio>
                      <n-radio value="task">任务</n-radio>
                    </n-space>
                  </n-radio-group>
                </n-form-item>
              </n-space>
            </n-card>
          </div>
        </div>
      </n-tab-pane>

      <!-- 条件配置 -->
      <n-tab-pane name="conditions" tab="条件配置">
        <div class="conditions">
          <n-form>
            <n-form-item label="执行条件">
              <n-input v-model:value="inputData.executionCondition" type="textarea"
                placeholder="输入执行条件表达式，如：${variable > 10}" :rows="3" @blur="updateElement" />
              <template #feedback>
                <n-text depth="3">使用表达式语言定义节点执行条件</n-text>
              </template>
            </n-form-item>

            <n-form-item label="跳过表达式">
              <n-input v-model:value="inputData.skipExpression" placeholder="输入跳过条件表达式" @blur="updateElement" />
              <template #feedback>
                <n-text depth="3">满足条件时跳过当前节点</n-text>
              </template>
            </n-form-item>

            <n-form-item label="异步执行">
              <n-space>
                <n-checkbox v-model:checked="inputData.asyncBefore" @update:checked="updateElement">
                  异步前置
                </n-checkbox>
                <n-checkbox v-model:checked="inputData.asyncAfter" @update:checked="updateElement">
                  异步后置
                </n-checkbox>
                <n-checkbox v-model:checked="inputData.exclusive" @update:checked="updateElement">
                  排他执行
                </n-checkbox>
              </n-space>
            </n-form-item>

            <n-form-item label="重试配置" v-if="inputData.asyncBefore || inputData.asyncAfter">
              <n-space vertical style="width: 100%">
                <n-input-group>
                  <n-input-group-label style="width: 80px">重试次数</n-input-group-label>
                  <n-input-number v-model:value="inputData.retryTimeCycle.retries" :min="0" placeholder="重试次数"
                    @blur="updateElement" />
                </n-input-group>
                <n-input-group>
                  <n-input-group-label style="width: 80px">重试间隔</n-input-group-label>
                  <n-input v-model:value="inputData.retryTimeCycle.timeCycle" placeholder="如：PT1M（1分钟）"
                    @blur="updateElement" />
                </n-input-group>
              </n-space>
            </n-form-item>
          </n-form>
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 操作按钮 -->
    <n-space justify="end" style="margin-top: 24px">
      <n-button @click="resetInputs">重置</n-button>
      <n-button type="primary" @click="saveInputs">保存配置</n-button>
      <n-button type="info" @click="exportConfig">导出配置</n-button>
      <n-button type="warning" @click="validateInputs">验证配置</n-button>
    </n-space>


    <!-- 导出配置对话框 -->
    <n-modal v-model:show="showExportModal" title="导出配置" size="large" :mask-closable="false">
      <n-card title="输入参数配置JSON" :bordered="false">
        <n-input :value="exportedConfig" type="textarea" readonly :rows="20"
          style="font-family: 'Courier New', monospace" />
        <template #action>
          <n-space justify="end">
            <n-button @click="showExportModal = false">关闭</n-button>
            <n-button type="primary" @click="copyConfig">复制配置</n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import {
  NCard,
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NInputNumber,
  NSelect,
  NButton,
  NSpace,
  NIcon,
  NCheckbox,
  NRadio,
  NRadioGroup,
  NCollapse,
  NCollapseItem,
  NModal,
  NEmpty,
  NText,
  useMessage
} from 'naive-ui'

// Props
interface Props {
  element?: any // BPMN元素
  modeler?: any // BPMN建模器实例
}

const props = withDefaults(defineProps<Props>(), {
  element: null,
  modeler: null
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
    timeCycle: 'PT1M'
  }
})

// 配置选项
const sourceTypeOptions = [
  { label: '变量', value: 'variable' },
  { label: '表达式', value: 'expression' },
  { label: '常量', value: 'constant' },
  { label: '脚本', value: 'script' }
]

const dataTypeOptions = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔值', value: 'boolean' },
  { label: '日期', value: 'date' },
  { label: '对象', value: 'object' },
  { label: '数组', value: 'array' },
  { label: '文件', value: 'file' }
]

const valueTypeOptions = [
  { label: '字符串', value: 'string' },
  { label: '表达式', value: 'expression' },
  { label: '脚本', value: 'script' }
]

const scriptFormatOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Groovy', value: 'groovy' },
  { label: 'Python', value: 'python' },
  { label: 'JUEL', value: 'juel' }
]

// 生成唯一ID
const generateId = () => {
  return 'input_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
}

// 获取源类型描述
const getSourceTypeDescription = (sourceType: string) => {
  const descriptions: Record<string, string> = {
    variable: '引用流程变量，如：myVariable',
    expression: '使用表达式，如：${variable + 10}',
    constant: '使用常量值，如：固定的字符串或数字',
    script: '执行脚本代码返回值'
  }
  return descriptions[sourceType] || ''
}

// 获取默认值占位符
const getDefaultValuePlaceholder = (dataType: string) => {
  const placeholders: Record<string, string> = {
    string: '输入字符串默认值',
    number: '输入数字默认值',
    boolean: 'true 或 false',
    date: '输入日期格式，如：2023-12-01'
  }
  return placeholders[dataType] || '输入默认值'
}

// 添加输入映射
const addInputMapping = () => {
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
      customExpression: ''
    },
    description: ''
  }
  inputData.inputMappings.push(newMapping)
  updateElement()
}

// 删除输入映射
const removeInputMapping = (index: number) => {
  inputData.inputMappings.splice(index, 1)
  updateElement()
}

// 添加脚本变量
const addScriptVariable = () => {
  const newVariable = {
    id: generateId(),
    name: '',
    value: '',
    valueType: 'string',
    scriptFormat: 'javascript',
    scope: 'local'
  }
  inputData.scriptVariables.push(newVariable)
  updateElement()
}

// 删除脚本变量
const removeScriptVariable = (index: number) => {
  inputData.scriptVariables.splice(index, 1)
  updateElement()
}

// 更新BPMN元素
const updateElement = () => {
  if (!props.element || !props.modeler) return

  const modeling = props.modeler.get('modeling')
  const moddle = props.modeler.get('moddle')

  // 更新基本属性
  modeling.updateProperties(props.element, {
    'camunda:asyncBefore': inputData.asyncBefore,
    'camunda:asyncAfter': inputData.asyncAfter,
    'camunda:exclusive': inputData.exclusive
  })

  // 创建或更新扩展元素
  let extensionElements = props.element.businessObject.extensionElements
  if (!extensionElements) {
    extensionElements = moddle.create('bpmn:ExtensionElements')
  }

  // 清除现有的输入相关配置
  extensionElements.values = extensionElements.values?.filter((element: any) =>
    !['camunda:InputOutput', 'camunda:Script', 'camunda:ExecutionListener'].includes(element.$type)
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
      } else {
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
      conditionExpression: conditionExpression
    })
  }

  // 更新扩展元素
  modeling.updateProperties(props.element, {
    extensionElements: extensionElements.values.length > 0 ? extensionElements : undefined
  })

  emit('inputs-updated', { ...inputData })
}

// 重置输入配置
const resetInputs = () => {
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
      timeCycle: 'PT1M'
    }
  })
  updateElement()
  message.success('输入配置已重置')
}

// 保存输入配置
const saveInputs = () => {
  updateElement()
  message.success('输入配置已保存')
}

// 验证输入配置
const validateInputs = () => {
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
  } else {
    message.success('配置验证通过')
  }
}

// 导出配置
const exportedConfig = computed(() => {
  return JSON.stringify(inputData, null, 2)
})

const exportConfig = () => {
  showExportModal.value = true
}

// 复制配置
const copyConfig = async () => {
  try {
    await navigator.clipboard.writeText(exportedConfig.value)
    message.success('配置已复制到剪贴板')
  } catch (error) {
    message.error('复制失败，请手动复制')
  }
}

// 加载现有配置
const loadInputData = () => {
  if (!props.element) return

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
      (element: any) => element.$type === 'camunda:InputOutput'
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
            customExpression: ''
          },
          description: ''
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
      (element: any) => element.$type === 'camunda:ExecutionListener'
    ) || []

    inputData.scriptVariables = executionListeners
      .filter((listener: any) => listener.script)
      .map((listener: any) => ({
        id: generateId(),
        name: 'scriptVar_' + Date.now(),
        value: listener.script.value,
        valueType: 'script',
        scriptFormat: listener.script.scriptFormat || 'javascript',
        scope: 'local'
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
