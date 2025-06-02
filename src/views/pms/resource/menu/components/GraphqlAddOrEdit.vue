
 <template>
  <MeModal ref="modalRef">
    <n-form
      ref="modalFormRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="modalForm"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="所属菜单" path="menuId">
          <n-tree-select
            v-model:value="modalForm.menuId"
            :options="menuOptions"
            :disabled="parentIdDisabled"
            label-field="name"
            key-field="id"
            placeholder="根菜单"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="所属服务" :rule="required">
          <n-select
            v-model:value="modalForm.uri"
            clearable
            :options="treeData"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="name" :rule="required">
          <template #label>
            <QuestionLabel label="名称" content="标题" />
          </template>
          <n-input v-model:value="modalForm.name" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="code" :rule="required">
          <template #label>
            <QuestionLabel label="编码" content="如果是菜单则对应前端路由的name，使用大驼峰" />
          </template>
          <n-input v-model:value="modalForm.code" :disabled="modalAction === 'edit'" />
        </n-form-item-gi>

        <n-form-item-gi :span="12" path="operation" :rule="required">
          <template #label>
            <QuestionLabel label="协议" content="如果是菜单则对应前端路由的name，使用大驼峰" />
          </template>
          <n-select
            v-model:value="modalForm.operation"
            clearable
            :options="[
              { label: 'Query', value: 'Query' },
              { label: 'Mutation', value: 'Mutation' },
              { label: 'Subscription', value: 'Subscription' }
            ]"
          />
        </n-form-item-gi>

        <n-form-item-gi :span="12" path="functionName" :rule="required">
          <template #label>
            <QuestionLabel label="方法名" content="如果是菜单则对应前端路由的name，使用大驼峰" />
          </template>
          <n-input v-model:value="modalForm.functionName" />
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </MeModal>
</template>

<script setup>
import { MeModal } from '@/components'
import {  apolloClients } from '@/utils/graphql'
import { useForm, useModal } from '@/composables'
import { saveGraphqlResource } from '../apollo'
import QuestionLabel from './QuestionLabel.vue'

const props = defineProps({
  menus: {
    type: Array,
    required: true,
  },
})
const emit = defineEmits(['refresh'])

const menuOptions = computed(() => {
  return [{ name: '根菜单', id: '', children: props.menus || [] }]
})

const required = {
  required: true,
  message: '此为必填项',
  trigger: ['blur', 'change'],
}

const treeData = ref([])

function initData() {
  const res = Object.keys(apolloClients).map(n => {
    return {
      value: `/${n}/graphql`,
      label: n + '服务'
    }
  })

  treeData.value = res || []
}



const defaultForm = {}
const [modalFormRef, modalForm, validation] = useForm()
const [modalRef, okLoading] = useModal()

const modalAction = ref('')
const parentIdDisabled = ref(false)
function handleOpen(options = {}) {
  const { action, row = {}, ...rest } = options
  initData()
  modalAction.value = action
  modalForm.value = { ...defaultForm, ...row }
  parentIdDisabled.value = !!row.menuId && action === 'add'
  modalRef.value.open({ ...rest, onOk: onSave })
}

async function onSave() {
  await validation()
  okLoading.value = true
  try {
    let newFormData
    let data = { ...modalForm.value}

    const res = await saveGraphqlResource(data)
    newFormData = res.data?.saveMenuResource

    okLoading.value = false
    $message.success('保存成功')
    emit('refresh', 'graphql', modalAction.value === 'add' ? newFormData : modalForm.value)
  }
  catch (error) {
    console.error(error)
    okLoading.value = false
    return false
  }
}

defineExpose({
  handleOpen,
})
</script>
