<template>
  <div>
    <n-space vertical :size="12">
      <div class="flex justify-between items-center">
        <h3>字典</h3>
        <div class="flex gap-2">

          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button type="warning" @click="refresh()" quaternary>
                <i class="i-material-symbols:refresh mr-2" />
              </n-button>
            </template>
            重置
          </n-tooltip>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <div class="flex gap-4">
          <ConditionItem v-model:value="queryItems.dictCode" size="small" type="string" :content-width="200">
            <NInput
              size="small"
              v-model:value="queryItems.dictCode.value"
              type="text"
              placeholder="字典键"
              clearable
            />
          </ConditionItem>
          <ConditionItem v-model:value="queryItems.dictName" size="small" type="string" :content-width="200">
            <NInput
              size="small"
              v-model:value="queryItems.dictName.value"
              type="text"
              placeholder="字典名"
              clearable
            />
          </ConditionItem>
        </div>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button type="primary" quaternary @click="handleAdd()">
              <i class="i-material-symbols:add mr-4 text-14" />
            </n-button>
          </template>
          新增
        </n-tooltip>
      </div>

      <div class="table-container" @scroll="handleScroll">
        <n-list
          bordered
          hoverable
          clickable
        >
          <template #header>
            <div class="flex items-center gap-2">
              <n-tag
                size="medium"
                class="w-32"
                type="primary"
              >
                字典键
              </n-tag>
              <div class="flex-1">
                <n-tag
                  size="medium"
                  class="w-full"
                  type="primary"
                >
                  字典名
                </n-tag>
              </div>
              <div class="flex-1">
                <n-tag
                  size="medium"
                  class="w-full"
                  type="primary"
                >
                  备注
                </n-tag>
              </div>
              <div class="w-20 text-right">
                <span class="whitespace-nowrap">操作</span>
              </div>
            </div>
          </template>
          <n-list-item
            v-for="item in dataList"
            clickable
            :key="item.id"
            :class="{ 'selected-item': selectedRowId === item.id }"
          >
            <div class="flex items-center gap-2">
              <n-button
                @click="handleRowClick(item)"
                size="tiny"
                class="w-32 cursor-pointer"
              >
                {{ item.dictCode }}
              </n-button>
              <div
                class="flex-1 cursor-pointer"
                @dblclick="item.isEditingDictName = true"
              >
                <n-input
                  v-if="item.isEditingDictName"
                  size="tiny"
                  v-model:value="item.dictName"
                  type="text"
                  placeholder="字典名"
                  clearable
                  class="flex-1"
                  @blur="handleUpdate(item, 'dictName'); item.isEditingDictName = false"
                />
                <div v-else class="text">{{ item.dictName || '--' }}</div>
              </div>
              <div
                class="flex-1 cursor-pointer"
                @dblclick="item.isEditingRemark = true"
              >
                <n-input
                  v-if="item.isEditingRemark"
                  size="tiny"
                  v-model:value="item.remark"
                  type="textarea"
                  placeholder="备注"
                  clearable
                  class="flex-1"
                  @blur="handleUpdate(item, 'remark'); item.isEditingRemark = false"
                />
                <n-ellipsis style="max-width: 150px" v-else class="text" :tooltip="{ placement: 'top' }">
                  {{ item.remark || '--' }}
                </n-ellipsis>
              </div>
              <div class="w-20 text-right">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button type="primary" size="tiny" quaternary @click="handleDelete(item)">
                      <i class="i-fe:x" />
                    </n-button>
                  </template>
                  删除
                </n-tooltip>
              </div>
            </div>
          </n-list-item>
        </n-list>
      </div>

    </n-space>
  </div>
</template>

<script setup>
import { CONDITION_PAGE_DICT_TYPE, deleteDictType, saveDictType } from '../apollo'
import { ref, watch, computed, nextTick } from 'vue'
import { ConditionItem } from '@/components'
import { NButton, NSpace, NInput, NTooltip, NList, NListItem, NTag } from 'naive-ui'
import { useQuery } from '@vue/apollo-composable'
import { defaultPrimaryColor } from '@/settings'
import { useAppStore } from '@/store'

const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

const emit = defineEmits(['click', 'refresh'])

let scrollTimer = null
let lastScrollTop = 0

const queryItems = ref({
  dictCode: {
    value: '',
    option: 'EQ'
  },
  dictName: {
    value: '',
    option: 'EQ'
  }
})

const after = ref(null)
const first = ref(10)

const variables = computed(() => ({
  pageQuery: {
    after: after.value,
    first: first.value,
  },
  filter: {
    dictCode: {
      value: queryItems.value.dictCode.value,
      option: queryItems.value.dictCode.option
    },
    dictName: {
      value: queryItems.value.dictName.value,
      option: queryItems.value.dictName.option
    }
  }
}))

