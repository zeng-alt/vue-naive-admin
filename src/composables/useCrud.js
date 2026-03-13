/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/12 09:03:00
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { cloneDeep } from 'lodash-es'
// import { useDraftStore } from '@/store'
import { useDraft, useForm, useModal } from '.'

const ACTIONS = {
  view: '查看',
  edit: '编辑',
  add: '新增',
}

export function useCrud({
  name,
  initForm = {},
  doCreate,
  doDelete,
  doUpdate,
  refresh,
  enableDraft = true,
  draftKey = name,
}) {
  const modalAction = ref('')
  const [modalRef, okLoading] = useModal()
  const [modalFormRef, modalForm, validation] = useForm(initForm)
  // const draftStore = useDraftStore()
  const currentRecordId = ref(null) // 当前编辑记录的ID
  const isModalOpening = ref(true)

  // 生成暂存key
  const getDraftKey = () => {
    const action = modalAction.value
    const id = currentRecordId.value
    return `${draftKey}_${action}_${id || 'new'}`
  }

  const isSave = () => {
    return enableDraft && modalAction.value !== 'view' && !isModalOpening.value
  }

  const draftStore = useDraft(modalForm, currentRecordId, getDraftKey, isSave)

  /** 自动保存暂存 */
  function autoSaveDraft() {
    if (!enableDraft || modalAction.value === 'view')
      return

    const key = getDraftKey()
    // draftStore.saveDraft(key, {
    //   ...modalForm.value,
    //   id: currentRecordId.value
    // })
    draftStore.saveDraft()
  }

  /** 加载暂存数据 */
  function loadDraft() {
    if (!enableDraft)
      return null

    return draftStore.loadDraft()
  }

  /** 检查是否有暂存数据 */
  function hasDraft() {
    if (!enableDraft)
      return false

    return draftStore.hasDraft()
  }

  /** 清除暂存数据 */
  function clearDraft() {
    if (!enableDraft)
      return

    draftStore.clearDraft()
  }

  /** 手动保存暂存 */
  async function handleSaveDraft() {
    if (!enableDraft || modalAction.value === 'view') {
      $message.warning('当前状态不支持暂存')
      return
    }

    autoSaveDraft()
    $message.success('暂存成功')
  }

  /** 恢复暂存数据 */
  async function handleRestoreDraft() {
    if (!hasDraft()) {
      $message.warning('没有可恢复的暂存数据')
      return
    }

    $dialog.confirm({
      title: '提示',
      type: 'warning',
      content: '确定要恢复暂存的数据吗？当前修改将被覆盖',
      confirm() {
        const draftData = loadDraft()
        if (draftData) {
          modalForm.value = { ...draftData }
          $message.success('暂存数据恢复成功')
        }
      },
      cancel() {
      },
    })
  }

  // const autoSaveHandler = debounceAndThrottle(autoSaveDraft, 2000, 10000)

  // // 监听表单变化，自动暂存
  // watch(
  //   modalForm,
  //   () => {
  //     if (!enableDraft || modalAction.value === 'view'  || isModalOpening.value) return

  //     // 防抖，避免频繁保存
  //     autoSaveHandler()
  //   },
  //   { deep: true }
  // )

  /** 新增 */
  function handleAdd(row = {}, title) {
    handleOpen({ action: 'add', title, row: { ...cloneDeep(initForm), ...cloneDeep(row) } })
  }

  /** 修改 */
  function handleEdit(row, title) {
    handleOpen({ action: 'edit', title, row })
  }

  /** 查看 */
  function handleView(row, title) {
    handleOpen({ action: 'view', title, row })
  }

  /** 打开modal */
  function handleOpen(options = {}) {
    const { action, row, title, onOk } = options
    isModalOpening.value = true
    currentRecordId.value = row.id
    modalAction.value = action
    modalForm.value = { ...row }

    modalRef.value?.open({
      ...options,
      // 暂存相关配置
      enableDraft,
      action,
      onClearDraft: () => clearDraft(),
      onCheckDraft: () => hasDraft(),
      onSaveDraft: handleSaveDraft,
      async onOk() {
        if (typeof onOk === 'function') {
          return await onOk()
        }
        else {
          return await handleSave()
        }
      },
      title: title ?? (ACTIONS[modalAction.value] || '') + name,
    })

    nextTick(() => {
      if (enableDraft && hasDraft() && action !== 'view') {
        $dialog.confirm({
          title: '提示',
          type: 'info',
          content: '检测到有未保存的暂存数据，是否恢复？',
          confirm() {
            const draftData = loadDraft()
            if (draftData) {
              modalForm.value = { ...draftData }
            }
          },
          cancel() {
            clearDraft()
          },
        })
      }
      if (enableDraft && action !== 'view')
        isModalOpening.value = false
    })
  }

  /** 保存 */
  async function handleSave(action) {
    if (!action && !['edit', 'add'].includes(modalAction.value)) {
      return false
    }
    await validation()
    const actions = {
      add: {
        api: () => doCreate(modalForm.value),
        cb: () => {
          $message.success('新增成功')
          clearDraft()
        },
      },
      edit: {
        api: () => doUpdate(modalForm.value),
        cb: () => {
          $message.success('保存成功')
          clearDraft()
        },
      },
    }

    action = action || actions[modalAction.value]

    try {
      okLoading.value = true
      const data = await action.api()
      action.cb()
      okLoading.value = false
      data && refresh(data)
    }
    catch (error) {
      console.error(error)
      okLoading.value = false
      return false
    }
  }

  /** 删除 */
  function handleDelete(id, confirmOptions) {
    if (!id && id !== 0)
      return
    const d = $dialog.warning({
      content: '确定删除？',
      title: '提示',
      positiveText: '确定',
      negativeText: '取消',
      async onPositiveClick() {
        try {
          d.loading = true
          const data = await doDelete(id)
          // 删除成功后，清除相关的暂存数据
          draftStore.clearDraft()
          $message.success('删除成功')
          d.loading = false
          refresh(data, true)
        }
        catch (error) {
          console.error(error)
          $message.error('删除失败')
          d.loading = false
        }
      },
      ...confirmOptions,
    })
  }

  // 组件卸载时清理定时器
  // onUnmounted(() => {
  //   if (autoSaveTimer) {
  //     clearTimeout(autoSaveTimer)
  //   }
  // })

  return {
    modalRef,
    modalFormRef,
    modalAction,
    modalForm,
    okLoading,
    validation,
    handleAdd,
    handleDelete,
    handleEdit,
    handleView,
    handleOpen,
    handleSave,
    // 暂存相关方法
    handleSaveDraft,
    handleRestoreDraft,
    hasDraft,
    clearDraft,
    autoSaveDraft,
  }
}
