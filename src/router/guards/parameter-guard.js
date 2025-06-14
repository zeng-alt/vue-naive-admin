import { useParameterStore } from '@/store'

export function createParameterGuard(router) {
  router.beforeEach(async (to) => {
    useParameterStore().resetParameter()
  })
}