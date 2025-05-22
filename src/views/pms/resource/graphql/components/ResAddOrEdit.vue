<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2024/04/01 15:52:31
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

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
        <n-form-item-gi :span="12" label="所属服务">
          <n-input :value="`${graphqlCode}服务`" :disabled="true" />
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
          <n-input v-model:value="modalForm.code" />
        </n-form-item-gi>

        <n-form-item-gi :span="12" path="operation" :rule="required">
          <template #label>
            <QuestionLabel label="协议" content="如果是菜单则对应前端路由的name，使用大驼峰" />
          </template>
          <n-select
            size="small"
            v-model:value="modalForm.operation"
            clearable
            :options="[
              { label: 'Query', value: 'Query' },
              { label: 'Mutation', value: 'Mutation' },
              { label: 'Subscription', value: 'Subscription' }
            ]"
          />
        </n-form-item-gi>

        <n-form-item-gi :span="24" path="functionName" :rule="required">
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
import { saveGraphqlResource } from '../apollo.js'
import { MeModal } from '@/components'
import { useForm, useModal } from '@/composables'
import QuestionLabel from './QuestionLabel.vue'

const props = defineProps({
  menus: {
    type: Array,
    required: true,
  },
})
const emit = defineEmits(['refresh'])

const graphqlCode = ref('')

const required = {
  required: true,
  message: '此为必填项',
  trigger: ['blur', 'change'],
}

// const defaultForm = { enable: true, show: true, layout: '',  menuStyle: 'default'}
const [modalFormRef, modalForm, validation] = useForm()
const [modalRef, okLoading] = useModal()

const modalAction = ref('')
function handleOpen(options = {}) {
  const { action, row = {}, code, ...rest  } = options
  graphqlCode.value = code
  modalAction.value = action
  modalForm.value = row
  modalRef.value.open({ ...rest, onOk: onSave })
}

async function onSave() {
  await validation()
  okLoading.value = true
  try {
    let newFormData

    if (modalAction.value === 'add') {
      const res = await saveGraphqlResource(modalForm.value)
      newFormData = res.data?.saveGraphqlResource
    }
    else if (modalAction.value === 'edit') {
      await saveGraphqlResource(modalForm.value)
    }
    okLoading.value = false
    $message.success('保存成功')
    emit('refresh', modalAction.value === 'add' ? newFormData : modalForm.value)
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
