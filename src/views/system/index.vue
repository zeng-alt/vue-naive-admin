<template>
  <div class="p-24">
    <n-grid :cols="24" :x-gap="16" :y-gap="16" responsive="screen">
      <n-grid-item v-for="item in menuItems" :key="item.code" :span="4" :xs="24" :s="24" :m="12" :l="6" :xl="6">
        <n-card
          class="h-140 cursor-pointer border border-gray-200 bg-gray-50 transition-all hover:scale-105 hover:shadow-lg"
          @click="handleCardClick(item)"
        >
          <div class="h-full flex flex-col items-center justify-center">
            <div class="mb-12">
              <i :class="`${item.icon}?mask`" class="text-36 text-primary" />
            </div>
            <div class="text-16 text-gray-800 font-medium">
              {{ item.name }}
            </div>
            <div v-if="item.description" class="mt-4 text-center text-12 text-gray-500">
              {{ item.description }}
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup>
import { usePermissionStore } from '@/store'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const permissionStore = usePermissionStore()

// 获取当前路由对应的菜单项
const menuItems = computed(() => {
  const currentRoute = router.currentRoute.value
  // 直接从 permissions 中查找当前路由对应的菜单项
  const parentMenu = permissionStore.permissions.find(p => p.code === currentRoute.name)
  if (!parentMenu)
    return []

  // 返回所有子菜单项
  return parentMenu.children
    ?.filter(item => item.type === 'MENU')
    .map(item => ({
      ...item,
      path: item.path || `/${hyphenate(item.code)}`,
    })) || []
})

function handleCardClick(item) {
  if (item.originPath) {
    window.open(item.originPath)
  }
  else {
    router.push(item.path)
  }
}
</script>

<style scoped>
.n-card {
  --n-border-radius: 8px;
  --n-border-color: #e5e7eb;
  --n-color: #f9fafb;
}
</style>
