<template>
  <div class="h-screen w-full flex">
    <n-layout has-sider class="h-full w-full">
      <n-layout-sider
        show-trigger
        collapse-mode="width"
        :collapsed-width="80"
        :native-scrollbar="false"
        :width="210"
        :collapsed="appStore.collapsed"
        style="height: 100vh; overflow: visible;"
        @collapse="appStore.setCollapsed(true)"
        @expand="appStore.setCollapsed(false)"
      >
        <SideBar />
      </n-layout-sider>

      <article class="h-full w-0 flex flex-col flex-1 overflow-hidden">
        <div style="flex-shrink: 0;">
          <AppHeader style="height: 60px;" />
          <div style="padding: 12px;">
            <AppTab />
          </div>
        </div>
        <div class="flex-1 overflow-y-auto">
          <slot />
        </div>
      </article>
    </n-layout>
  </div>
</template>

<script setup>
import { AppTab } from '@/layouts/components'
import { useAppStore } from '@/store'
import AppHeader from './header/index.vue'
import SideBar from './sidebar/index.vue'

const appStore = useAppStore()
</script>

<style>
.collapsed {
  width: 64px;
}

/* 确保侧边栏高度正确，但允许触发器按钮溢出 */
:deep(.n-layout-sider) {
  height: 100vh !important;
  overflow: visible !important;
  border-right: none !important; /* 移除右边框 */
}

/* 让侧边栏内容区域为 flex 布局 */
:deep(.n-layout-sider .n-layout-sider-scroll-container) {
  overflow: hidden !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
