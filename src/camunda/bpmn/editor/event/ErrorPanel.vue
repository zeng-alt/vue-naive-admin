<template>
  <NForm size="small" :model="errorData">
    <NFormItem label="错误引用" path="errorRef">
      <NSelect
        v-model:value="errorData.errorRef"
        placeholder="请选择错误定义"
        :options="errorOptions"
        clearable
        filterable
        @update:value="updateErrorRef"
      />
    </NFormItem>

    <NFormItem v-show="errorData.errorRef !== 'none'" label="错误名称" path="errorName">
      <NInput
        v-model:value="errorData.errorName"
        placeholder="请输入错误名称"
        @blur="updateErrorName(errorData.errorName)"
      />
    </NFormItem>

    <NFormItem v-show="errorData.errorRef !== 'none'" label="错误代码" path="errorCode">
      <NInput
        v-model:value="errorData.errorCode"
        placeholder="请输入错误代码"
        @blur="updateErrorCode(errorData.errorCode)"
      />
    </NFormItem>

    <NFormItem v-show="errorData.errorRef !== 'none'" label="错误消息" path="errorMessage">
      <NInput
        v-model:value="errorData.errorMessage"
        type="textarea"
        placeholder="请输入错误消息描述"
        :rows="1"
        @blur="updateErrorMessage(errorData.errorMessage)"
      />
    </NFormItem>

    <NFormItem v-show="showVal" label="错误代码变量" path="codeVal">
      <NInput
        v-model:value="errorData.codeVal"
        placeholder="输入错误代码变量"
        @blur="updateErrorCodeVal(errorData.codeVal)"
      />
      <template #feedback>
        定义包含错误代码的变量的名称
      </template>
    </NFormItem>
    <NFormItem v-show="showVal" label="错误信息变量" path="messageVal">
      <NInput
        v-model:value="errorData.messageVal"
        placeholder="输入错误信息变量"
        @blur="updateErrorMessageVal(errorData.messageVal)"
      />
      <template #feedback>
        定义包含错误消息的变量的名称
      </template>
    </NFormItem>
  </NForm>
</template>

<script setup>
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
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
  bo: {
    type: Object,
    default: null,
  },
  showVal: {
    type: Boolean,
    default: true,
  },
})

const elementRegistry = props.bpmnModeler.get('elementRegistry')
const definitions = props.bpmnModeler.getDefinitions()
const modeling = props.bpmnModeler.get('modeling')
const bpmnFactory = props.bpmnModeler.get('bpmnFactory')
const element = elementRegistry.get(props.selectedElement.id)

// 错误数据模型
const errorData = reactive({
  errorRef: 'none',
  errorCode: '',
  errorName: '',
  errorMessage: '',
  messageVal: '',
  codeVal: '',
})

const errorOptions = ref([])

function loadErrors() {
  errorOptions.value = [
    {
      label: 'None (不指定错误)',
      value: 'none',
    },
    {
      label: '创建新的错误',
      value: 'create',
    },
  ]
  if (definitions.rootElements) {
    definitions.rootElements.forEach((rootElement) => {
      if (rootElement.$type === 'bpmn:Error') {
        errorOptions.value.push({
          label: `${rootElement.name || rootElement.id}`,
          value: rootElement.id,
        })
      }
    })
  }
};

loadErrors()

// 初始化数据
function initializeData() {
  const errorEventDef = props.bo.errorRef

  if (errorEventDef) {
    errorData.errorRef = errorEventDef.id || ''
    errorData.errorCode = errorEventDef.errorCode || ''
    errorData.errorName = errorEventDef.name || ''
    errorData.errorMessage = errorEventDef.errorMessage || ''
  }

  errorData.codeVal = props.bo?.errorCodeVariable
  errorData.messageVal = props.bo?.errorMessageVariable
}

// 更新错误引用
function updateErrorRef(value) {
  if (value === 'none') {
    errorData.errorName = ''
    errorData.errorCode = ''
    errorData.errorMessage = ''
    modeling.updateModdleProperties(element, props.bo, {
      errorRef: undefined,
    })
  }
  else if (value === 'create') {
    const error = bpmnFactory.create('bpmn:Error')
    error.name = error.id
    errorData.errorRef = error.id
    errorData.errorName = error.id

    definitions.get('rootElements').push(error)
    modeling.updateModdleProperties(element, props.bo, {
      errorRef: error,
    })
    errorOptions.value.push({ value: error.id, label: error.name })
    loadErrors()
  }
  else {
    // 查找选中的错误定义
    const selectedError = getError(value)
    if (selectedError) {
      modeling.updateModdleProperties(element, props.bo, {
        errorRef: selectedError,
      })

      // 同步显示数据
      errorData.errorRef = selectedError.id || ''
      errorData.errorCode = selectedError.errorCode || ''
      errorData.errorName = selectedError.name || ''
      errorData.errorMessage = selectedError.errorMessage || ''
    }
  }
}

// 更新错误代码（仅显示，实际需要通过errorRef更新）
function updateErrorCode(value) {
  if (props.bo && props.bo.errorRef) {
    modeling.updateModdleProperties(element, props.bo.errorRef, {
      errorCode: value,
    })
  }
}

// 更新错误名称
function updateErrorName(value) {
  if (props.bo && props.bo.errorRef) {
    modeling.updateModdleProperties(element, props.bo.errorRef, {
      name: value,
    })
    loadErrors()
  }
}

// 更新错误消息
function updateErrorMessage(value) {
  if (props.bo && props.bo.errorRef) {
    modeling.updateModdleProperties(element, props.bo.errorRef, {
      errorMessage: value,
    })
  }
}

// 更新错误消息
function updateErrorCodeVal(value) {
  if (props.bo) {
    modeling.updateModdleProperties(element, props.bo, {
      errorCodeVariable: value,
    })
  }
}

// 更新错误消息
function updateErrorMessageVal(value) {
  if (props.bo) {
    modeling.updateModdleProperties(element, props.bo, {
      errorMessageVariable: value,
    })
  }
}
function getError(id) {
  return definitions.rootElements.find(
    element => element.id === id && element.$type === 'bpmn:Error',
  )
}

// 组件挂载时初始化

initializeData()
</script>
