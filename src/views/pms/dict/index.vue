<template>
  <CommonPage>
    <div class="flex">
      <n-spin size="small" :show="treeLoading">
        <DictList
          @click="handleClick"
        />
      </n-spin>
      <div class="ml-40 w-0 flex-1" >
        <GraphqlCrud
          :show="loading"
          ref="$table"
          v-model:filters="queryItems"
          :condition="true"
          :scroll-x="120"
          :columns="columns"
          :get-data="CONDITION_PAGE_DICT_TYPE"
        >

        </GraphqlCrud>
      </div>
    </div>
  </CommonPage>
</template>

<script setup>
import DictList from './components/DictList.vue'
import { GraphqlCrud } from '@/components'
import { CONDITION_PAGE_DICT_TYPE } from './apollo'
import { ref, onMounted } from 'vue'

const treeLoading = ref(false)
const loading = ref(false)

const queryItems = ref({})

const columns = [
  {
    title: '字典编码',
    key: 'parameterKey',
    ellipsis: { tooltip: true },
  },
  {
    title: '字典名',
    key: 'parameterName',
    ellipsis: { tooltip: true },
  },
  {
    title: '字典值',
    key: 'parameterValue',
    ellipsis: { tooltip: true },
  },
  {
    title: '字典排序',
    key: 'parameterKey',
    ellipsis: { tooltip: true },
  },
  {
    title: '状态',
    key: 'parameterName',
    ellipsis: { tooltip: true },
  },
  {
    title: '备注',
    key: 'parameterValue',
    ellipsis: { tooltip: true },
  },
  {
    title: '操作',
    key: 'parameterValue',
    ellipsis: { tooltip: true },
  },
]

function handleClick(data) {
  loading.value = true
  console.log(data)
}

</script>
