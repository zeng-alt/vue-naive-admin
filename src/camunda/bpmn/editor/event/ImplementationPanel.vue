<template>
  <NForm :model="implementationData" size="small">
    <NFormItem label="实现类型" path="implementationType">
      <NSelect
        v-model:value="implementationData.implementationType"
        placeholder="选择实现类型"
        :options="implementationTypeOptions"
        @update:value="updateImplementationType"
      />
    </NFormItem>

    <!-- Java Class -->
    <NFormItem
      v-show="implementationData.implementationType === 'class'"
      label="Java类"
      path="javaClass"
    >
      <NInput
        v-model:value="implementationData.javaClass"
        placeholder="请输入Java类的完整路径"
        @blur="updateImplementation"
      />
      <template #feedback>
        示例: com.example.MyServiceTask
      </template>
    </NFormItem>

    <!-- Expression -->
    <NFormItem
      v-show="implementationData.implementationType === 'expression'"
      label="表达式"
      path="expression"
    >
      <NInput
        v-model:value="implementationData.expression"
        type="textarea"
        :rows="2"
        placeholder="请输入表达式"
        @blur="updateImplementation"
      />
      <template #feedback>
        示例: ${myBean.doSomething()} 或 ${myBean}
      </template>
    </NFormItem>

    <NFormItem
      v-show="implementationData.implementationType === 'expression'"
      label="返回变量名"
      path="resultVal"
    >
      <NInput
        v-model:value="implementationData.resultVal"
        :rows="2"
        placeholder="请输入返回变量名"
        @blur="updateImplementation"
      />
    </NFormItem>

    <!-- Delegate Expression -->
    <NFormItem
      v-show="implementationData.implementationType === 'delegateExpression'"
      label="委托表达式"
      path="delegateExpression"
    >
      <NInput
        v-model:value="implementationData.delegateExpression"
        placeholder="请输入委托表达式"
        @blur="updateImplementation"
      />
      <template #feedback>
        示例: ${myDelegate} - 引用Spring Bean或CDI Bean
      </template>
    </NFormItem>

    <!-- Connector -->
    <template v-if="implementationData.implementationType === 'connector'">
      <NFormItem label="连接器ID" path="connectorId">
        <NInput
          v-model:value="implementationData.connectorId"
          placeholder="请输入连接器ID"
          @blur="updateImplementation"
        />
        <template #feedback>
          示例: http-connector, mail-connector 等预定义连接器ID
        </template>
      </NFormItem>

      <!-- Connector Inputs -->
      <NFormItem path="connectorInputs">
        <NScrollbar style="max-height: 600px">
          <ConnectorInputs ref="connectorInputsRef" :bo="bo" :element="selectedElement" :modeler="bpmnModeler" @save="updateConnectorExtensions" />
        </NScrollbar>
      </NFormItem>

      <!-- Connector Outputs -->
      <NFormItem path="connectorOutputs">
        <NScrollbar style="max-height: 600px">
          <ConnectorOutputs ref="connectorOutputsRef" :bo="bo" :element="selectedElement" :modeler="bpmnModeler" @save="updateConnectorExtensions" />
        </NScrollbar>
      </NFormItem>
    </template>

    <!-- External Task -->
    <template v-if="implementationData.implementationType === 'external'">
      <NFormItem label="外部任务主题" path="topic">
        <NInput
          v-model:value="implementationData.topic"
          placeholder="请输入外部任务主题"
          @blur="updateImplementation"
        />
        <template #feedback>
          外部工作者将订阅此主题来处理任务
        </template>
      </NFormItem>

      <NFormItem label="任务优先级" path="taskPriority">
        <NInputNumber
          v-model:value="implementationData.taskPriority"
          placeholder="任务优先级"
          :min="0"
          :max="100"
          @blur="updateImplementation"
        />
      </NFormItem>
    </template>

    <!-- Script Task -->
    <template v-if="implementationData.implementationType === 'script'">
      <NFormItem label="脚本格式" path="scriptFormat">
        <NSelect
          v-model:value="implementationData.scriptFormat"
          placeholder="选择脚本语言"
          :options="scriptFormatOptions"
          @update:value="updateImplementation"
        />
      </NFormItem>

      <NFormItem label="脚本类型" path="scriptType">
        <NSelect
          v-model:value="implementationData.scriptType"
          placeholder="选择脚本类型"
          :options="scriptTypeOptions"
          @update:value="updateScriptType"
        />
      </NFormItem>

      <!-- 内联脚本 -->
      <NFormItem
        v-show="implementationData.scriptType === 'inline'"
        label="脚本内容"
        path="script"
      >
        <NInput
          v-model:value="implementationData.script"
          type="textarea"
          :rows="5"
          placeholder="请输入脚本内容"
          @blur="updateImplementation"
        />
      </NFormItem>

      <!-- 外部脚本资源 -->
      <NFormItem
        v-show="implementationData.scriptType === 'external'"
        label="脚本资源"
        path="resource"
      >
        <NInput
          v-model:value="implementationData.resource"
          placeholder="请输入脚本文件路径"
          @blur="updateImplementation"
        />
        <template #feedback>
          示例: classpath:scripts/myScript.js
        </template>
      </NFormItem>
    </template>

    <!-- DMN Business Rule Task -->
    <template v-if="implementationData.implementationType === 'dmn'">
      <NFormItem label="决策参考" path="decisionRef">
        <NInput
          v-model:value="implementationData.decisionRef"
          placeholder="请输入决策定义的ID"
          @blur="updateImplementation"
        />
        <template #feedback>
          引用DMN决策表的ID
        </template>
      </NFormItem>

      <NFormItem label="决策参考绑定" path="decisionRefBinding">
        <NSelect
          v-model:value="implementationData.decisionRefBinding"
          placeholder="选择绑定类型"
          :options="decisionBindingOptions"
          @update:value="updateImplementation"
        />
      </NFormItem>

      <NFormItem
        v-show="implementationData.decisionRefBinding === 'version'"
        label="决策版本"
        path="decisionRefVersion"
      >
        <NInput
          v-model:value="implementationData.decisionRefVersion"
          placeholder="请输入版本号"
          @blur="updateImplementation"
        />
      </NFormItem>
    </template>
  </NForm>
