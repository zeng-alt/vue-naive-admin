<template>
  <CommonPage>
    <template #action>
      <NButton v-permission="'AddUser'" type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        创建新参数
      </NButton>
    </template>

    <GraphqlCrud
      ref="$table"
      v-model:filters="queryItems"
      :condition="true"
      :scroll-x="1200"
      :columns="columns"
      :get-data="PAGE_PARAMETER"
    >
      <ConditionItem v-model:value="queryItems.parameterName" label="参数名" type="string" :label-width="50">
        <NInput
          v-model:value="queryItems.parameterName.value"
          type="text"
          placeholder="请输入参数名称"
          clearable
        />
      </ConditionItem>
      <ConditionItem v-model:value="queryItems.parameterKey" label="参数键" type="string" :label-width="50">
        <NInput
          v-model:value="queryItems.parameterKey.value"
          type="text"
          placeholder="请输入参数键"
          clearable
        />
      </ConditionItem>
    </GraphqlCrud>

    <MeModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
        :disabled="modalAction === 'view'"
      >
        <NFormItem
          label="参数键"
          path="parameterKey"
          :rule="{
            required: true,
            message: '请输入参数键',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput v-model:value="modalForm.parameterKey" :disabled="modalAction !== 'add'" />
        </NFormItem>
        <NFormItem
          v-if="['add', 'edit'].includes(modalAction)"
          label="参数名"
          path="parameterName"
          :rule="{
            required: true,
            message: '请输入参数名',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput v-model:value="modalForm.parameterName" />
        </NFormItem>
        <NFormItem
          v-if="['add', 'edit'].includes(modalAction)"
          label="参数值"
          path="parameterValue"
          :rule="{
            required: true,
            message: '请输入参数值',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput v-model:value="modalForm.parameterValue" />
        </NFormItem>
        <NFormItem
          label="参数类型"
          path="parameterType"
          :rule="{
            required: true,
            message: '请输入参数类型',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput v-model:value="modalForm.parameterType" :disabled="modalAction !== 'add'" />
        </NFormItem>
        <NFormItem
          label="备注"
          path="remark"
        >
          <NInput v-model:value="modalForm.remark" />
        </NFormItem>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NFormItem, NInput, NTooltip } from 'naive-ui'
import { ref } from 'vue'
import { GraphqlCrud, MeModal } from '@/components'
import { useCrud } from '@/composables'
import { formatDateTime } from '@/utils'
import { deleteParameter, PAGE_PARAMETER, saveParameter } from './apollo'

defineOptions({ name: 'ParameterMgt' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({
  parameterKey: {},
  parameterName: {},
})

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleEdit,
} = useCrud({
  name: '参数',
  initForm: {},
  doCreate: saveParameter,
  doDelete: deleteParameter,
  doUpdate: saveParameter,
  refresh: () => $table.value?.handleSearch(),
})

const columns = [
  {
    title: '参数键',
    key: 'parameterKey',
    width: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: '参数名',
    key: 'parameterName',
    width: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: '参数值',
    key: 'parameterValue',
    width: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: '参数类型',
    key: 'parameterType',
    width: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: '备注',
    key: 'remark',
    width: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: '创建时间',
    key: 'createDate',
    width: 180,
    render(row) {
      return h('span', formatDateTime(row.createTime))
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 320,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return [
        h(
          NTooltip,
          { trigger: 'hover' },
          {
            trigger: () =>
              h(
                NButton,
                {
                  text: true,
                  size: 'large',
                  style: 'margin-left: 12px;',
                  type: 'info',
                  onClick: () => handleEdit(row),
                },
                {
                  icon: () => h('i', {
                    class: 'i-material-symbols:edit-outline text-14',
                  }),
                },
              ),
            default: () => '修改', // 这是提示的内容
          },
        ),
        h(
          NTooltip,
          { trigger: 'hover' },
          {
            trigger: () =>
              h(
                NButton,
                {
                  text: true,
                  size: 'large',
                  style: 'margin-left: 12px;',
                  type: 'error',
                  onClick: () => handleDelete(row.id),
                },
                {
                  icon: () => h('i', {
                    class: 'i-material-symbols:delete-outline text-14',
                  }),
                },
              ),
            default: () => '删除', // 这是提示的内容
          },
        ),
      ]
    },
  },
]

onMounted(() => {
  $table.value?.handleSearch()
})
</script>
