<template>

  <div class="flex justify-between items-center">
    <h3>租户列表</h3>
    <div class="flex gap-2">
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button type="primary" @click="handleAdd()" quaternary>
            <i class="i-material-symbols:add mr-4 text-14" />
          </n-button>
        </template>
        新增
      </n-tooltip>
    </div>
  </div>
  <div class="flex mr-20">
    <n-input
      v-model:value="queryItem.companyName"
      placeholder="公司名称 模糊查询[_或%]"
      clearable
      @keydown.enter="handleSearch"
    />
  </div>
  <n-infinite-scroll style="height: 400px;" @load="handleLoad">
    <n-tree
      class="mr-20"
      :show-irrelevant-nodes="false"
      :data="treeData"
      key-field="id"
      label-field="companyName"
      :selected-keys="[currentTenant?.id]"
      :render-prefix="renderPrefix"
      :render-label="renderLabel"
      :render-suffix="renderSuffix"
      :on-update:selected-keys="onSelect"
      default-expand-all block-line selectable
    >
      <template slot="empty">
        <n-empty description="你什么也找不到"/>
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
import { NButton, NEllipsis } from 'naive-ui'
import { deleteTenant } from '../apollo.js'
import { ref, withModifiers, onMounted, h } from 'vue'
import { useLazyQuery } from '@vue/apollo-composable'
import { FUZZY_PAGE_TENANT } from '../apollo.js'
import { apolloClients } from '@/utils/graphql'

const props = defineProps({
  currentTenant: {
    type: Object,
    default: () => null,
  },
  splitSize: {
    type: Number,
    default: 0.25
  }
})

const emit = defineEmits(['update:currentTenant', 'add'])

function onSelect(keys, option, { action, node }) {
  emit('update:currentTenant', action === 'select' ? node : null)
}

const queryItem = {
  companyName: undefined,
  licenseNumber: undefined
}

const pageQuery  = {
  after: undefined,
  first: 10,
}

const { result, load, refetch } = useLazyQuery(
  FUZZY_PAGE_TENANT,
  { filter: queryItem, pageQuery },
  {
    clientId: 'tenant',
    fetchPolicy: 'network-only'
  }
)

const treeData = ref([])
const noMore = ref(false)
const loading = ref(false)

watch(result, (newResult) => {
  if (newResult?.fuzzyPageTenant?.edges) {
    treeData.value = newResult.fuzzyPageTenant.edges.map(e => e.node)
    pageQuery.after = newResult.fuzzyPageTenant.pageInfo.endCursor
    noMore.value = !newResult.fuzzyPageTenant?.pageInfo?.hasNextPage
  }
})

async function handleLoad() {
  if (loading.value || noMore.value) {
    return;
  }
  try {
    loading.value = true
    await refetch({filter: queryItem, pageQuery})
    loading.value = false
  } catch (e) {
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
        await deleteTenant(item.id)
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
  treeData.value = []
  pageQuery.after = undefined
  noMore.value = false
  refetch({filter: queryItem, pageQuery})
}

function renderLabel({ option, selected })  {
  return h('div', {
    class: [
      'flex items-center gap-2',
      selected ? 'n-tree-node-content--selected' : ''
    ]
  }, [
    h(NEllipsis, { style: { width: '80px' } }, { default: () => option.companyName || '--' }),
    props.splitSize >= 0.2 && h(NEllipsis, { style: { width: '80px', marginLeft: '10px' } }, { default: () => option.licenseNumber || '--' }),
    props.splitSize >= 0.3 && h(NEllipsis, { style: { width: '100px', marginLeft: '20px' } }, { default: () => option.contactUserName || '--' }),
    props.splitSize >= 0.4 && h(NEllipsis, { style: { width: '120px', marginLeft: '20px' } }, { default: () => option.contactPhone || '--' }),
    props.splitSize >= 0.5 && h(NEllipsis, { style: { width: '150px', marginLeft: '20px' } }, { default: () => option.address || '--' }),
    props.splitSize >= 0.6 && h(NEllipsis, { style: { width: '100px', marginLeft: '20px' } }, { default: () => option.domain || '--' }),
    props.splitSize >= 0.7 && h(NEllipsis, { style: { width: '80px', marginLeft: '20px' } }, { default: () => option.accountCount || '--' })
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
  apolloClients.tenant.cache.evict({ fieldName: 'fuzzyPageTenant' })
  apolloClients.tenant.cache.gc()
  load()
})


defineExpose({
  handleSearch
})

// onUnmounted(() => {
//   apolloClients.tenant.cache.evict({ fieldName: 'fuzzyPageTenant' })
//   apolloClients.tenant.cache.gc()
// })
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