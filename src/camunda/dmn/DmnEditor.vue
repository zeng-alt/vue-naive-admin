<template>
  <div style="display: flex; height: 100%;" :class="{ 'dark-mode': isDark }">
    <NLayout has-sider sider-placement="right">
      <NLayoutContent>
        <div class="dmn-wrapper" style="height: 100%; position: relative;">
          <!-- DMN 编辑器容器 -->
          <div ref="dmnContainer" class="dmn-container" style="width: 100%; height: 100%;" />
          <!-- 浮动按钮组 -->
          <div v-show="viewType === 'drd'" class="floating-btn-group">
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
                    <path fill="currentColor" d="M12 8.25a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5m-2.6-6h-.033c-1.092 0-1.958 0-2.655.057c-.714.058-1.317.18-1.868.46a4.75 4.75 0 0 0-2.076 2.077c-.281.55-.403 1.154-.461 1.868c-.057.697-.057 1.563-.057 2.655V9.4a.75.75 0 0 0 1.5 0c0-1.132 0-1.937.052-2.566c.05-.62.147-1.005.302-1.31a3.25 3.25 0 0 1 1.42-1.42c.305-.155.69-.251 1.31-.302c.63-.051 1.434-.052 2.566-.052a.75.75 0 0 0 0-1.5m5.2 1.5c1.133 0 1.937 0 2.566.052c.62.05 1.005.147 1.31.302a3.25 3.25 0 0 1 1.42 1.42c.155.305.251.69.302 1.31c.051.63.052 1.434.052 2.566a.75.75 0 0 0 1.5 0v-.033c0-1.092 0-1.958-.057-2.655c-.058-.714-.18-1.317-.46-1.868a4.75 4.75 0 0 0-2.076-2.076c-.552-.281-1.155-.403-1.869-.461c-.697-.057-1.563-.057-2.655-.057H14.6a.75.75 0 0 0 0 1.5M3.75 14.6a.75.75 0 0 0-1.5 0v.033c0 1.092 0 1.958.057 2.655c.058.714.18 1.317.46 1.869a4.75 4.75 0 0 0 2.077 2.075c.55.281 1.154.403 1.868.461c.697.057 1.563.057 2.655.057H9.4a.75.75 0 0 0 0-1.5c-1.132 0-1.937 0-2.566-.052c-.62-.05-1.005-.147-1.31-.302a3.25 3.25 0 0 1-1.42-1.42c-.155-.305-.251-.69-.302-1.31c-.051-.63-.052-1.434-.052-2.566m18 0a.75.75 0 0 0-1.5 0c0 1.133 0 1.937-.052 2.566c-.05.62-.147 1.005-.302 1.31a3.25 3.25 0 0 1-1.42 1.42c-.305.155-.69.251-1.31.302c-.63.051-1.434.052-2.566.052a.75.75 0 0 0 0 1.5h.033c1.092 0 1.958 0 2.655-.057c.714-.058 1.317-.18 1.869-.46a4.75 4.75 0 0 0 2.075-2.076c.281-.552.403-1.155.461-1.869c.057-.697.057-1.563.057-2.655z" />
                  </svg>
                </NIcon>
              </NButton>
              <NButton ghost @click="lastStep">
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 21 21">
                    <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2.5 13.5c3.333-4 6.333-6 9-6s5 1 7 3" />
                      <path d="M2.5 8.5v5h5" />
                    </g>
                  </svg>
                </NIcon>
              </NButton>
              <NButton ghost @click="nextStep">
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 21 21">
                    <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18.5 13.5c-3.17-4-6.17-6-9-6s-5.163 1-7 3" />
                      <path d="M13.5 13.5h5v-5" />
                    </g>
                  </svg>
                </NIcon>
              </NButton>
              <NButton ghost @click="importExport">
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M8.65 3.35L5.86 6.14c-.32.31-.1.85.35.85H8V13c0 .55.45 1 1 1s1-.45 1-1V6.99h1.79c.45 0 .67-.54.35-.85L9.35 3.35a.501.501 0 0 0-.7 0zM16 17.01V11c0-.55-.45-1-1-1s-1 .45-1 1v6.01h-1.79c-.45 0-.67.54-.35.85l2.79 2.78c.2.19.51.19.71 0l2.79-2.78c.32-.31.09-.85-.35-.85H16z" />
                  </svg>
                </NIcon>
              </NButton>
              <NButton ghost @click="save">
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M17 20.75H7A2.75 2.75 0 0 1 4.25 18V6A2.75 2.75 0 0 1 7 3.25h7.5a.75.75 0 0 1 .53.22L19.53 8a.75.75 0 0 1 .22.53V18A2.75 2.75 0 0 1 17 20.75Zm-10-16A1.25 1.25 0 0 0 5.75 6v12A1.25 1.25 0 0 0 7 19.25h10A1.25 1.25 0 0 0 18.25 18V8.81l-4.06-4.06Z" />
                    <path fill="currentColor" d="M16.75 20h-1.5v-6.25h-6.5V20h-1.5v-6.5a1.25 1.25 0 0 1 1.25-1.25h7a1.25 1.25 0 0 1 1.25 1.25ZM12.47 8.75H8.53a1.29 1.29 0 0 1-1.28-1.3V4h1.5v3.25h3.5V4h1.5v3.45a1.29 1.29 0 0 1-1.28 1.3Z" />
                  </svg>
                </NIcon>
              </NButton>
            </NButtonGroup>
          </div>
        </div>
      </NLayoutContent>
      <NLayoutSider
        v-show="viewType === 'drd'"
        collapse-mode="width"
        :collapsed-width="0"
        :width="450"
        :native-scrollbar="false"
        show-trigger="bar"
        content-style="padding: 24px;"
        bordered
      >
        <div id="properties-container" class="dmn-properties-panel" style="width: 100%; height: 99%;" />
      </NLayoutSider>
    </NLayout>

    <NModal
      v-model:show="showImportExport"
      title="导入 / 导出"
      preset="card"
      size="small"
      draggable
      :style="{ width: '800px' }"
    >
      <NInput
        v-model:value="dmnXMLContent"
        type="textarea"
        placeholder="请输入内容"
        :autosize="{ minRows: 20, maxRows: 20 }"
        style="width: 100%;"
      />
      <template #action>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <!-- 左侧按钮 -->
          <NSpace>
            <NButton type="primary" @click="importDmn">
              导入
            </NButton>
            <NButton type="tertiary" @click="exportDmn">
              下载
            </NButton>
          </NSpace>
          <!-- 右侧按钮 -->
          <NButton text @click="showImportExport = false">
            取消
          </NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>

