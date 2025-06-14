
import { defineStore } from 'pinia'

export const useDictStore = defineStore('dict', {
  state: () => ({
    dict: new Map()
  }),
  actions: {
    getDict(key) {
      if (!key)
        return []
      return this.dict.get(key) || []
    },

    setDict(key, value) {
      if (!key)
        return false
      try {
        this.dict.set(key, value)
      } catch (e) {
        console.error('setDict Error:', e)
        return false
      }
    },

    remove(key) {
      if (!key)
        return false
      try {
        this.dict.remove(key)
      } catch (e) {
        console.error('remove Error:', e)
        return false
      }
    },

    cleanDict() {
      this.dict.clear()
    },
    resetDict() {
      this.$reset()
    },
  },
})
