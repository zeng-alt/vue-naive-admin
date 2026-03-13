<script lang="js" setup>
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
} from 'naive-ui'
import { reactive, ref } from 'vue'

const props = defineProps({
  bpmnModeler: {
    type: Object,
    required: true,
  },
  element: {
    type: Object,
    default: null,
  },
})

// 表单引用
const formRef = ref(null)
// 候选用户列表
const candidateUsersList = ref([])
const candidateGroupsList = ref([])

const modeling = props.bpmnModeler.get('modeling')
const elementRegistry = props.bpmnModeler.get('elementRegistry')

const element = elementRegistry.get(props.element.id)

// 分配类型
const assignmentType = ref('assignee')

// 表单数据
const formData = reactive({
  assignee: undefined,
  candidateUsers: undefined,
  candidateGroups: undefined,
  dueDate: undefined,
  followUpDate: undefined,
  priority: undefined,
})

// 加载元素属性
function loadElementProperties(element) {
  const businessObject = element.businessObject

  formData.assignee = businessObject.assignee
  formData.candidateUsers = businessObject.candidateUsers
  formData.candidateGroups = businessObject.candidateGroups
  formData.dueDate = businessObject.dueDate
  formData.followUpDate = businessObject.followUpDate
  formData.priority = businessObject.priority

  // 解析候选用户和组
  candidateUsersList.value = formData.candidateUsers ? formData.candidateUsers.split(',').map(u => u.trim()) : []
  candidateGroupsList.value = formData.candidateGroups ? formData.candidateGroups.split(',').map(g => g.trim()) : []
}

loadElementProperties(element)

// 处理分配类型变化
function handleAssignmentTypeChange(type) {
  // 清空其他分配字段
  formData.assignee = ''
  formData.candidateUsers = ''
  formData.candidateGroups = ''
  candidateUsersList.value = []
  candidateGroupsList.value = []

  updateElement()
}

// 处理候选用户变化
function handleCandidateUsersChange(users) {
  formData.candidateUsers = users.join(',')
  updateElement()
}

// 处理候选组变化
function handleCandidateGroupsChange(groups) {
  formData.candidateGroups = groups.join(',')
  updateElement()
}

// 更新BPMN元素
async function updateElement() {
  if (!props.element || !props.bpmnModeler)
    return

  try {
    if (!element)
      return

    if (formData.assignee) {
      modeling.updateProperties(element, {
        'camunda:assignee': formData.assignee || '',
      })
    }

    if (formData.candidateUsers) {
      modeling.updateProperties(element, {
        'camunda:candidateUsers': formData.candidateUsers || '',
      })
    }

    if (formData.candidateGroups) {
      modeling.updateProperties(element, {
        'camunda:candidateGroups': formData.candidateGroups || '',
      })
    }

    if (formData.dueDate) {
      modeling.updateProperties(element, {
        'camunda:dueDate': formData.dueDate || '',
      })
    }

    if (formData.followUpDate) {
      modeling.updateProperties(element, {
        'camunda:followUpDate': formData.followUpDate || '',
      })
    }

    if (formData.priority) {
      modeling.updateProperties(element, {
        'camunda:priority': formData.priority || '',
      })
    }
  }
  catch (error) {
    console.error('更新元素失败:', error)
    window.$error('更新元素失败')
  }
}

// 保存配置
async function saveConfiguration() {
  try {
    await formRef.value?.validate()
    await updateElement()
    window.$success('配置保存成功')
  }
  catch (error) {
    window.$error('请检查表单填写是否正确')
  }
}

// 暴露方法
defineExpose({
  loadElementProperties,
  updateElement,
})
</script>

<template>
  <div class="user-assignment-panel">
    <NForm :model="formData" size="small">
      <!-- 指定用户 -->
      <NFormItem label="指定用户" path="assignee">
        <NSelect
          v-model:value="formData.assignee"
          filterable
          clearable
          placeholder="选择用户"
          :options="[
            {
              label: 'Drive My Car',
              value: 'song1',
            },
            {
              label: 'Norwegian Wood',
              value: 'song2',
            },
          ]"
          @update:value="updateElement"
        />
      </NFormItem>

      <!-- 候选用户 -->
      <NFormItem label="候选用户" path="candidateUsers">
        <NSelect
          v-model:value="candidateUsersList"
          filterable
          clearable
          multiple
          placeholder="候选用户"
          :options="[
            {
              label: 'Drive My Car',
              value: 'song1',
            },
            {
              label: 'Norwegian Wood',
              value: 'song2',
            },
          ]"
          @update:value="handleCandidateUsersChange"
        />
      </NFormItem>

      <!-- 候选组 -->
      <NFormItem label="候选组" path="candidateGroups">
        <NSelect
          v-model:value="candidateGroupsList"
          filterable
          multiple
          clearable
          placeholder="候选组"
          :options="[
            {
              label: 'Drive My Car',
              value: 'song1',
            },
            {
              label: 'Norwegian Wood',
              value: 'song2',
            },
          ]"
          @update:value="handleCandidateGroupsChange"
        />
      </NFormItem>
      <NFormItem label="截止时间" path="dueDate">
        <NInput
          v-model:value="formData.dueDate"
          clearable
          placeholder="${someDate} or 2025-06-26T09:54:00"
          @update:value="updateElement"
        />
      </NFormItem>
      <NFormItem label="跟进日期" path="followUpDate">
        <NInput
          v-model:value="formData.followUpDate"
          clearable
          placeholder="${someDate} or 2025-06-26T09:54:00"
          @update:value="updateElement"
        />
      </NFormItem>
      <NFormItem label="优先级" path="priority">
        <NInputNumber
          v-model:value="formData.priority"
          clearable
          @update:value="updateElement"
        />
      </NFormItem>
    </NForm>
  </div>
</template>