<script setup>
import { CamundaPlatformModeler as DmnModeler } from 'camunda-dmn-js'
import { NButton, NButtonGroup, NIcon, NInput, NLayout, NLayoutContent, NLayoutSider, NModal, NSpace } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import 'camunda-dmn-js/dist/assets/camunda-platform-modeler.css'

const props = defineProps({
  dmnXML: {
    type: String,
    default: null,
  },
})
const emits = defineEmits(['save:dmn'])
const { messages, locale } = useI18n()
import { useDark } from '@vueuse/core'

const isDark = useDark()
const dmnContainer = ref(null)
const canUndo = ref(true)
const canRedo = ref(true)
const viewType = ref('drd')
const showImportExport = ref(false)
let dmnModeler = null
const dmnXMLContent = ref('')
// 默认的DMN XML模板
const defaultDmnXML = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_0ajuj0t" name="DRD" namespace="http://camunda.org/schema/1.0/dmn" exporter="Camunda Modeler" exporterVersion="5.36.1" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.23.0">
  <decision id="Decision_0aamv2e" name="Decision 1">
    <decisionTable id="DecisionTable_1og06ps">
      <input id="Input_1">
        <inputExpression id="InputExpression_1" typeRef="string">
          <text></text>
        </inputExpression>
      </input>
      <output id="Output_1" typeRef="string" />
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram>
      <dmndi:DMNShape dmnElementRef="Decision_0aamv2e">
        <dc:Bounds height="80" width="180" x="160" y="160" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>
