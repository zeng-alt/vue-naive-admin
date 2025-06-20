import { defineStore } from 'pinia'

export const useDraftStore = defineStore('draft', {
  state: () => ({
    drafts: new Map(), // 使用 Map 存储多个模块的暂存数据
  }),

  getters: {
    // 获取指定模块的暂存数据
    getDraft: (state) => (key) => {
      return state.drafts.get(key) || null
    },

    // 检查是否有暂存数据
    hasDraft: (state) => (key) => {
      return state.drafts.has(key) && state.drafts.get(key) !== null
    },

    // 获取所有暂存的key列表
    getDraftKeys: (state) => {
      return Array.from(state.drafts.keys())
    }
  },

  actions: {
    // 保存暂存数据
    saveDraft(key, data) {
      this.drafts.set(key, {
        data: JSON.parse(JSON.stringify(data)), // 深拷贝
        timestamp: Date.now(),
        id: data.id || null // 保存记录ID，用于区分新增和编辑
      })
    },

    // 获取暂存数据
    loadDraft(key) {
      const draft = this.drafts.get(key)
      return draft?.data || null
    },

    // 删除暂存数据
    removeDraft(key) {
      this.drafts.delete(key)
    },

    // 清空所有暂存数据
    clearAllDrafts() {
      this.drafts.clear()
    },

    // 清理过期的暂存数据（可选，例如超过24小时的）
    clearExpiredDrafts(expireTime = 24 * 60 * 60 * 1000) {
      const now = Date.now()
      for (const [key, draft] of this.drafts.entries()) {
        if (now - draft.timestamp > expireTime) {
          this.drafts.delete(key)
        }
      }
    }
  },

  // 持久化配置（如果使用 pinia-plugin-persistedstate）
  persist: {
    key: 'zero-ddd-drafts',
    storage: localStorage,
    serializer: {
      serialize: (state) => {
        // 将 Map 转换为普通对象进行序列化
        return JSON.stringify({
          drafts: Object.fromEntries(state.drafts)
        })
      },
      deserialize: (str) => {
        const data = JSON.parse(str)
        return {
          drafts: new Map(Object.entries(data.drafts || {}))
        }
      }
    }
  }
})