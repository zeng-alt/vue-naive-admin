<template>
  <div class="outputs-panel">
    <div class="outputs-section">
      <div class="section-header">
        <span class="section-title">输出参数 (Output Parameters)</span>
        <NButton size="small" type="primary" @click="addOutput">
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
          添加参数
        </NButton>
      </div>

      <div v-if="outputData.outputs.length === 0" class="empty-state">
        <NEmpty description="暂无输出参数">
          <template #extra>
            <NButton size="small" @click="addOutput">
              添加第一个输出参数
            </NButton>
          </template>
        </NEmpty>
      </div>

      <div v-for="(output, index) in outputData.outputs" :key="output.id" class="output-item">
        <NCard size="small" :bordered="true">
          <template #header>
            <div class="output-header">
              <span>{{ output.name || `参数 ${index + 1}` }}</span>
              <NButton size="small" type="error" text @click="removeOutput(index)">
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 16 16">
                    <path fill="currentColor" fill-rule="evenodd" d="M5.75 3V1.5h4.5V3h-4.5Zm-1.5 0V1a1 1 0 0 1 1-1h5.5a1 1 0 0 1 1 1v2h2.5a.75.75 0 0 1 0 1.5h-.365l-.743 9.653A2 2 0 0 1 11.148 16H4.852a2 2 0 0 1-1.994-1.847L2.115 4.5H1.75a.75.75 0 0 1 0-1.5h2.5Zm-.63 1.5h8.76l-.734 9.538a.5.5 0 0 1-.498.462H4.852a.5.5 0 0 1-.498-.462L3.62 4.5Z" clip-rule="evenodd" />
                  </svg>
                </NIcon>
              </NButton>
            </div>
          </template>

          <NSpace vertical>
            <!-- 参数名 -->
            <NFormItem label="参数名" :show-feedback="false">
              <NInput v-model:value="output.name" size="small" :autofocus="index === outputData.outputs.length - 1" placeholder="输入参数名称" @blur="updateElement" />
            </NFormItem>

            <!-- 参数类型 -->
            <NFormItem label="参数类型" :show-feedback="false">
              <NSelect v-model:value="output.type" size="small" :options="outputTypeOptions" @update:value="onTypeChange(output)" />
            </NFormItem>

            <!-- 字符串/表达式类型 -->
            <NFormItem
              v-if="output.type === 'string' || output.type === 'expression'" label="值"
              :show-feedback="false"
            >
              <NInput
                v-model:value="output.value" size="small"
                :placeholder="output.type === 'expression' ? '${variable}' : '输入字符串值'" @blur="updateElement"
              />
            </NFormItem>

            <!-- 脚本类型 -->
            <template v-if="output.type === 'script'">
              <NFormItem label="脚本格式" :show-feedback="false">
                <NSelect
                  v-model:value="output.scriptFormat" size="small" :options="scriptFormatOptions"
                  @update:value="updateElement"
                />
              </NFormItem>
              <NFormItem label="脚本内容" :show-feedback="false">
                <NInput
                  v-model:value="output.scriptValue" size="small" type="textarea" placeholder="输入脚本代码" :rows="4"
                  @blur="updateElement"
                />
              </NFormItem>
            </template>

            <!-- List类型 -->
            <template v-if="output.type === 'list'">
              <NFormItem label="列表项" :show-feedback="false">
                <div class="list-items">
                  <div v-for="(item, itemIndex) in output.listItems" :key="itemIndex" class="list-item">
                    <NInputGroup>
                      <NInput
                        v-model:value="item.value" size="small" :placeholder="getListItemPlaceholder(item.type)"
                        @blur="updateElement"
                      />
                      <NButton
                        size="small" type="error"
                        @click="removeListItem(output, itemIndex)"
                      >
                        <NIcon>
                          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 16 16">
                            <path fill="currentColor" fill-rule="evenodd" d="M5.75 3V1.5h4.5V3h-4.5Zm-1.5 0V1a1 1 0 0 1 1-1h5.5a1 1 0 0 1 1 1v2h2.5a.75.75 0 0 1 0 1.5h-.365l-.743 9.653A2 2 0 0 1 11.148 16H4.852a2 2 0 0 1-1.994-1.847L2.115 4.5H1.75a.75.75 0 0 1 0-1.5h2.5Zm-.63 1.5h8.76l-.734 9.538a.5.5 0 0 1-.498.462H4.852a.5.5 0 0 1-.498-.462L3.62 4.5Z" clip-rule="evenodd" />
                          </svg>
                        </NIcon>
                      </NButton>
                    </NInputGroup>
                  </div>
                  <NButton size="small" block style="margin-top: 8px" @click="addListItem(output)">
                    添加列表项
                  </NButton>
                </div>
              </NFormItem>
            </template>

            <!-- Map类型 -->
            <template v-if="output.type === 'map'">
              <NFormItem label="键值对" :show-feedback="false">
                <div class="map-entries">
                  <div v-for="(entry, entryIndex) in output.mapEntries" :key="entryIndex" class="map-entry">
                    <NInputGroup>
                      <NInput v-model:value="entry.key" size="small" placeholder="键名" @blur="updateElement" />
                      <NInput
                        v-model:value="entry.value" size="small" :placeholder="getMapValuePlaceholder(entry.type)"
                        @blur="updateElement"
                      />
                      <NButton size="small" type="error" @click="removeMapEntry(output, entryIndex)">
                        <NIcon>
                          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 16 16">
                            <path fill="currentColor" fill-rule="evenodd" d="M5.75 3V1.5h4.5V3h-4.5Zm-1.5 0V1a1 1 0 0 1 1-1h5.5a1 1 0 0 1 1 1v2h2.5a.75.75 0 0 1 0 1.5h-.365l-.743 9.653A2 2 0 0 1 11.148 16H4.852a2 2 0 0 1-1.994-1.847L2.115 4.5H1.75a.75.75 0 0 1 0-1.5h2.5Zm-.63 1.5h8.76l-.734 9.538a.5.5 0 0 1-.498.462H4.852a.5.5 0 0 1-.498-.462L3.62 4.5Z" clip-rule="evenodd" />
                          </svg>
                        </NIcon>
                      </NButton>
                    </NInputGroup>
                  </div>
                  <NButton size="small" block style="margin-top: 8px" @click="addMapEntry(output)">
                    添加键值对
                  </NButton>
                </div>
              </NFormItem>
            </template>
          </NSpace>
        </NCard>
      </div>
    </div>

    <!-- 操作按钮 -->
    <NSpace justify="end" style="margin-top: 24px">
      <NButton @click="resetOutputs">
        重置
      </NButton>
      <NButton type="primary" @click="saveOutputs">
        保存
      </NButton>
    </NSpace>
  </div>
