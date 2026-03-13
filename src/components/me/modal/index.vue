<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2024/01/13 17:41:38
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <n-modal
    v-model:show="show"
    class="modal-box"
    :style="{ width: modalOptions.width, ...modalOptions.modalStyle }"
    :preset="undefined"
    size="huge"
    :bordered="false"
    @after-leave="onAfterLeave"
  >
    <n-card :style="modalOptions.contentStyle" :closable="modalOptions.closable" @close="closeAndDraft()">
      <template #header>
        <header class="modal-header">
          {{ modalOptions.title }}
          <!-- 暂存状态指示器 -->
          <n-tag v-if="modalOptions.showDraftStatus && hasDraftData" type="info" size="small" class="ml-8">
            有暂存
          </n-tag>
        </header>
      </template>

      <template #header-extra>
        <n-button
          v-if="(modalOptions.enableDraft || enableDraft) && modalOptions.showDraftSave && !isViewMode"
          quaternary
          type="tertiary"
          @click="handleSaveDraft"
        >
          <i class="i-material-symbols:draft mr-4 text-18" />
          暂存
        </n-button>
      </template>

      <slot />

      <!-- 底部按钮 -->
      <template #footer>
        <slot name="footer">
          <footer v-if="modalOptions.showFooter" class="flex justify-end">
            <n-button v-if="modalOptions.showCancel" @click="handleCancel()">
              {{ modalOptions.cancelText }}
            </n-button>
            <n-button
              v-if="modalOptions.showOk"
              type="primary"
              :loading="modalOptions.okLoading"
              class="ml-20"
              @click="handleOk()"
            >
              {{ modalOptions.okText }}
            </n-button>
          </footer>
        </slot>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup>
import { initDrag } from './utils'

const props = defineProps({
  width: {
    type: String,
    default: '800px',
  },
  title: {
    type: String,
    default: '',
  },
  closable: {
    type: Boolean,
    default: true,
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  okText: {
    type: String,
    default: '确定',
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  showOk: {
    type: Boolean,
    default: true,
  },
  modalStyle: {
    type: Object,
    default: () => {},
  },
  contentStyle: {
    type: Object,
    default: () => {},
  },
  onOk: {
    type: Function,
    default: () => {},
  },
  onCancel: {
    type: Function,
    default: () => {},
  },

  // 暂存相关配置
  enableDraft: {
    type: Boolean,
    default: false,
  },
  showDraftSave: {
    type: Boolean,
    default: true,
  },
  showDraftRestore: {
    type: Boolean,
    default: true,
  },
  showDraftStatus: {
    type: Boolean,
    default: true,
  },
  onSaveDraft: {
    type: Function,
    default: () => {},
  },
  onCheckDraft: {
    type: Function,
    default: () => false,
  },
})

const emit = defineEmits(['open', 'close', 'save-draft', 'restore-draft'])

// 声明一个show变量，用于控制模态框的显示与隐藏
const show = ref(false)
// 声明一个modalOptions变量，用于存储模态框的配置信息
const modalOptions = ref({})

// 是否有暂存数据
const hasDraftData = ref(false)
// 是否为查看模式
const isViewMode = computed(() => modalOptions.value?.action === 'view')

const okLoading = computed({
  get() {
    return !!modalOptions.value?.okLoading
  },
  set(v) {
    if (modalOptions.value) {
      modalOptions.value.okLoading = v
    }
  },
})

// 检查暂存状态
function checkDraftStatus() {
  if (modalOptions.value?.enableDraft && typeof modalOptions.value.onCheckDraft === 'function') {
    hasDraftData.value = modalOptions.value.onCheckDraft()
  }
}

// 打开模态框
async function open(options = {}) {
  // 将props和options合并赋值给modalOptions
  modalOptions.value = { ...props, ...options }

  // 将show的值设置为true
  show.value = true

  // 检查暂存状态
  checkDraftStatus()

  await nextTick()
  initDrag(
    Array.prototype.at.call(document.querySelectorAll('.modal-header'), -1),
    Array.prototype.at.call(document.querySelectorAll('.modal-box'), -1),
  )
  emit('open')
}

// 定义一个close函数，用于关闭模态框
function close() {
  show.value = false
  hasDraftData.value = false
  emit('close')
}

function closeAndDraft() {
  show.value = false
  hasDraftData.value = false
  if (typeof modalOptions.value.onSaveDraft === 'function') {
    modalOptions.value.onSaveDraft()
  }
  emit('close')
}

// 处理暂存保存
async function handleSaveDraft() {
  if (typeof modalOptions.value.onSaveDraft === 'function') {
    try {
      await modalOptions.value.onSaveDraft()
      // 重新检查暂存状态
      checkDraftStatus()
      emit('save-draft')
    }
    catch (error) {
      console.error('保存暂存失败:', error)
    }
  }
}

// 定义一个handleOk函数，用于处理模态框确定操作
async function handleOk(data) {
  // 如果modalOptions中没有onOk函数，则直接关闭模态框
  if (typeof modalOptions.value.onOk !== 'function') {
    return close()
  }
  try {
    // 调用onOk函数，传入data参数
    const res = await modalOptions.value.onOk(data)
    // 如果onOk函数的返回值不为false，则关闭模态框
    if (res !== false)
      close()
  }
  catch (error) {
    console.error(error)
    okLoading.value = false
  }
}

// 定义一个handleCancel函数，用于处理模态框取消操作
async function handleCancel(data) {
  // 如果modalOptions中没有onCancel函数，则直接关闭模态框
  if (typeof modalOptions.value.onCancel !== 'function') {
    if (typeof modalOptions.value.onClearDraft === 'function') {
      modalOptions.value.onClearDraft()
    }

    return close()
  }
  try {
    // 调用onCancel函数，传入data参数
    const res = await modalOptions.value.onCancel(data)

    // 如果onCancel函数的返回值不为false，则关闭模态框
    if (res !== false) {
      if (typeof modalOptions.value.onClearDraft === 'function') {
        modalOptions.value.onClearDraft()
      }
      close()
    }
  }
  catch (error) {
    console.error(error)
    okLoading.value = false
  }
}

async function onAfterLeave() {
  await nextTick()
  initDrag(
    Array.prototype.at.call(document.querySelectorAll('.modal-header'), -1),
    Array.prototype.at.call(document.querySelectorAll('.modal-box'), -1),
  )
}

// 定义一个defineExpose函数，用于暴露open、close、handleOk、handleCancel函数
defineExpose({
  open,
  close,
  handleOk,
  handleCancel,
  okLoading,
  options: modalOptions,

  handleSaveDraft,
  closeAndDraft,
  checkDraftStatus,
  hasDraftData,
})
</script>
