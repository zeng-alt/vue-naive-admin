<template>
  <MeModal ref="modalRef" width="1000px">
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
      <MeQueryItem label="服务" :label-width="50">
        <n-select
          v-model:value="queryItems.uri.value"
          size="small"
          clearable
          :options="options"
        />
      </MeQueryItem>
      <MeQueryItem label="所属菜单">
        <n-tree-select
          v-model:value="queryItems.menuId.value"
          :options="treeData"
          label-field="name"
          key-field="id"
          placeholder="根菜单"
          clearable
        />
      </MeQueryItem>
      <MeQueryItem label="协议" size="small" :label-width="50">
        <n-select
          v-model:value="queryItems.operation.value"
          size="small"
          clearable
          :options="[
            { label: 'Query', value: 'Query' },
            { label: 'Mutation', value: 'Mutation' },
            { label: 'Subscription', value: 'Subscription' },
          ]"
        />
      </MeQueryItem>
      <ConditionItem v-model:value="queryItems.code" size="small" label="编码" type="string" :label-width="50">
        <NInput
          v-model:value="queryItems.code.value"
          size="small"
          type="text"
          placeholder="请输入graphql编码"
          clearable
        />
      </ConditionItem>
      <ConditionItem v-model:value="queryItems.name" size="small" label="名称" type="string" :label-width="50">
        <NInput
          v-model:value="queryItems.name.value"
          size="small"
          type="text"
          placeholder="请输入graphql名称"
          clearable
        />
      </ConditionItem>
      <ConditionItem v-model:value="queryItems.functionName" size="small" label="方法名" type="string" :label-width="50">
        <NInput
          v-model:value="queryItems.functionName.value"
          size="small"
          type="text"
          placeholder="请输入graphql方法名"
          clearable
        />
      </ConditionItem>
    </GraphqlCrud>
  </MeModal>
</template>

<script setup>
import { ref } from 'vue'
import { ConditionItem, GraphqlCrud, MeModal, MeQueryItem } from '@/components'
import { useModal } from '@/composables'
import { apolloClients } from '@/utils/graphql'
import { PAGE_GRAPHQL_RESOURCE } from '@/views/pms/resource/graphql/apollo'

defineOptions({ name: 'AssociationGraphql' })

const props = defineProps({
  treeData: {
    type: Array,
    default: [],
  },
})

const emit = defineEmits(['checked'])

const queryItems = ref({
  code: {},
  name: {},
  uri: {
    option: 'EQ',
    value: undefined,
  },
  menuId: {
    option: 'EQ',
    value: undefined,
  },
  operation: {
    option: 'EQ',
    value: undefined,
  },
  functionName: {},
})

const treeLoading = ref(false)
const $table = ref(null)
const options = ref([])
const mapData = ref(new Map())
async function initData() {
  treeLoading.value = true
  const res = Object.keys(apolloClients).map((n) => {
    return {
      value: `/${n}/graphql`,
      label: `${n}服务`,
    }
  })

  options.value = res || []
  queryItems.value.uri.value = options.value[0]?.value

  const map = new Map()

  function traverse(nodes) {
    nodes.forEach((node) => {
      map.set(node.id, node.name)
      if (node.children && node.children.length) {
        traverse(node.children)
      }
    })
  }

  traverse(props.treeData)
  mapData.value = map
  treeLoading.value = false
}

initData()

const [modalRef] = useModal()

function handleOpen(options = {}) {
  modalRef.value.open({ ...options })
}

function onChecked(rowKeys) {
  emit('checked', rowKeys || [])
}

function handleMenu(id) {
  return mapData.value.get(id)
}

const btnsColumns = [
  { type: 'selection', fixed: 'left' },
  { title: '名称', key: 'name', width: 200 },
  { title: '编码', key: 'code', width: 250 },
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
      }
      else {
        return '无父菜单'
      }
    },
  },
  { title: '方法名', key: 'functionName', width: 200 },
  { title: '协议', key: 'operation', width: 120 },
]

defineExpose({
  handleOpen,
})
</script>
