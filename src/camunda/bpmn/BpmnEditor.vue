<template>
  <div style="display: flex; height: 100vh;" :class="{ 'dark-mode': isDark }">
    <NLayout has-sider sider-placement="right">
      <NLayoutContent content-style="padding: 24px;">
        <div style="flex: 1; height: 100%; position: relative;">
          <div id="canvas" class="bpmn-container" style="width: 100%; height: 100%;" />
          <!-- 浮动按钮组 -->
          <div class="floating-btn-group">
            <NButtonGroup size="small">
              <NButton ghost @click="zoomIn">
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13 4v7h7v2h-7v7h-2v-7H4v-2h7V4h2Z" />
                  </svg>
                </NIcon>
              </NButton>
              <NButton ghost @click="zoomOut">
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M4 11h16v2H4v-2Z" />
                  </svg>
                </NIcon>
              </NButton>
              <NButton ghost @click="centerView">
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 8.25a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5m-2.6-6h-.033c-1.092 0-1.958 0-2.655.057c-.714.058-1.317.18-1.868.46a4.75 4.75 0 0 0-2.076 2.077c-.281.55-.403 1.154-.461 1.868c-.057.697-.057 1.563-.057 2.655V9.4a.75.75 0 0 0 1.5 0c0-1.132 0-1.937.052-2.566c.05-.62.147-1.005.302-1.31a3.25 3.25 0 0 1 1.42-1.42c.305-.155.69-.251 1.31-.302c.63-.051 1.434-.052 2.566-.052a.75.75 0 0 0 0-1.5m5.2 1.5c1.133 0 1.937 0 2.566.052c.62.05 1.005.147 1.31.302a3.25 3.25 0 0 1 1.42 1.42c.155.305.251.69.302 1.31c.051.63.052 1.434.052 2.566a.75.75 0 0 0 1.5 0v-.033c0-1.092 0-1.958-.057-2.655c-.058-.714-.18-1.317-.46-1.868a4.75 4.75 0 0 0-2.076-2.076c-.552-.281-1.155-.403-1.869-.461c-.697-.057-1.563-.057-2.655-.057H14.6a.75.75 0 0 0 0 1.5M3.75 14.6a.75.75 0 0 0-1.5 0v.033c0 1.092 0 1.958.057 2.655c.058.714.18 1.317.46 1.869a4.75 4.75 0 0 0 2.077 2.075c.55.281 1.154.403 1.868.461c.697.057 1.563.057 2.655.057H9.4a.75.75 0 0 0 0-1.5c-1.132 0-1.937 0-2.566-.052c-.62-.05-1.005-.147-1.31-.302a3.25 3.25 0 0 1-1.42-1.42c-.155-.305-.251-.69-.302-1.31c-.051-.63-.052-1.434-.052-2.566m18 0a.75.75 0 0 0-1.5 0c0 1.133 0 1.937-.052 2.566c-.05.62-.147 1.005-.302 1.31a3.25 3.25 0 0 1-1.42 1.42c-.305.155-.69.251-1.31.302c-.63.051-1.434.052-2.566.052a.75.75 0 0 0 0 1.5h.033c1.092 0 1.958 0 2.655-.057c.714-.058 1.317-.18 1.869-.46a4.75 4.75 0 0 0 2.075-2.076c.281-.552.403-1.155.461-1.869c.057-.697.057-1.563.057-2.655z"
                    />
                  </svg>
                </NIcon>
              </NButton>
              <NButton ghost @click="lastStep">
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 16 16">
                    <path
                      fill="currentColor"
                      d="M5.854 2.146a.5.5 0 0 1 0 .708L3.707 5h2.336c1.468 0 2.905 0 4.226.396c1.365.41 2.585 1.234 3.647 2.827a.5.5 0 0 1-.832.554c-.938-1.407-1.968-2.083-3.103-2.423C8.815 6.004 7.517 6 6 6H3.707l2.147 2.146a.5.5 0 1 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0ZM8 14a2 2 0 1 0 0-4a2 2 0 0 0 0 4Zm0-1a1 1 0 1 1 0-2a1 1 0 0 1 0 2Z"
                    />
                  </svg>
                </NIcon>
              </NButton>
              <NButton ghost @click="nextStep">
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 16 16">
                    <path
                      fill="currentColor"
                      d="M10.146 2.146a.5.5 0 0 0 0 .708L12.293 5H9.957c-1.468 0-2.905 0-4.226.396c-1.365.41-2.585 1.234-3.647 2.827a.5.5 0 0 0 .832.554C3.854 7.37 4.884 6.694 6.02 6.354C7.185 6.004 8.483 6 10 6h2.293l-2.146 2.146a.5.5 0 1 0 .707.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.707 0ZM8 15a2 2 0 1 0 0-4a2 2 0 0 0 0 4Zm0-1a1 1 0 1 1 0-2a1 1 0 0 1 0 2Z"
                    />
                  </svg>
                </NIcon>
              </NButton>
              <NButton ghost @click="toggleMinimap">
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="m9 1.842l6.074 3.544L22 2.5v15.574l-7 4.084l-6.074-3.544L2 21.5V5.926l7-4.084Zm1 15.084l4 2.333V7.074l-4-2.333v12.185ZM8 4.74L4 7.074V18.5l4-1.667V4.741Zm8 2.426v12.092l4-2.333V5.5l-4 1.667Z"
                    />
                  </svg>
                </NIcon>
              </NButton>
              <NButton ghost @click="showXml">
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="m9 1.842l6.074 3.544L22 2.5v15.574l-7 4.084l-6.074-3.544L2 21.5V5.926l7-4.084Zm1 15.084l4 2.333V7.074l-4-2.333v12.185ZM8 4.74L4 7.074V18.5l4-1.667V4.741Zm8 2.426v12.092l4-2.333V5.5l-4 1.667Z"
                    />
                  </svg>
                </NIcon>
              </NButton>
            </NButtonGroup>
          </div>
        </div>
      </NLayoutContent>
      <NLayoutSider
        collapse-mode="width" :collapsed-width="0" :width="450" :native-scrollbar="false"
        show-trigger="bar" content-style="padding: 24px;" bordered
      >
        <Panel :selected-element="selectedElement" :bpmn-modeler="bpmnModeler" />
      </NLayoutSider>
    </NLayout>
  </div>
