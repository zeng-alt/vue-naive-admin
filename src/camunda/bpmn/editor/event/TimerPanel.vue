<template>
  <NForm :model="timerData" size="small">
    <NFormItem label="定时器类型" path="timerType">
      <NSelect
        v-model:value="timerData.timerType" placeholder="选择定时器类型"
        :options="timerTypeOptions" @update:value="updateTimerType"
      />
    </NFormItem>

    <!-- 时间周期 -->
    <NFormItem v-show="timerData.timerType === 'timeCycle'" label="时间周期" path="timeCycle">
      <NInput
        v-model:value="timerData.timeCycle" placeholder="请输入时间周期 (如: R/PT10S)"
        @blur="updateTimerValue('timeCycle', timerData.timeCycle)"
      />
      <template #label>
        <NPopover trigger="hover" placement="left">
          <template #trigger>
            <span style="border-bottom: 1px dotted black;">时间周期</span>
          </template>
          <template #header>
            <NText strong depth="1">
              定义为 ISO 8601 重复间隔格式或 cron 表达式的周期
            </NText>
          </template>
          <b>R5/PT10S</b> - 每 10 秒，最多 5 次<br>
          <b>R/P1D</b> - 每天，无限次<br>
          <b>0 0 9-17 * * MON-FRI</b> 周一至周五，UTC 时间上午 9 点至下午 5 点，每小时整点执行
        </NPopover>
      </template>
    </NFormItem>

    <!-- 时间日期 -->
    <NFormItem v-show="timerData.timerType === 'timeDate'" label="时间日期" path="timeDate">
      <NInput
        v-model:value="timerData.timeDate" placeholder="请输入时间日期 (如: 2024-12-31T23:59:59)"
        @blur="updateTimerValue('timeDate', timerData.timeDate)"
      />
      <template #label>
        <NPopover trigger="hover" placement="left">
          <template #trigger>
            <span style="border-bottom: 1px dotted black;">时间日期</span>
          </template>
          <template #header>
            <NText strong depth="1">
              以 ISO 8601 日期和时间组合表示法定义的特定时间点。
            </NText>
          </template>
          <b>2019-10-01T12:00:00Z</b> - UTC 时间 <br>
          <b>2019-10-02T08:09:40+02:00</b> - UTC 加 2 小时时区偏移
        </NPopover>
      </template>
    </NFormItem>

    <!-- 时间持续时间 -->
    <NFormItem v-show="timerData.timerType === 'timeDuration'" label="持续时间" path="timeDuration">
      <NInput
        v-model:value="timerData.timeDuration" placeholder="请输入持续时间 (如: PT1H30M)"
        @blur="updateTimerValue('timeDuration', timerData.timeDuration)"
      />
      <template #label>
        <NPopover trigger="hover" placement="left">
          <template #trigger>
            <span style="border-bottom: 1px dotted black;">持续时间</span>
          </template>
          <template #header>
            <NText strong depth="1">
              按照 ISO 8601 时长格式定义的时间长度
            </NText>
          </template>
          <b>PT15S</b> - 15 秒<br>
          <b>PT1H30M</b> - 1 小时 30 分钟<br>
          <b>P14D</b> - 14 天
        </NPopover>
      </template>
    </NFormItem>
  </NForm>
</template>

<script setup>
import {
  NForm,
  NFormItem,
  NInput,
  NPopover,
  NSelect,
  NText,
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

const elementRegistry = props.bpmnModeler.get('elementRegistry')
const modeling = props.bpmnModeler.get('modeling')
const bpmnFactory = props.bpmnModeler.get('bpmnFactory')
const element = elementRegistry.get(props.selectedElement.id)

// 定时器数据模型
const timerData = reactive({
  timerType: 'none',
  timeCycle: '',
  timeDate: '',
  timeDuration: '',
})

// 定时器类型选项
const timerTypeOptions = ref([
  { label: '无定时器', value: 'none' },
  { label: '时间周期', value: 'timeCycle' },
  { label: '时间日期', value: 'timeDate' },
  { label: '持续时间', value: 'timeDuration' },
])

// 初始化定时器数据
function initTimerData() {
  const timerEventDefinition = props.selectedElement.eventDefinitions?.[0]
  if (timerEventDefinition && timerEventDefinition.$type === 'bpmn:TimerEventDefinition') {
    if (timerEventDefinition.timeCycle) {
      timerData.timerType = 'timeCycle'
      timerData.timeCycle = timerEventDefinition.timeCycle.body || ''
    }
    else if (timerEventDefinition.timeDate) {
      timerData.timerType = 'timeDate'
      timerData.timeDate = timerEventDefinition.timeDate.body || ''
    }
    else if (timerEventDefinition.timeDuration) {
      timerData.timerType = 'timeDuration'
      timerData.timeDuration = timerEventDefinition.timeDuration.body || ''
    }
  }
  else {
    timerData.timerType = 'none'
  }
}

// 更新定时器类型
function updateTimerType(value) {
  timerData.timerType = value

  // 创建或更新定时器事件定义
  let timerEventDefinition = props.selectedElement.eventDefinitions?.[0]

  if (!timerEventDefinition || timerEventDefinition.$type !== 'bpmn:TimerEventDefinition') {
    timerEventDefinition = bpmnFactory.create('bpmn:TimerEventDefinition')
    modeling.updateModdleProperties(element, props.selectedElement, {
      eventDefinitions: [timerEventDefinition],
    })
  }

  // 清除其他定时器属性
  modeling.updateModdleProperties(element, timerEventDefinition, {
    timeCycle: undefined,
    timeDate: undefined,
    timeDuration: undefined,
  })

  // 清空表单数据
  timerData.timeCycle = ''
  timerData.timeDate = ''
  timerData.timeDuration = ''
}

// 更新定时器值
function updateTimerValue(type, value) {
  const timerEventDefinition = props.selectedElement.eventDefinitions?.[0]

  if (timerEventDefinition && timerEventDefinition.$type === 'bpmn:TimerEventDefinition') {
    let timerExpression

    if (value.trim()) {
      // 创建定时器表达式
      timerExpression = bpmnFactory.create('bpmn:FormalExpression', {
        body: value,
      })
    }

    const updateProps = {}
    updateProps[type] = timerExpression

    modeling.updateModdleProperties(element, timerEventDefinition, updateProps)
  }
}

// 初始化
initTimerData()
</script>