</template>

<script setup>
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NScrollbar,
  NSelect,
} from 'naive-ui'
import { reactive, ref } from 'vue'
import ConnectorInputs from './ConnectorInputs.vue'
import ConnectorOutputs from './ConnectorOutputs.vue'

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
  implementationTypeOptions: {
    type: Array,
    default: () => {
      return [{ label: '无实现', value: 'none' }, { label: 'Java类', value: 'class' }, { label: '表达式', value: 'expression' }, { label: '委托表达式', value: 'delegateExpression' }, { label: '外部任务', value: 'external' }, { label: '连接器', value: 'connector' }, { label: '脚本任务', value: 'script' }, { label: 'DMN业务规则', value: 'dmn' }]
    },
  },
})

const connectorInputsRef = ref(null)
const connectorOutputsRef = ref(null)
// 提取公共变量
const elementRegistry = props.bpmnModeler.get('elementRegistry')
const modeling = props.bpmnModeler.get('modeling')
const moddle = props.bpmnModeler.get('moddle')
const element = elementRegistry.get(props.selectedElement.id)

// 实现数据模型
const implementationData = reactive({
  implementationType: 'none',
  javaClass: '',
  expression: '',
  resultVal: '',
  delegateExpression: '',
  topic: '',
  taskPriority: undefined,
  connectorId: undefined,
  connectorInputs: [],
  connectorOutputs: [],
  scriptFormat: 'javascript',
  scriptType: 'inline',
  script: '',
  resource: '',
  decisionRef: '',
  decisionRefBinding: 'latest',
  decisionRefVersion: '',
})

// 脚本语言选项
const scriptFormatOptions = ref([
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Groovy', value: 'groovy' },
  { label: 'Python', value: 'python' },
  { label: 'JRuby', value: 'jruby' },
])