`

// 初始化 DMN 编辑器
onMounted(() => {
  // const messages = await loadLocaleMessages(locale.value)

  function translate(template, replacements) {
    replacements = replacements || {}

    // Translate
    template = messages.value[locale.value]?.dmn[template] || template

    // Replace
    return template.replace(/\{([^}]+)\}/g, (_, key) => {
      return replacements[key] || `{${key}}`
    })
  }

  const translateModule = {
    translate: ['value', translate],
  }

  dmnModeler = new DmnModeler({
    container: dmnContainer.value,
    keyboard: {
      bindTo: window,
    },

    drd: {
      propertiesPanel: {
        parent: '#properties-container',
      },
      overview: {
        parent: '#overview-container',
        open: true,
        width: 280,
        height: 200,
      },
      additionalModules: [
        // 国际化
        translateModule,
      ],
    },
    additionalModules: {
      translateModule,
    },
    decisionTable: {
      additionalModules: [translateModule],
    },
    literalExpression: {
      additionalModules: [translateModule],
    },
  })
  dmnModeler.on('views.changed', (event) => {
    if (event.activeView.type === 'drd') {
      viewType.value = 'drd'
    }
    if (event.activeView.type === 'decisionTable') {
      viewType.value = 'decisionTable'
    }
  })
  newDmn()
})

function zoomIn() {
  if (dmnModeler) {
    const activeViewer = dmnModeler.getActiveViewer()
    const canvas = activeViewer.get('canvas')
    const currentZoom = canvas.zoom()
    canvas.zoom(currentZoom + 0.1, 'auto')
  }
}

function zoomOut() {
  if (dmnModeler) {
    try {
      const canvas = dmnModeler.getActiveViewer().get('canvas')
      const currentZoom = canvas.zoom()
      canvas.zoom(currentZoom / 1.2, 'auto')
    }
    catch (error) {
      console.error('缩小失败:', error)
    }
  }
}

function centerView() {
  if (dmnModeler) {
    try {
      const canvas = dmnModeler.getActiveViewer().get('canvas')

      // 获取所有元素的边界框
      const elementRegistry = dmnModeler.getActiveViewer().get('elementRegistry')
      const elements = elementRegistry.getAll()

      if (elements.length === 0)
        return

      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      elements.forEach((element) => {
        if (element.x !== undefined && element.y !== undefined) {
          minX = Math.min(minX, element.x)
          minY = Math.min(minY, element.y)
          maxX = Math.max(maxX, element.x + (element.width || 0))
          maxY = Math.max(maxY, element.y + (element.height || 0))
        }
      })

      if (minX !== Infinity) {
        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2

        // 计算合适的缩放比例
        const containerRect = dmnContainer.value.getBoundingClientRect()
        const contentWidth = maxX - minX
        const contentHeight = maxY - minY

        const scaleX = (containerRect.width * 0.8) / contentWidth
        const scaleY = (containerRect.height * 0.8) / contentHeight
        const scale = Math.min(scaleX, scaleY, 1) // 不超过100%缩放

        // 设置视图中心和缩放
        canvas.viewbox({
          x: centerX - (containerRect.width / 2) / scale,
          y: centerY - (containerRect.height / 2) / scale,
          width: containerRect.width / scale,
          height: containerRect.height / scale,
        })
      }
      else {
        // 如果没有元素，只是重置视图
        canvas.zoom('fit-viewport', 'auto')
      }
    }
    catch (error) {
      console.error('居中视图失败:', error)
      // 备用方案：使用fit-viewport
      try {
        const canvas = dmnModeler.getActiveViewer().get('canvas')
        canvas.zoom('fit-viewport', 'auto')
      }
      catch (fallbackError) {
        console.error('备用居中方案也失败:', fallbackError)
      }
    }
  }
}

function lastStep() {
  if (dmnModeler) {
    try {
      const commandStack = dmnModeler.getActiveViewer().get('commandStack')
      canUndo.value = commandStack.canUndo()
      canRedo.value = commandStack.canRedo()
      commandStack.undo()
    }
    catch (error) {
      console.error('撤销失败:', error)
    }
  }
}

function nextStep() {
  if (dmnModeler) {
    try {
      const commandStack = dmnModeler.getActiveViewer().get('commandStack')
      canUndo.value = commandStack.canUndo()
      canRedo.value = commandStack.canRedo()
      commandStack.redo()
    }
    catch (error) {
      console.error('重做失败:', error)
    }
  }
}

async function importExport() {
  const { xml } = await dmnModeler.saveXML({ format: true })
  dmnXMLContent.value = xml
  showImportExport.value = true
}

// 导出 DMN XML
async function exportDmn() {
  const { xml } = await dmnModeler.saveXML({ format: true })
  const blob = new Blob([xml], { type: 'application/xml' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'dmn.xml'
  a.click()
}

// 导入 DMN XML
async function importDmn() {
  await dmnModeler.importXML(dmnXMLContent.value)
  const activeViewer = dmnModeler.getActiveViewer()
  if (activeViewer && activeViewer.get('canvas')) {
    activeViewer.get('canvas').zoom('fit-viewport')
  }
  showImportExport.value = false
}

// 新建 DMN
async function newDmn() {
  try {
    // 清空当前内容
    dmnXMLContent.value = props.dmnXML ? props.dmnXML : defaultDmnXML

    // 导入默认模板
    await dmnModeler.importXML(defaultDmnXML)

    // 重置视图
    try {
      const activeViewer = dmnModeler.getActiveViewer()

      if (activeViewer && activeViewer.get('canvas')) {
        activeViewer.get('canvas').zoom('fit-viewport')
      }
    }
    catch (err) {
      console.log('视图调整失败，但不影响功能:', err)
    }

    console.log('新建 DMN 成功')
  }
  catch (err) {
    console.error('新建 DMN 出错', err)
  }
}

async function save() {
  const { xml } = await dmnModeler.saveXML({ format: true })
  console.log('保存 DMN:', xml)
  emits('save:dmn', xml)
  showImportExport.value = false
}
</script>

<style>
.dark-mode .dmn-container {
  filter: invert(1);
}

/* 整体容器 & 工具栏 */
.dark-mode .djs-toolbar {
  background-color: #282a36; /* Dracula 背景 */
  color: #f8f8f2; /* Dracula 字体颜色 */
  border-color: #6272a4; /* 工具栏边框 */
}

.dark-mode .dmn-container .djs-context-pad.open > .group > .entry {
  background-color: #282a36;
  color: #f8f8f2;
  border-color: #6272a4;
}

.dark-mode .dmn-properties-panel {
  filter: invert(1);
}

.dark-mode .dmn-properties-panel .djs-context-pad.open > .group > .entry {
  background-color: #282a36;
  color: #f8f8f2;
  border-color: #6272a4;
}

/* 工具项 palette */
.dark-mode .dmn-container .djs-context-pad.open > .group > .entry {
  background-color: #44475a; /* Dracula 深灰节点背景 */
  color: #f8f8f2; /* 字体颜色 */
  border: 1px solid #6272a4; /* 边框颜色 */
  border-radius: 4px;
}

/* Hover / 选中状态 */
.dark-mode .dmn-container .djs-context-pad.open > .group > .entry:hover,
.dark-mode .dmn-container .djs-context-pad.open > .group > .entry.djs-selected {
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
</style>
