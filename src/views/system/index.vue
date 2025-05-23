<template>
  <div class="p-24">
    <!-- 添加搜索框 -->

    <div class="flex justify-end mr-9">
      <div class="flex">
        <n-input
          v-model:value="searchText"
          placeholder="搜索菜单..."
          clearable
        >
          <template #prefix>
            <i class="i-carbon:search text-16" />
          </template>
        </n-input>
      </div>
    </div>


    <n-grid :cols="24" :x-gap="16" :y-gap="16" responsive="screen">
      <n-grid-item v-for="item in filteredMenuItems" :key="item.code" :span="4" :xs="24" :s="24" :m="12" :l="6" :xl="6">
        <n-card
          class="h-140 cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
          @click="handleCardClick(item)"
        >
          <div class="h-full flex flex-col items-center justify-center">
            <div class="mb-12">
              <i :class="`${item.icon}?mask`" :style="{ color: themeVars.primaryColor }" class="text-36" />
            </div>
            <div :style="{ color: themeVars.textColor1 }" class="text-16 font-medium">
              {{ item.name }}
            </div>
            <div v-if="item.description" :style="{ color: themeVars.textColor3 }" class="mt-4 text-center text-12">
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
import { useThemeVars } from 'naive-ui'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const permissionStore = usePermissionStore()
const themeVars = useThemeVars()
const searchText = ref('')

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

// 添加过滤后的菜单项计算属性
const filteredMenuItems = computed(() => {
  if (!searchText.value) return menuItems.value

  const searchLower = searchText.value.toLowerCase()
  return menuItems.value.filter(item =>
    item.name.toLowerCase().includes(searchLower) ||
    (item.description && item.description.toLowerCase().includes(searchLower))
  )
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
  --n-border: v-bind('themeVars.borderColor');
}
</style>