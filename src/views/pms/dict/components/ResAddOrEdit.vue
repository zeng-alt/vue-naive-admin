
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

        <n-form-item-gi :span="12" path="dictName" :rule="required">
          <template #label>
            <QuestionLabel label="字典名称" content="标题" />
          </template>
          <n-input v-model:value="modalForm.dictName" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="dictCode" :rule="required">
          <template #label>
            <QuestionLabel label="字典编码" content="使用大驼峰" />
          </template>
          <n-input v-model:value="modalForm.dictCode"/>
        </n-form-item-gi>
        <n-form-item-gi :span="24" path="remark" label="备注">
          <n-input type="textarea" v-model:value="modalForm.remark"/>
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </MeModal>
</template>

<script setup>
import { MeModal, QuestionLabel } from '@/components'
import { useForm, useModal } from '@/composables'
import { saveDictType } from '../apollo'


const emit = defineEmits(['refresh'])

const required = {
  required: true,
  message: '此为必填项',
  trigger: ['blur', 'change'],
}

// const defaultForm = { enable: true, show: true, layout: '',  menuStyle: 'default'}
const [modalFormRef, modalForm, validation] = useForm()
const [modalRef, okLoading] = useModal()

function handleOpen(options = {}) {
  const { ...rest } = options
  modalRef.value.open({ ...rest, onOk: onSave })
}

async function onSave() {
  await validation()
  okLoading.value = true
  try {
    await saveDictType(modalForm.value)
    okLoading.value = false
    $message.success('保存成功')
    emit('refresh')
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
