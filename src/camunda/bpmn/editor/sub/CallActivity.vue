<template>
  <div style="display: flex; align-items: center">
    <NIcon size="30">
      <span class="bpmn-icon-call-activity" />
    </NIcon>
    <div style="display: flex; flex-direction: column; margin-left: 8px">
      <span style="font-size: 12px">调用活动</span>
      <span>{{ name }}</span>
    </div>
  </div>
  <NTabs type="bar" animated>
    <NTabPane name="base" tab="常规">
      <PanelGeneral
        :element="element"
        :bpmn-modeler="bpmnModeler"
        @update-name="onUpdateName"
      />
      <AsyncContinuations
        :element="selectedElement"
        :bpmn-modeler="bpmnModeler"
        :show-job="false"
      />
    </NTabPane>
    <NTabPane name="calledElement" tab="调用活动" />
    <NTabPane name="input/outputMappings" tab="输入/输出绑定" />
    <NTabPane name="executionListeners" tab="执行监听器">
      <NScrollbar style="max-height: 600px">
        <ExecutionListeners
          :element="element"
          :bpmn-modeler="bpmnModeler"
        />
      </NScrollbar>
    </NTabPane>
    <NTabPane name="extensionProperties" tab="扩展属性">
      <NScrollbar style="max-height: 600px">
        <ExtensionProperties
          :element="element"
          :bpmn-modeler="bpmnModeler"
        />
      </NScrollbar>
    </NTabPane>
    <NTabPane name="inputs" tab="输入参数">
      <NScrollbar style="max-height: 600px">
        <Inputs :element="element" :modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
    <NTabPane name="Onputs" tab="输出参数">
      <NScrollbar style="max-height: 600px">
        <Outputs :element="element" :modeler="bpmnModeler" />
      </NScrollbar>
    </NTabPane>
  </NTabs>
</template>

<script lang="ts" setup>
import { NIcon, NScrollbar, NTabPane, NTabs } from 'naive-ui'
import { ref } from 'vue'
import AsyncContinuations from '../panel/AsyncContinuations.vue'
import ExecutionListeners from '../panel/ExecutionListeners.vue'
import ExtensionProperties from '../panel/ExtensionProperties.vue'
import Inputs from '../panel/Inputs.vue'
import Outputs from '../panel/Outputs.vue'
import PanelGeneral from '../panel/PanelGeneral.vue'

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
const name = ref(element.businessObject.name)

function onUpdateName(newName: string) {
  name.value = newName
}
</script>
