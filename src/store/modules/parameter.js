
import { defineStore } from 'pinia'

export const useParameterStore = defineStore('parameter', {
  state: () => ({
    parameter: new Map()
  }),
  actions: {
    getParameter(key) {
      if (!key)
        return null
      return this.parameter.get(key) || null
    },

    setParameter(key, value) {
      if (!key)
        return false
      try {
        this.parameter.set(key, value)
      } catch (e) {
        console.error('setDict Error:', e)
        return false
      }
    },

    remove(key) {
      if (!key)
        return false
      try {
        this.parameter.remove(key)
      } catch (e) {
        console.error('remove Error:', e)
        return false
      }
    },

    resetParameter() {
      this.$reset()
    },
  },
})
