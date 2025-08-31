import { markRaw } from 'vue'

class ComponentRegistry {
  constructor() {
    if (ComponentRegistry.instance) {
      return ComponentRegistry.instance
    }
    this.components = new Map()
    ComponentRegistry.instance = this
  }

  // 注册单个组件
  register(type, component) {
    this.components.set(type, markRaw(component))
  }

  // 批量注册组件
  registerBatch(components) {
    Object.entries(components).forEach(([type, component]) => {
      this.register(type, component)
    })
  }

  // 获取组件
  get(type) {
    return this.components.get(type)
  }

  // 检查组件是否存在
  has(type) {
    return this.components.has(type)
  }

  // 获取所有已注册的组件类型
  getRegisteredTypes() {
    return Array.from(this.components.keys())
  }

  // 注销组件
  unregister(type) {
    return this.components.delete(type)
  }

  // 清空所有组件
  clear() {
    this.components.clear()
  }
}

export const componentRegistry = new ComponentRegistry()
export { ComponentRegistry }