const { result, refetch } = useQuery(CONDITION_PAGE_DICT_TYPE, variables)

// extract edges and pageInfo using computed
const edges = computed(() => result.value?.conditionPageDictType?.edges ?? [])
const pageInfo = computed(() => result.value?.conditionPageDictType?.pageInfo ?? {})

// 使用ref存储可编辑的数据
const dataList = ref([])
const isLoading = ref(false)
const hasNextPage = ref(false)

// 监听edges变化，更新dataList
watch(edges, (newEdges) => {
  if (newEdges) {
    if (variables.value.pageQuery.after) {
      // 加载更多数据时，追加到现有数据
      dataList.value = [...dataList.value, ...newEdges.map(e => ({
        ...e.node,
        isEditingDictName: false,
        isEditingRemark: false
      }))]
    } else {
      // 首次加载或重置时，替换数据
      dataList.value = newEdges.map(e => ({
        ...e.node,
        isEditingDictName: false,
        isEditingRemark: false
      }))
    }
    hasNextPage.value = !!pageInfo.value.hasNextPage
  }
}, { immediate: true })

const detailResult = ref([])
const selectedRowId = ref(null)

const refresh = async () => {
  // 重置查询条件
  queryItems.value = {
    dictCode: {
      value: '',
      option: 'EQ'
    },
    dictName: {
      value: '',
      option: 'EQ'
    }
  }
  // 先重置 after
  after.value = null
  // 等待下一个 tick，确保 variables 更新
  await nextTick()
  emit('refresh')
  selectedRowId.value = null
  // 重置滚动位置
  lastScrollTop = 0
  refetch(variables.value)
  console.log('refresh')
}

const handleUpdate = (data, key) => {
  // TODO: 处理更新逻辑
  console.log('更新数据:', data, key)
  saveDictType({
    id: data.id,
    [key]: data[key]
  })
}

const handleAdd = () => {
  // TODO: 处理新增逻辑
}

const handleDelete = (data) => {
  // TODO: 处理删除逻辑
  console.log('删除数据:', data)
  const d = $dialog.warning({
    content: '确定删除？',
    title: '提示',
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        d.loading = true
        await deleteDictType(data.id)
        $message.success('删除成功')
        after.value = null
        refetch()
        d.loading = false
      }
      catch (error) {
        console.error(error)
        d.loading = false
      }
    },
  })
}

const handleRowClick = (row) => {
  selectedRowId.value = row.id
  emit('click', row)
}

watch(detailResult, (value) => {
  if (value?.dictDetail) {
    // 处理详细数据
    console.log('详细数据:', value.dictDetail)
  }
})

// 处理滚动事件
const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target

  // 判断是否向下滚动
  if (scrollTop <= lastScrollTop) {
    lastScrollTop = scrollTop
    return
  }

  // 更新上次滚动位置
  lastScrollTop = scrollTop

  // 当滚动到距离底部20px时触发加载
  if (scrollHeight - scrollTop - clientHeight < 20 && !isLoading.value) {
    // 清除之前的定时器
    if (scrollTimer) {
      clearTimeout(scrollTimer)
    }
    // 设置新的定时器，300ms后执行
    scrollTimer = setTimeout(() => {
      loadMore()
    }, 300)
  }
}

// 加载更多数据
const loadMore = async () => {
  if (isLoading.value) return

  if (!hasNextPage.value) {
    $message.warning('没有更多数据了')
    return
  }

  isLoading.value = true
  try {
    // 触发查询更新
    after.value = pageInfo.value.endCursor
    refetch()
  } finally {
    isLoading.value = false
  }
}

</script>

<style scoped>
.table-container {
  width: 500px;
  height: 400px;
  overflow-y: auto;
}

/* 自定义滚动条样式 */
.table-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-track {
  background: transparent;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: v-bind(defaultPrimaryColor);
}

.selected-item {
  background-color: v-bind('isDark ? "#292038" : "#F1EAFA"') !important;
}

.selected-item:hover {
  background-color: v-bind('isDark ? "#292038" : "#F1EAFA"') !important;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.w-32 {
  width: 8rem;
}

.cursor-pointer {
  cursor: pointer;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.text {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--n-text-color);
}

:deep(.n-tag) {
  transition: all 0.3s ease;
}

:deep(.n-tag:hover) {
  opacity: 0.8;
}

:deep(.n-list-item) {
  transition: all 0.3s ease;
  padding: 8px 12px;
}

:deep(.n-list-item:hover) {
  background-color: var(--n-table-color-striped);
}

:deep(.n-list) {
  border: none;
}

:deep(.n-list-item) {
  border-bottom: 1px solid var(--n-border-color);
}

:deep(.n-list-item:last-child) {
  border-bottom: none;
}

:deep(.n-input) {
  width: 100%;
}
</style>