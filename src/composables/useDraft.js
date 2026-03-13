import { onUnmounted, watch } from 'vue'
import { useDraftStore } from '@/store'
import { debounceAndThrottle } from '@/utils'

export function useDraft(modalForm, recordId, getKeyHandler, autoSaveCondition) {
  if (typeof getKeyHandler !== 'function') {
    throw new TypeError('getKeyHandler must be a function')
  }

  const draftStore = useDraftStore()

  function saveDraft() {
    draftStore.saveDraft(getKeyHandler(), { ...modalForm.value, id: recordId.value })
  }

  function loadDraft() {
    return draftStore.loadDraft(getKeyHandler())
  }

  function clearDraft() {
    draftStore.removeDraft(getKeyHandler())
  }

  function hasDraft() {
    return draftStore.hasDraft(getKeyHandler())
  }

  function restoreDraft() {
    const draft = loadDraft(getKeyHandler())
    if (draft) {
      modalForm.value = { ...draft }
    }
  }

  const { handler, cancel } = debounceAndThrottle(saveDraft, 2000, 10000)

  // 监听表单变化，自动暂存
  watch(
    modalForm,
    () => {
      if (typeof autoSaveCondition === 'function' && autoSaveCondition())
        handler() // 防抖，避免频繁保存
    },
    { deep: true },
  )

  // 组件卸载时清理定时器
  onUnmounted(() => {
    cancel()
  })

  return { saveDraft, loadDraft, clearDraft, hasDraft, restoreDraft }
}
