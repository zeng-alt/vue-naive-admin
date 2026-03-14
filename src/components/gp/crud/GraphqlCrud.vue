<template>
  <div class="h-full flex flex-col overflow-hidden">
    <AppCard v-if="$slots.default" bordered bg="#fafafc dark:black" class="mb-30 min-h-60 rounded-4">
      <form class="flex justify-between p-16" @submit.prevent="handleSearch()">
        <NScrollbar x-scrollable>
          <NSpace :wrap="!expand || isExpanded" :size="[32, 16]" class="p-10">
            <slot :size="size" />
          </NSpace>
        </NScrollbar>
        <div class="flex-shrink-0 p-10">
          <NButton ghost type="primary" :size="size" @click="handleReset">
            <i class="i-fe:rotate-ccw mr-4" />
            重置
          </NButton>
          <NButton class="ml-20" type="primary" attr-type="submit" :size="size" @click="handleSearch(true)">
            <i class="i-fe:search mr-4" />
            搜索
          </NButton>

          <template v-if="expand">
            <NButton v-if="!isExpanded" type="primary" :size="size" text @click="toggleExpand">
              <i class="i-fe:chevrons-down ml-4" />
              展开
            </NButton>
            <NButton v-else text type="primary" :size="size" @click="toggleExpand">
              <i class="i-fe:chevrons-up ml-4" />
              收起
            </NButton>
          </template>
        </div>
      </form>
    </AppCard>

    <!-- <NDataTable
      :row-key="(row) => row[rowKey]"
      :checked-row-keys="internalCheckedKeys"
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :scroll-x="scrollX"
      :remote="true"
      :size="size"
      :pagination="pagination"
      @update:checked-row-keys="onChecked"
    /> -->

    <ProDataTable
      :row-key="(row) => row[rowKey]"
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :scroll-x="scrollX"
      :remote="remote"
      :size="size"
      :pagination="isPagination ? pagination : false"
      flex-height
      class="flex-1"
      :drag-sort-options="dragSortOptions"
      @update:checked-row-keys="onChecked"
      @update:page="onPageChange"
    />
  </div>
</template>

<script setup>
import { useQuery } from '@vue/apollo-composable'
import { ProDataTable } from 'pro-naive-ui'
import { computed, getCurrentInstance, ref, watch } from 'vue'
import { utils, writeFile } from 'xlsx'

