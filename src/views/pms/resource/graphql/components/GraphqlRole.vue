<template>
  <MeModal ref="modalRef">
    <GraphqlCrud
      ref="$table"
      v-model:filters="queryItems"
      size="small"
      :condition="true"
      :scroll-x="-1"
      :columns="columns"
      :get-data="PAGE_ROLE"
      @on-checked="onChecked"
    >
      <ConditionItem v-model:value="queryItems.name" size="small" type="string" label="角色名" :label-width="50" :content-width="150">
        <n-input v-model:value="queryItems.name.value" size="small" type="text" placeholder="请输入角色名" clearable />
      </ConditionItem>
      <ConditionItem v-model:value="queryItems.enable" size="small" label="状态" type="string" :label-width="50" :content-width="150">
        <n-select
          v-model:value="queryItems.enable.value"
          size="small"
          clearable
          :options="[
            { label: '启用', value: true },
            { label: '停用', value: false },
          ]"
        />
      </ConditionItem>
    </GraphqlCrud>
  </MeModal>
</template>

<script setup>
import { NSwitch } from 'naive-ui'
import { ref } from 'vue'
import { MeModal } from '@/components'
import { useModal } from '@/composables'
import { PAGE_ROLE, saveRole } from '@/views/pms/role/apollo.js'
import api from '../api.js'

const emit = defineEmits(['refresh'])

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({
  name: {},
  enable: {},
})

const [modalRef, okLoading] = useModal()

const modalAction = ref('')
const graphqlService = ref('')
const graphqlIds = ref([])
const modalType = ref('')
const roleIds = ref([])

function onChecked(rowKeys) {
  roleIds.value = rowKeys || []
}

function handleOpen(options = {}) {
  const { action, type, ids = [], service, ...rest } = options
  if (type === 'service') {
    graphqlService.value = service
  }
  else {
    graphqlIds.value = ids
  }
  modalType.value = type
  modalAction.value = action
  modalRef.value.open({ ...rest, onOk: onSave })
}

async function onSave() {
  if (roleIds.value.length === 0) {
    // $message.error('请选择角色')
    return true
  }

  okLoading.value = true
  try {
    if (modalAction.value === 'authorize') {
      if (modalType.value === 'service') {
        await api.serviceAuthorize({ service: graphqlService.value, roleIds: roleIds.value })
      }
      else {
        await api.functionAuthorize({ graphqlIds: graphqlIds.value, roleIds: roleIds.value })
      }
    }
    else if (modalAction.value === 'cancelAuthorize') {
      if (modalType.value === 'service') {
        await api.serviceCancelAuthorize({ service: graphqlService.value, roleIds: roleIds.value })
      }
      else {
        await api.functionCancelAuthorize({ graphqlIds: graphqlIds.value, roleIds: roleIds.value })
      }
    }
    okLoading.value = false
    $message.success(modalAction.value === 'authorize' ? '授权成功' : '取消授权成功')
    emit('refresh')
  }
  catch (error) {
    console.error(error)
    okLoading.value = false
    return false
  }
}

async function handleEnable(row) {
  // row.enableLoading = true
  try {
    await saveRole({ id: row.id, enable: !row.enable })
    // row.enableLoading = false
    $message.success('操作成功')
    $table.value?.handleSearch()
  }
  catch (error) {
    console.error(error)
    // row.enableLoading = false
  }
}

const columns = [
  { type: 'selection', fixed: 'left' },
  { title: '角色名', key: 'name' },
  { title: '角色编码', key: 'code' },
  {
    title: '状态',
    key: 'enable',
    render: row =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.enable,
          loading: !!row.enableLoading,
          disabled: row.code === 'SUPER_ADMIN',
          onUpdateValue: () => handleEnable(row),
        },
        {
          checked: () => '启用',
          unchecked: () => '停用',
        },
      ),
  },
]

defineExpose({
  handleOpen,
})
</script>
