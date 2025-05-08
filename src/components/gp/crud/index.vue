<template>
  <div class="crud-wrapper">
    <AppCard v-if="$slots.default" bordered bg="#fafafc dark:black" class="mb-30 min-h-60 rounded-4">
      <form class="flex justify-between p-16" @submit.prevent="handleSearch()">
        <NScrollbar x-scrollable>
          <NSpace :wrap="!expand || isExpanded" :size="[32, 16]" class="p-10">
            <slot />
          </NSpace>
        </NScrollbar>
        <div class="flex-shrink-0 p-10">
          <NButton ghost type="primary" @click="resetFilters">
            <i class="i-fe:rotate-ccw mr-4" />
            重置
          </NButton>
          <NButton class="ml-20" type="primary" attr-type="submit" @click="handleSearch(true)">
            <i class="i-fe:search mr-4" />
            搜索
          </NButton>

          <template v-if="expand">
            <NButton v-if="!isExpanded" type="primary" text @click="toggleExpand">
              <i class="i-fe:chevrons-down ml-4" />
              展开
            </NButton>
            <NButton v-else text type="primary" @click="toggleExpand">
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
      :pagination="paginationConfig"
      @update:checked-row-keys="onChecked"
      @update:filters="handleFiltersChange"
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
  /** 查询结果的字段名 */
})
const emit = defineEmits(['update:filters', 'onChecked', 'onDataChange'])

const queryFunction = props.getData.definitions[0].selectionSet.selections[0].name.alias || props.getData.definitions[0].selectionSet.selections[0].name.value
// cursor-based pagination state
const after = ref(null)
const first = ref(5)
const pageNumber = ref(1)
const cursorHistory = ref([])

// GraphQL query using Relay style pagination
// const PAGE_USER = gql`
//   query PageUser($after: String, $first: Int!, $filters: FilterInput) {
//     pageUser(after: $after, first: $first, filters: $filters) {
//       edges {
//         cursor
//         node {
//           id
//           # ... other fields
//         }
//       }
//       pageInfo {
//         hasNextPage
//         hasPreviousPage
//         startCursor
//         endCursor
//       }
//     }
//   }
// `

// reactive variables for query
const variables = computed(() => ({
  pageQuery: {
    after: after.value,
    first: first.value,
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

function handleFiltersChange() {

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
function handleExport() {
  if (!dataList.value.length)
    return
  const exportCols = props.columns.filter(col => col.title && !col.hideInExcel)
  const header = exportCols.map(col => col.title)
  const rows = dataList.value.map(item => exportCols.map(col => item[col.key]))
  const sheet = utils.aoa_to_sheet([header, ...rows])
  const book = utils.book_new()
  utils.book_append_sheet(book, sheet, '数据报表')
  writeFile(book, '数据报表.xlsx')
}

const paginationConfig = computed(() => ({
  page: pageNumber.value,
  pageSize: first.value,
  pageCount: pageNumber.value + (pageInfo.value.hasNextPage ? 1 : 0),
  showSizePicker: false,
  showQuickJumper: false,
  onChange: (page) => {
    if (page > pageNumber.value) {
      goNext()
    }
    else if (page < pageNumber.value) {
      goPrev(page)
    }
  },
}))

// reset filters and pagination
async function resetFilters() {
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
  resetFilters,
})
</script>
