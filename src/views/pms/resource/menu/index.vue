<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:28:53
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <div class="flex">
      <n-spin size="small" :show="treeLoading">
        <MenuTree
          v-model:current-menu="currentMenu"
          class="w-320 shrink-0"
          :tree-data="treeData"
          @refresh="initData"
        />
      </n-spin>

      <div class="ml-40 w-0 flex-1">
        <template v-if="currentMenu">
          <div class="flex justify-between">
            <h3 class="mb-12">
              {{ currentMenu.name }}
            </h3>
            <NButton size="small" type="primary" @click="handleEdit(currentMenu)">
              <i class="i-material-symbols:edit-outline mr-4 text-14" />
              编辑
            </NButton>
          </div>
          <n-descriptions label-placement="left" bordered :column="2">
            <n-descriptions-item label="编码">
              {{ currentMenu.code }}
            </n-descriptions-item>
            <n-descriptions-item label="名称">
              {{ currentMenu.name }}
            </n-descriptions-item>
            <n-descriptions-item label="路由地址">
              {{ currentMenu.path ?? '--' }}
            </n-descriptions-item>
            <n-descriptions-item label="组件路径">
              {{ currentMenu.component ?? '--' }}
            </n-descriptions-item>
            <n-descriptions-item label="菜单图标">
              <span v-if="currentMenu.icon" class="flex items-center">
                <i :class="`${currentMenu.icon}?mask text-22 mr-8`" />
                <span class="opacity-50">{{ currentMenu.icon }}</span>
              </span>
              <span v-else>无</span>
            </n-descriptions-item>
            <n-descriptions-item label="layout">
              {{ currentMenu.layout || '跟随系统' }}
            </n-descriptions-item>
            <n-descriptions-item label="是否显示">
              {{ currentMenu.show ? '是' : '否' }}
            </n-descriptions-item>
            <n-descriptions-item label="是否启用">
              {{ currentMenu.enable ? '是' : '否' }}
            </n-descriptions-item>
            <n-descriptions-item label="KeepAlive">
              {{ currentMenu.keepAlive ? '是' : '否' }}
            </n-descriptions-item>
            <n-descriptions-item label="排序">
              {{ currentMenu.order ?? '--' }}
            </n-descriptions-item>
            <n-descriptions-item label="菜单风格">
              {{ currentMenu.menuStyle ?? '默认' }}
            </n-descriptions-item>
          </n-descriptions>

          <div class="mt-32 flex justify-between">
            <div class="flex flex-1 items-center gap-4">
              <n-tabs v-model:value="currentType" type="line" size="small">
                <n-tab-pane name="http" tab="HTTP">
                  <GraphqlCrud
                    ref="$table"
                    :filters="{ menuId: { option: 'EQ', value: currentMenu.id } }"
                    :columns="btnsColumns"
                    :condition="true"
                    :scroll-x="-1"
                    :get-data="CONDITION_PAGE_HTTP_RESOURCE"
                  />
                </n-tab-pane>
                <n-tab-pane name="graphql" tab="GraphQL">
                  <GraphqlCrud
                    ref="$graphqlTable"
                    :filters="{ menuId: { option: 'EQ', value: currentMenu.id } }"
                    :columns="btnsColumns"
                    :condition="true"
                    :scroll-x="-1"
                    :get-data="CONDITION_PAGE_GRAPHQL_RESOURCE"
                  />
                </n-tab-pane>
                <template #suffix>
                  <NButton size="small" type="primary" class="ml-12" @click="handleAddBtn">
                    <i class="i-fe:plus mr-4 text-14" />
                    新增
                  </NButton>
                  <NButton size="small" type="success" class="ml-12" @click="handleIntroduce">
                    <i class="i-material-symbols:electricalServices mr-4 text-14" />
                    关联
                  </NButton>
                </template>
              </n-tabs>
            </div>
          </div>
        </template>
        <n-empty v-else class="h-450 f-c-c" size="large" description="请选择菜单查看详情" />
      </div>
    </div>
    <ResAddOrEdit ref="modalRef" :menus="treeData" @refresh="initData" />
    <GraphqlAddOrEdit ref="graphqlModalRef" :menus="treeData" @refresh="initData" />
    <MeModal ref="httpModalRef" width="1000px">
      <HttpResource :show-header="false" @checked="onChecked" />
    </MeModal>
    <AssociationGraphql ref="associationGraphqlRef" :tree-data="treeData" @checked="onChecked" />
  </CommonPage>
</template>

<script setup>
import { NButton, NSwitch } from 'naive-ui'
import { GraphqlCrud, MeModal } from '@/components'
import { useModal } from '@/composables'
import HttpResource from '@/views/pms/resource/http/index.vue'
import api from './api'
import { CONDITION_PAGE_GRAPHQL_RESOURCE, CONDITION_PAGE_HTTP_RESOURCE, deletePermission, handleGraphqlDisconnect, handleHttpDisconnect, saveAllGraphqlResource, saveAllHttpResource } from './apollo'
import AssociationGraphql from './components/AssociationGraphql.vue'
import GraphqlAddOrEdit from './components/GraphqlAddOrEdit.vue'
import MenuTree from './components/MenuTree.vue'
import ResAddOrEdit from './components/ResAddOrEdit.vue'

