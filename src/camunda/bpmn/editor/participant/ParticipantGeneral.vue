<script setup>
import {
  NCheckbox,
  NForm,
  NFormItem,
  NInput,
  NPopover,
  NText,
} from 'naive-ui'
import { reactive } from 'vue'

const props = defineProps({
  element: Object,
  bpmnModeler: Object,
})

const emit = defineEmits(['update-name'])

const modeling = props.bpmnModeler.get('modeling')
const moddle = props.bpmnModeler.get('moddle')
const elementRegistry = props.bpmnModeler.get('elementRegistry')

const currentElement = elementRegistry.get(props.element.id)
const bo = currentElement.businessObject
// 表单数据
const formData = reactive({
  participantName: '',
  participantId: '',
  processId: '',
  processName: '',
  versionTag: '',
  executable: true,
  startableInTasklist: true,
  elementDocumentation: '',
  processDocumentation: '',
  timeTolive: '',
  startable: true,
})

function updateDocumentation(val, element) {
  if (val) {
    const newDocumentation = moddle.create('bpmn:Documentation', {
      text: val,
    })

    // 使用 modeling 更新元素的 documentation
    modeling.updateProperties(element, {
      documentation: [newDocumentation],
    })
  }
  else {
    // 使用 modeling 删除元素的 documentation
    modeling.updateProperties(element, {
      documentation: [],
    })
  }
}

function updateElementDocumentation(val) {
  if (val) {
    const newDocumentation = moddle.create('bpmn:Documentation', {
      text: val,
    })

    // 使用 modeling 更新元素的 documentation
    modeling.updateProperties(props.element, {
      documentation: [newDocumentation],
    })
  }
  else {
    // 使用 modeling 删除元素的 documentation
    modeling.updateProperties(props.element, {
      documentation: [],
    })
  }
}

function updateProcessDocumentation(val) {
  if (val) {
    const newDocumentation = moddle.create('bpmn:Documentation', {
      text: val,
    })

    // 使用 modeling 更新元素的 documentation

    bo.processRef.documentation = [newDocumentation]
  }
  else {
    // 使用 modeling 删除元素的 documentation
    bo.processRef.documentation = []
  }
}

function updateName(val) {
  modeling.updateLabel(props.element, val)
  formData.name = val
  emit('update-name', val)
}

function updateParticipantName(name) {
  modeling.updateLabel(props.element, name)
  emit('update-name', name)
}

function updateProcessName(name) {
  bo.processRef.name = name
}

function updateTimeToLive(timeToLive) {
  bo.processRef.historyTimeToLive = timeToLive
}

function updateVersionTag(version) {
  bo.processRef.versionTag = version
}

function updateExecutable(executable) {
  bo.processRef.isExecutable = executable
}

function updateStartableInTasklist(startable) {
  bo.processRef.isStartableInTasklist = startable
}

function updateParticipantId(val) {
  const commandStack = props.bpmnModeler.get('commandStack')

  commandStack.execute('element.updateProperties', {
    element: props.element,
    properties: { id: val },
  })
}

function initializeData() {
  formData.participantId = bo.id
  formData.processId = bo.processRef.id	|| ''
  formData.participantName = bo.name
  formData.processName = bo.processRef.name
  formData.versionTag = bo.processRef.versionTag
  formData.executable = bo.processRef.isExecutable
  formData.startableInTasklist = bo.processRef.isStartableInTasklist
  formData.elementDocumentation = bo.documentation?.[0]?.text
  formData.processDocumentation = bo.processRef.documentation?.[0]?.text
}

initializeData()
</script>

<template>
  <NForm size="small" :model="formData">
    <NFormItem label="参与者名称" path="participantName">
      <NInput id="name" v-model:value="formData.participantName" type="textarea" :rows="1" size="small" @update:value="updateParticipantName" />
    </NFormItem>

    <NFormItem label="参与者ID" path="participantId">
      <NInput id="id" v-model:value="formData.participantId" size="small" @update:value="updateParticipantId" />
    </NFormItem>

    <NFormItem label="流程ID" path="processId">
      <NInput id="id" :value="formData.processId" size="small" disabled />
    </NFormItem>

    <NFormItem label="流程名称" path="processName">
      <NInput id="name" v-model:value="formData.processName" type="textarea" :rows="1" size="small" @update:value="updateProcessName" />
    </NFormItem>

    <NFormItem path="versionTag" label="版本标签">
      <NInput v-model:value="formData.versionTag" size="small" @update:value="updateVersionTag" />
    </NFormItem>

    <NFormItem path="timeTolive" label="历史数据保留策略">
      <template #label>
        <NPopover trigger="hover" placement="left">
          <template #trigger>
            <span style="border-bottom: 1px dotted black;">历史数据保留策略</span>
          </template>
          <template #header>
            <NText strong depth="1">
              在此资源被清理之前的天数
            </NText>
          </template>
          如果指定了该值，它将优先于引擎的配置
        </NPopover>
      </template>
      <NInput v-model:value="formData.timeTolive" size="small" @update:value="updateTimeToLive" />
    </NFormItem>

    <NFormItem label="元素文档" path="elementDocumentation">
      <NInput
        v-model:value="formData.elementDocumentation" type="textarea" size="small"
        @blur="updateElementDocumentation(formData.elementDocumentation)"
      />
    </NFormItem>

    <NFormItem label="流程文档" path="processDocumentation">
      <NInput
        v-model:value="formData.processDocumentation" type="textarea" size="small"
        @blur="updateProcessDocumentation(formData.processDocumentation)"
      />
    </NFormItem>

    <NFormItem>
      <NCheckbox v-model:checked="formData.executable" style="margin-right: 12px" @update:checked="updateExecutable">
        可执行
      </NCheckbox>

      <NCheckbox v-model:checked="formData.startableInTasklist" style="margin-right: 12px" @update:checked="updateStartableInTasklist">
        任务列表可启动
      </NCheckbox>
    </NFormItem>
  </NForm>
</template>
