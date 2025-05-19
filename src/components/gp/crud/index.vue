<template>
  <div class="crud-wrapper">
    <AppCard v-if="$slots.default" bordered bg="#fafafc dark:black" class="mb-30 min-h-60 rounded-4">
      <form class="flex justify-between p-16" @submit.prevent="handleSearch()">
        <NScrollbar x-scrollable>
          <NSpace :wrap="!expand || isExpanded" :size="[32, 16]" class="p-10">
            <slot :size="size" />
          </NSpace>
        </NScrollbar>
        <div class="flex-shrink-0 p-10">
          <NButton ghost type="primary" @click="handleReset" :size="size">
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

    <NDataTable
      :row-key="(row) => row[rowKey]"
      :columns="columns"
      :data="dataList"
      :loading="loading"
      :scroll-x="scrollX"
      :remote="true"
      :size="size"
      :pagination="paginationConfig"
      @update:checked-row-keys="onChecked"
    />
  </div>
</template>

<script setup>
import { useQuery } from '@vue/apollo-composable'
import { NButton, NDataTable, NScrollbar, NSpace } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { utils, writeFile } from 'xlsx'

// props
const props = defineProps({
  condition: { type: Boolean, default: false },
  scrollX: { type: Number, default: 1200 },
  rowKey: { type: String, default: 'id' },
  columns: { type: Array, required: true },
  expand: Boolean,
  filters: { type: Object, default: () => ({}) },
  /** @type {import('graphql').DocumentNode} */
  getData: { type: Object, required: true },
  pageSize: { type: Number, default: 5 },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['tiny', 'small', 'medium', 'large'].includes(value)
  },
  /** 查询结果的字段名 */
})
const emit = defineEmits(['update:filters', 'onChecked', 'onDataChange'])

const queryFunction = props.getData.definitions[0].selectionSet.selections[0].name.alias || props.getData.definitions[0].selectionSet.selections[0].name.value
// cursor-based pagination state
const after = ref(null)
const pageNumber = ref(1)
const cursorHistory = ref([])

// reactive variables for query
const variables = computed(() => ({
  pageQuery: {
    after: after.value,
    first: props.pageSize,
  },
  filter: props.filters,
}))

// execute query
const { result, loading, refetch } = useQuery(props.getData, variables)

// extract edges and pageInfo using computed
const edges = computed(() => result.value?.[queryFunction]?.edges ?? [])
const pageInfo = computed(() => result.value?.[queryFunction]?.pageInfo ?? {})

// derive data list from edges
const dataList = computed(() => edges.value.map(e => e.node))

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
    refetch()
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
    refetch()
  }
}

// search resets to first page
function handleSearch() {
  after.value = null
  pageNumber.value = 1
  cursorHistory.value = []
  refetch()
}

// row selection remains unchanged
function onChecked(keys) {
  emit('onChecked', keys)
}

// emit data change
watch(dataList, val => emit('onDataChange', val))

// export Excel unchanged
function handleExport(columns = props.columns, data = dataList.value) {
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

const paginationConfig = computed(() => ({
  page: pageNumber.value,
  pageSize: variables.value.pageQuery.first,
  size: props.size,
  pageCount: pageNumber.value + (pageInfo.value.hasNextPage ? 1 : 0),
  showSizePicker: true,
  showQuickJumper: false,
  pageSizes: [5, 10, 20, 30, 40],
  onChange: (page) => {
    if (page > pageNumber.value) {
      goNext()
    }
    else if (page < pageNumber.value) {
      goPrev(page)
    }
  },
  onUpdatePageSize: (pageSize) => {
    pageNumber.value = 1
    variables.value.pageQuery.first = pageSize
    variables.value.pageQuery.after = null
    handleSearch()
  }
}))

// reset filters and pagination
async function handleReset() {
  // 创建一个新的空对象，保持与原始 filters 相同的结构
  const emptyFilters = Object.keys(props.filters).reduce((acc, key) => {
    if (props.condition) {
      acc[key] = {
        option: 'EQ',
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
  emit('update:filters', emptyFilters)
  await nextTick()
  refetch()
}

defineExpose({
  handleSearch,
  onChecked,
  handleExport,
  handleReset,
})
</script>

<style scoped>
.crud-wrapper {
  width: 100%;
}

:deep(.n-data-table) {
  --n-table-color-striped: var(--n-item-color-active);
}

:deep(.n-data-table .n-data-table-td) {
  padding: 8px 12px;
}

:deep(.n-data-table .n-data-table-th) {
  padding: 8px 12px;
  font-weight: 500;
}
</style>
