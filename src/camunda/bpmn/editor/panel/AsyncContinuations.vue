<script setup>
import {
  NCollapse,
  NCollapseItem,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSpace,
  NSwitch,
  NText,
} from 'naive-ui'
import { onMounted, reactive } from 'vue'

const props = defineProps({
  element: {
    type: Object,
    required: true,
  },
  bpmnModeler: {
    type: Object,
    required: true,
  },
  showJob: {
    type: Boolean,
    default: () => true,
  },
})

const modeling = props.bpmnModeler.get('modeling')
const moddle = props.bpmnModeler.get('moddle')
const elementRegistry = props.bpmnModeler.get('elementRegistry')

const currentElement = elementRegistry.get(props.element.id)
const bo = currentElement.businessObject

// 表单数据
const formData = reactive({
  asyncBefore: false,
  asyncAfter: false,
  exclusive: true,
  jobPriority: null,
  taskPriority: null,
  retryTimeCycle: '',
  failedJobRetryTimeCycle: '',
})

// 初始化数据
function initializeData() {
  // 获取扩展元素
  const extensionElements = bo.extensionElements
  // 设置初始值
  formData.asyncBefore = bo.asyncBefore || false
  formData.asyncAfter = bo.asyncAfter || false
  formData.exclusive = bo.exclusive !== false // 默认true
  formData.jobPriority = bo.jobPriority || null

  // 获取重试配置
  if (extensionElements) {
    // const failedJobRetry = extensionElements.values?.find(
    //   el => el.$type === 'camunda:failedJobRetryTimeCycle'
    // )

    const retryTimeCycle = bo.extensionElements.values
      && bo.extensionElements.values.find(v => v.$type === 'camunda:FailedJobRetryTimeCycle')
    if (retryTimeCycle) {
      formData.failedJobRetryTimeCycle = retryTimeCycle.body || ''
    }
  }
}

// 更新异步配置
function updateAsyncConfig(type, value) {
  const updates = {}
  updates[type] = value

  // 如果启用异步，确保有扩展元素
  if (value) {
    ensureExtensionElements()
  }

  modeling.updateProperties(currentElement, updates)
  formData[type] = value
}

// 更新排他性
function updateExclusive(value) {
  modeling.updateProperties(currentElement, { exclusive: value })
  formData.exclusive = value
}

// 更新作业优先级
function updateJobPriority(value) {
  // const updates = { jobPriority: value || undefined }
  // modeling.updateProperties(currentElement, updates)
  bo.set('camunda:jobPriority', value)
  formData.jobPriority = value
}

// 更新重试时间周期
function updateRetryTimeCycle(value) {
  // const extensionElements = getOrCreateExtensionElements()

  // // 移除现有的重试配置
  // const existingRetry = extensionElements.values?.find(
  //   el => el.$type === 'camunda:failedJobRetryTimeCycle'
  // )

  // if (existingRetry) {
  //   const index = extensionElements.values.indexOf(existingRetry)
  //   extensionElements.values.splice(index, 1)
  // }

  // // 添加新的重试配置
  // if (value) {
  //   const retryElement = moddle.create('camunda:failedJobRetryTimeCycle', {
  //     body: value
  //   })
  //   extensionElements.values.push(retryElement)
  // }

  // modeling.updateProperties(currentElement, { extensionElements })
  // formData.failedJobRetryTimeCycle = value
  if (!bo.extensionElements) {
    bo.extensionElements = moddle.create('bpmn:ExtensionElements')
  }

  // 查找已有的 retryTimeCycle
  let retryTimeCycle = bo.extensionElements.values
    && bo.extensionElements.values.find(v => v.$type === 'camunda:FailedJobRetryTimeCycle')

  if (!retryTimeCycle) {
    retryTimeCycle = moddle.create('camunda:FailedJobRetryTimeCycle', {
      body: '', // 默认值
    })
    bo.extensionElements.get('values').push(retryTimeCycle)
  }
  else {
    retryTimeCycle.body = value // 修改值
  }
  formData.failedJobRetryTimeCycle = value
}

// 确保扩展元素存在
function ensureExtensionElements() {
  if (!bo.extensionElements) {
    const extensionElements = moddle.create('bpmn:ExtensionElements')
    modeling.updateProperties(currentElement, { extensionElements })
  }
}

onMounted(() => {
  initializeData()
})
</script>

<template>
  <NCollapse>
    <NCollapseItem title="异步连续配置" name="1">
      <NForm size="small">
        <!-- <span>异步延续</span> -->
        <NSpace>
          <NFormItem label="异步执行前" size="small">
            <NSwitch
              size="small"
              :value="formData.asyncBefore"
              @update:value="(val) => updateAsyncConfig('asyncBefore', val)"
            />
            <NText depth="3" style="margin-left: 8px; font-size: 12px;">
              在元素执行前异步处理
            </NText>
          </NFormItem>

          <NFormItem label="异步执行后">
            <NSwitch
              size="small"
              :value="formData.asyncAfter"
              @update:value="(val) => updateAsyncConfig('asyncAfter', val)"
            />
            <NText depth="3" style="margin-left: 8px; font-size: 12px;">
              在元素执行后异步处理
            </NText>
          </NFormItem>

          <NFormItem v-if="formData.asyncBefore || formData.asyncAfter" label="排他执行">
            <NSwitch
              size="small"
              :value="formData.exclusive"
              @update:value="updateExclusive"
            />
            <NText depth="3" style="margin-left: 8px; font-size: 12px;">
              确保同一流程实例的作业按顺序执行
            </NText>
          </NFormItem>
        </NSpace>
      </NForm>
    </NCollapseItem>
    <NCollapseItem v-if="formData.asyncBefore || formData.asyncAfter || showJob" title="工作执行" name="2">
      <!-- 优先级配置 -->
      <NForm size="small">
        <NFormItem label="重试时间周期">
          <NInput
            size="small"
            :value="formData.failedJobRetryTimeCycle"
            placeholder="R3/PT10M"
            clearable
            @update:value="updateRetryTimeCycle"
          />
          <NText depth="3" style="font-size: 12px; margin-top: 4px;">
            失败重试配置: R{次数}/PT{时间} 或 R{次数}/P{天数}DT{小时}H{分钟}M
          </NText>
        </NFormItem>

        <NFormItem label="任务优先级">
          <NInputNumber
            size="small"
            :value="formData.jobPriority"
            :min="0"
            :max="100"
            placeholder="默认优先级"
            clearable
            style="width: 100%"
            @update:value="updateJobPriority"
          />
          <NText depth="3" style="font-size: 12px;">
            任务执行优先级 (0-100)
          </NText>
        </NFormItem>
      </NForm>
    </NCollapseItem>
  </NCollapse>
</template>
