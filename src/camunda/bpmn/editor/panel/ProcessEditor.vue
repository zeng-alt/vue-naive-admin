<template>
  <div style="display: flex; align-items: center;">
    <NIcon size="20">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
        viewBox="0 0 14 14"
      >
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="m6.547 10.263l-2.81-2.81c.309-.517.617-1.052.922-1.584c1.016-1.766 2.008-3.49 2.938-4.387c2.524-2.524 5.981-1.06 5.981-1.06s1.463 3.457-1.06 5.981c-.89.922-2.587 1.9-4.34 2.908c-.546.315-1.097.632-1.631.952m2.14-6.532a1.582 1.582 0 1 1 3.164 0a1.582 1.582 0 0 1-3.163 0Zm-4.09-.232c-1.418-.377-2.749.321-3.93 1.404a.48.48 0 0 0 .089.765l1.905 1.148l.002-.004c.275-.46.582-.993.894-1.533c.355-.617.716-1.243 1.04-1.78m2.587 7.84l1.148 1.905a.48.48 0 0 0 .765.088c1.083-1.18 1.782-2.512 1.404-3.93c-.522.314-1.07.63-1.613.943l-.083.048c-.548.316-1.091.628-1.616.943zM2.622 9.343a2 2 0 0 1 1.402 3.46c-.222.212-.569.378-.89.506a10.47 10.47 0 0 1-1.1.358c-.367.1-.717.18-.982.233a5.991 5.991 0 0 1-.336.059a2.99 2.99 0 0 1-.133.013a.54.54 0 0 1-.198-.022a.509.509 0 0 1-.241-.156a.508.508 0 0 1-.11-.22a.547.547 0 0 1-.012-.176c.003-.04.009-.086.015-.128c.013-.088.033-.203.06-.334c.053-.264.135-.612.235-.977c.1-.364.222-.754.359-1.095c.128-.321.294-.667.506-.888a2 2 0 0 1 1.425-.633"
          clip-rule="evenodd"
        />
      </svg>
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">流程 </span>
      <span>{{ name }}</span>
    </div>
  </div>
  <NTabs type="bar" animated>
    <NTabPane name="base" tab="常规">
      <NForm :model="bo" size="small">
        <NFormItem path="name" label="名称">
          <NInput
            v-model:value="name"
            size="small"
          />
        </NFormItem>
        <NFormItem path="id" label="id">
          <NInput size="small" :disabled="true" :value="bo.id" />
        </NFormItem>
        <NFormItem path="versionTag" label="版本标签">
          <NInput v-model:value="bo.versionTag" size="small" />
        </NFormItem>
        <NFormItem path="historyTimeToLive" label="历史数据保留策略">
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
          <NInput v-model:value="bo.historyTimeToLive" size="small" />
        </NFormItem>
        <NFormItem path="documentation[0]?.text" label="文档">
          <NInput
            type="textarea"
            size="small"
            :value="bo.documentation?.[0]?.text"
            @update:value="updateDocumentation"
          />
        </NFormItem>
      </NForm>
      <NCheckbox v-model:checked="isExecutable" style="margin-right: 12px">
        可执行
      </NCheckbox>
    </NTabPane>
    <NTabPane name="baseSetter" tab="基础设置">
      <NForm :model="bo" size="small">
        <NFormItem path="candidateStarterGroups" label="候选启动群组">
          <NSelect
            v-model:value="bo.candidateStarterGroups"
            multiple
            filterable
            :options="[{
                         label: 'group1',
                         value: '1',
                       },
                       {
                         label: 'zroup2',
                         value: '2',
                       }]"
          />
        </NFormItem>
        <NFormItem path="candidateStarterUsers" label="候选启动用户">
          <NSelect
            v-model:value="bo.candidateStarterUsers"
            multiple
            filterable
            :options="[{
                         label: 'user1',
                         value: '1',
                       },
                       {
                         label: 'zser2',
                         value: '2',
                       }]"
          />
        </NFormItem>
        <NFormItem path="taskPriority" label="外部任务的优先级">
          <NInputNumber v-model:value="bo.taskPriority" clearable />
        </NFormItem>
        <NFormItem path="jobPriority" label="内部任务的优先级">
          <NInputNumber v-model:value="bo.jobPriority" clearable />
        </NFormItem>
      </NForm>
    </NTabPane>
    <NTabPane name="executionListeners" tab="执行监听器">
      <NScrollbar style="max-height: 600px">
        <ExecutionListeners :element="processElements" :bpmn-modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
    <NTabPane name="extensionProperties" tab="扩展属性">
      <NScrollbar style="max-height: 600px">
        <ExtensionProperties :element="processElements" :bpmn-modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
  </NTabs>
</template>

<script setup>
import {
  NCheckbox,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NPopover,
  NScrollbar,
  NSelect,
  NTabPane,
  NTabs,
  NText,
} from 'naive-ui'
import { ref, watch } from 'vue'
import ExecutionListeners from './ExecutionListeners.vue'
import ExtensionProperties from './ExtensionProperties.vue'

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

const modeling = props.bpmnModeler.get('modeling')
const moddle = props.bpmnModeler.get('moddle')
const definitions = props.bpmnModeler.get('canvas').getRootElement().businessObject.$parent
const process = definitions.rootElements.find(el => el.$type === 'bpmn:Process')

const name = ref(process.name)
const isExecutable = ref(process.isExecutable)

const elementRegistry = props.bpmnModeler.get('elementRegistry')
const processElements = elementRegistry.filter((element) => {
  return element.type === 'bpmn:Process'
})[0]
// const processElements = process
const bo = processElements.businessObject
// const bo = process;

watch(() => name.value, (newName) => {
  modeling.updateProperties(processElements, {
    name: newName,
  })
})

watch(() => isExecutable.value, (newName) => {
  modeling.updateProperties(processElements, {
    isExecutable: newName,
  })
})

function updateDocumentation(val) {
  const newDocumentation = moddle.create('bpmn:Documentation', {
    text: val,
  })

  // 使用 modeling 更新元素的 documentation
  modeling.updateProperties(processElements, {
    documentation: [newDocumentation],
  })
}
</script>