// 脚本类型选项
const scriptTypeOptions = ref([
  { label: '内联脚本', value: 'inline' },
  { label: '外部脚本', value: 'external' },
])

// 决策绑定选项
const decisionBindingOptions = ref([
  { label: '最新版本', value: 'latest' },
  { label: '部署版本', value: 'deployment' },
  { label: '指定版本', value: 'version' },
])

// 重置实现数据
function resetImplementationData() {
  implementationData.javaClass = ''
  implementationData.expression = ''
  implementationData.delegateExpression = ''
  implementationData.topic = ''
  implementationData.taskPriority = undefined
  implementationData.connectorId = undefined
  implementationData.connectorInputs = []
  implementationData.connectorOutputs = []
  implementationData.script = ''
  implementationData.resource = ''
  implementationData.decisionRef = ''
  implementationData.decisionRefVersion = ''
}

// 更新实现类型
function updateImplementationType(type) {
  implementationData.implementationType = type
  resetImplementationData()

  // 清除所有实现相关的属性
  const properties = {
    'camunda:class': undefined,
    'camunda:expression': undefined,
    'camunda:delegateExpression': undefined,
    'camunda:type': undefined,
    'camunda:topic': undefined,
    'camunda:taskPriority': undefined,
    'camunda:connectorId': undefined,
    'camunda:resultVariable': undefined,
    'scriptFormat': undefined,
    'script': undefined,
    'resource': undefined,
    'camunda:decisionRef': undefined,
    'camunda:decisionRefBinding': undefined,
    'camunda:decisionRefVersion': undefined,
  }

  modeling.updateModdleProperties(element, props.bo, properties)

  // 根据类型设置默认值
  if (type !== 'none') {
    updateImplementation()
  }
}

// 统一的实现更新方法
function updateImplementation() {
  const properties = {}

  switch (implementationData.implementationType) {
    case 'class':
      if (implementationData.javaClass.trim()) {
        properties['camunda:class'] = implementationData.javaClass
      }
      break

    case 'expression':
      if (implementationData.expression.trim()) {
        properties['camunda:expression'] = implementationData.expression
        properties['camunda:resultVariable'] = implementationData.resultVal
      }
      break

    case 'delegateExpression':
      if (implementationData.delegateExpression.trim()) {
        properties['camunda:delegateExpression'] = implementationData.delegateExpression
      }
      break

    case 'external':
      properties['camunda:type'] = 'external'
      if (implementationData.topic.trim()) {
        properties['camunda:topic'] = implementationData.topic
      }
      if (implementationData.taskPriority !== undefined) {
        properties['camunda:taskPriority'] = implementationData.taskPriority.toString()
      }
      break

    case 'connector':
      updateConnectorExtensions()
      break
    case 'script':
      properties.scriptFormat = implementationData.scriptFormat
      if (implementationData.scriptType === 'inline' && implementationData.script.trim()) {
        properties.script = implementationData.script
      }
      else if (implementationData.scriptType === 'external' && implementationData.resource.trim()) {
        properties.resource = implementationData.resource
      }
      break

    case 'dmn':
      if (implementationData.decisionRef.trim()) {
        properties['camunda:decisionRef'] = implementationData.decisionRef
        properties['camunda:decisionRefBinding'] = implementationData.decisionRefBinding
        if (implementationData.decisionRefBinding === 'version' && implementationData.decisionRefVersion.trim()) {
          properties['camunda:decisionRefVersion'] = implementationData.decisionRefVersion
        }
      }
      break
  }

  modeling.updateModdleProperties(element, props.bo, properties)
}

// 更新脚本类型
function updateScriptType(type) {
  implementationData.scriptType = type
  implementationData.script = ''
  implementationData.resource = ''
  updateImplementation()
}