</template>

<script setup>
import {
  NButton,
  NCard,
  NEmpty,
  NFormItem,
  NIcon,
  NInput,
  NInputGroup,
  NSelect,
  NSpace,
} from 'naive-ui'
import { onMounted, reactive, watch } from 'vue'

const props = defineProps({
  element: null,
  modeler: null,
})

// Emits
const emit = defineEmits(['outputsUpdated'])

// 输出数据
const outputData = reactive({
  outputs: [],
})

// 配置选项
const outputTypeOptions = [
  { label: '字符串', value: 'string' },
  { label: '表达式', value: 'expression' },
  { label: '脚本', value: 'script' },
  { label: '列表', value: 'list' },
  { label: '映射', value: 'map' },
]

const scriptFormatOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Groovy', value: 'groovy' },
  { label: 'JUEL', value: 'juel' },
]

// 生成唯一ID
function generateId() {
  return `output_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
}

// 获取占位符文本
function getListItemPlaceholder(type) {
  return type === 'expression' ? '$' + '{variable}' : '输入值'
}

function getMapValuePlaceholder(type) {
  return type === 'expression' ? '$' + '{variable}' : '输入值'
}

// 添加输出参数
function addOutput() {
  const newOutput = {
    id: generateId(),
    name: '',
    type: 'string',
    value: '',
    scriptFormat: 'javascript',
    scriptValue: '',
    listItems: [],
    mapEntries: [],
  }
  outputData.outputs.push(newOutput)
  updateElement()
}

// 删除输出参数
function removeOutput(index) {
  outputData.outputs.splice(index, 1)
  updateElement()
}

// 类型改变处理
function onTypeChange(output) {
  // 重置相关字段
  output.value = ''
  output.scriptValue = ''
  output.listItems = []
  output.mapEntries = []

  // 根据类型初始化默认值
  if (output.type === 'list') {
    output.listItems = []
  }
  else if (output.type === 'map') {
    output.mapEntries = []
  }

  updateElement()
}

// 列表操作
function addListItem(output) {
  output.listItems.push({ type: 'string', value: '' })
  updateElement()
}

function removeListItem(output, index) {
  output.listItems.splice(index, 1)
  updateElement()
}

// 映射操作
function addMapEntry(output) {
  output.mapEntries.push({ key: '', type: 'string', value: '' })
  updateElement()
}

function removeMapEntry(output, index) {
  output.mapEntries.splice(index, 1)
  updateElement()
}

// 更新BPMN元素
function updateElement() {
  if (!props.element || !props.modeler)
    return

  const modeling = props.modeler.get('modeling')
  const moddle = props.modeler.get('moddle')

  // 获取或创建扩展元素
  let extensionElements = props.element.businessObject.extensionElements
  if (!extensionElements) {
    extensionElements = moddle.create('bpmn:ExtensionElements')
  }

  // 查找现有的InputOutput元素
  let inputOutput = extensionElements.values?.find(
    element => element.$type === 'camunda:InputOutput',
  )

  // 如果没有InputOutput元素且有输出参数，创建一个新的
  if (!inputOutput && outputData.outputs.length > 0) {
    inputOutput = moddle.create('camunda:InputOutput')
    extensionElements.values = extensionElements.values || []
    extensionElements.values.push(inputOutput)
  }

  // 如果有InputOutput元素，更新输出参数
  if (inputOutput) {
    // 清除现有的输出参数
    inputOutput.outputParameters = []

    // 添加新的输出参数
    if (outputData.outputs.length > 0) {
      inputOutput.outputParameters = outputData.outputs.map((output) => {
        const outputParameter = moddle.create('camunda:OutputParameter')
        outputParameter.name = output.name

        switch (output.type) {
          case 'string':
            outputParameter.value = output.value
            break

          case 'expression':
            outputParameter.value = output.value
            break

          case 'script': {
            const script = moddle.create('camunda:Script')
            script.scriptFormat = output.scriptFormat
            script.value = output.scriptValue
            outputParameter.definition = script
            break
          }

          case 'list': {
            const list = moddle.create('camunda:List')
            list.items = output.listItems.map((item) => {
              const listItem = moddle.create('camunda:Value')
              if (item.type === 'expression') {
                listItem.value = item.value
              }
              else {
                listItem.value = item.value
              }
              return listItem
            })
            outputParameter.definition = list
            break
          }
          case 'map': {
            const map = moddle.create('camunda:Map')
            map.entries = output.mapEntries.map((entry) => {
              const mapEntry = moddle.create('camunda:Entry')
              mapEntry.key = entry.key
              if (entry.type === 'expression') {
                mapEntry.value = entry.value
              }
              else {
                mapEntry.value = entry.value
              }
              return mapEntry
            })
            outputParameter.definition = map
            break
          }
        }

        return outputParameter
      })
    }

    // 如果InputOutput既没有输入也没有输出参数，则移除它
    if ((!inputOutput.inputParameters || inputOutput.inputParameters.length === 0)
      && (!inputOutput.outputParameters || inputOutput.outputParameters.length === 0)) {
      extensionElements.values = extensionElements.values?.filter(
        element => element.$type !== 'camunda:InputOutput',
      ) || []
    }
  }

  // 更新元素
  modeling.updateProperties(props.element, {
    extensionElements: extensionElements.values?.length > 0 ? extensionElements : undefined,
  })

  emit('outputsUpdated', { ...outputData })
}

// 重置输出
function resetOutputs() {
  outputData.outputs = []
  updateElement()
  window.$success('输出参数已重置')
}

// 保存输出
function saveOutputs() {
  // 验证参数名
  updateElement()
  window.$success('输出参数已保存')
}

// 加载现有数据
function loadOutputData() {
  if (!props.element)
    return

  const businessObject = props.element.businessObject
  const extensionElements = businessObject.extensionElements

  if (extensionElements) {
    const inputOutput = extensionElements.values?.find(
      element => element.$type === 'camunda:InputOutput',
    )

    if (inputOutput && inputOutput.outputParameters) {
      outputData.outputs = inputOutput.outputParameters.map((param) => {
        const output = {
          id: generateId(),
          name: param.name || '',
          type: 'string',
          value: '',
          scriptFormat: 'javascript',
          scriptValue: '',
          listItems: [],
          mapEntries: [],
        }

        // 判断参数类型和值
        if (param.definition) {
          if (param.definition.$type === 'camunda:Script') {
            output.type = 'script'
            output.scriptFormat = param.definition.scriptFormat || 'javascript'
            output.scriptValue = param.definition.value || ''
          }
          else if (param.definition.$type === 'camunda:List') {
            output.type = 'list'
            output.listItems = (param.definition.items || []).map(item => ({
              type: 'string',
              value: item.value || '',
            }))
          }
          else if (param.definition.$type === 'camunda:Map') {
            output.type = 'map'
            output.mapEntries = (param.definition.entries || []).map(entry => ({
              key: entry.key || '',
              type: 'string',
              value: entry.value || '',
            }))
          }
        }
        else {
          // 简单值，判断是否为表达式
          const value = param.value || ''
          if (value.startsWith('${') && value.endsWith('}')) {
            output.type = 'expression'
          }
          else {
            output.type = 'string'
          }
          output.value = value
        }

        return output
      })
    }
  }
}

// 监听元素变化
watch(() => props.element, () => {
  if (props.element) {
    loadOutputData()
  }
}, { immediate: true })

onMounted(() => {
  if (props.element) {
    loadOutputData()
  }
})
</script>

<style scoped>
.outputs-panel {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-weight: 500;
  font-size: 14px;
}

.empty-state {
  margin: 24px 0;
}

.output-item {
  margin-bottom: 16px;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-item,
.map-entry {
  margin-bottom: 8px;
}

.list-items,
.map-entries {
  width: 100%;
}
</style>
