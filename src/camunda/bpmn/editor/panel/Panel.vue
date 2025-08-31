<template>
  <component
    :is="currentComponent"
    v-if="selectedElement?.$type && currentComponent"
    :key="selectedElement.id"
    :selected-element="selectedElement"
    :bpmn-modeler="bpmnModeler"
  />
  <div
    v-else-if="selectedElement?.$type && !currentComponent"
    class="component-error"
    :data-type="selectedElement?.$type"
  >
    <slot name="error" :type="selectedElement?.$type">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <div>
          <div class="error-title">
            未知组件类型
          </div>
          <div class="error-message">
            组件类型 "{{ selectedElement?.$type }}" 未注册
          </div>
          <div class="error-hint">
            已注册类型:
            {{ componentRegistry.getRegisteredTypes().join(", ") || "无" }}
          </div>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { componentRegistry } from './EditorComponentRegistry'

defineOptions({
  name: 'Panel',
})

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

const currentComponent = computed(() => {
  if (!props.selectedElement) {
    return null
  }
  const component = componentRegistry.get(props.selectedElement?.$type || props.selectedElement.type)
  return component || null
})

const formData = ref({
  name: '',
  id: '',
  description: '',
  triggerType: 'none',
  isExecutable: true,
})

const isStartEvent = computed(() => {
  if (!props.selectedElement)
    return false
  return props.selectedElement.$type === 'bpmn:StartEvent'
})

function loadElementData(element) {
  formData.value = {
    name: element.name || '',
    id: element.id || '',
    description: element.description || '',
    triggerType: 'none',
    isExecutable: element.isExecutable !== false,
  }
}

function resetFormData() {
  formData.value = {
    name: '',
    id: '',
    description: '',
    triggerType: 'none',
    isExecutable: true,
  }
}

watch(() => props.selectedElement, (newElement) => {
  if (newElement && isStartEvent.value) {
    loadElementData(newElement)
  }
  else {
    resetFormData()
  }
}, { immediate: true })
</script>

<style scoped>
</style>