defineOptions({ name: 'MenuResourceMgt' })

const [httpModalRef, okLoading] = useModal()

const treeData = ref([])
const treeLoading = ref(false)
const $table = ref(null)
const currentMenu = ref(null)
const currentType = ref('http')
const $graphqlTable = ref(null)

async function initData(type, data) {
  if (type === 'http' && data?.method) {
    $table.value.handleSearch()
    return
  }
  if (type === 'graphql') {
    $graphqlTable.value.handleSearch()
    return
  }
  treeLoading.value = true
  const res = await api.getMenuTree()
  treeData.value = res || []
  treeLoading.value = false

  if (data)
    currentMenu.value = data
}
initData()

const modalRef = ref(null)
function handleEdit(item = {}) {
  modalRef.value?.handleOpen({
    action: 'edit',
    type: 'MENU',
    title: `编辑菜单 - ${item.name}`,
    row: item,
    okText: '保存',
  })
}

const btnsColumns = [
  { title: '名称', key: 'name' },
  { title: '编码', key: 'code' },
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
            style: 'margin-left: 12px;',
            onClick: () => handleEditBtn(row),
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
            type: 'warning',
            style: 'margin-left: 12px;',
            onClick: () => handleDisconnect(row),
          },
          {
            default: () => '断联',
            icon: () => h('i', { class: 'i-material-symbols:powerOff text-14' }),
          },
        ),

        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            onClick: () => handleDeleteBtn(row.id),
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

watch(
  () => currentType.value,
  async () => {
    await nextTick()
    if (currentType.value === 'http') {
      $table.value?.handleSearch()
    }
    else {
      $graphqlTable.value?.handleSearch()
    }
  },
)

const associationGraphqlRef = ref(null)
const graphqlModalRef = ref(null)

function handleAddBtn() {
  if (currentType.value === 'http') {
    modalRef.value?.handleOpen({
      action: 'add',
      type: 'BUTTON',
      title: '新增按钮',
      row: { type: 'BUTTON', menuId: currentMenu.value.id },
      okText: '保存',
    })
  }
  else {
    graphqlModalRef.value?.handleOpen({
      action: 'add',
      type: 'BUTTON',
      title: '新增按钮',
      row: { menuId: currentMenu.value.id },
      okText: '保存',
    })
  }
}

function handleEditBtn(row) {
  if (currentType.value === 'http') {
    modalRef.value?.handleOpen({
      action: 'edit',
      type: 'BUTTON',
      title: `编辑按钮 - ${row.name}`,
      row,
      okText: '保存',
    })
  }
  else {
    graphqlModalRef.value?.handleOpen({
      action: 'edit',
      type: 'BUTTON',
      title: `编辑按钮 - ${row.name}`,
      row,
      okText: '保存',
    })
  }
}

function handleDisconnect(row) {
  const d = $dialog.warning({
    content: '确定断开菜单关联？',
    title: '提示',
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        d.loading = true
        if (currentType.value === 'http') {
          await handleHttpDisconnect({ ...row, menuId: null })
          $table.value.handleSearch()
        }
        else {
          await handleGraphqlDisconnect({ ...row, menuId: null })
          $graphqlTable.value.handleSearch()
        }
        $message.success('断联成功')
      }
      catch (error) {
        console.error(error)
        d.loading = false
      }
    },
  })
}

function handleDeleteBtn(id) {
  const d = $dialog.warning({
    content: '确定删除？',
    title: '提示',
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        d.loading = true
        // await api.deletePermission(id)
        await deletePermission(id)
        $message.success('删除成功')
        if (currentType.value === 'http') {
          $table.value.handleSearch()
        }
        else {
          $graphqlTable.value.handleSearch()
        }
      }
      catch (error) {
        console.error(error)
        d.loading = false
      }
    },
  })
}

async function handleEnable(item) {
  try {
    item.enableLoading = true
    await api.savePermission(item.id, {
      enable: !item.enable,
    })
    $message.success('操作成功')
    $table.value?.handleSearch()
    item.enableLoading = false
  }
  catch (error) {
    console.error(error)
    item.enableLoading = false
  }
}

async function handleIntroduce() {
  if (currentType.value === 'http') {
    httpModalRef.value.open({
      title: '关联HTTP资源',
      action: 'introduce',
      onOk: handleAssociationBtn,
    })
  }
  else {
    associationGraphqlRef.value.handleOpen({
      title: '关联Graphql资源',
      action: 'introduce',
      onOk: handleAssociationBtn,
    })
  }
}

const permissionIds = ref([])

function onChecked(ids) {
  permissionIds.value = ids
}

async function handleAssociationBtn() {
  const data = permissionIds.value.map(num => ({
    id: num,
    menuId: currentMenu.value.id,
  })) || []
  if (currentType.value === 'http') {
    await saveAllHttpResource(data)
    $table.value.handleSearch()
  }
  else {
    await saveAllGraphqlResource(data)
    $graphqlTable.value.handleSearch()
  }
  permissionIds.value = []
  $message.success('关联成功')
}
</script>
