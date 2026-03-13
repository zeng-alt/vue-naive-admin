<template>
  <div class="mr-20 flex items-center justify-between">
    <h3>租户列表</h3>
  </div>
  <div class="mr-20 mt-10 flex">
    <n-input
      v-model:value="queryItem.name"
      placeholder="权限名称 模糊查询[_或%]"
      clearable
      @keydown.enter="handleSearch"
    />
    <n-select
      v-model:value="queryItem.resourceType"
      class="ml-10"
      placeholder="权限类型"
      clearable
      :options="dict.resource_type"
      @update:value="handleSearch"
    />
  </div>
  <n-infinite-scroll class="mr-20" style="height: 400px;" @load="handleLoad">
    <n-tree
      class="mr-20"
      :show-irrelevant-nodes="false"
      :data="treeData"
      key-field="id"
      label-field="name"
      :selected-keys="[currentAbac?.id]"
      :render-prefix="renderPrefix"
      :render-label="renderLabel"
      :render-suffix="renderSuffix"
      :on-update:selected-keys="onSelect"
      default-expand-all block-line selectable
    >
      <template #empty>
        <n-empty description="你什么也找不到" />
      </template>
    </n-tree>
    <div v-if="loading" class="text">
      加载中...
    </div>
    <div v-if="noMore" class="text">
      没有更多了
    </div>
  </n-infinite-scroll>
</template>

<script setup>
import { useLazyQuery } from '@vue/apollo-composable'
import { NButton, NEllipsis } from 'naive-ui'
import { h, onMounted, ref, watch, withModifiers } from 'vue'
import { useDict } from '@/composables/useDict.js'
import { apolloClients } from '@/utils/graphql'
import { FUZZY_PAGE_PERMISSION_RULE } from '../apollo.js'

defineProps({
  currentAbac: {
    type: Object,
    default: () => null,
  },
})

const emit = defineEmits(['update:currentAbac', 'add', 'selectAbac'])

const dict = useDict('resource_type')

function onSelect(keys, option, { action, node }) {
  emit('update:currentAbac', action === 'select' ? node : null)
  emit('selectAbac')
}

const queryItem = {
  name: undefined,
  resourceType: undefined,
}

const pageQuery = {
  after: undefined,
  first: 13,
}

const { result, load, refetch } = useLazyQuery(
  FUZZY_PAGE_PERMISSION_RULE,
  { filter: queryItem, pageQuery },
  {
    fetchPolicy: 'network-only',
  },
)

const treeData = ref([])
const noMore = ref(false)
const loading = ref(false)
const manualTrigger = ref(true)

watch(result, (newResult) => {
  if (!manualTrigger.value)
    return // 不是主动触发的，忽略
  if (newResult?.fuzzyPagePermissionRule?.edges) {
    const value = newResult.fuzzyPagePermissionRule.edges.map(e => e.node)
    treeData.value = [...treeData.value, ...value]
    pageQuery.after = newResult.fuzzyPagePermissionRule.pageInfo.endCursor
    noMore.value = !newResult.fuzzyPagePermissionRule?.pageInfo?.hasNextPage
  }
  manualTrigger.value = false
})

async function handleLoad() {
  if (loading.value || noMore.value) {
    return
  }
  try {
    manualTrigger.value = true
    loading.value = true
    await refetch({ filter: queryItem, pageQuery })
    loading.value = false
  }
  catch (e) {
    console.error(e)
    loading.value = false
  }
}

async function handleDelete(item) {
  $dialog.confirm({
    content: `确认删除【${item.name}】？`,
    async confirm() {
      try {
        $message.loading('正在删除', { key: 'deleteTenant' })
        // await deleteTenant(item.id)
        $message.success('删除成功', { key: 'deleteTenant' })
        emit('refresh')
        handleSearch()
        emit('update:currentTenant', null)
      }
      catch (error) {
        console.error(error)
        $message.destroy('deleteTenant')
      }
    },
  })
}

function handleAdd() {
  emit('update:currentTenant', {})
  emit('add')
}

function handleSearch() {
  manualTrigger.value = true
  treeData.value = []
  pageQuery.after = undefined
  noMore.value = false
  refetch({ filter: queryItem, pageQuery })
}

function renderLabel({ option, selected }) {
  return h('div', {
    class: [
      'flex items-center gap-2',
      selected ? 'n-tree-node-content--selected' : '',
    ],
  }, [
    h(NEllipsis, { style: { width: '150px' } }, { default: () => option.code || '--' }),
    h(NEllipsis, { style: { width: '180px', marginLeft: '20px' } }, { default: () => option.name || '--' }),
  ])
}

function renderPrefix({ option }) {
  return h('i', { class: `${option.icon}?mask text-16` })
}

function renderSuffix({ option }) {
  return [

    h(
      NButton,
      {
        text: true,
        type: 'error',
        size: 'tiny',
        style: 'margin-left: 12px;',
        onClick: withModifiers(() => handleDelete(option), ['stop']),
      },
      { default: () => '删除' },
    ),
  ]
}

onMounted(() => {
  apolloClients.main.cache.evict({ fieldName: 'fuzzyPagePermissionRule' })
  apolloClients.tenant.cache.gc()
  load()
})

defineExpose({
  handleSearch,
})
</script>

<style scoped>
.text {
  text-align: center;
}

.w-80 {
  width: 80px;
}

.w-100 {
  width: 100px;
}

.w-120 {
  width: 120px;
}

.w-150 {
  width: 150px;
}

.w-180 {
  width: 180px;
}

.w-200 {
  width: 200px;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
