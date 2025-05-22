<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:29:56
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <template #action>
      <NButton v-permission="'AddUser'" type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        创建新用户
      </NButton>
    </template>

    <GraphqlCrud
      ref="$table"
      v-model:filters="queryItems"
      :condition="true"
      :expand="true"
      :scroll-x="1200"
      :columns="columns"
      :get-data="PAGE_USER"
    >
      <ConditionItem v-model:value="queryItems.username" label="用户名" type="string" :label-width="50">
        <n-input
          v-model:value="queryItems.username.value"
          type="text"
          placeholder="请输入用户名"
          clearable
        />
      </ConditionItem>

      <ConditionItem v-model:value="queryItems.gender" label="性别" type="string" :label-width="50">
        <n-select v-model:value="queryItems.gender.value" clearable :options="genders" />
      </ConditionItem>

      <ConditionItem v-model:value="queryItems.enable" label="状态" type="string" :label-width="50">
        <n-select
          v-model:value="queryItems.enable.value"
          clearable
          :options="[
            { label: '启用', value: true },
            { label: '停用', value: false },
          ]"
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
        <n-form-item
          label="用户名"
          path="username"
          :rule="{
            required: true,
            message: '请输入用户名',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.username" :disabled="modalAction !== 'add'" />
        </n-form-item>
        <n-form-item
          v-if="['add', 'reset'].includes(modalAction)"
          :label="modalAction === 'reset' ? '重置密码' : '初始密码'"
          path="password"
          :rule="{
            required: true,
            message: '请输入密码',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.password" type="password" show-password-on="mousedown" />
        </n-form-item>

        <n-form-item v-if="['add', 'setRole'].includes(modalAction)" label="角色" path="roleIds">
          <n-select
            v-model:value="modalForm.roleIds"
            :options="roles"
            label-field="name"
            value-field="id"
            clearable
            filterable
            multiple
          />
        </n-form-item>
        <n-form-item v-if="modalAction === 'add'" label="状态" path="enable">
          <NSwitch v-model:value="modalForm.enable">
            <template #checked>
              启用
            </template>
            <template #unchecked>
              停用
            </template>
          </NSwitch>
        </n-form-item>
      </n-form>
      <n-alert v-if="modalAction === 'add'" type="warning" closable>
        详细信息需由用户本人补充修改
      </n-alert>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { ConditionItem, GraphqlCrud, MeModal } from '@/components'
import { useCrud } from '@/composables'
import { withPermission } from '@/directives'
import { formatDateTime } from '@/utils'
import { NAvatar, NButton, NSwitch, NTag } from 'naive-ui'
import api from './api'
import { saveUser, deleteUser } from './apollo'
import { PAGE_USER, queryRoleByEnable } from './apollo'
import { h } from 'vue'

defineOptions({ name: 'UserMgt' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({
  username: {},
  gender: {},
  enable: {},
})

onMounted(() => {
  $table.value?.handleSearch()
})

const genders = [
  { label: '男', value: '1' },
  { label: '女', value: '2' },
]
// const roles = ref([])
// api.getAllRoles().then(({ data = [] }) => (roles.value = data))
const { result } = queryRoleByEnable(true)
const roles = computed(() => result.value?.queryRole ?? [])

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleOpen,
  handleSave,
} = useCrud({
  name: '用户',
  initForm: { enable: true },
  doCreate: saveUser,
  doDelete: deleteUser,
  doUpdate: saveUser,
  refresh: () => $table.value?.handleSearch(),
})

const columns = [
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    render: ({ avatar }) =>
      h(NAvatar, {
        size: 'medium',
        src: avatar,
      }),
  },
  {
    title: '用户名',
    key: 'username',
    width: 150,
    sorter: true,
    filter: true,
    filterOptionValues: [],
    filterOptions: [
      {
        label: 'Value1',
        value: 1,
      },
      {
        label: 'Value2',
        value: 2,
      },
    ],
    ellipsis: { tooltip: true },
  },
  {
    title: '角色',
    key: 'userRoles',
    width: 200,
    ellipsis: { tooltip: true },
    render: (row) => {
      if (row.username === 'superAdmin') {
        return h(
          NTag,
          { type: 'error' },
          { default: () => '超级管理员' },
        )
      }
      if (row.userRoles?.length) {
        return row.userRoles.map((item, index) =>
          h(
            NTag,
            { type: 'success', style: index > 0 ? 'margin-left: 8px;' : '' },
            { default: () => item.role?.name },
          ),
        )
      }
      return '暂无角色'
    },
  },
  {
    title: '性别',
    key: 'gender',
    width: 80,
    render: ({ gender }) => {
      return genders.find(item => gender === item.value)?.label ?? ''
    },
  },
  { title: '邮箱', key: 'email', width: 150, ellipsis: { tooltip: true } },
  {
    title: '创建时间',
    key: 'createDate',
    width: 180,
    render(row) {
      return h('span', formatDateTime(row.createTime))
    },
  },
  {
    title: '状态',
    key: 'enable',
    width: 120,
    render: row =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.enable,
          loading: !!row.enableLoading,
          disabled: row.username === 'superAdmin',
          onUpdateValue: () => handleEnable(row),
        },
        {
          checked: () => '启用',
          unchecked: () => '停用',
        },
      ),
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
        withPermission(
          h(NButton, {
            size: 'small',
            type: 'primary',
            secondary: true,
          }, {
            default: () => '超管专属',
            icon: () => h('i', { class: 'i-carbon:user-role text-14' }),
          }),
          'SuperAdmin',
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            class: 'ml-12px',
            secondary: true,
            disabled: row.username === 'superAdmin',
            onClick: () => handleOpenRolesSet(row),
          },
          {
            default: () => '分配角色',
            icon: () => h('i', { class: 'i-carbon:user-role text-14' }),
          },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            style: 'margin-left: 12px;',
            disabled: row.username === 'superAdmin',
            onClick: () => handleOpen({ action: 'reset', title: '重置密码', row, onOk: onSave }),
          },
          {
            default: () => '重置密码',
            icon: () => h('i', { class: 'i-radix-icons:reset text-14' }),
          },
        ),

        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            disabled: row.username === 'superAdmin',
            style: 'margin-left: 12px;',
            onClick: () => handleDelete(row.id),
          },
          {
            default: () => '删除',
            icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' }),
          },
        ),
      ]
    },
  },
]

async function handleEnable(row) {
  // row.enableLoading = true
  try {
    await saveUser({ id: row.id, enable: !row.enable })
    // row.enableLoading = false
    $message.success('操作成功')
    $table.value?.handleSearch()
  }
  catch (error) {
    console.error(error)
    // row.enableLoading = false
  }
}

function handleOpenRolesSet(row) {
  const roleIds = row.roles.map(item => item.id)
  handleOpen({
    action: 'setRole',
    title: '分配角色',
    row: { id: row.id, username: row.username, roleIds },
    onOk: onSave,
  })
}

function onSave() {
  if (modalAction.value === 'setRole') {
    return handleSave({
      api: () => api.update(modalForm.value),
      cb: () => $message.success('分配成功'),
    })
  }
  else if (modalAction.value === 'reset') {
    return handleSave({
      api: () => api.resetPwd(modalForm.value.id, modalForm.value),
      cb: () => $message.success('密码重置成功'),
    })
  }
  handleSave()
}
</script>
