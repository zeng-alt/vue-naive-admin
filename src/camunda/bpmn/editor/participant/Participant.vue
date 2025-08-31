<template>
  <div style="display: flex; align-items: center;">
    <NIcon size="30">
      <span class="bpmn-icon-participant" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px;">
      <span style="font-size: 12px">参与者</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <NTabs type="bar" animated>
    <NTabPane name="base" tab="常规">
      <ParticipantGeneral :element="element" :bpmn-modeler="bpmnModeler" @update-name="onUpdateName" />
    </NTabPane>
    <NTabPane name="baseSetter" tab="设置">
      <NForm size="small">
        <NFormItem path="candidateStarterGroups" label="候选启动群组">
          <NSelect
            v-model:value="bo.processRef.candidateStarterGroups"
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
            v-model:value="bo.processRef.candidateStarterUsers"
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
          <NInputNumber v-model:value="bo.processRef.taskPriority" clearable />
        </NFormItem>
        <NFormItem path="jobPriority" label="内部任务的优先级">
          <NInputNumber v-model:value="bo.processRef.jobPriority" clearable />
        </NFormItem>
      </NForm>
    </NTabPane>
    <NTabPane name="executionListeners" tab="执行监听器">
      <NScrollbar style="max-height: 600px">
        <ExecutionListeners :element="element" :bpmn-modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
    <NTabPane name="extensionProperties" tab="扩展属性">
      <NScrollbar style="max-height: 600px">
        <ExtensionProperties :element="element" :bpmn-modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
  </NTabs>
</template>

<script setup>
import {
  NForm,
  NFormItem,
  NIcon,
  NInputNumber,
  NScrollbar,
  NSelect,
  NTabPane,
  NTabs,
} from 'naive-ui'
import { ref } from 'vue'
import ExecutionListeners from '../panel/ExecutionListeners.vue'
import ExtensionProperties from '../panel/ExtensionProperties.vue'
import ParticipantGeneral from './ParticipantGeneral.vue'

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
const element = elementRegistry.get(props.selectedElement.id)
const bo = element.businessObject
// 用响应式变量保存最新的name，供模板或其他逻辑使用
const name = ref(bo.name)

function onUpdateName(newName) {
  name.value = newName
}
</script>