// 获取或创建扩展元素
function getOrCreateExtensionElements() {
  let extensionElements = props.selectedElement.extensionElements

  if (!extensionElements) {
    extensionElements = moddle.create('bpmn:ExtensionElements')
    modeling.updateModdleProperties(element, props.bo, {
      extensionElements,
    })
  }

  return extensionElements
}

// 更新连接器扩展配置
function updateConnectorExtensions() {
  if (implementationData.implementationType !== 'connector')
    return

  const extensionElements = getOrCreateExtensionElements()

  // 移除现有的连接器配置
  const existingInputOutput = extensionElements.values?.find(val => val.$type === 'camunda:Connector')
  if (existingInputOutput) {
    const index = extensionElements.values.indexOf(existingInputOutput)
    if (index > -1) {
      extensionElements.values.splice(index, 1)
    }
  }
  const inputParameters = connectorInputsRef.value?.updateElement()
  const outputParameters = connectorOutputsRef.value?.updateElement()

  if (inputParameters || outputParameters) {
    const inputOutput = moddle.create('camunda:InputOutput')

    if (inputParameters) {
      inputOutput.inputParameters = inputParameters
    }

    if (outputParameters) {
      inputOutput.outputParameters = outputParameters
    }

    if (!extensionElements.values) {
      extensionElements.values = []
    }

    const connector = moddle.create('camunda:Connector', {
      connectorId: implementationData.connectorId,
    })
    connector.inputOutput = inputOutput
    extensionElements.get('values').push(connector)
  }
  else {
    const connector = moddle.create('camunda:Connector', {
      connectorId: implementationData.connectorId,
    })

    extensionElements.get('values').push(connector)
  }

  // 如果没有任何扩展元素，移除整个extensionElements
  if (!extensionElements.values || extensionElements.values.length === 0) {
    modeling.updateModdleProperties(element, props.bo, {
      extensionElements: undefined,
    })
  }
}

// 初始化实现数据
function initImplementationData() {
  // const bo = props.selectedElement.eventDefinitions[0];

  // 检查各种实现类型
  if (props.bo.get('camunda:class')) {
    implementationData.implementationType = 'class'
    implementationData.javaClass = props.bo.get('camunda:class')
  }
  else if (props.bo.get('camunda:expression')) {
    implementationData.implementationType = 'expression'
    implementationData.expression = props.bo.get('camunda:expression')
    implementationData.resultVal = props.bo.get('camunda:resultVariable')
  }
  else if (props.bo.get('camunda:delegateExpression')) {
    implementationData.implementationType = 'delegateExpression'
    implementationData.delegateExpression = props.bo.get('camunda:delegateExpression')
  }
  else if (props.bo.get('camunda:type') === 'external' && props.bo.get('camunda:topic')) {
    implementationData.implementationType = 'external'
    implementationData.topic = props.bo.get('camunda:topic') || ''
    const priority = props.bo.get('camunda:taskPriority')
    implementationData.taskPriority = priority ? Number.parseInt(priority) : undefined
  }
  else if (props.bo.extensionElements?.values.find(element => element.$type === 'camunda:Connector')) {
    implementationData.implementationType = 'connector'
    implementationData.connectorId = props.bo.extensionElements?.values[0]?.connectorId || ''
  }
  else if (props.bo.scriptFormat) {
    implementationData.implementationType = 'script'
    implementationData.scriptFormat = props.bo.scriptFormat
    if (props.bo.script) {
      implementationData.scriptType = 'inline'
      implementationData.script = props.bo.script
    }
    else if (props.bo.resource) {
      implementationData.scriptType = 'external'
      implementationData.resource = props.bo.resource
    }
  }
  else if (props.bo.get('camunda:decisionRef')) {
    implementationData.implementationType = 'dmn'
    implementationData.decisionRef = props.bo.get('camunda:decisionRef')
    implementationData.decisionRefBinding = props.bo.get('camunda:decisionRefBinding') || 'latest'
    implementationData.decisionRefVersion = props.bo.get('camunda:decisionRefVersion') || ''
  }
  else {
    implementationData.implementationType = 'none'
  }
}

// 初始化
initImplementationData()
</script>
