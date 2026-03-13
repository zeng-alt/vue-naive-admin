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
      :condition="true"
      :expand="true"
      :scroll-x="1200"
      :columns="columns"
      :get-data="PAGE_ROLE"
      @fetch="handleFetch"
    >
      <ConditionItem v-model:value="queryItems.name" type="string" label="角色名" :label-width="50">
        <n-input v-model:value="queryItems.name.value" type="text" placeholder="请输入角色名" clearable />
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

    <MeModal ref="modalRef" width="600px" @close="closeModal">
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

        <n-form-item path="permissionIds">
          <n-card title="权限列表" size="large">
            <template #header-extra>
              <NButton size="small" class="mr-12" @click="handleSelectAll">
                {{ isAllSelected ? '全不选' : '全选' }}
              </NButton>
              <NButton size="small" class="mr-12" @click="handleExpandAll">
                {{ isAllExpanded ? '折叠' : '展开' }}
              </NButton>

              <NSwitch
                v-model:value="cascade"
                class="mr-12"
                size="small"
                @update-value="(value) => value && handleCheckedKeysChange(modalForm.permissionIds, permissionTree)"
              >
                <template #checked>
                  <p class="text-12">
                    父子联动
                  </p>
                </template>
                <template #unchecked>
                  <p class="text-12">
                    父子联动
                  </p>
                </template>
              </NSwitch>
            </template>
            <n-tree
              key-field="id"
              label-field="name"
              :selectable="false"
              :data="permissionTree"
              :checked-keys="modalForm.permissionIds"
              :on-update:checked-keys="(keys) => (modalForm.permissionIds = keys)"
              :cascade="cascade"
              :default-expand-all="isAllExpanded"
              checkable
              check-on-click
              class="cus-scroll max-h-200 w-full"
            />
          </n-card>
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

    <RoleGraphql ref="graphqlRoleRef" width="1000px" @refresh="() => $table.handleSearch()" />
  </CommonPage>
</template>

<script setup>
import { NButton, NSwitch } from 'naive-ui'
import { nextTick, ref, watch } from 'vue'
import { ConditionItem, GraphqlCrud, MeModal } from '@/components'
import { useCrud } from '@/composables'
import api from './api'
import { PAGE_ROLE, saveRole } from './apollo'
import RoleGraphql from './components/RoleGraphql.vue'

defineOptions({ name: 'RoleMgt' })

const router = useRouter()
const graphqlRoleRef = ref(null)

const cascade = ref(false)
const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({
  name: {},
  enable: {},
})

onMounted(() => {
  $table.value?.handleSearch()
})

const { modalRef, modalFormRef, modalAction, modalForm, handleAdd, handleDelete, handleEdit }
  = useCrud({
    name: '角色',
    doCreate: api.save,
    doDelete: api.delete,
    doUpdate: api.save,
    initForm: { enable: true, permissionIds: [] },
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

const permissionAllId = ref(([]))
const permissionTree = ref([])

function getAllIds(nodes) {
  let ids = []
  nodes.forEach((node) => {
    if (node.children) {
      ids = [...ids, ...getAllIds(node.children)]
    }
    if (node.id) {
      ids.push(node.id)
    }
  })
  return ids
}

// api.getAllPermissionTree().then(( data = [] ) => (permissionTree.value = data))
api.getAllPermissionTree().then((res) => {
  // 确保所有 ID 都是字符串类型
  const convertIdsToString = (nodes) => {
    return nodes.map(node => ({
      ...node,
      id: String(node.id),
      children: node.children ? convertIdsToString(node.children) : undefined,
    }))
  }

  permissionTree.value = convertIdsToString(res ?? [])
  permissionAllId.value = getAllIds(permissionTree.value)
})

// 在整棵树中查找指定 id 的节点
function findNodeById(tree, id) {
  for (const node of tree) {
    if (node.id === id) {
      return node
    }
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found)
        return found
    }
  }
  return null
}

// 获取指定节点及其所有子节点的 id
function getAllChildrenKeys(node) {
  const keys = []
  if (!node)
    return keys
  if (node.children) {
    for (const child of node.children) {
      keys.push(child.id)
      keys.push(...getAllChildrenKeys(child))
    }
  }
  return keys
}

// 处理勾选变化
function handleCheckedKeysChange(checkedKeys, tree) {
  if (cascade.value) {
    const allKeys = new Set(checkedKeys)

    checkedKeys.forEach((id) => {
      const node = findNodeById(tree, id)
      if (node) {
        getAllChildrenKeys(node).forEach(childId => allKeys.add(childId))
      }
    })

    modalForm.value.permissionIds = [...allKeys]
  }
  else {
    modalForm.value.permissionIds = checkedKeys
  }
}

function handleFetch(data, callback) {
  const processed = handlePermission(data)
  callback(processed)
}

function handlePermission(role = []) {
  return role.map((r) => {
    return {
      ...r,
      permissionIds: r.rolePermissions?.map(r => String(r.permission.id)) || [],
    }
  })
}

const isAllExpanded = ref(true)
const isAllSelected = ref(false)

// 处理全选/全不选
function handleSelectAll() {
  if (isAllSelected.value) {
    modalForm.value.permissionIds = []
  }
  else {
    // 获取所有叶子节点的 id
    modalForm.value.permissionIds = permissionAllId.value
  }
  isAllSelected.value = !isAllSelected.value
}

// 处理展开/折叠
function handleExpandAll() {
  isAllExpanded.value = !isAllExpanded.value
}

function closeModal() {
  cascade.value = false
  isAllExpanded.value = true
  isAllSelected.value = false
}

// 监听 modalForm.permissionIds 的变化，确保树组件正确显示选中状态
watch(() => modalForm.value.permissionIds, (newVal) => {
  console.log('modalForm.permissionIds changed:', newVal)
  // 使用 nextTick 确保 DOM 更新后再检查
  nextTick(() => {
    console.log('After nextTick - modalForm.permissionIds:', modalForm.value.permissionIds)
  })
}, { deep: true })

// 监听 permissionTree 的变化，确保数据加载完成后再设置选中状态
watch(() => permissionTree.value, (newVal) => {
  if (newVal && newVal.length > 0 && modalForm.value.permissionIds && modalForm.value.permissionIds.length > 0) {
    console.log('Permission tree loaded, permissionIds:', modalForm.value.permissionIds)
    // 强制更新树组件的选中状态
    nextTick(() => {
      // 这里可以添加额外的逻辑来确保选中状态正确显示
    })
  }
}, { deep: true })
</script>
