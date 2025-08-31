<script lang="js" setup>
import { ref, reactive } from 'vue'
import { 
  NForm, NFormItem, NInput, NSelect,
  NInputNumber,
} from 'naive-ui'


const props = defineProps({
  bpmnModeler: {
    type: Object,
    required: true
  },
  element: {
    type: Object,
    default: null
  }
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
  priority: undefined
})

// 加载元素属性
const loadElementProperties = (element) => {
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
const handleAssignmentTypeChange = (type) => {
  // 清空其他分配字段
  formData.assignee = ''
  formData.candidateUsers = ''
  formData.candidateGroups = ''
  candidateUsersList.value = []
  candidateGroupsList.value = []
  
  updateElement()
}

// 处理候选用户变化
const handleCandidateUsersChange = (users) => {
  formData.candidateUsers = users.join(',')
  updateElement()
}

// 处理候选组变化
const handleCandidateGroupsChange = (groups) => {
  formData.candidateGroups = groups.join(',')
  updateElement()
}

// 更新BPMN元素
const updateElement = async () => {
  if (!props.element || !props.bpmnModeler) return
  
  try {
    if (!element) return
    
    if (formData.assignee) {
      modeling.updateProperties(element, {
        'camunda:assignee': formData.assignee || '',
      });
    }

    if (formData.candidateUsers) {
      modeling.updateProperties(element, {
        'camunda:candidateUsers': formData.candidateUsers || '',
      });
    }

    if (formData.candidateGroups) {
      modeling.updateProperties(element, {
        'camunda:candidateGroups': formData.candidateGroups || ''
      });
    }

    if (formData.dueDate) {
      modeling.updateProperties(element, {
        'camunda:dueDate': formData.dueDate || ''
      });
    }

    if (formData.followUpDate) {
      modeling.updateProperties(element, {
        'camunda:followUpDate': formData.followUpDate || ''
      });
    }

    if (formData.priority) {
      modeling.updateProperties(element, {
        'camunda:priority': formData.priority || ''
      });
    }

  } catch (error) {
    console.error('更新元素失败:', error)
    window.$error('更新元素失败')
  }
}

// 保存配置
const saveConfiguration = async () => {
  try {
    await formRef.value?.validate()
    await updateElement()
    window.$success('配置保存成功')
  } catch (error) {
    window.$error('请检查表单填写是否正确')
  }
}

// 暴露方法
defineExpose({
  loadElementProperties,
  updateElement
})
</script>


<template>
  <div class="user-assignment-panel">

    <n-form :model="formData" size="small">

      <!-- 指定用户 -->
      <n-form-item label="指定用户" path="assignee">
        <n-select
          v-model:value="formData.assignee"
          filterable
          clearable
          placeholder="选择用户"
          :options="[
            {
              label: 'Drive My Car',
              value: 'song1'
            },
            {
              label: 'Norwegian Wood',
              value: 'song2'
            },
          ]"
          @update:value="updateElement"
        />
      </n-form-item>

      <!-- 候选用户 -->
      <n-form-item label="候选用户" path="candidateUsers">
        <n-select
          v-model:value="candidateUsersList"
          filterable
          clearable
          multiple 
          placeholder="候选用户"
          :options="[
            {
              label: 'Drive My Car',
              value: 'song1'
            },
            {
              label: 'Norwegian Wood',
              value: 'song2'
            },
          ]"
          @update:value="handleCandidateUsersChange"
        />
      </n-form-item>

      <!-- 候选组 -->
      <n-form-item label="候选组" path="candidateGroups">
        <n-select
          v-model:value="candidateGroupsList"
          filterable
          multiple 
          clearable
          placeholder="候选组"
          :options="[
            {
              label: 'Drive My Car',
              value: 'song1'
            },
            {
              label: 'Norwegian Wood',
              value: 'song2'
            },
          ]"
          @update:value="handleCandidateGroupsChange"
        />
      </n-form-item>
      <n-form-item label="截止时间" path="dueDate">
        <n-input
          v-model:value="formData.dueDate"
          clearable
          placeholder="${someDate} or 2025-06-26T09:54:00"
          @update:value="updateElement"
        />
      </n-form-item>
      <n-form-item label="跟进日期" path="followUpDate">
        <n-input
          v-model:value="formData.followUpDate"
          clearable
          placeholder="${someDate} or 2025-06-26T09:54:00"
          @update:value="updateElement"
        />
      </n-form-item>
      <n-form-item label="优先级" path="priority">
        <n-input-number
          clearable
          v-model:value="formData.priority"
          @update:value="updateElement"
        />
      </n-form-item>
    </n-form>

  </div>
</template>