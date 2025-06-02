<template>
  <CommonPage :show-header="showHeader">
    <template #action v-show="showHeader">
      <NButton v-permission="'AddUser'" type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        创建HTTP资源
      </NButton>
    </template>

    <GraphqlCrud
      ref="$table"
      v-model:filters="queryItems"
      :condition="true"
      :scroll-x="1200"
      :columns="columns"
      :expand="true"
      @on-checked="onChecked"
      :get-data="CONDITION_PAGE_HTTP_RESOURCE"
    >
      <MeQueryItem label="所属菜单" >
        <n-tree-select
          v-model:value="queryItems.menuId.value"
          :options="treeData"
          label-field="name"
          key-field="id"
          placeholder="根菜单"
          clearable
        />
      </MeQueryItem>

      <MeQueryItem label="协议" :label-width="50">
        <n-select
          v-model:value="queryItems.method.value"
          clearable
          :options="option"
        />
      </MeQueryItem>
      <ConditionItem v-model:value="queryItems.name" label="名称" type="string" :label-width="50">
        <NInput
          v-model:value="queryItems.name.value"
          type="text"
          placeholder="请输入名称"
          clearable
        >
          <template #password-invisible-icon></template>
        </NInput>
      </ConditionItem>
      <ConditionItem v-model:value="queryItems.code" label="编码" type="string" :label-width="50">
        <NInput
          v-model:value="queryItems.code.value"
          type="text"
          placeholder="请输入编码"
          clearable
        />
      </ConditionItem>
    </GraphqlCrud>


    <MeModal ref="modalRef" width="800px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        require-mark-placement="left"
        :label-width="100"
        :model="modalForm"
      >
        <n-grid :cols="24" :x-gap="24">
          <n-form-item-gi :span="12" label="所属菜单" path="menuId">
            <n-tree-select
              v-model:value="modalForm.menuId"
              :options="treeData"
              label-field="name"
              key-field="id"
              placeholder="根菜单"
              clearable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="12" path="name" :rule="required">
            <template #label>
              <QuestionLabel label="名称" content="标题" />
            </template>
            <n-input v-model:value="modalForm.name" />
          </n-form-item-gi>
          <n-form-item-gi :span="12" path="code" :rule="required">
            <template #label>
              <QuestionLabel label="编码" content="如果是菜单则对应前端路由的name，使用大驼峰" />
            </template>
            <n-input v-model:value="modalForm.code" :disabled="modalAction === 'edit'"/>
          </n-form-item-gi>
          <n-form-item-gi :span="12" path="enable">
            <template #label>
              <QuestionLabel
                label="状态"
                content="如果是菜单，禁用后将不添加到路由表，无法进入此页面"
              />
            </template>
            <n-switch v-model:value="modalForm.enable">
              <template #checked>
                启用
              </template>
              <template #unchecked>
                禁用
              </template>
            </n-switch>
          </n-form-item-gi>

          <n-form-item-gi :span="12" path="method" :rule="required">
            <template #label>
              <QuestionLabel label="协议" content="如果是菜单则对应前端路由的name，使用大驼峰" />
            </template>
            <n-select
              size="small"
              v-model:value="modalForm.method"
              clearable
              :options="option"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="24" path="path">
            <template #label>
              <QuestionLabel
                label="接口路径"
                content="前端组件的路径，以 / 开头，父级菜单可不填"
              />
            </template>
            <n-input v-model:value="modalForm.path" >
              <template #separator></template>
            </n-input>
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { GraphqlCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'
import { NButton, NFormItem, NInput, NTooltip, NSwitch, NTag } from 'naive-ui'
import { ref } from 'vue'
import { CONDITION_PAGE_HTTP_RESOURCE, saveHttpResource, deletePermission } from './apollo'
import api from '@/views/pms/resource/menu/api'
import QuestionLabel from '@/views/pms/resource/menu/components/QuestionLabel.vue'

const emit = defineEmits(['checked'])

const props = defineProps({
  showHeader: {
    type: Boolean,
    default: true
  }
})

function onChecked(rowKeys) {
  emit('checked', rowKeys || [])
}

defineOptions({ name: 'HttpResourceMgt' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({
  menuId: {
    option: 'EQ',
    value: null
  },
  name: {},
  code: {},
  method: {
    option: 'EQ',
    value: null
  }
})

const option = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'HEAD', value: 'HEAD' },
  { label: 'OPTIONS', value: 'OPTIONS' },
  { label: 'TRACE', value: 'TRACE' }
]

const required = {
  required: true,
  message: '此为必填项',
  trigger: ['blur', 'change'],
}

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
  initForm: {enable: true},
  doCreate: saveHttpResource,
  doDelete: deletePermission,
  doUpdate: saveHttpResource,
  refresh: () => $table.value?.handleSearch(),
})

const mapData = ref(new Map())
const treeData = ref([])
async function initData() {
  const res = await api.getMenuTree()

  treeData.value = res || []
  const map = new Map()

  function traverse(nodes) {
    nodes.forEach(node => {
      map.set(node.id, node.name)
      if (node.children && node.children.length) {
        traverse(node.children)
      }
    })
  }

  traverse(res)
  mapData.value = map
}

initData()

function handleMenu(id) {
  return mapData.value.get(id)
}


async function handleEnable(item) {
  try {
    await saveHttpResource({id: item.id, enable: !item.enable})
    $message.success('操作成功')
    $table.value?.handleSearch()
  }
  catch (error) {
    console.error(error)
  }
}

const columns = [
  { type: 'selection', fixed: 'left' },
  {
    title: '编码',
    key: 'code',
    width: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: '名称',
    key: 'name',
    width: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: '父菜单',
    key: 'menuId',
    width: 150,
    ellipsis: { tooltip: true },
    render: (row) => {
      const menuName = handleMenu(row.menuId)
      if (menuName) {
        return h(
          NTag,
          { type: 'success' },
          {
            default: () => menuName,
          },
        )
      } else  {
        return '无父菜单'
      }
    }
  },
  {
    title: '协议',
    key: 'method',
    width: 100,
    ellipsis: { tooltip: true },
    render: (row) => {
      return h(
          NTag,
          { type: 'success' },
          { default: () => row.method },
        )
    },
  },
  {
    title: '状态',
    key: 'enable',
    width: 100,
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
    title: '路径',
    key: 'path',
    ellipsis: { tooltip: true },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
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
        )
      ]
    },
  },
]

onMounted(() => {
  $table.value?.handleSearch()
})
</script>