// props
const props = defineProps({
  condition: { type: Boolean, default: false },
  /**
   * @remote true: 后端分页  false： 前端分页
   */
  remote: {
    type: Boolean,
    default: true,
  },
  /**
   * @isPagination 是否分页
   */
  isPagination: {
    type: Boolean,
    default: true,
  },
  scrollX: { type: Number, default: 1200 },
  rowKey: { type: String, default: 'id' },
  columns: { type: Array, required: true },
  expand: Boolean,
  filters: { type: Object, default: () => ({}) },
  /** @type {import('graphql').DocumentNode} */
  getData: { type: Object, required: true },
  pageSize: { type: Number, default: 10 },
  size: {
    type: String,
    default: 'medium',
    validator: value => ['tiny', 'small', 'medium', 'large'].includes(value),
  },
  /** 默认选中的行 */
  checkedKeys: {
    type: Array,
    default: () => [],
  },
  /**
   * 拖拽排序配置
   * @columnPath 拖拽列的路径，传入则启用拖拽
   * @handle 是否依赖手柄拖拽，false则整行可拖拽
   * @onEnd 拖拽结束回调
   */
  dragSortOptions: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:filters', 'onChecked', 'onDataChange', 'fetch'])

const { vnode } = getCurrentInstance()

const queryFunction = props.getData.definitions[0].selectionSet.selections[0].name.alias || props.getData.definitions[0].selectionSet.selections[0].name.value
// cursor-based pagination state
const after = ref(null)
const pageNumber = ref(1)
const cursorHistory = ref([])
// 添加 currentPageSize ref
const currentPageSize = ref(props.pageSize)

// reactive variables for query
const variables = computed(() => ({
  pageQuery: {
    after: after.value,
    first: currentPageSize.value,
  },
  filter: props.filters,
}))

// execute query
const { result, loading, refetch } = useQuery(props.getData, variables)

// extract edges and pageInfo using computed
const edges = computed(() => result.value?.[queryFunction]?.edges ?? [])
const pageInfo = computed(() => result.value?.[queryFunction]?.pageInfo ?? {})

const tableData = ref([])

watch(edges, () => {
  const raw = edges.value.map(e => e.node)

  // 判断是否监听了 fetch 事件
  const listeners = vnode.props || {}
  const hasFetchListener = 'onFetch' in listeners

  if (hasFetchListener) {
    // 如果监听了 fetch，则发出并等待回调（你设计为第三个参数）
    emit('fetch', raw, (processedData) => {
      tableData.value = processedData
    })
  }
  else {
    // 否则，自己处理 fallback 逻辑
    tableData.value = raw
  }
}, { immediate: true })

function onPageChange(currentPage) {
  pagination.page = currentPage
  if (props.remote) {
    handleQuery()
  }
}
function onChecked(rowKeys) {
  if (props.columns.some(item => item.type === 'selection')) {
    emit('onChecked', rowKeys)
  }
}

// 拖拽排序配置
const dragSortOptions = computed(() => {
  if (!props.dragSortOptions) return undefined

  return {
    ...props.dragSortOptions,
    onEnd: (event) => {
      const { newIndex, oldIndex } = event
      if (newIndex === oldIndex) return

      // 使用 map 创建新数组，确保元素可变
      const list = tableData.value.map(item => ({ ...item }))

      // 移动元素
      const [movedItem] = list.splice(oldIndex, 1)
      list.splice(newIndex, 0, movedItem)

      // 重新计算受影响的 sort
      const sortList = []
      // 确定受影响的范围
      const start = Math.min(oldIndex, newIndex)
      const end = Math.max(oldIndex, newIndex)

      // 检测排序方向
      let isAsc = true
      if (tableData.value.length > 1) {
        const firstSort = tableData.value[0].sort
        const lastSort = tableData.value[tableData.value.length - 1].sort
        if (typeof firstSort === 'number' && typeof lastSort === 'number' && firstSort > lastSort) {
          isAsc = false
        }
      }

      // 收集受影响范围内的所有 sort 值
      const sortValues = []
      for (let i = start; i <= end; i++) {
        sortValues.push(list[i].sort)
      }
      // 根据方向重新排序这些值
      sortValues.sort((a, b) => isAsc ? a - b : b - a)

      for (let i = start; i <= end; i++) {
        const item = list[i]
        const newSort = sortValues[i - start]

        if (item.sort !== newSort) {
          item.sort = newSort
          sortList.push({ id: item.id, sort: newSort })
        }
      }

      tableData.value = list
      emit('onDataChange', list)

      if (sortList.length > 0) {
        props.dragSortOptions.onEnd?.(sortList)
      }
    },
  }
})

// 是否展开
const isExpanded = ref(false)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

// pagination actions
function goNext() {
  if (pageInfo.value.endCursor) {
    cursorHistory.value.push(after.value)
    after.value = pageInfo.value.endCursor
    pageNumber.value++
    refetch(variables.value)
  }
}

function goPrev(page) {
  if (pageNumber.value > 1) {
    pageNumber.value--
    if (pageNumber.value === 1) {
      after.value = null
      cursorHistory.value = []
    }
    else if (pageNumber.value > page) {
      pageNumber.value = page
      after.value = cursorHistory.value[page - 1]
    }
    else {
      after.value = cursorHistory.value.pop()
    }
    refetch(variables.value)
  }
}

// search resets to first page
function handleSearch() {
  after.value = null
  pageNumber.value = 1
  cursorHistory.value = []
  refetch()
}

// emit data change
watch(tableData, val => emit('onDataChange', val))

// export Excel unchanged
function handleExport(columns = props.columns, data = tableData.value) {
  if (!data?.length)
    return $message.warning('没有数据')
  const columnsData = columns.filter(item => !!item.title && !item.hideInExcel)
  const thKeys = columnsData.map(item => item.key)
  const thData = columnsData.map(item => item.title)
  const trData = data.map(item => thKeys.map(key => item[key]))
  const sheet = utils.aoa_to_sheet([thData, ...trData])
  const workBook = utils.book_new()
  utils.book_append_sheet(workBook, sheet, '数据报表')
  writeFile(workBook, '数据报表.xlsx')
}

// 修改 pagination
const pagination = computed(() => ({
  page: pageNumber.value,
  pageSize: currentPageSize.value,
  pageCount: pageNumber.value + (pageInfo.value.hasNextPage ? 1 : 0),
  showSizePicker: true,
  showQuickJumper: false,
  pageSizes: [5, 10, 20, 40, 60, 100],
  onChange: (page) => {
    if (page > pageNumber.value) {
      goNext()
    }
    else if (page < pageNumber.value) {
      goPrev(page)
    }
  },
  onUpdatePageSize: (pageSize) => {
    currentPageSize.value = pageSize
    pageNumber.value = 1
    // variables.value.pageQuery.first = pageSize
    variables.value.pageQuery.after = null
    handleSearch()
  },
}))

// 修改 handleReset 函数
async function handleReset() {
  // let nextFilters = cloneDeep(originFilters)
  let nextFilters = Object.keys(originFilters).reduce((acc, key) => {
    if (props.condition) {
      const option = originFilters[key]?.option || 'EQ'
      acc[key] = {
        option: option,
        value: null,
      }
    }
    else {
      acc[key] = null
    }
    return acc
  }, {})
  after.value = null
  pageNumber.value = 1
  cursorHistory.value = []
  currentPageSize.value = props.pageSize // 重置为默认值
  emit('update:filters', nextFilters)
  await nextTick()
  refetch(variables.value)
}

defineExpose({
  handleSearch,
  onChecked,
  handleExport,
  handleReset,
})
</script>

<style scoped>

</style>