</template>

<script setup>
import BpmnModeler from 'camunda-bpmn-js/dist/camunda-platform-modeler.production.min.js'
import { NButton, NButtonGroup, NIcon, NLayout, NLayoutContent, NLayoutSider } from 'naive-ui'
import { onMounted, ref, onActivated, onDeactivated, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Panel from './editor/panel/Panel.vue'
import 'camunda-bpmn-js/dist/assets/camunda-platform-modeler.css'

const { messages, locale } = useI18n()
import { useDark } from '@vueuse/core'

const isDark = useDark()
const selectedElement = ref(null)

let bpmnModeler

const props = defineProps({
  bpmnXML: {
    type: String,
    default: null,
  },
})

console.log(props.bpmnXML);


onMounted(() => {
  function translate(template, replacements) {
    replacements = replacements || {}

    // Translate
    template = messages.value[locale.value]?.bpmn[template] || template

    // Replace
    return template.replace(/\{([^}]+)\}/g, (_, key) => {
      return replacements[key] || `{${key}}`
    })
  }

  const translateModule = {
    translate: ['value', translate],
  }

  bpmnModeler = new BpmnModeler({
    container: '#canvas',
    additionalModules: [
      // 国际化
      translateModule,
    ],
  })

  const xml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" id="Definitions_1l4w30j" targetNamespace="http://bpmn.io/schema/bpmn" xmlns:modeler="http://camunda.org/schema/modeler/1.0" exporter="Camunda Modeler" exporterVersion="5.36.1" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.23.0">
      <bpmn:process id="Process_1xcnjp8" isExecutable="true" >
        <bpmn:startEvent id="StartEvent_1" />
      </bpmn:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1xcnjp8">
          <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
            <dc:Bounds x="182" y="162" width="36" height="36" />
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn:definitions>
    `

  bpmnModeler.importXML(xml)

  // 监听节点选中事件
  bpmnModeler.on('selection.changed', (e) => {
    const element = e.newSelection[0]
    if (element && element.businessObject) {
      selectedElement.value = element.businessObject
    }
    else {
      const canvas = bpmnModeler.get('canvas')
      const rootElement = canvas.getRootElement()
      // selectedElement.value = rootElement
      selectedElement.value = { $type: rootElement.type, id: rootElement.id }
      // if (rootElement.collaborations && rootElement.collaborations.length > 0) {
      //   selectedElement.value = {$type: 'bpmn:collaboration', id: rootElement.id};
      // } else {
      //   selectedElement.value = {$type: 'bpmn:Process', id: rootElement.id};
      // }
    }
  })

  toggleMinimap()
})

function toggleMinimap() {
  if (bpmnModeler) {
    const minimap = bpmnModeler.get('minimap')
    if (minimap)
      minimap.toggle()
  }
}

function zoomIn() {
  if (bpmnModeler) {
    const canvas = bpmnModeler.get('canvas')
    const currentZoom = canvas.zoom()
    const newZoom = Math.min(currentZoom * 1.2, 3.0) // 放大1.2倍，最大3倍
    canvas.zoom(newZoom, 'auto')
  }
}

function zoomOut() {
  if (bpmnModeler) {
    const canvas = bpmnModeler.get('canvas')
    const currentZoom = canvas.zoom()
    const newZoom = Math.max(currentZoom / 1.2, 0.2) // 缩小1.2倍，最小0.2倍
    canvas.zoom(newZoom, 'auto')
  }
}

function centerView() {
  if (bpmnModeler) {
    const canvas = bpmnModeler.get('canvas')
    // 重置缩放级别为1.0
    canvas.zoom(1.0, 'auto')
    // 将视图居中到画布中心
    canvas.viewbox({
      x: 0,
      y: 0,
      width: canvas.viewbox().outer.width,
      height: canvas.viewbox().outer.height,
    })
  }
}

function lastStep() {
  if (bpmnModeler) {
    const commandStack = bpmnModeler.get('commandStack')
    // 撤销上一步操作
    if (commandStack.canUndo()) {
      commandStack.undo()
    }
  }
}

function nextStep() {
  if (bpmnModeler) {
    const commandStack = bpmnModeler.get('commandStack')
    // 重做下一步操作
    if (commandStack.canRedo()) {
      commandStack.redo()
    }
  }
}

function showXml() {
  bpmnModeler.saveXML({ format: true }).then(({ xml }) => {
    console.log(xml)
  })
}

onActivated(async () => {
  // 页面被 keep-alive 激活时，DOM 已经重新挂载
  await nextTick()
  if (bpmnModeler) {
    bpmnModeler.attachTo('#canvas')   // 重新挂载
    console.log('bpmnModeler 已 attach 回 canvas')
  }
})

onDeactivated(() => {
  if (bpmnModeler) {
    bpmnModeler.detach()   // 暂时卸载，不销毁实例
    console.log('bpmnModeler 已 detach')
  }
})
</script>

<style scoped>
.dark-mode .bpmn-container {
  filter: invert(1);
}

/* 整体容器 & 工具栏 */
.dark-mode .djs-toolbar {
  background-color: #282a36; /* Dracula 背景 */
  color: #f8f8f2; /* Dracula 字体颜色 */
  border-color: #6272a4; /* 工具栏边框 */
}

.dark-mode .bpmn-container .djs-context-pad.open > .group > .entry {
  background-color: #282a36;
  color: #f8f8f2;
  border-color: #6272a4;
}

/* 工具项 palette */
.dark-mode .bpmn-container .djs-context-pad.open > .group > .entry {
  background-color: #44475a; /* Dracula 深灰节点背景 */
  color: #f8f8f2; /* 字体颜色 */
  border: 1px solid #6272a4; /* 边框颜色 */
  border-radius: 4px;
}

/* Hover / 选中状态 */
.dark-mode .bpmn-container .djs-context-pad.open > .group > .entry:hover,
.dark-mode .bpmn-container .djs-context-pad.open > .group > .entry.djs-selected {
  background-color: #6272a4; /* 高亮色 */
  color: #f8f8f2;
}

.floating-btn-group {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 10;
}

:deep([title*='Close minimap']),
:deep([title*='Open minimap']) {
  display: none !important;
}

/* 将小地图定位到右下角 */
:deep(.djs-minimap) {
  position: absolute !important;
  top: auto !important;
  bottom: 20px !important;
  right: auto !important;
  left: 20px !important;
  z-index: 1000 !important;
  border: 1px solid #ddd !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

/* 确保小地图容器的样式 */
:deep(.djs-minimap .djs-minimap-container) {
  width: 200px !important;
  height: 150px !important;
}
</style>
