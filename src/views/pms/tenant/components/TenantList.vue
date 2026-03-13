<template>
  <div class="flex items-center justify-between">
    <h3 class="page-title">
      <i class="i-material-symbols:list mr-8" />
      租户列表
    </h3>
    <div class="flex gap-2">
      <n-tooltip trigger="hover">
        <template #trigger>
          <NButton type="primary" quaternary @click="handleAdd()">
            <i class="i-material-symbols:add mr-4 text-14" />
          </NButton>
        </template>
        新增
      </n-tooltip>
    </div>
  </div>
  <div class="mr-20 flex">
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
      <template #empty>
        <div class="empty-state">
          <n-empty description="暂无租户数据">
            <template #icon>
              <i class="i-material-symbols:business text-4xl" />
            </template>
            <template #extra>
              <NButton type="primary" strong @click="handleAdd()">
                <template #icon>
                  <i class="i-material-symbols:add" />
                </template>
                创建第一个租户
              </NButton>
            </template>
          </n-empty>
        </div>
      </template>
    </n-tree>

    <!-- 现代化加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-content">
        <n-spin size="small" />
        <span class="loading-text">正在加载更多租户...</span>
      </div>
    </div>

    <!-- 现代化完成状态 -->
    <div v-if="noMore && treeData.length > 0" class="completion-state">
      <n-divider class="completion-divider">
        <div class="completion-content">
          <i class="i-material-symbols:check-circle text-green-500" />
          <span class="completion-text">已加载全部 {{ treeData.length }} 个租户</span>
        </div>
      </n-divider>
    </div>
  </n-infinite-scroll>
</template>

<script setup>
import { useLazyQuery } from '@vue/apollo-composable'
import { NButton, NEllipsis } from 'naive-ui'
import { h, onMounted, ref, withModifiers } from 'vue'
import { apolloClients } from '@/utils/graphql'
import { deleteTenant } from '../apollo.js'
import { FUZZY_PAGE_TENANT } from '../apollo.js'

const props = defineProps({
  currentTenant: {
    type: Object,
    default: () => null,
  },
  splitSize: {
    type: Number,
    default: 0.25,
  },
})

const emit = defineEmits(['update:currentTenant', 'add'])

function onSelect(keys, option, { action, node }) {
  emit('update:currentTenant', action === 'select' ? node : null)
}

const queryItem = {
  companyName: undefined,
  licenseNumber: undefined,
}

const pageQuery = {
  after: undefined,
  first: 10,
}

const { result, load, refetch } = useLazyQuery(
  FUZZY_PAGE_TENANT,
  { filter: queryItem, pageQuery },
  {
    clientId: 'tenant',
    fetchPolicy: 'network-only',
  },
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
    return
  }
  try {
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
        await deleteTenant(item.id)
        $message.success('删除成功', { key: 'deleteTenant' })
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
  refetch({ filter: queryItem, pageQuery })
}

function renderLabel({ option, selected }) {
  return h('div', {
    class: [
      'flex items-center gap-2',
      selected ? 'n-tree-node-content--selected' : '',
    ],
  }, [
    h(NEllipsis, { style: { width: '80px' } }, { default: () => option.companyName || '--' }),
    props.splitSize >= 0.2 && h(NEllipsis, { style: { width: '80px', marginLeft: '10px' } }, { default: () => option.licenseNumber || '--' }),
    props.splitSize >= 0.3 && h(NEllipsis, { style: { width: '100px', marginLeft: '20px' } }, { default: () => option.contactUserName || '--' }),
    props.splitSize >= 0.4 && h(NEllipsis, { style: { width: '120px', marginLeft: '20px' } }, { default: () => option.contactPhone || '--' }),
    props.splitSize >= 0.5 && h(NEllipsis, { style: { width: '150px', marginLeft: '20px' } }, { default: () => option.address || '--' }),
    props.splitSize >= 0.6 && h(NEllipsis, { style: { width: '100px', marginLeft: '20px' } }, { default: () => option.domain || '--' }),
    props.splitSize >= 0.7 && h(NEllipsis, { style: { width: '80px', marginLeft: '20px' } }, { default: () => option.accountCount || '--' }),
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
  handleSearch,
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

.loading-state {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.loading-text {
  color: #666;
  font-size: 14px;
}

.completion-state {
  padding: 16px 20px;
}

.completion-divider :deep(.n-divider__line) {
  background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
}

.completion-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.completion-text {
  font-weight: 500;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-state :deep(.n-empty) {
  margin: 0;
}

.empty-state :deep(.n-empty__icon) {
  color: #d0d0d0;
}

.empty-state :deep(.n-empty__description) {
  color: #999;
  font-size: 16px;
  margin: 16px 0;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.section-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #e6f7ff;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.dark .page-title {
  color: #fff;
  border-bottom-color: #404040;
}
</style>
