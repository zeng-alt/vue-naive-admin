<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2024/04/01 15:52:40
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增角色
      </NButton>
    </template>

    <GraphqlCrud
      ref="$table"
      v-model:filters="queryItems"
      @fetch="handleFetch"
      :condition="true"
      :expand="true"
      :scroll-x="1200"
      :columns="columns"
      :get-data="PAGE_ROLE"
    >
      <ConditionItem v-model:value="queryItems.name" type="string" label="角色名" :label-width="50">
        <n-input v-model:value="queryItems.name.value" type="text" placeholder="请输入角色名" clearable />
      </ConditionItem>
      <ConditionItem label="状态" v-model:value="queryItems.enable" type="string" :label-width="50">
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
    <MeModal ref="modalRef" @close="closeModal" width="520px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
      >
        <n-form-item
          label="角色名"
          path="name"
          :rule="{
            required: true,
            message: '请输入角色名',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.name" />
        </n-form-item>
        <n-form-item
          label="角色编码"
          path="code"
          :rule="{
            required: true,
            message: '请输入角色编码',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.code" :disabled="modalAction !== 'add'" />
        </n-form-item>
        <n-form-item label="父子连动">
          <NSwitch v-model:value="cascade" @update-value="(value) => value && handleCheckedKeysChange(modalForm.permissionIds, permissionTree)">
            <template #checked>
              是
            </template>
            <template #unchecked>
              否
            </template>
          </NSwitch>
        </n-form-item>

        <n-form-item label="权限" path="permissionIds">
          <n-tree
            key-field="id"
            label-field="name"
            :selectable="false"
            :data="permissionTree"
            :checked-keys="modalForm.permissionIds"
            :on-update:checked-keys="(keys) => (modalForm.permissionIds = keys)"
            :cascade="cascade"
            default-expand-all checkable check-on-click
            class="cus-scroll max-h-200 w-full"
          />
        </n-form-item>
        <n-form-item label="状态" path="enable">
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
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { MeCrud, MeModal, MeQueryItem, ConditionItem, GraphqlCrud } from '@/components'
import { useCrud } from '@/composables'
import { NButton, NSwitch } from 'naive-ui'
import api from './api'
import {PAGE_ROLE, saveRole, deleteRole} from './apollo'

defineOptions({ name: 'RoleMgt' })

const router = useRouter()

const cascade = ref(false)
const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({
  name: {},
  enable: {}
})

onMounted(() => {
  $table.value?.handleSearch()
})

const { modalRef, modalFormRef, modalAction, modalForm, handleAdd, handleDelete, handleEdit }
  = useCrud({
    name: '角色',
    doCreate: api.save,
    doDelete: deleteRole,
    doUpdate: api.save,
    initForm: { enable: true },
    refresh: (_, keepCurrentPage) => $table.value?.handleSearch(keepCurrentPage),
  })

const columns = [
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
  {
    title: '操作',
    key: 'actions',
    width: 320,
    align: 'right',
    fixed: 'right',
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () =>
              router.push({ path: `/pms/role/user/${row.id}`, query: { roleName: row.name } }),
          },
          {
            default: () => '分配用户',
            icon: () => h('i', { class: 'i-fe:user-plus text-14' }),
          },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            style: 'margin-left: 12px;',
            disabled: row.code === 'SUPER_ADMIN',
            onClick: () => handleEdit(row),
          },
          {
            default: () => '编辑',
            icon: () => h('i', { class: 'i-material-symbols:edit-outline text-14' }),
          },
        ),

        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            disabled: row.code === 'SUPER_ADMIN',
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

function closeModal() {
  cascade.value = false
}

const permissionTree = ref([])
// api.getAllPermissionTree().then(( data = [] ) => (permissionTree.value = data))
api.getAllPermissionTree().then(res => permissionTree.value = res ?? [])

// 获取所有子节点的key
function getAllChildrenKeys(node) {
  const keys = []
  if (node.children) {
    node.children.forEach(child => {
      keys.push(child.id)
      keys.push(...getAllChildrenKeys(child))
    })
  }
  return keys
}

// 处理选中节点变化
function handleCheckedKeysChange(keys, nodes) {
  if (cascade.value) {
    // 如果是级联模式，需要收集所有子节点的key
    const allKeys = new Set(keys)
    nodes.forEach(node => {
        getAllChildrenKeys(node).forEach(key => allKeys.add(key))
    })
    modalForm.value.permissionIds = Array.from(allKeys)
  } else {
    modalForm.value.permissionIds = keys
  }
}

function handleFetch(data, callback) {
  const processed = handlePermission(data)
  callback(processed)
}

function handlePermission(role = []) {
  return role.map(r => {
    return {
      ...r,
      permissionIds: r.rolePermissions?.map(r => r.permission.id) || []
    }
  })
}

</script>
