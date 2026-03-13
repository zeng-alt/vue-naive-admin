<template>
  <CommonPage>
    <div class="flex">
      <n-spin size="small" :show="treeLoading">
        <DictList
          @click="handleClick"
          @refresh="refresh"
        />
      </n-spin>
      <div class="ml-40 w-0 flex-1">
        <template v-if="dictTypeId">
          <div class="flex justify-between">
            <h3 class="mb-12">
              字典数据
            </h3>
            <div class="flex gap-16">
              <NButton size="small" type="primary" @click="handleAdd()">
                <i class="i-material-symbols:add mr-4 text-14" />
                新增
              </NButton>
              <NButton size="small" type="primary" @click="$table.handleExport()">
                <i class="i-material-symbols:file-download mr-4 text-14" />
                导出
              </NButton>
            </div>
          </div>
          <GraphqlCrud
            ref="$table"
            v-model:filters="queryItems"
            :expand="false"
            :condition="false"
            :scroll-x="120"
            :columns="columns"
            size="small"
            :page-size="10"
            :get-data="FUZZY_PAGE_DICT_DATA"
            @update:filters="handleFiltersChange"
          >
            <MeQueryItem size="small" label="字典标签" type="string" :label-width="70" :content-width="150">
              <n-input
                v-model:value="queryItems.dictLabel"
                size="small"
                type="text"
                placeholder="请输入字典标签"
                clearable
              />
            </MeQueryItem>
            <MeQueryItem size="small" label="字典值" type="string" :label-width="50" :content-width="150">
              <n-input
                v-model:value="queryItems.dictValue"
                size="small"
                type="text"
                placeholder="字典值"
                clearable
              />
            </MeQueryItem>
          </GraphqlCrud>
        </template>
        <n-empty v-else class="h-450 f-c-c" size="large" description="请选择字典查看详情" />
      </div>
    </div>
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
          label="字典标签"
          path="dictLabel"
          :rule="{
            required: true,
            message: '请输入字典标签',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.dictLabel" :disabled="modalAction === 'view'" />
        </n-form-item>
        <n-form-item
          label="字典键值"
          path="dictValue"
          :rule="{
            required: true,
            message: '请输入字典键值',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.dictValue" :disabled="modalAction !== 'add'" />
        </n-form-item>

        <n-form-item
          label="样式属性"
          path="cssClass"
          :rule="{
            message: '请输入样式属性',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.cssClass" />
        </n-form-item>

        <n-form-item
          label="字典排序"
          path="dictSort"
        >
          <n-input-number v-model:value="modalForm.dictSort" :min="0" />
        </n-form-item>
        <n-grid :cols="24" :x-gap="24">
          <n-form-item-gi
            :span="12"
            label="回显样式"
            path="listClass"
            :rule="{
              message: '请输入回显样式',
              trigger: ['input', 'blur'],
            }"
          >
            <n-select v-model:value="modalForm.listClass" :options="options" />
          </n-form-item-gi>
          <n-form-item-gi :span="12">
            <n-tag :show="modalForm.dictLabel" :type="modalForm.listClass" :bordered="false">
              {{ modalForm.dictLabel }}
            </n-tag>
          </n-form-item-gi>
        </n-grid>

        <n-grid :cols="24" :x-gap="24">
          <n-form-item-gi :span="12" label="系统默认:" path="isDefault">
            <NSwitch v-model:value="modalForm.isDefault">
              <template #checked>
                是
              </template>
              <template #unchecked>
                否
              </template>
            </NSwitch>
          </n-form-item-gi>

          <n-form-item-gi :span="12" label="状态:" path="status">
            <NSwitch
              v-model:value="modalForm.status"
            >
              <template #checked>
                启用
              </template>
              <template #unchecked>
                停用
              </template>
            </NSwitch>
          </n-form-item-gi>
        </n-grid>

        <n-form-item
          label="备注"
          :rule="{
            message: '请输入备注',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.remark" type="textarea" />
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NSwitch, NTooltip } from 'naive-ui'
import { ref, watch } from 'vue'
import { GraphqlCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'
import { deleteDictData, FUZZY_PAGE_DICT_DATA, saveDictData } from './apollo'
import DictList from './components/DictList.vue'

defineOptions({ name: 'DictMgt' })

const $table = ref(null)
const treeLoading = ref(false)
const dictTypeId = ref(undefined)

const queryItems = ref({
  dictType: {},
})

const options = [
  {
    label: '默认',
    value: 'default',
  },
  {
    label: '次要',
    value: 'tertiary',
  },
  {
    label: '主要',
    value: 'primary',
  },
  {
    label: '信息',
    value: 'info',
  },
  {
    label: '成功',
    value: 'success',
  },
  {
    label: '警告',
    value: 'warning',
  },
  {
    label: '错误',
    value: 'error',
  },
]

const initForm = {
  dictType: {
    id: dictTypeId.value,
  },
  listClass: 'tertiary',
  isDefault: false,
  status: true,
  dictSort: 0,
}

watch(() => dictTypeId.value, () => {
  initForm.dictType.id = dictTypeId.value
})

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleEdit,
  handleView,
} = useCrud({
  name: '字典数据',
  initForm,
  doCreate: saveDictData,
  doDelete: deleteDictData,
  doUpdate: saveDictData,
  refresh: () => $table.value?.handleSearch(),
})

const columns = [
  {
    title: '字典标签',
    key: 'dictLabel',
    ellipsis: { tooltip: true },
  },
  {
    title: '字典值',
    key: 'dictValue',
    ellipsis: { tooltip: true },
  },
  {
    title: '字典排序',
    key: 'dictSort',
    ellipsis: { tooltip: true },
  },
  {
    title: '状态',
    key: 'status',
    render: row =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.status,
          onUpdateValue: () => handleEnable(row),
        },
        {
          checked: () => '启用',
          unchecked: () => '停用',
        },
      ),
  },
  {
    title: '备注',
    key: 'remark',
    ellipsis: { tooltip: true },
  },
  {
    title: '操作',
    key: 'actions',
    align: 'right',
    fixed: 'right',
    width: 120,
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
                  onClick: () => handleView(row, '查字典数据'),
                },
                {
                  icon: () => h('i', {
                    class: 'i-fe:eye text-14',
                  }),
                },
              ),
            default: () => '查看', // 这是提示的内容
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

function handleExport() {
  $table.value?.handleExport()
}

async function handleEnable(row) {
  try {
    await saveDictData({ id: row.id, status: !row.status })
    $message.success('操作成功')
    $table.value?.handleSearch()
  }
  catch (error) {
    console.error(error)
  }
}

function handleClick(data) {
  queryItems.value.dictType = { id: data.id }
  dictTypeId.value = data.id
  console.log(data)
}

function handleFiltersChange(data) {
  data.dictType = { id: dictTypeId.value }
}

function refresh() {
  queryItems.value.dictType = {}
}
</script>
