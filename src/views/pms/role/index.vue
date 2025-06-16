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


    <MeModal ref="modalRef" @close="closeModal" width="600px">
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
          <n-card title="权限列表" size="large" >
            <template #header-extra>
              <n-button size="small" @click="handleSelectAll" class="mr-12">
                {{ isAllSelected ? '全不选' : '全选' }}
              </n-button>
              <n-button size="small" @click="handleExpandAll" class="mr-12">
                {{ isAllExpanded ? '折叠' : '展开' }}
              </n-button>

              <n-switch
                class="mr-12"
                v-model:value="cascade"
                size="small"
                @update-value="(value) => value && handleCheckedKeysChange(modalForm.permissionIds, permissionTree)"
              >
                <template #checked><p class="text-12">父子联动</p></template>
                <template #unchecked><p class="text-12">父子联动</p></template>
              </n-switch>

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

    <RoleGraphql ref="graphqlRoleRef" @refresh="()=> $table.handleSearch()" width="1000px"/>
  </CommonPage>

</template>

<script setup>
import { MeModal, ConditionItem, GraphqlCrud } from '@/components'
import { useCrud } from '@/composables'
import api from './api'
import {PAGE_ROLE, saveRole, deleteRole} from './apollo'
import RoleGraphql from './components/RoleGraphql.vue'
import { ref } from 'vue'
import {NSwitch, NButton} from 'naive-ui'

defineOptions({ name: 'RoleMgt' })

const router = useRouter()
const graphqlRoleRef = ref(null)

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

function handleGraphql(row) {
  graphqlRoleRef.value?.handleOpen({
    title: `分配graphql到 - ${row.name}`,
    row,
    okText: '分配',
  })
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

const permissionAllId = ref(([]))
const permissionTree = ref([])

const getAllIds = (nodes) => {
  let ids = []
  nodes.forEach(node => {
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
api.getAllPermissionTree().then(res => {
  permissionTree.value = res ?? []
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
      if (found) return found
    }
  }
  return null
}

// 获取指定节点及其所有子节点的 id
function getAllChildrenKeys(node) {
  const keys = []
  if (!node) return keys
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

    checkedKeys.forEach(id => {
      const node = findNodeById(tree, id)
      if (node) {
        getAllChildrenKeys(node).forEach(childId => allKeys.add(childId))
      }
    })

    modalForm.value.permissionIds = Array.from(allKeys)
  } else {
    modalForm.value.permissionIds = checkedKeys
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


const isAllExpanded = ref(true)
const isAllSelected = ref(false)

// 处理全选/全不选
function handleSelectAll() {
  if (isAllSelected.value) {
    modalForm.value.permissionIds = []
  } else {
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

// // 监听选中状态变化
// watch(() => modalForm.permissionIds, (newVal) => {
//   // 获取所有叶子节点的 id
//   const getAllLeafIds = (nodes) => {
//     let ids = []
//     nodes.forEach(node => {
//       if (!node.children || node.children.length === 0) {
//         ids.push(node.id)
//       } else {
//         ids = ids.concat(getAllLeafIds(node.children))
//       }
//     })
//     return ids
//   }
//   const allLeafIds = getAllLeafIds(permissionTree.value)
//   isAllSelected.value = allLeafIds.length > 0 && allLeafIds.every(id => newVal.includes(id))
// }, { deep: true })

// // 监听展开状态变化
// watch(() => expandedKeys.value, (newVal) => {
//   // 获取所有节点的 id
//   const getAllIds = (nodes) => {
//     let ids = []
//     nodes.forEach(node => {
//       ids.push(node.id)
//       if (node.children && node.children.length > 0) {
//         ids = ids.concat(getAllIds(node.children))
//       }
//     })
//     return ids
//   }
//   const allIds = getAllIds(permissionTree.value)
//   isAllExpanded.value = allIds.length > 0 && allIds.every(id => newVal.includes(id))
// }, { deep: true })

</script>
