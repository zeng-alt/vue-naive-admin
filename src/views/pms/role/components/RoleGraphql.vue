
 <template>

  <MeModal ref="modalRef">
    <GraphqlCrud
      ref="$table"
      v-model:filters="queryItems"
      :checkedKeys="graphqlIds"
      :condition="true"
      :columns="btnsColumns"
      :scroll-x="-1"
      :get-data="PAGE_GRAPHQL_RESOURCE"
      @on-checked="onChecked"
    >

      <MeQueryItem label="服务" :label-width="50">
        <n-select
          size="small"
          v-model:value="queryItems.uri.value"
          clearable
          :options="options"
        />
      </MeQueryItem>
      <ConditionItem v-model:value="queryItems.code" size="small" label="编码" type="string" :label-width="50">
        <NInput
          size="small"
          v-model:value="queryItems.code.value"
          type="text"
          placeholder="请输入graphql编码"
          clearable
        />
      </ConditionItem>
      <ConditionItem v-model:value="queryItems.functionName" size="small" label="方法名" type="string" :label-width="50">
        <NInput
          size="small"
          v-model:value="queryItems.functionName.value"
          type="text"
          placeholder="请输入graphql方法名"
          clearable
        />
      </ConditionItem>
      <MeQueryItem label="协议" size="small" :label-width="50">
        <n-select
          size="small"
          v-model:value="queryItems.operation.value"
          clearable
          :options="[
            { label: 'Query', value: 'Query' },
            { label: 'Mutation', value: 'Mutation' },
            { label: 'Subscription', value: 'Subscription' }
          ]"
        />
      </MeQueryItem>
    </GraphqlCrud>
  </MeModal>

</template>

<script setup>
import { PAGE_GRAPHQL_RESOURCE } from '@/views/pms/resource/graphql/apollo.js'
import {  apolloClients } from '@/utils/graphql'
import { useModal } from '@/composables'
import { GraphqlCrud,  MeQueryItem, MeModal, ConditionItem } from '@/components'
import { ref } from 'vue'
import api from '../api'

defineOptions({ name: 'RoleGraphql' })

const emit = defineEmits(['refresh'])

const queryItems = ref({
  code: {},
  uri: {
    option: 'EQ',
    value: undefined
  },
  operation: {
    option: 'EQ',
    value: undefined
  },
  functionName: {}
})

const options = ref([])
const treeLoading = ref(false)
const $table = ref(null)
async function initData() {

  treeLoading.value = true

  const res = Object.keys(apolloClients).map(n => {
    return {
      value: `/${n}/graphql`,
      label: n + '服务'
    }
  })

  // const res = await api.getMenuTree()
  options.value = res || []
  treeLoading.value = false
  queryItems.value.uri.value = options.value[0].value
  $table.value?.handleSearch()
}

const role = ref(null)
const graphqlIds = ref([])

function onChecked(rowKeys) {
  graphqlIds.value = rowKeys || []
}

const [modalRef, okLoading] = useModal()

function handleOpen(options = {}) {
  initData()
  const { action, row = {}, ...rest  } = options
  role.value = row
  graphqlIds.value = row.permissionIds
  modalRef.value.open({ ...rest, onOk: onSave })
}

async function onSave() {

  okLoading.value = true
  try {

    okLoading.value = false
    await api.save({...role.value, permissionIds: graphqlIds.value})
    $message.success('授权成功')
    emit('refresh')
  }
  catch (error) {
    console.error(error)
    okLoading.value = false
    return false
  }
}

const btnsColumns = [
  { type: 'selection', fixed: 'left' },
  { title: '名称', key: 'name', width: 200 },
  { title: '编码', key: 'code', width: 250 },
  { title: '方法名', key: 'functionName', width: 200 },
  { title: '协议', key: 'operation', width: 120 },
]

defineExpose({
  handleOpen,
})
</script>
