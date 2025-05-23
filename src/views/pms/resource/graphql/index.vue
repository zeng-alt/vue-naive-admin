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
        <GraphqlTree
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
              graphql方法
            </h3>
            <div class="flex items-center">
              <NButton class="ml-12" size="small" type="primary" @click="handleAddBtn">
                <i class="i-fe:plus mr-4 text-14" />
                新增
              </NButton>
              <NButton class="ml-12" size="small" :disabled="!graphqlIds.length" type="error" @click="handleDeleteBtn(graphqlIds)">
                <i v-if="graphqlIds.length" class="i-material-symbols:delete-outline mr-4 text-14" />
                批量删除
              </NButton>
              <NButton class="ml-12" size="small" :disabled="!graphqlIds.length" type="warning" @click="handleBatchCancelAuthorization()">
                <i v-if="graphqlIds.length" class="i-material-symbols:delete-outline mr-4 text-14" />
                批量取消授权
              </NButton>
              <NButton
                size="small"
                class="ml-12"
                :disabled="!graphqlIds.length"
                type="primary"
                @click="handleBatchAuthorization()"
              >
                <i v-if="graphqlIds.length" class="i-line-md:confirm-circle mr-4 text-14" />
                批量授权
              </NButton>
            </div>
          </div>

          <GraphqlCrud
            ref="$table"
            v-model:filters="queryItems"
            :expand="true"
            :condition="true"
            :columns="btnsColumns"
            :scroll-x="-1"
            :get-data="PAGE_GRAPHQL_RESOURCE"
            @on-checked="onChecked"
          >
            <ConditionItem v-model:value="queryItems.code" size="small" label="编码" type="string" :label-width="50">
              <NInput
                size="small"
                v-model:value="queryItems.code.value"
                type="text"
                placeholder="请输入graphql编码"
                clearable
              />
            </ConditionItem>
            <ConditionItem v-model:value="queryItems.name" size="small" label="名称" type="string" :label-width="50">
              <NInput
                size="small"
                v-model:value="queryItems.name.value"
                type="text"
                placeholder="请输入graphql名称"
                clearable
              />
            </ConditionItem>
            <ConditionItem v-model:value="queryItems.functionName" size="small" label="方法名" type="string" :label-width="50">
              <NInput
                size="small"
                v-model:value="queryItems.functionName.value"
                type="text"
                placeholder="请输入graphql方法名"
                clearable
              />
            </ConditionItem>
            <MeQueryItem label="协议" size="small" :label-width="50">
              <n-select
                size="small"
                v-model:value="queryItems.operation.value"
                clearable
                :options="[
                  { label: 'Query', value: 'Query' },
                  { label: 'Mutation', value: 'Mutation' },
                  { label: 'Subscription', value: 'Subscription' }
                ]"
              />
            </MeQueryItem>
          </GraphqlCrud>
        </template>
        <n-empty v-else class="h-450 f-c-c" size="large" description="请选择菜单查看详情" />
      </div>
    </div>
    <ResAddOrEdit ref="modalRef" :menus="treeData" @refresh="initData" />
    <GraphqlRole ref="roleModalRef" @refresh="initData"/>
  </CommonPage>
</template>

<script setup>
import { PAGE_GRAPHQL_RESOURCE, saveGraphqlResource, deleteGraphqlResource } from './apollo.js'
import {  apolloClients } from '@/utils/graphql'
import { GraphqlCrud,  MeQueryItem, ConditionItem } from '@/components'
import { NButton, NTooltip } from 'naive-ui'
// import { deleteMenuResource } from  './apollo'
import GraphqlTree from './components/GraphqlTree.vue'
import ResAddOrEdit from './components/ResAddOrEdit.vue'
import GraphqlRole from './components/GraphqlRole.vue'
import { ref } from 'vue'

defineOptions({ name: 'GraphqlResourceMgt' })

const queryItems = ref({
  code: {},
  name: {},
  uri: {
    option: 'EQ',
    value: undefined
  },
  operation: {
    option: 'EQ',
    value: undefined
  },
  functionName: {}
})
const treeData = ref([])
const treeLoading = ref(false)
const $table = ref(null)
const currentMenu = ref(null)
async function initData(data) {

  if (currentMenu.value) {
    $table.value.handleSearch()
    return
  }

  treeLoading.value = true

  const res = Object.keys(apolloClients).map(n => {
    return {
      code: n,
      name: n + '服务'
    }
  })

  // const res = await api.getMenuTree()
  treeData.value = res || []
  treeLoading.value = false

  if (data)
    currentMenu.value = data
}

initData()

const modalRef = ref(null)
const roleModalRef = ref(null)

const graphqlIds = ref([])

function onChecked(rowKeys) {
  graphqlIds.value = rowKeys || []
}

const btnsColumns = [
  { type: 'selection', fixed: 'left' },
  { title: '名称', key: 'name', width: 200 },
  { title: '编码', key: 'code', width: 250 },
  { title: '方法名', key: 'functionName', width: 200 },
  { title: '协议', key: 'operation', width: 120 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'right',
    fixed: 'right',
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
                  onClick: () => handleEditBtn(row),
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
                  onClick: () => handleDeleteBtn(row.id),
                },
                {
                  icon: () => h('i', {
                    class: 'i-material-symbols:delete-outline text-14',
                  }),
                },
              ),
            default: () => '删除', // 这是提示的内容
          },
        )
      ]
    },
  },
]

watch(
  () => currentMenu.value,
  async (v) => {
    await nextTick()
    if (v)
      queryItems.value.uri.value = `/${v.code}/graphql`
      $table.value.handleSearch()
  },
)

function handleBatchCancelAuthorization() {
  roleModalRef.value?.handleOpen({
    action: 'cancelAuthorize',
    type: 'function',
    title: '批量取消授权',
    ids: graphqlIds.value,
  })
}

function handleBatchAuthorization() {
  roleModalRef.value?.handleOpen({
    action: 'authorize',
    type: 'function',
    title: '批量授权',
    ids: graphqlIds.value,
  })
}

function handleAddBtn() {
  modalRef.value?.handleOpen({
    action: 'add',
    title: '新增方法',
    code: currentMenu.value.code,
    row: { uri: `/${currentMenu.value.code}/graphql` },
    okText: '保存',
  })
}

function handleEditBtn(row) {
  modalRef.value?.handleOpen({
    action: 'edit',
    title: `编辑方法 - ${row.name}`,
    code: currentMenu.value.code,
    row: { ...row, uri: `/${currentMenu.value.code}/graphql` },
    okText: '保存',
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
        //await api.deletePermission(id)
        await deleteGraphqlResource(id)
        $message.success('删除成功')
        $table.value.handleSearch()
        d.loading = false
      }
      catch (error) {
        console.error(error)
        d.loading = false
      }
    },
  })
}

</script>
